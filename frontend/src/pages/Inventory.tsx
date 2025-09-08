import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Package, Warehouse } from "lucide-react";
import api from "../lib/api";

const Inventory: React.FC = () => {
  const [warehouse, setWarehouse] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [w, s] = await Promise.all([
          api.get("/inventory/warehouse", { params: { page: 1, limit: 10 } }),
          api.get("/inventory/schools", { params: { page: 1, limit: 10 } }),
        ]);
        setWarehouse(w.data.data || []);
        setSchools(s.data.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Book
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ISBN
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {warehouse.map((row) => (
                      <tr key={row.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {row.book?.title}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {row.book?.isbn}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {row.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <Package className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                School Inventory
              </h3>
            </div>
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        School
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Book
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schools.map((row) => (
                      <tr key={row.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {row.school?.schoolName}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {row.book?.title}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {row.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Inventory;
