const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Order = require('../models/Order');

// Sample data
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
          email: 'business@apple.com',
          phone: '+1-408-996-1010',
          website: 'https://www.apple.com',
          taxId: 'US123456789'
        },
        address: {
          street: '1 Apple Park Way',
          city: 'Cupertino',
          state: 'CA',
          zipCode: '95014',
          country: 'United States'
        },
        categories: ['Electronics'],
        paymentTerms: 'Net 30',
        creditLimit: 1000000,
        status: 'active',
        rating: 4.9,
        performance: {
          totalOrders: 245,
          onTimeDelivery: 98,
          qualityRating: 4.9,
          lastOrderDate: new Date('2024-01-15'),
          averageLeadTime: 7
        }
      },
      {
        name: 'Samsung Electronics',
        contactPerson: {
          name: 'Jong-Hee Han',
          title: 'CEO',
          email: 'business@samsung.com',
          phone: '+82-2-2255-0114'
        },
        address: {
          street: '129 Samsung-ro, Yeongtong-gu',
          city: 'Suwon-si',
          state: 'Gyeonggi-do',
          zipCode: '16677',
          country: 'South Korea'
        },
        categories: ['Electronics'],
        status: 'active',
        rating: 4.7,
        performance: {
          totalOrders: 189,
          onTimeDelivery: 95,
          qualityRating: 4.7,
          lastOrderDate: new Date('2024-01-14'),
          averageLeadTime: 10
        }
      },
      {
        name: 'Nike Inc.',
        contactPerson: {
          name: 'John Donahoe',
          title: 'CEO',
          email: 'orders@nike.com',
          phone: '+1-503-671-6453'
        },
        address: {
          street: 'One Bowerman Drive',
          city: 'Beaverton',
          state: 'OR',
          zipCode: '97005',
          country: 'United States'
        },
        categories: ['Footwear', 'Clothing'],
        status: 'active',
        rating: 4.8,
        performance: {
          totalOrders: 156,
          onTimeDelivery: 97,
          qualityRating: 4.8,
          lastOrderDate: new Date('2024-01-13'),
          averageLeadTime: 5
        }
      }
    ];

    const createdSuppliers = await Supplier.insertMany(suppliers);
    console.log('Created sample suppliers');

    // Create sample products
    const products = [
      {
        sku: 'IPH14P-256',
        name: 'iPhone 14 Pro 256GB',
        description: 'Latest iPhone with Pro camera system',
        category: 'Electronics',
        price: 1099.99,
        cost: 850.00,
        quantity: 45,
        minStock: 20,
        supplier: createdSuppliers[0]._id,
        status: 'active',
        barcode: '123456789012',
        location: {
          warehouse: 'A',
          aisle: '1',
          shelf: 'A',
          bin: '001'
        }
      },
      {
        sku: 'SGS23-128',
        name: 'Samsung Galaxy S23 128GB',
        description: 'Premium Android smartphone',
        category: 'Electronics',
        price: 899.99,
        cost: 650.00,
        quantity: 28,
        minStock: 25,
        supplier: createdSuppliers[1]._id,
        status: 'active'
      },
      {
        sku: 'NAM-001',
        name: 'Nike Air Max 270',
        description: 'Comfortable running shoes',
        category: 'Footwear',
        price: 150.00,
        cost: 90.00,
        quantity: 3,
        minStock: 15,
        supplier: createdSuppliers[2]._id,
        status: 'active'
      },
      {
        sku: 'MBP-M2-512',
        name: 'MacBook Pro M2 512GB',
        description: 'Professional laptop with M2 chip',
        category: 'Electronics',
        price: 1999.99,
        cost: 1500.00,
        quantity: 12,
        minStock: 10,
        supplier: createdSuppliers[0]._id,
        status: 'active'
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log('Created sample products');

    // Create sample orders
    const orders = [
      {
        customer: {
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+1-555-0123'
        },
        items: [
          {
            product: createdProducts[0]._id,
            sku: createdProducts[0].sku,
            name: createdProducts[0].name,
            quantity: 1,
            unitPrice: createdProducts[0].price,
            totalPrice: createdProducts[0].price
          }
        ],
        subtotal: 1099.99,
        tax: 87.99,
        shipping: 0,
        total: 1187.98,
        status: 'delivered',
        paymentStatus: 'paid',
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States'
        },
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date('2024-01-10'),
            notes: 'Order created'
          },
          {
            status: 'delivered',
            timestamp: new Date('2024-01-15'),
            notes: 'Order delivered'
          }
        ]
      },
      {
        customer: {
          name: 'Sarah Johnson',
          email: 'sarah.j@email.com',
          phone: '+1-555-0124'
        },
        items: [
          {
            product: createdProducts[1]._id,
            sku: createdProducts[1].sku,
            name: createdProducts[1].name,
            quantity: 1,
            unitPrice: createdProducts[1].price,
            totalPrice: createdProducts[1].price
          }
        ],
        subtotal: 899.99,
        tax: 71.99,
        shipping: 10,
        total: 981.98,
        status: 'processing',
        paymentStatus: 'paid',
        shippingAddress: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'United States'
        }
      }
    ];

    await Order.insertMany(orders);
    console.log('Created sample orders');

    console.log('✅ Sample data seeded successfully!');
    console.log('Login credentials:');
    console.log('Email: admin@inventory.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
