import React from "react";
import Layout from "../components/Layout";
import { BarChart3, TrendingUp, Package, Users } from "lucide-react";

const Reports: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">View and generate system reports</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Sales Report
                </h3>
                <p className="text-sm text-gray-500">View sales analytics</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Inventory Report
                </h3>
                <p className="text-sm text-gray-500">Stock levels and status</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Transaction Report
                </h3>
                <p className="text-sm text-gray-500">
                  All transactions history
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  School Report
                </h3>
                <p className="text-sm text-gray-500">
                  School registrations and activity
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Reports
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">
                  Monthly Sales Report
                </h4>
                <p className="text-sm text-gray-500">
                  Generated on January 15, 2024
                </p>
              </div>
              <button className="btn-secondary">Download</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">
                  Inventory Status Report
                </h4>
                <p className="text-sm text-gray-500">
                  Generated on January 14, 2024
                </p>
              </div>
              <button className="btn-secondary">Download</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
