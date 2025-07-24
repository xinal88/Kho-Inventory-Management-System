const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const Supplier = require('../models/Supplier');
const { auth } = require('../middleware/auth');

// @route   GET /api/reports/sales
// @desc    Get sales report
// @access  Private
router.get('/sales', auth, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      groupBy = 'day',
      category,
      supplier 
    } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Build match conditions
    const matchConditions = {
      status: { $in: ['delivered', 'shipped'] }
    };

    if (Object.keys(dateFilter).length > 0) {
      matchConditions.createdAt = dateFilter;
    }

    // Group by configuration
    let groupByConfig;
    switch (groupBy) {
      case 'hour':
        groupByConfig = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        };
        break;
      case 'day':
        groupByConfig = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'week':
        groupByConfig = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'month':
        groupByConfig = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default:
        groupByConfig = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const pipeline = [
      { $match: matchConditions },
      {
        $group: {
          _id: groupByConfig,
          totalSales: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' },
          totalItems: { $sum: '$itemsCount' }
        }
      },
      { $sort: { '_id': 1 } }
    ];

    const salesData = await Order.aggregate(pipeline);

    // Get summary statistics
    const summary = await Order.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' },
          totalItems: { $sum: '$itemsCount' }
        }
      }
    ]);

    res.json({
      data: salesData,
      summary: summary[0] || {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalItems: 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/reports/inventory
// @desc    Get inventory report
// @access  Private
router.get('/inventory', auth, async (req, res) => {
  try {
    const { category, supplier, status } = req.query;

    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (supplier) filter.supplier = supplier;
    if (status) filter.status = status;

    // Inventory summary by category
    const inventoryByCategory = await Product.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
          averagePrice: { $avg: '$price' },
          lowStockItems: {
            $sum: {
              $cond: [{ $lte: ['$quantity', '$minStock'] }, 1, 0]
            }
          },
          outOfStockItems: {
            $sum: {
              $cond: [{ $eq: ['$quantity', 0] }, 1, 0]
            }
          }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    // Inventory summary by supplier
    const inventoryBySupplier = await Product.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplier',
          foreignField: '_id',
          as: 'supplierInfo'
        }
      },
      { $unwind: '$supplierInfo' },
      {
        $group: {
          _id: '$supplier',
          supplierName: { $first: '$supplierInfo.name' },
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
          lowStockItems: {
            $sum: {
              $cond: [{ $lte: ['$quantity', '$minStock'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    // Overall statistics
    const overallStats = await Product.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
          averagePrice: { $avg: '$price' },
          lowStockItems: {
            $sum: {
              $cond: [{ $lte: ['$quantity', '$minStock'] }, 1, 0]
            }
          },
          outOfStockItems: {
            $sum: {
              $cond: [{ $eq: ['$quantity', 0] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.json({
      byCategory: inventoryByCategory,
      bySupplier: inventoryBySupplier,
      overall: overallStats[0] || {
        totalProducts: 0,
        totalQuantity: 0,
        totalValue: 0,
        averagePrice: 0,
        lowStockItems: 0,
        outOfStockItems: 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/reports/products/top-selling
// @desc    Get top selling products report
// @access  Private
router.get('/products/top-selling', auth, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      limit = 20,
      sortBy = 'revenue' // revenue, quantity, orders
    } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchConditions = {
      status: { $in: ['delivered', 'shipped'] }
    };

    if (Object.keys(dateFilter).length > 0) {
      matchConditions.createdAt = dateFilter;
    }

    // Determine sort field
    let sortField;
    switch (sortBy) {
      case 'quantity':
        sortField = 'totalQuantity';
        break;
      case 'orders':
        sortField = 'totalOrders';
        break;
      default:
        sortField = 'totalRevenue';
    }

    const topProducts = await Order.aggregate([
      { $match: matchConditions },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.name' },
          sku: { $first: '$items.sku' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          totalOrders: { $sum: 1 },
          averagePrice: { $avg: '$items.unitPrice' }
        }
      },
      { $sort: { [sortField]: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json(topProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/reports/suppliers/performance
// @desc    Get supplier performance report
// @access  Private
router.get('/suppliers/performance', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter for orders
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Get supplier performance data
    const supplierPerformance = await Supplier.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'supplier',
          as: 'products'
        }
      },
      {
        $addFields: {
          totalProducts: { $size: '$products' },
          lowStockProducts: {
            $size: {
              $filter: {
                input: '$products',
                cond: { $lte: ['$$this.quantity', '$$this.minStock'] }
              }
            }
          },
          outOfStockProducts: {
            $size: {
              $filter: {
                input: '$products',
                cond: { $eq: ['$$this.quantity', 0] }
              }
            }
          },
          totalInventoryValue: {
            $sum: {
              $map: {
                input: '$products',
                as: 'product',
                in: { $multiply: ['$$product.quantity', '$$product.price'] }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          'contactPerson.name': 1,
          'contactPerson.email': 1,
          status: 1,
          rating: 1,
          categories: 1,
          totalProducts: 1,
          lowStockProducts: 1,
          outOfStockProducts: 1,
          totalInventoryValue: 1,
          'performance.totalOrders': 1,
          'performance.onTimeDelivery': 1,
          'performance.qualityRating': 1,
          'performance.lastOrderDate': 1
        }
      },
      { $sort: { totalInventoryValue: -1 } }
    ]);

    res.json(supplierPerformance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/reports/profit-analysis
// @desc    Get profit analysis report
// @access  Private
router.get('/profit-analysis', auth, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchConditions = {
      status: { $in: ['delivered', 'shipped'] }
    };

    if (Object.keys(dateFilter).length > 0) {
      matchConditions.createdAt = dateFilter;
    }

    // Group by configuration
    let groupByConfig;
    switch (groupBy) {
      case 'day':
        groupByConfig = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'week':
        groupByConfig = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'month':
        groupByConfig = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default:
        groupByConfig = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
    }

    const profitAnalysis = await Order.aggregate([
      { $match: matchConditions },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $addFields: {
          itemCost: { $multiply: ['$items.quantity', '$productInfo.cost'] },
          itemProfit: { 
            $subtract: [
              '$items.totalPrice',
              { $multiply: ['$items.quantity', '$productInfo.cost'] }
            ]
          }
        }
      },
      {
        $group: {
          _id: groupByConfig,
          totalRevenue: { $sum: '$items.totalPrice' },
          totalCost: { $sum: '$itemCost' },
          totalProfit: { $sum: '$itemProfit' },
          totalOrders: { $addToSet: '$_id' }
        }
      },
      {
        $addFields: {
          orderCount: { $size: '$totalOrders' },
          profitMargin: {
            $cond: [
              { $gt: ['$totalRevenue', 0] },
              { $multiply: [{ $divide: ['$totalProfit', '$totalRevenue'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json(profitAnalysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
