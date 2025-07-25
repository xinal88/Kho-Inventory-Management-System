# Inventory Management Dashboard

A comprehensive web-based inventory management system built with React, Node.js, Express, and MongoDB. This dashboard provides real-time inventory tracking, supplier management, sales order processing, and detailed analytics.

## Features

### 📊 Dashboard Overview
- Real-time inventory metrics and KPIs
- Interactive charts and graphs
- Low stock alerts and notifications
- Recent orders and activity feed

### 📦 Inventory Management
- Product catalog with detailed information
- Stock level tracking and alerts
- Category-based organization
- Barcode support and SKU management
- Bulk import/export functionality

### 🛒 Sales Orders
- Order creation and management
- Status tracking (Pending, Processing, Shipped, Delivered)
- Customer information management
- Order history and analytics

### 🏢 Supplier Management
- Supplier contact information
- Performance tracking and ratings
- Purchase order management
- Supplier categorization

### 📈 Reports & Analytics
- Sales performance reports
- Inventory turnover analysis
- Profit margin calculations
- Customizable date ranges
- Export functionality (PDF, Excel)

### 👥 User Management
- Role-based access control
- User permissions and departments
- Activity logging and audit trails

## Technology Stack

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (v4.4 or higher)
- **Git**

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd inventory-management-dashboard
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# MONGODB_URI=mongodb://localhost:27017/inventory_management
# JWT_SECRET=your_super_secret_jwt_key_here
# PORT=5000
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd ../

# Install dependencies
npm install
```

### 4. Database Setup

Make sure MongoDB is running on your system:

```bash
# Start MongoDB (if using local installation)
mongod

# Or start MongoDB service
sudo systemctl start mongod
```

### 5. Start the Application

#### Start Backend Server
```bash
cd backend
npm run dev
```
The backend server will start on `http://localhost:5000`

#### Start Frontend Development Server
```bash
# In a new terminal, from root directory
npm start
```
The frontend will start on `http://localhost:3000`

## Default Login Credentials

After setting up the database, you can create an admin user by registering through the API or by running the seed script:

```bash
cd backend
node scripts/createAdmin.js
```

Default credentials:
- **Email**: admin@inventory.com
- **Password**: admin123

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Product Endpoints
- `GET /api/products` - Get all products (with filtering)
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Order Endpoints
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order status

### Supplier Endpoints
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create new supplier
- `GET /api/suppliers/:id` - Get supplier by ID
- `PUT /api/suppliers/:id` - Update supplier

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/inventory_management
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Project Structure

```
inventory-management-dashboard/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── scripts/         # Utility scripts
│   └── server.js        # Express server
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utility functions
│   └── App.js          # Main App component
├── public/             # Static assets
└── package.json        # Dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@inventory-dashboard.com or create an issue in the repository.

## Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics and forecasting
- [ ] Integration with external APIs (shipping, payment)
- [ ] Multi-warehouse support
- [ ] Automated reordering system
- [ ] Barcode scanning mobile app
#   K h o - I n v e n t o r y - M a n a g e m e n t - S y s t e m  
 