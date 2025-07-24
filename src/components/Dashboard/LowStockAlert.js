import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';

const lowStockItems = [
  { id: 1, name: 'iPhone 14 Pro', sku: 'IPH14P-256', currentStock: 5, minStock: 20, category: 'Electronics' },
  { id: 2, name: 'Nike Air Max', sku: 'NAM-001', currentStock: 3, minStock: 15, category: 'Footwear' },
  { id: 3, name: 'Samsung Galaxy S23', sku: 'SGS23-128', currentStock: 8, minStock: 25, category: 'Electronics' },
  { id: 4, name: 'MacBook Pro M2', sku: 'MBP-M2-512', currentStock: 2, minStock: 10, category: 'Electronics' },
  { id: 5, name: 'Adidas Ultraboost', sku: 'AUB-22', currentStock: 6, minStock: 20, category: 'Footwear' }
];

const LowStockAlert = () => {
  return (
    <div className="space-y-4">
      {lowStockItems.length === 0 ? (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No low stock alerts</p>
        </div>
      ) : (
        lowStockItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">SKU: {item.sku}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-red-600">
                {item.currentStock} / {item.minStock}
              </p>
              <p className="text-xs text-gray-500">{item.category}</p>
            </div>
          </div>
        ))
      )}
      
      {lowStockItems.length > 0 && (
        <button className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Reorder All Low Stock Items
        </button>
      )}
    </div>
  );
};

export default LowStockAlert;
