const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_management');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@inventory.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@inventory.com',
      password: 'admin123',
      role: 'admin',
      department: 'admin',
      status: 'active',
      emailVerified: true,
      permissions: [
        'inventory.read',
        'inventory.write',
        'inventory.delete',
        'orders.read',
        'orders.write',
        'orders.delete',
        'suppliers.read',
        'suppliers.write',
        'suppliers.delete',
        'reports.read',
        'users.read',
        'users.write',
        'users.delete',
        'settings.read',
        'settings.write'
      ]
    });

    await admin.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@inventory.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();
