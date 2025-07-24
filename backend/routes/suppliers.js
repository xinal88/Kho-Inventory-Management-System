const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Supplier = require('../models/Supplier');
const { auth } = require('../middleware/auth');

// @route   GET /api/suppliers
// @desc    Get all suppliers with filtering and pagination
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      category,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'contactPerson.name': { $regex: search, $options: 'i' } },
        { 'contactPerson.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) filter.status = status;
    if (category) filter.categories = category;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const suppliers = await Supplier.find(filter)
      .populate('productsCount')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const total = await Supplier.countDocuments(filter);

    res.json({
      suppliers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/suppliers/:id
// @desc    Get supplier by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('productsCount');
    
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    res.json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/suppliers
// @desc    Create new supplier
// @access  Private
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Supplier name is required'),
  body('contactPerson.name').notEmpty().withMessage('Contact person name is required'),
  body('contactPerson.email').isEmail().withMessage('Valid contact email is required'),
  body('contactPerson.phone').notEmpty().withMessage('Contact phone is required'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.zipCode').notEmpty().withMessage('Zip code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if supplier with same email already exists
    const existingSupplier = await Supplier.findOne({ 
      'contactPerson.email': req.body.contactPerson.email 
    });
    if (existingSupplier) {
      return res.status(400).json({ error: 'Supplier with this email already exists' });
    }

    const supplier = new Supplier({
      ...req.body,
      createdBy: req.user.id
    });

    await supplier.save();
    
    res.status(201).json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/suppliers/:id
// @desc    Update supplier
// @access  Private
router.put('/:id', [
  auth,
  body('name').optional().notEmpty().withMessage('Supplier name cannot be empty'),
  body('contactPerson.email').optional().isEmail().withMessage('Valid contact email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Check if email is being changed and if it already exists
    if (req.body.contactPerson?.email && 
        req.body.contactPerson.email !== supplier.contactPerson.email) {
      const existingSupplier = await Supplier.findOne({ 
        'contactPerson.email': req.body.contactPerson.email 
      });
      if (existingSupplier) {
        return res.status(400).json({ error: 'Supplier with this email already exists' });
      }
    }

    // Deep merge for nested objects
    if (req.body.contactPerson) {
      supplier.contactPerson = { ...supplier.contactPerson, ...req.body.contactPerson };
      delete req.body.contactPerson;
    }
    if (req.body.company) {
      supplier.company = { ...supplier.company, ...req.body.company };
      delete req.body.company;
    }
    if (req.body.address) {
      supplier.address = { ...supplier.address, ...req.body.address };
      delete req.body.address;
    }
    if (req.body.performance) {
      supplier.performance = { ...supplier.performance, ...req.body.performance };
      delete req.body.performance;
    }

    Object.assign(supplier, req.body, { updatedBy: req.user.id });
    await supplier.save();
    
    res.json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/suppliers/:id
// @desc    Delete supplier
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Check if supplier has associated products
    const Product = require('../models/Product');
    const productCount = await Product.countDocuments({ supplier: req.params.id });
    
    if (productCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete supplier. ${productCount} products are associated with this supplier.` 
      });
    }

    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/suppliers/:id/products
// @desc    Get products by supplier
// @access  Private
router.get('/:id/products', auth, async (req, res) => {
  try {
    const Product = require('../models/Product');
    const products = await Product.find({ supplier: req.params.id })
      .select('sku name category price quantity minStock status');
    
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/suppliers/:id/rating
// @desc    Update supplier rating
// @access  Private
router.put('/:id/rating', [
  auth,
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, notes } = req.body;
    
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    supplier.rating = rating;
    if (notes) supplier.notes = notes;
    supplier.updatedBy = req.user.id;
    
    await supplier.save();
    
    res.json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/suppliers/stats/overview
// @desc    Get supplier statistics
// @access  Private
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const totalSuppliers = await Supplier.countDocuments();
    const activeSuppliers = await Supplier.countDocuments({ status: 'active' });
    const inactiveSuppliers = await Supplier.countDocuments({ status: 'inactive' });
    
    // Get suppliers by category
    const suppliersByCategory = await Supplier.aggregate([
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get average rating
    const avgRating = await Supplier.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    res.json({
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      suppliersByCategory,
      averageRating: avgRating[0]?.avgRating || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
