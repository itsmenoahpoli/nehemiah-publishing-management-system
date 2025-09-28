import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CreditCard,
  BookOpen,
  Plus,
  FileText,
  BarChart3,
  Warehouse,
  School,
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { dashboardApi } from "../lib/apiService";
import SimpleChart from "../components/SimpleChart";
import { formatCurrency } from "../lib/utils";

interface DashboardOverview {
  totalBooks: number;
  totalSchools: number;
  totalCustomers: number;
  totalUsers: number;
  pendingRegistrations: number;
  totalRevenue: number;
  totalSchoolRevenue: number;
  totalWarehouseStock: number;
  totalSchoolStock: number;
}

interface StatusCounts {
  bills: {
    total: number;
    pending: number;
    paid: number;
    cancelled: number;
  };
  transactions: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  returns: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}


interface TopSellingBook {
  bookId: number;
  title: string;
  totalSold: number;
  orderCount: number;
  revenue: number;
}

interface RecentActivity {
  recentBills: Array<{
    id: number;
    billNumber: string;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  recentTransactions: Array<{
    id: number;
    transactionNumber: string;
    totalAmount: number;
    status: string;
    bookCount: number;
    createdAt: string;
  }>;
  recentReturns: Array<{
    id: number;
    returnNumber: string;
    totalAmount: number;
    status: string;
    bookCount: number;
    createdAt: string;
  }>;
  recentRegistrations: Array<{
    id: number;
    schoolName: string;
    isApproved: boolean;
    createdAt: string;
  }>;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [statusCounts, setStatusCounts] = useState<StatusCounts | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [topSellingBooks, setTopSellingBooks] = useState<TopSellingBook[]>([]);
  const [booksByPublisher, setBooksByPublisher] = useState<Array<{publisher: string, count: number}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const [
          overviewResponse,
          recentActivityResponse,
          booksChartsResponse
        ] = await Promise.all([
          dashboardApi.getOverview(),
          dashboardApi.getRecentActivity(),
          dashboardApi.getBooksCharts()
        ]);

        setOverview(overviewResponse.data.overview);
        setStatusCounts(overviewResponse.data.statusCounts);
        setRecentActivity(recentActivityResponse.data);
        setTopSellingBooks(booksChartsResponse.data.topSellingBooks.slice(0, 5));
        setBooksByPublisher(booksChartsResponse.data.booksByPublisher.slice(0, 6));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-book':
        navigate('/maintenance');
        break;
      case 'process-request':
        navigate('/book-requests');
        break;
      case 'generate-report':
        navigate('/reports');
        break;
      case 'view-inventory':
        navigate('/inventory');
        break;
      default:
        break;
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'completed':
      case 'paid':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'completed':
      case 'paid':
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!overview || !statusCounts) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load dashboard data</p>
        </div>
      </Layout>
    );
  }

  const overviewCards = [
    {
      name: "Total Books",
      value: overview.totalBooks,
      icon: BookOpen,
      color: "bg-blue-500",
      description: "Books in system"
    },
    {
      name: "Total Schools",
      value: overview.totalSchools,
      icon: School,
      color: "bg-green-500",
      description: "Registered schools"
    },
    {
      name: "Total Revenue",
      value: formatCurrency(overview.totalRevenue),
      icon: DollarSign,
      color: "bg-emerald-500",
      description: "Bill sales revenue"
    },
    {
      name: "School Revenue",
      value: formatCurrency(overview.totalSchoolRevenue),
      icon: ShoppingCart,
      color: "bg-purple-500",
      description: "School sales revenue"
    },
    {
      name: "Pending Registrations",
      value: overview.pendingRegistrations,
      icon: Users,
      color: "bg-yellow-500",
      description: "Awaiting approval"
    },
    {
      name: "Warehouse Stock",
      value: overview.totalWarehouseStock,
      icon: Warehouse,
      color: "bg-indigo-500",
      description: "Total warehouse inventory"
    }
  ];

  const statusCards = [
    {
      name: "Bills",
      data: statusCounts.bills,
      color: "bg-blue-500"
    },
    {
      name: "Transactions",
      data: statusCounts.transactions,
      color: "bg-green-500"
    },
    {
      name: "Returns",
      data: statusCounts.returns,
      color: "bg-red-500"
    }
  ];

  const quickActions = [
    {
      name: "Add New Book",
      icon: Plus,
      color: "bg-blue-600",
      action: "add-book",
      description: "Add a new book to the system"
    },
    {
      name: "Process Book Request",
      icon: FileText,
      color: "bg-yellow-600",
      action: "process-request",
      description: "Review and approve book requests"
    },
    {
      name: "Generate Report",
      icon: BarChart3,
      color: "bg-green-600",
      action: "generate-report",
      description: "Create system reports"
    },
    {
      name: "View Inventory",
      icon: Warehouse,
      color: "bg-purple-600",
      action: "view-inventory",
      description: "Check stock levels"
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

        {/* Overview Statistics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {overviewCards.map((card) => (
            <div key={card.name} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className={`p-3 rounded-md ${card.color} mb-3`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className="w-full">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                    </dd>
                    <dd className="text-xs text-gray-400">
                      {card.description}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Status Breakdown Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {statusCards.map((statusCard) => (
            <div key={statusCard.name} className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {statusCard.name} Status
              </h3>
              <div className="space-y-3">
                {Object.entries(statusCard.data).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">
                      {status}
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity?.recentBills.slice(0, 3).map((bill) => (
                <div key={bill.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Bill #{bill.billNumber} - {bill.customerName}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {formatCurrency(bill.totalAmount)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                        {getStatusIcon(bill.status)}
                        <span className="ml-1 capitalize">{bill.status}</span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{formatDate(bill.createdAt)}</p>
                  </div>
                </div>
              ))}
              
              {recentActivity?.recentTransactions.slice(0, 2).map((transaction) => (
                <div key={transaction.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Transaction #{transaction.transactionNumber}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {formatCurrency(transaction.totalAmount)} • {transaction.bookCount} books
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1 capitalize">{transaction.status}</span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{formatDate(transaction.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.action}
                  onClick={() => handleQuickAction(action.action)}
                  className={`w-full p-3 rounded-lg text-white ${action.color} hover:opacity-90 transition-opacity flex items-center space-x-3`}
                >
                  <action.icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">{action.name}</div>
                    <div className="text-xs opacity-75">{action.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top Selling Books Chart */}
          {topSellingBooks.length > 0 && (
            <SimpleChart
              data={topSellingBooks.map(book => ({
                label: book.title.length > 20 ? book.title.substring(0, 20) + '...' : book.title,
                value: book.totalSold
              }))}
              title="Top Selling Books (Units Sold)"
              maxHeight={300}
            />
          )}

          {/* Books by Publisher Chart */}
          {booksByPublisher.length > 0 && (
            <SimpleChart
              data={booksByPublisher.map(publisher => ({
                label: publisher.publisher.length > 15 ? publisher.publisher.substring(0, 15) + '...' : publisher.publisher,
                value: publisher.count
              }))}
              title="Books by Publisher"
              type="pie"
            />
          )}
        </div>

        {/* Top Selling Books Table */}
        {topSellingBooks.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Top Selling Books Details
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topSellingBooks.map((book) => (
                    <tr key={book.bookId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {book.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {book.totalSold}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {book.orderCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(book.revenue)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;