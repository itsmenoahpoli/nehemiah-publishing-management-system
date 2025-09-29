import React, { useState } from "react";
import Layout from "../components/Layout";
import { BarChart3, TrendingUp, Package, Users, Download, Calendar } from "lucide-react";
import { reportsApi } from "../lib/apiService";
import { useToast } from "../contexts/ToastContext";
import * as XLSX from "xlsx";
import Modal from "../components/Modal";

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const { showSuccess, showError } = useToast();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewSummary, setPreviewSummary] = useState<any[] | null>(null);
  const [onConfirmDownload, setOnConfirmDownload] = useState<(() => Promise<void>) | null>(null);

  const handleDownloadSalesReport = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getSales({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      const bills = response.data.bills || [];
      const rows = bills.map((b: any) => ({
        PaidAt: b.paidAt ? new Date(b.paidAt).toLocaleString() : "",
        BillId: b.id,
        Customer: b.customer?.name || "",
        TotalAmount: b.totalAmount,
        PaidAmount: b.paidAmount,
        PaymentMethod: b.paymentMethod || "",
      }));
      
      const summary = [
        {
          TotalOrders: response.data.totalOrders || 0,
          TotalRevenue: response.data.totalRevenue || 0,
        },
      ];

      setPreviewTitle("Preview Sales Report");
      setPreviewRows(rows);
      setPreviewSummary(summary);
      setOnConfirmDownload(() => async () => {
        const wb = XLSX.utils.book_new();
        const wsSummary = XLSX.utils.json_to_sheet(summary);
        const wsSales = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
        XLSX.utils.book_append_sheet(wb, wsSales, "Sales");
        XLSX.writeFile(wb, `Sales_Report_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`);
        showSuccess('Sales report downloaded successfully');
      });
      setPreviewOpen(true);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInventoryReport = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getInventory();
      
      const warehouse = (response.data.warehouseStocks || []).map((s: any) => ({
        BookId: s.bookId,
        ISBN: s.book?.isbn || "",
        Title: s.book?.title || "",
        Quantity: s.quantity,
        Status: s.quantity < 10 ? "Low Stock" : "In Stock",
      }));
      
      const schools = (response.data.schoolStocks || []).map((s: any) => ({
        SchoolId: s.schoolId,
        School: s.school?.schoolName || "",
        BookId: s.bookId,
        ISBN: s.book?.isbn || "",
        Title: s.book?.title || "",
        Quantity: s.quantity,
      }));
      
      const summary = [
        {
          TotalWarehouseBooks: response.data.summary?.totalWarehouseBooks || 0,
          TotalSchoolBooks: response.data.summary?.totalSchoolBooks || 0,
          LowStockCount: response.data.summary?.lowStockCount || 0,
        },
      ];

      setPreviewTitle("Preview Inventory Report");
      setPreviewRows(warehouse.slice(0, 100));
      setPreviewSummary(summary);
      setOnConfirmDownload(() => async () => {
        const wb = XLSX.utils.book_new();
        const wsSummary = XLSX.utils.json_to_sheet(summary);
        const wsWarehouse = XLSX.utils.json_to_sheet(warehouse);
        const wsSchools = XLSX.utils.json_to_sheet(schools);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
        XLSX.utils.book_append_sheet(wb, wsWarehouse, "Warehouse");
        XLSX.utils.book_append_sheet(wb, wsSchools, "Schools");
        XLSX.writeFile(wb, `Inventory_Report_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`);
        showSuccess('Inventory report downloaded successfully');
      });
      setPreviewOpen(true);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTransactionReport = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getTransactions({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      const transactions = response.data.transactions || [];
      const rows = transactions.map((t: any) => ({
        Date: new Date(t.createdAt).toLocaleDateString(),
        Type: t.type,
        Description: t.description,
        Amount: t.amount,
        Status: t.status,
      }));

      setPreviewTitle("Preview Transaction Report");
      setPreviewRows(rows);
      setPreviewSummary(null);
      setOnConfirmDownload(() => async () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, "Transactions");
        XLSX.writeFile(wb, `Transaction_Report_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`);
        showSuccess('Transaction report downloaded successfully');
      });
      setPreviewOpen(true);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSchoolReport = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getSchools();
      
      const schools = response.data.schools || [];
      const rows = schools.map((s: any) => ({
        SchoolName: s.schoolName,
        Email: s.email,
        Phone: s.phone,
        Address: s.address,
        Status: s.isApproved ? "Approved" : "Pending",
        RegistrationDate: new Date(s.createdAt).toLocaleDateString(),
      }));

      setPreviewTitle("Preview School Report");
      setPreviewRows(rows);
      setPreviewSummary(null);
      setOnConfirmDownload(() => async () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, "Schools");
        XLSX.writeFile(wb, `School_Report_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`);
        showSuccess('School report downloaded successfully');
      });
      setPreviewOpen(true);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">View and generate system reports</p>
        </div>

        {/* Date Range Selector */}
        <div className="card">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Report Date Range</h3>
              <p className="text-sm text-gray-500">Select the date range for your reports</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Sales Report</h3>
                <p className="text-sm text-gray-500">Revenue and sales analytics</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleDownloadSalesReport}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Inventory Report</h3>
                <p className="text-sm text-gray-500">Stock levels and status</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleDownloadInventoryReport}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Transaction Report</h3>
                <p className="text-sm text-gray-500">All transactions history</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleDownloadTransactionReport}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">School Report</h3>
                <p className="text-sm text-gray-500">School registrations and activity</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleDownloadSchoolReport}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reports</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Sales Report</h4>
                <p className="text-sm text-gray-500">
                  Generated for {dateRange.startDate} to {dateRange.endDate}
                </p>
              </div>
              <button
                onClick={handleDownloadSalesReport}
                disabled={loading}
                className="btn-secondary flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Inventory Status Report</h4>
                <p className="text-sm text-gray-500">
                  Current stock levels and status
                </p>
              </div>
              <button
                onClick={handleDownloadInventoryReport}
                disabled={loading}
                className="btn-secondary flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Transaction Report</h4>
                <p className="text-sm text-gray-500">
                  All transactions from {dateRange.startDate} to {dateRange.endDate}
                </p>
              </div>
              <button
                onClick={handleDownloadTransactionReport}
                disabled={loading}
                className="btn-secondary flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">School Report</h4>
                <p className="text-sm text-gray-500">
                  School registrations and activity
                </p>
              </div>
              <button
                onClick={handleDownloadSchoolReport}
                disabled={loading}
                className="btn-secondary flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={previewTitle}
        size="xl"
        footer={
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={() => setPreviewOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (onConfirmDownload) {
                  await onConfirmDownload();
                }
                setPreviewOpen(false);
              }}
              className="btn-primary"
            >
              Continue to Download
            </button>
          </div>
        }
      >
        {previewSummary && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
            <div className="overflow-auto border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(previewSummary[0] || {}).map((key) => (
                      <th key={key} className="px-3 py-2 text-left font-medium text-gray-700">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewSummary.map((row, idx) => (
                    <tr key={idx} className="odd:bg-white even:bg-gray-50">
                      {Object.values(row).map((val: any, i) => (
                        <td key={i} className="px-3 py-2 text-gray-900">{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Rows Preview</h4>
          <p className="text-xs text-gray-500 mb-2">Showing up to 100 rows.</p>
          <div className="overflow-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(previewRows[0] || {}).map((key) => (
                    <th key={key} className="px-3 py-2 text-left font-medium text-gray-700">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.slice(0, 100).map((row, idx) => (
                  <tr key={idx} className="odd:bg-white even:bg-gray-50">
                    {Object.values(row).map((val: any, i) => (
                      <td key={i} className="px-3 py-2 text-gray-900">{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Reports;