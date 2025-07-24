import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';

const suppliersData = [
  {
    id: 1,
    name: 'Apple Inc.',
    contact: 'Tim Cook',
    email: 'contact@apple.com',
    phone: '+1-408-996-1010',
    address: '1 Apple Park Way, Cupertino, CA 95014',
    category: 'Electronics',
    status: 'Active',
    productsSupplied: 15,
    totalOrders: 245,
    lastOrder: '2024-01-15',
    rating: 4.9
  },
  {
    id: 2,
    name: 'Samsung Electronics',
    contact: 'Jong-Hee Han',
    email: 'business@samsung.com',
    phone: '+82-2-2255-0114',
    address: '129 Samsung-ro, Yeongtong-gu, Suwon-si, Gyeonggi-do, South Korea',
    category: 'Electronics',
    status: 'Active',
    productsSupplied: 12,
    totalOrders: 189,
    lastOrder: '2024-01-14',
    rating: 4.7
  },
  {
    id: 3,
    name: 'Nike Inc.',
    contact: 'John Donahoe',
    email: 'orders@nike.com',
    phone: '+1-503-671-6453',
    address: 'One Bowerman Drive, Beaverton, OR 97005',
    category: 'Footwear',
    status: 'Active',
    productsSupplied: 28,
    totalOrders: 156,
    lastOrder: '2024-01-13',
    rating: 4.8
  },
  {
    id: 4,
    name: 'Adidas AG',
    contact: 'Kasper Rorsted',
    email: 'business@adidas.com',
    phone: '+49-9132-84-0',
    address: 'Adi-Dassler-Strasse 1, 91074 Herzogenaurach, Germany',
    category: 'Footwear',
    status: 'Active',
    productsSupplied: 22,
    totalOrders: 134,
    lastOrder: '2024-01-12',
    rating: 4.6
  },
  {
    id: 5,
    name: 'TechSupply Co.',
    contact: 'Jane Smith',
    email: 'sales@techsupply.com',
    phone: '+1-555-123-4567',
    address: '123 Tech Street, Silicon Valley, CA 94000',
    category: 'Electronics',
    status: 'Inactive',
    productsSupplied: 8,
    totalOrders: 45,
    lastOrder: '2023-12-20',
    rating: 4.2
  }
];

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'footwear', label: 'Footwear' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'books', label: 'Books' }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const filteredSuppliers = suppliersData.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         supplier.status.toLowerCase() === statusFilter;
    const matchesCategory = categoryFilter === 'all' || 
                           supplier.category.toLowerCase() === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600">Manage your supplier relationships and contacts</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Supplier
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                <p className="text-sm text-gray-600">{supplier.contact}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(supplier.status)}`}>
                {supplier.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {supplier.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {supplier.phone}
              </div>
              <div className="flex items-start text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{supplier.address}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-500">Products:</span>
                <span className="ml-1 font-medium">{supplier.productsSupplied}</span>
              </div>
              <div>
                <span className="text-gray-500">Orders:</span>
                <span className="ml-1 font-medium">{supplier.totalOrders}</span>
              </div>
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-1 font-medium">{supplier.category}</span>
              </div>
              <div>
                <span className="text-gray-500">Rating:</span>
                <span className="ml-1 font-medium">{supplier.rating}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Last order: {supplier.lastOrder}
              </div>
              <div className="flex space-x-2">
                <button 
                  className="text-blue-600 hover:text-blue-900"
                  onClick={() => setSelectedSupplier(supplier)}
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button className="text-green-600 hover:text-green-900">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No suppliers found matching your criteria.</p>
        </div>
      )}

      {/* Supplier Details Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedSupplier(null)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Supplier Details</h3>
                  <button onClick={() => setSelectedSupplier(null)} className="text-gray-400 hover:text-gray-600">
                    ×
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Company Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedSupplier.name}</p>
                      <p><span className="font-medium">Contact:</span> {selectedSupplier.contact}</p>
                      <p><span className="font-medium">Category:</span> {selectedSupplier.category}</p>
                      <p><span className="font-medium">Status:</span> {selectedSupplier.status}</p>
                      <p><span className="font-medium">Rating:</span> {selectedSupplier.rating} {getRatingStars(selectedSupplier.rating)}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Email:</span> {selectedSupplier.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedSupplier.phone}</p>
                      <p><span className="font-medium">Address:</span> {selectedSupplier.address}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Business Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Products Supplied:</span> {selectedSupplier.productsSupplied}</p>
                      <p><span className="font-medium">Total Orders:</span> {selectedSupplier.totalOrders}</p>
                      <p><span className="font-medium">Last Order:</span> {selectedSupplier.lastOrder}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
