import React from "react";
import Layout from "../components/Layout";
import { Users, Settings } from "lucide-react";

const Maintenance: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-gray-600">Manage system settings and users</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="card">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  User Management
                </h3>
                <p className="text-sm text-gray-500">
                  Manage system users and roles
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  System Settings
                </h3>
                <p className="text-sm text-gray-500">
                  Configure system parameters
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Maintenance;
