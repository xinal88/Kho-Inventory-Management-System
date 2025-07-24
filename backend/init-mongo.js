// MongoDB initialization script
db = db.getSiblingDB('inventory_management');

// Create collections
db.createCollection('users');
db.createCollection('products');
db.createCollection('suppliers');
db.createCollection('orders');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.products.createIndex({ "sku": 1 }, { unique: true });
db.products.createIndex({ "name": "text", "description": "text" });
db.suppliers.createIndex({ "name": "text" });
db.orders.createIndex({ "orderNumber": 1 }, { unique: true });

print('Database initialized successfully!');
