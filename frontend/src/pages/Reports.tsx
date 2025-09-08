import React from "react";
import Layout from "../components/Layout";
import { BarChart3, TrendingUp, Package, Users } from "lucide-react";
import api from "../lib/api";
import * as XLSX from "xlsx";

const toYmd = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const monthKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}_${m}`;
};

const Reports: React.FC = () => {
  const handleDownloadMonthlySales = async () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const { data } = await api.get("/reports/sales", {
      params: { startDate: toYmd(start), endDate: toYmd(end) },
    });
    const bills = data.data.bills || [];
    const rows = bills.map((b: any) => ({
      PaidAt: b.paidAt ? new Date(b.paidAt).toLocaleString() : "",
      BillId: b.id,
      Customer: b.customer?.customerName || "",
      TotalAmount: b.totalAmount,
      PaidAmount: b.paidAmount,
      PaymentMethod: b.paymentMethod || "",
    }));
    const summary = [
      {
        TotalOrders: data.data.totalOrders || 0,
        TotalRevenue: data.data.totalRevenue || 0,
      },
    ];
    const wb = XLSX.utils.book_new();
    const wsSummary = XLSX.utils.json_to_sheet(summary);
    const wsSales = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    XLSX.utils.book_append_sheet(wb, wsSales, "Sales");
    XLSX.writeFile(wb, `Monthly_Sales_${monthKey(now)}.xlsx`);
  };

  const handleDownloadInventoryStatus = async () => {
    const now = new Date();
    const { data } = await api.get("/reports/inventory");
    const warehouse = (data.data.warehouseStocks || []).map((s: any) => ({
      BookId: s.bookId,
      ISBN: s.book?.isbn || "",
      Title: s.book?.title || "",
      Quantity: s.quantity,
    }));
    const schools = (data.data.schoolStocks || []).map((s: any) => ({
      SchoolId: s.schoolId,
      School: s.school?.schoolName || "",
      BookId: s.bookId,
      ISBN: s.book?.isbn || "",
      Title: s.book?.title || "",
      Quantity: s.quantity,
    }));
    const summary = [
      {
        TotalWarehouseBooks: data.data.summary?.totalWarehouseBooks || 0,
        TotalSchoolBooks: data.data.summary?.totalSchoolBooks || 0,
        LowStockCount: data.data.summary?.lowStockCount || 0,
      },
    ];
    const wb = XLSX.utils.book_new();
    const wsSummary = XLSX.utils.json_to_sheet(summary);
    const wsWarehouse = XLSX.utils.json_to_sheet(warehouse);
    const wsSchools = XLSX.utils.json_to_sheet(schools);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    XLSX.utils.book_append_sheet(wb, wsWarehouse, "Warehouse");
    XLSX.utils.book_append_sheet(wb, wsSchools, "Schools");
    XLSX.writeFile(wb, `Inventory_Status_${monthKey(now)}.xlsx`);
  };
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
              <BarChart3 className="h-8 w-8 text-blue-600" />
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
              <Package className="h-8 w-8 text-blue-600" />
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
              <TrendingUp className="h-8 w-8 text-blue-600" />
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
              <Users className="h-8 w-8 text-blue-600" />
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
              <button
                className="btn-secondary"
                onClick={handleDownloadMonthlySales}
              >
                Download
              </button>
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
              <button
                className="btn-secondary"
                onClick={handleDownloadInventoryStatus}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
