import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../lib/api";
import {
  Package,
  Users,
  CreditCard,
  TrendingUp,
  BookOpen,
  RotateCcw,
} from "lucide-react";

interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  totalSales: number;
  pendingRequests: number;
  lowStockBooks: number;
  totalReturns: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalUsers: 0,
    totalSales: 0,
    pendingRequests: 0,
    lowStockBooks: 0,
    totalReturns: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/reports/inventory");
        if (data.success) {
          setStats({
            totalBooks:
              data.data.summary.totalWarehouseBooks +
              data.data.summary.totalSchoolBooks,
            totalUsers: 0,
            totalSales: 0,
            pendingRequests: data.data.summary.lowStockCount,
            lowStockBooks: data.data.summary.lowStockCount,
            totalReturns: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      name: "Total Books",
      value: stats.totalBooks,
      icon: BookOpen,
      color: "bg-blue-500",
    },
    {
      name: "Pending Requests",
      value: stats.pendingRequests,
      icon: Package,
      color: "bg-yellow-500",
    },
    {
      name: "Low Stock Books",
      value: stats.lowStockBooks,
      icon: TrendingUp,
      color: "bg-red-500",
    },
    {
      name: "Total Returns",
      value: stats.totalReturns,
      icon: RotateCcw,
      color: "bg-green-500",
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome to Nehemiah Publishing Management System
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.name} className="card">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-md ${card.color}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {card.value.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    New stock entry added
                  </p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Payment processed
                  </p>
                  <p className="text-sm text-gray-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    New user registered
                  </p>
                  <p className="text-sm text-gray-500">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full btn-primary">Add New Book</button>
              <button className="w-full btn-secondary">
                Process Book Request
              </button>
              <button className="w-full btn-secondary">Generate Report</button>
              <button className="w-full btn-secondary">View Inventory</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
