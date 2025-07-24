const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Order = require('../models/Order');

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Supplier.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    // Create users
    console.log('👥 Creating users...');
    const sampleUsers = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@inventory.com',
        password: 'admin123',
        role: 'admin',
        permissions: [
          'inventory.read', 'inventory.write', 'inventory.delete',
          'orders.read', 'orders.write', 'orders.delete',
          'suppliers.read', 'suppliers.write', 'suppliers.delete',
          'reports.read', 'users.read', 'users.write', 'users.delete',
          'settings.read', 'settings.write'
        ],
        department: 'admin',
        phone: '+1-555-0001',
        emailVerified: true
      },
      {
        firstName: 'John',
        lastName: 'Manager',
        email: 'manager@inventory.com',
        password: 'manager123',
        role: 'manager',
        permissions: [
          'inventory.read', 'inventory.write',
          'orders.read', 'orders.write',
          'suppliers.read', 'suppliers.write',
          'reports.read'
        ],
        department: 'inventory',
        phone: '+1-555-0002',
        emailVerified: true
      },
      {
        firstName: 'Sarah',
        lastName: 'Employee',
        email: 'employee@inventory.com',
        password: 'employee123',
        role: 'employee',
        permissions: [
          'inventory.read', 'inventory.write',
          'orders.read', 'orders.write'
        ],
        department: 'warehouse',
        phone: '+1-555-0003',
        emailVerified: true
      }
    ];

    const users = await User.create(sampleUsers);
    console.log(`✅ Created ${users.length} users`);

    // Create suppliers
    console.log('🏢 Creating suppliers...');
    const sampleSuppliers = [
      {
        name: 'TechCorp Electronics',
        contactPerson: {
          name: 'Michael Chen',
          title: 'Sales Manager',
          email: 'michael.chen@techcorp.com',
          phone: '+1-555-1001'
        },
        company: {
          email: 'sales@techcorp.com',
          phone: '+1-555-1000',
          website: 'https://techcorp.com',
          taxId: 'TC123456789'
        },
        address: {
          street: '123 Tech Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'United States'
        },
        categories: ['Electronics'],
        paymentTerms: 'Net 30',
        creditLimit: 50000,
        rating: 4.5,
        performance: {
          totalOrders: 25,
          onTimeDelivery: 95,
          qualityRating: 4.5,
          averageLeadTime: 7
        },
        createdBy: users[0]._id
      },
      {
        name: 'Fashion Forward Inc',
        contactPerson: {
          name: 'Emma Rodriguez',
          title: 'Account Executive',
          email: 'emma.rodriguez@fashionforward.com',
          phone: '+1-555-2001'
        },
        company: {
          email: 'orders@fashionforward.com',
          phone: '+1-555-2000',
          website: 'https://fashionforward.com',
          taxId: 'FF987654321'
        },
        address: {
          street: '456 Fashion Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States'
        },
        categories: ['Clothing', 'Footwear'],
        paymentTerms: 'Net 45',
        creditLimit: 75000,
        rating: 4.2,
        performance: {
          totalOrders: 18,
          onTimeDelivery: 88,
          qualityRating: 4.2,
          averageLeadTime: 10
        },
        createdBy: users[0]._id
      },
      {
        name: 'BookWorld Publishers',
        contactPerson: {
          name: 'David Thompson',
          title: 'Distribution Manager',
          email: 'david.thompson@bookworld.com',
          phone: '+1-555-3001'
        },
        company: {
          email: 'distribution@bookworld.com',
          phone: '+1-555-3000',
          website: 'https://bookworld.com',
          taxId: 'BW456789123'
        },
        address: {
          street: '789 Literary Lane',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'United States'
        },
        categories: ['Books'],
        paymentTerms: 'Net 30',
        creditLimit: 30000,
        rating: 4.8,
        performance: {
          totalOrders: 32,
          onTimeDelivery: 98,
          qualityRating: 4.8,
          averageLeadTime: 5
        },
        createdBy: users[0]._id
      },
      {
        name: 'HomeStyle Solutions',
        contactPerson: {
          name: 'Lisa Park',
          title: 'Sales Director',
          email: 'lisa.park@homestyle.com',
          phone: '+1-555-4001'
        },
        company: {
          email: 'sales@homestyle.com',
          phone: '+1-555-4000',
          website: 'https://homestyle.com',
          taxId: 'HS789123456'
        },
        address: {
          street: '321 Home Depot Way',
          city: 'Atlanta',
          state: 'GA',
          zipCode: '30309',
          country: 'United States'
        },
        categories: ['Home & Garden'],
        paymentTerms: 'Net 30',
        creditLimit: 40000,
        rating: 4.3,
        performance: {
          totalOrders: 22,
          onTimeDelivery: 92,
          qualityRating: 4.3,
          averageLeadTime: 8
        },
        createdBy: users[0]._id
      },
      {
        name: 'SportZone Equipment',
        contactPerson: {
          name: 'Mark Johnson',
          title: 'Regional Manager',
          email: 'mark.johnson@sportzone.com',
          phone: '+1-555-5001'
        },
        company: {
          email: 'orders@sportzone.com',
          phone: '+1-555-5000',
          website: 'https://sportzone.com',
          taxId: 'SZ123789456'
        },
        address: {
          street: '654 Athletic Blvd',
          city: 'Denver',
          state: 'CO',
          zipCode: '80202',
          country: 'United States'
        },
        categories: ['Sports'],
        paymentTerms: 'Net 30',
        creditLimit: 35000,
        rating: 4.1,
        performance: {
          totalOrders: 15,
          onTimeDelivery: 85,
          qualityRating: 4.1,
          averageLeadTime: 12
        },
        createdBy: users[0]._id
      }
    ];

    const suppliers = await Supplier.create(sampleSuppliers);
    console.log(`✅ Created ${suppliers.length} suppliers`);

    // Create products
    console.log('📦 Creating products...');
    const sampleProducts = [
      // Electronics from TechCorp
      {
        sku: 'TECH001',
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        category: 'Electronics',
        price: 199.99,
        cost: 120.00,
        quantity: 45,
        minStock: 10,
        maxStock: 100,
        supplier: suppliers[0]._id,
        location: { warehouse: 'A', aisle: '1', shelf: 'A', bin: '001' },
        reorderPoint: 15,
        reorderQuantity: 50,
        tags: ['wireless', 'bluetooth', 'audio'],
        createdBy: users[0]._id
      },
      {
        sku: 'TECH002',
        name: 'Smartphone Case',
        description: 'Protective case for latest smartphone models',
        category: 'Electronics',
        price: 29.99,
        cost: 15.00,
        quantity: 120,
        minStock: 20,
        maxStock: 200,
        supplier: suppliers[0]._id,
        location: { warehouse: 'A', aisle: '1', shelf: 'B', bin: '002' },
        reorderPoint: 25,
        reorderQuantity: 100,
        tags: ['protection', 'smartphone', 'accessory'],
        createdBy: users[0]._id
      },
      {
        sku: 'TECH003',
        name: 'USB-C Charging Cable',
        description: 'Fast charging USB-C cable 6ft length',
        category: 'Electronics',
        price: 19.99,
        cost: 8.00,
        quantity: 200,
        minStock: 30,
        maxStock: 300,
        supplier: suppliers[0]._id,
        location: { warehouse: 'A', aisle: '1', shelf: 'C', bin: '003' },
        reorderPoint: 40,
        reorderQuantity: 150,
        tags: ['charging', 'usb-c', 'cable'],
        createdBy: users[0]._id
      },
      // Clothing from Fashion Forward
      {
        sku: 'FASH001',
        name: 'Cotton T-Shirt',
        description: 'Premium cotton t-shirt available in multiple colors',
        category: 'Clothing',
        price: 24.99,
        cost: 12.00,
        quantity: 85,
        minStock: 15,
        maxStock: 150,
        supplier: suppliers[1]._id,
        location: { warehouse: 'B', aisle: '2', shelf: 'A', bin: '001' },
        reorderPoint: 20,
        reorderQuantity: 75,
        tags: ['cotton', 'casual', 'basic'],
        createdBy: users[0]._id
      },
      {
        sku: 'FASH002',
        name: 'Denim Jeans',
        description: 'Classic fit denim jeans in various sizes',
        category: 'Clothing',
        price: 79.99,
        cost: 40.00,
        quantity: 60,
        minStock: 10,
        maxStock: 100,
        supplier: suppliers[1]._id,
        location: { warehouse: 'B', aisle: '2', shelf: 'B', bin: '002' },
        reorderPoint: 15,
        reorderQuantity: 50,
        tags: ['denim', 'jeans', 'classic'],
        createdBy: users[0]._id
      },
      // Books from BookWorld
      {
        sku: 'BOOK001',
        name: 'JavaScript Programming Guide',
        description: 'Comprehensive guide to modern JavaScript programming',
        category: 'Books',
        price: 49.99,
        cost: 25.00,
        quantity: 30,
        minStock: 5,
        maxStock: 50,
        supplier: suppliers[2]._id,
        location: { warehouse: 'C', aisle: '3', shelf: 'A', bin: '001' },
        reorderPoint: 8,
        reorderQuantity: 25,
        tags: ['programming', 'javascript', 'education'],
        createdBy: users[0]._id
      },
      {
        sku: 'BOOK002',
        name: 'Business Management Essentials',
        description: 'Essential principles of modern business management',
        category: 'Books',
        price: 39.99,
        cost: 20.00,
        quantity: 25,
        minStock: 5,
        maxStock: 40,
        supplier: suppliers[2]._id,
        location: { warehouse: 'C', aisle: '3', shelf: 'B', bin: '002' },
        reorderPoint: 8,
        reorderQuantity: 20,
        tags: ['business', 'management', 'education'],
        createdBy: users[0]._id
      },
      // Home & Garden from HomeStyle
      {
        sku: 'HOME001',
        name: 'Garden Tool Set',
        description: 'Complete set of essential garden tools',
        category: 'Home & Garden',
        price: 89.99,
        cost: 45.00,
        quantity: 35,
        minStock: 8,
        maxStock: 60,
        supplier: suppliers[3]._id,
        location: { warehouse: 'D', aisle: '4', shelf: 'A', bin: '001' },
        reorderPoint: 12,
        reorderQuantity: 30,
        tags: ['gardening', 'tools', 'outdoor'],
        createdBy: users[0]._id
      },
      {
        sku: 'HOME002',
        name: 'Indoor Plant Pot',
        description: 'Decorative ceramic pot for indoor plants',
        category: 'Home & Garden',
        price: 34.99,
        cost: 18.00,
        quantity: 50,
        minStock: 10,
        maxStock: 80,
        supplier: suppliers[3]._id,
        location: { warehouse: 'D', aisle: '4', shelf: 'B', bin: '002' },
        reorderPoint: 15,
        reorderQuantity: 40,
        tags: ['plants', 'decoration', 'indoor'],
        createdBy: users[0]._id
      },
      // Sports from SportZone
      {
        sku: 'SPORT001',
        name: 'Basketball',
        description: 'Official size basketball for indoor/outdoor use',
        category: 'Sports',
        price: 29.99,
        cost: 15.00,
        quantity: 40,
        minStock: 8,
        maxStock: 70,
        supplier: suppliers[4]._id,
        location: { warehouse: 'E', aisle: '5', shelf: 'A', bin: '001' },
        reorderPoint: 12,
        reorderQuantity: 35,
        tags: ['basketball', 'sports', 'outdoor'],
        createdBy: users[0]._id
      },
      {
        sku: 'SPORT002',
        name: 'Yoga Mat',
        description: 'Non-slip yoga mat with carrying strap',
        category: 'Sports',
        price: 39.99,
        cost: 20.00,
        quantity: 55,
        minStock: 10,
        maxStock: 90,
        supplier: suppliers[4]._id,
        location: { warehouse: 'E', aisle: '5', shelf: 'B', bin: '002' },
        reorderPoint: 15,
        reorderQuantity: 45,
        tags: ['yoga', 'fitness', 'exercise'],
        createdBy: users[0]._id
      },
      // Low stock item for testing alerts
      {
        sku: 'LOW001',
        name: 'Limited Edition Watch',
        description: 'Luxury watch with limited availability',
        category: 'Electronics',
        price: 299.99,
        cost: 180.00,
        quantity: 3, // Below minStock
        minStock: 5,
        maxStock: 20,
        supplier: suppliers[0]._id,
        location: { warehouse: 'A', aisle: '1', shelf: 'D', bin: '004' },
        reorderPoint: 5,
        reorderQuantity: 15,
        tags: ['luxury', 'watch', 'limited'],
        createdBy: users[0]._id
      }
    ];

    const products = await Product.create(sampleProducts);
    console.log(`✅ Created ${products.length} products`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n🔐 Sample login credentials:');
    console.log('Admin: admin@inventory.com / admin123');
    console.log('Manager: manager@inventory.com / manager123');
    console.log('Employee: employee@inventory.com / employee123');

    console.log('\n📊 Database Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Suppliers: ${suppliers.length}`);
    console.log(`- Products: ${products.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase();
