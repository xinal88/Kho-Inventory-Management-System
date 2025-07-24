import React, { useState } from 'react';
import { Edit, Trash2, Eye, AlertTriangle } from 'lucide-react';

// Mock data - in real app this would come from API
const inventoryData = [
  {
    id: 1,
    sku: 'IPH14P-256',
    name: 'iPhone 14 Pro 256GB',
    category: 'Electronics',
    price: 1099.99,
    cost: 850.00,
    quantity: 45,
    minStock: 20,
    supplier: 'Apple Inc.',
    lastUpdated: '2024-01-15'
  },
  {
    id: 2,
    sku: 'NAM-001',
    name: 'Nike Air Max 270',
    category: 'Footwear',
    price: 150.00,
    cost: 90.00,
    quantity: 3,
    minStock: 15,
    supplier: 'Nike',
    lastUpdated: '2024-01-14'
  },
  {
    id: 3,
    sku: 'SGS23-128',
    name: 'Samsung Galaxy S23 128GB',
    category: 'Electronics',
    price: 899.99,
    cost: 650.00,
    quantity: 28,
    minStock: 25,
    supplier: 'Samsung',
    lastUpdated: '2024-01-13'
  },
  {
    id: 4,
    sku: 'MBP-M2-512',
    name: 'MacBook Pro M2 512GB',
    category: 'Electronics',
    price: 1999.99,
    cost: 1500.00,
    quantity: 12,
    minStock: 10,
    supplier: 'Apple Inc.',
    lastUpdated: '2024-01-12'
  },
  {
    id: 5,
    sku: 'AUB-22',
    name: 'Adidas Ultraboost 22',
    category: 'Footwear',
    price: 180.00,
    cost: 110.00,
    quantity: 6,
    minStock: 20,
    supplier: 'Adidas',
    lastUpdated: '2024-01-11'
  }
];

const InventoryTable = ({ searchTerm, filterCategory }) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Filter and search logic
  const filteredData = inventoryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || 
                           item.category.toLowerCase().replace(' & ', '-').replace(' ', '-') === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStockStatus = (quantity, minStock) => {
    if (quantity === 0) {
      return { status: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    } else if (quantity <= minStock) {
      return { status: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
    } else {
      return { status: 'In Stock', color: 'text-green-600 bg-green-100' };
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('sku')}
            >
              SKU
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('name')}
            >
              Product Name
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('category')}
            >
              Category
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('price')}
            >
              Price
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('quantity')}
            >
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('supplier')}
            >
              Supplier
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((item) => {
            const stockStatus = getStockStatus(item.quantity, item.minStock);
            return (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      {item.quantity <= item.minStock && (
                        <div className="flex items-center text-xs text-red-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Low Stock Alert
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${item.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                    {stockStatus.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.supplier}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {sortedData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
