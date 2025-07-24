import React from 'react';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';
import InventoryChart from '../components/Dashboard/InventoryChart';
import RecentOrders from '../components/Dashboard/RecentOrders';
import LowStockAlert from '../components/Dashboard/LowStockAlert';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Products',
      value: '2,847',
      change: '+12%',
      changeType: 'positive',
      icon: Package,
      color: 'blue'
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+8%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'green'
    },
    {
      title: 'Active Suppliers',
      value: '156',
      change: '+3%',
      changeType: 'positive',
      icon: Users,
      color: 'purple'
    },
    {
      title: 'Revenue',
      value: '$45,678',
      change: '+15%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'yellow'
    },
    {
      title: 'Low Stock Items',
      value: '23',
      change: '-5%',
      changeType: 'negative',
      icon: AlertTriangle,
      color: 'red'
    },
    {
      title: 'Growth Rate',
      value: '12.5%',
      change: '+2.1%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'indigo'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your inventory.</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Overview</h3>
          <InventoryChart />
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
          <LowStockAlert />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
        <RecentOrders />
      </div>
    </div>
  );
};

export default Dashboard;
