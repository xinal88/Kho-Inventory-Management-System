const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const Supplier = require('../models/Supplier');
const { auth } = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Product statistics
    const totalProducts = await Product.countDocuments({ status: 'active' });
    const lowStockProducts = await Product.countDocuments({
      status: 'active',
      $expr: { $lte: ['$quantity', '$minStock'] }
    });
    const outOfStockProducts = await Product.countDocuments({
      status: 'active',
      quantity: 0
    });

    // Order statistics
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: startDate }
    });
    const pendingOrders = await Order.countDocuments({
      status: 'pending'
    });
    const completedOrders = await Order.countDocuments({
      status: 'delivered',
      createdAt: { $gte: startDate }
    });

    // Revenue statistics
    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, averageOrderValue: 0 };

    // Supplier statistics
    const totalSuppliers = await Supplier.countDocuments({ status: 'active' });

    // Growth calculations (compare with previous period)
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - parseInt(period));

    const previousRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousStartDate, $lt: startDate },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);

    const previousRevenueAmount = previousRevenue[0]?.totalRevenue || 0;
    const revenueGrowth = previousRevenueAmount > 0 
      ? ((revenue.totalRevenue - previousRevenueAmount) / previousRevenueAmount * 100).toFixed(1)
      : 0;

    const previousOrders = await Order.countDocuments({
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });

    const orderGrowth = previousOrders > 0 
      ? ((totalOrders - previousOrders) / previousOrders * 100).toFixed(1)
      : 0;

    res.json({
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
        growth: orderGrowth
      },
      revenue: {
        total: revenue.totalRevenue,
        average: revenue.averageOrderValue,
        growth: revenueGrowth
      },
      suppliers: {
        total: totalSuppliers
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/dashboard/charts/sales
// @desc    Get sales chart data
// @access  Private
router.get('/charts/sales', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          sales: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json(salesData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/dashboard/charts/inventory
// @desc    Get inventory chart data
// @access  Private
router.get('/charts/inventory', auth, async (req, res) => {
  try {
    const inventoryData = await Product.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
          inStock: {
            $sum: {
              $cond: [{ $gt: ['$quantity', '$minStock'] }, 1, 0]
            }
          },
          lowStock: {
            $sum: {
              $cond: [
                { $and: [{ $lte: ['$quantity', '$minStock'] }, { $gt: ['$quantity', 0] }] },
                1,
                0
              ]
            }
          },
          outOfStock: {
            $sum: {
              $cond: [{ $eq: ['$quantity', 0] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { totalValue: -1 }
      }
    ]);

    res.json(inventoryData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/dashboard/recent-orders
// @desc    Get recent orders
// @access  Private
router.get('/recent-orders', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('orderNumber customer.name status total createdAt itemsCount')
      .lean();

    res.json(recentOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/dashboard/low-stock-alerts
// @desc    Get low stock alerts
// @access  Private
router.get('/low-stock-alerts', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const lowStockProducts = await Product.find({
      status: 'active',
      $expr: { $lte: ['$quantity', '$minStock'] }
    })
    .populate('supplier', 'name')
    .sort({ quantity: 1 })
    .limit(parseInt(limit))
    .select('sku name category quantity minStock supplier');

    res.json(lowStockProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/dashboard/top-products
// @desc    Get top selling products
// @access  Private
router.get('/top-products', auth, async (req, res) => {
  try {
    const { period = '30', limit = 10 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          sku: { $first: '$items.sku' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json(topProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/dashboard/alerts
// @desc    Get all dashboard alerts
// @access  Private
router.get('/alerts', auth, async (req, res) => {
  try {
    const alerts = [];

    // Low stock alerts
    const lowStockCount = await Product.countDocuments({
      status: 'active',
      $expr: { $lte: ['$quantity', '$minStock'] }
    });

    if (lowStockCount > 0) {
      alerts.push({
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${lowStockCount} products are running low on stock`,
        action: 'View Products',
        link: '/inventory?filter=lowStock'
      });
    }

    // Out of stock alerts
    const outOfStockCount = await Product.countDocuments({
      status: 'active',
      quantity: 0
    });

    if (outOfStockCount > 0) {
      alerts.push({
        type: 'error',
        title: 'Out of Stock Alert',
        message: `${outOfStockCount} products are out of stock`,
        action: 'View Products',
        link: '/inventory?filter=outOfStock'
      });
    }

    // Pending orders
    const pendingOrdersCount = await Order.countDocuments({
      status: 'pending'
    });

    if (pendingOrdersCount > 0) {
      alerts.push({
        type: 'info',
        title: 'Pending Orders',
        message: `${pendingOrdersCount} orders are waiting for processing`,
        action: 'View Orders',
        link: '/orders?status=pending'
      });
    }

    res.json(alerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
