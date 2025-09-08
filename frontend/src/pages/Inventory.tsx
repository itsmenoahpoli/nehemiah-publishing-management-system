import React from "react";
import Layout from "../components/Layout";
import { Package, Warehouse } from "lucide-react";

const Inventory: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">Manage warehouse and school inventory</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="card">
            <div className="flex items-center mb-4">
              <Warehouse className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Warehouse Stock
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              View and manage warehouse inventory levels
            </p>
            <button className="btn-primary">View Warehouse Stock</button>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <Package className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                School Inventory
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              View and manage school inventory levels
            </p>
            <button className="btn-primary">View School Inventory</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Inventory;
