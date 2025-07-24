import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Electronics', inStock: 450, lowStock: 23, outOfStock: 5 },
  { name: 'Clothing', inStock: 320, lowStock: 15, outOfStock: 8 },
  { name: 'Books', inStock: 280, lowStock: 12, outOfStock: 3 },
  { name: 'Home & Garden', inStock: 190, lowStock: 8, outOfStock: 2 },
  { name: 'Sports', inStock: 150, lowStock: 6, outOfStock: 4 },
  { name: 'Toys', inStock: 120, lowStock: 4, outOfStock: 1 }
];

const InventoryChart = () => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="inStock" stackId="a" fill="#10b981" name="In Stock" />
          <Bar dataKey="lowStock" stackId="a" fill="#f59e0b" name="Low Stock" />
          <Bar dataKey="outOfStock" stackId="a" fill="#ef4444" name="Out of Stock" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InventoryChart;
