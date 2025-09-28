import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { History, Eye, Search, Filter, Plus, Edit } from "lucide-react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import StatusUpdateModal from "../components/StatusUpdateModal";
import { useToast } from "../contexts/ToastContext";
import { billingApi, bookRequestsApi, returnsApi } from "../lib/apiService";
import api from "../lib/api";

interface Order {
  id: number;
  type: 'BILL' | 'REQUEST' | 'RETURN';
  number: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
  details?: any;
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    type: 'BILL',
    customerId: '',
    paymentMethod: 'CASH',
    items: [{ bookId: '', quantity: '' }]
  });
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  const loadOrders = async (page = 1, searchTerm = '', type = '', status = '') => {
    try {
      setLoading(true);
      
      // Fetch data from all sources
      const [billsResponse, requestsResponse, returnsResponse] = await Promise.all([
        billingApi.getAll({ page, limit: 10, search: searchTerm, status: status || undefined }),
        bookRequestsApi.getAll({ page, limit: 10, status: status || undefined }),
        returnsApi.getAll({ page, limit: 10, status: status || undefined })
      ]);

      // Combine and format all orders
      const allOrders: Order[] = [
        ...(billsResponse.data || []).map((bill: any) => ({
          id: bill.id,
          type: 'BILL' as const,
          number: bill.billNumber,
          customer: bill.customer?.name || 'Unknown',
          amount: bill.totalAmount,
          status: bill.status,
          date: bill.createdAt,
          details: bill
        })),
        ...(requestsResponse.data || []).map((request: any) => ({
          id: request.id,
          type: 'REQUEST' as const,
          number: `REQ-${request.id}`,
          customer: request.school?.schoolName || 'Unknown School',
          amount: 0,
          status: request.status,
          date: request.createdAt,
          details: request
        })),
        ...(returnsResponse.data || []).map((returnItem: any) => ({
          id: returnItem.id,
          type: 'RETURN' as const,
          number: returnItem.returnNumber,
          customer: 'School Return',
          amount: returnItem.totalAmount,
          status: returnItem.status,
          date: returnItem.createdAt,
          details: returnItem
        }))
      ];

      // Filter by type if specified
      const filteredOrders = type ? allOrders.filter(order => order.type === type) : allOrders;
      
      setOrders(filteredOrders);
      setPagination({
        page,
        limit: 10,
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / 10)
      });
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    loadOrders(1, searchTerm, typeFilter, statusFilter);
  };

  const handlePageChange = (page: number) => {
    loadOrders(page, search, typeFilter, statusFilter);
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type);
    loadOrders(1, search, type, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    loadOrders(1, search, typeFilter, status);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (createFormData.type === 'BILL') {
        await billingApi.create({
          customerId: parseInt(createFormData.customerId),
          items: createFormData.items
            .filter(item => item.bookId && item.quantity)
            .map(item => ({
              bookId: parseInt(item.bookId),
              quantity: parseInt(item.quantity),
            })),
          paymentMethod: createFormData.paymentMethod
        });
        showSuccess('Bill created successfully');
      }
      setIsCreateModalOpen(false);
      setCreateFormData({
        type: 'BILL',
        customerId: '',
        paymentMethod: 'CASH',
        items: [{ bookId: '', quantity: '' }]
      });
      loadOrders(pagination.page, search, typeFilter, statusFilter);
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleStatusUpdate = async (order: Order, newStatus: string) => {
    try {
      setStatusUpdateLoading(true);
      
      switch (order.type) {
        case 'BILL':
          await billingApi.updateStatus(order.id, newStatus);
          break;
        case 'REQUEST':
          if (newStatus === 'APPROVED') {
            await bookRequestsApi.approve(order.id);
          } else if (newStatus === 'REJECTED') {
            await bookRequestsApi.reject(order.id);
          }
          break;
        case 'RETURN':
          if (newStatus === 'APPROVED') {
            await returnsApi.approve(order.id);
          } else if (newStatus === 'REJECTED') {
            await returnsApi.reject(order.id);
          }
          break;
        default:
          throw new Error('Invalid order type');
      }
      
      showSuccess(`Order status updated to ${newStatus} successfully`);
      setIsStatusModalOpen(false);
      setSelectedOrder(null);
      loadOrders(pagination.page, search, typeFilter, statusFilter);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'APPROVED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BILL':
        return '💰';
      case 'REQUEST':
        return '📚';
      case 'RETURN':
        return '🔄';
      default:
        return '📄';
    }
  };

  const columns = [
    {
      key: 'number',
      label: 'Order Number',
      render: (value: string, row: Order) => (
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getTypeIcon(row.type)}</span>
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'customer',
      label: 'Customer/School',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: number | string | null | undefined, row: Order) => (
        <span className="font-medium">
          {row.type === 'REQUEST' ? 'N/A' : (() => {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            return `$${numValue && !isNaN(numValue) ? numValue.toFixed(2) : '0.00'}`;
          })()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const actions = (row: Order) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleView(row)}
        className="text-blue-600 hover:text-blue-900"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={() => {
          setSelectedOrder(row);
          setIsStatusModalOpen(true);
        }}
        className="text-purple-600 hover:text-purple-900"
        title="Update Status"
      >
        <Edit className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
            <p className="text-gray-600">View all order transactions</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => handleTypeFilter('')}
              className={`px-3 py-1 rounded-md text-sm ${
                typeFilter === ''
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => handleTypeFilter('BILL')}
              className={`px-3 py-1 rounded-md text-sm ${
                typeFilter === 'BILL'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              Bills
            </button>
            <button
              onClick={() => handleTypeFilter('REQUEST')}
              className={`px-3 py-1 rounded-md text-sm ${
                typeFilter === 'REQUEST'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              Requests
            </button>
            <button
              onClick={() => handleTypeFilter('RETURN')}
              className={`px-3 py-1 rounded-md text-sm ${
                typeFilter === 'RETURN'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              Returns
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => handleStatusFilter('')}
              className={`px-3 py-1 rounded-md text-sm ${
                statusFilter === ''
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => handleStatusFilter('PENDING')}
              className={`px-3 py-1 rounded-md text-sm ${
                statusFilter === 'PENDING'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => handleStatusFilter('PAID')}
              className={`px-3 py-1 rounded-md text-sm ${
                statusFilter === 'PAID'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => handleStatusFilter('APPROVED')}
              className={`px-3 py-1 rounded-md text-sm ${
                statusFilter === 'APPROVED'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              Approved
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          searchPlaceholder="Search by order number or customer..."
          actions={actions}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
          title="Order Details"
          size="lg"
        >
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Number</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedOrder.number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedOrder.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedOrder.customer}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedOrder.type === 'REQUEST' ? 'N/A' : (() => {
                      const numValue = typeof selectedOrder.amount === 'string' ? parseFloat(selectedOrder.amount) : selectedOrder.amount;
                      return `$${numValue && !isNaN(numValue) ? numValue.toFixed(2) : '0.00'}`;
                    })()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedOrder.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedOrder.details && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Details</label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(selectedOrder.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Order"
          size="lg"
        >
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-4">
                Currently, only Bill creation is supported. Other order types will be added in future updates.
              </p>
            </div>
            
            <FormField
              label="Order Type"
              name="type"
              type="select"
              value={createFormData.type}
              onChange={(value) => setCreateFormData({ ...createFormData, type: value })}
              required
              options={[
                { value: 'BILL', label: 'Bill' },
                { value: 'REQUEST', label: 'Request (Coming Soon)' },
                { value: 'RETURN', label: 'Return (Coming Soon)' }
              ]}
            />
            
            <FormField
              label="Customer ID"
              name="customerId"
              type="number"
              value={createFormData.customerId}
              onChange={(value) => setCreateFormData({ ...createFormData, customerId: value })}
              placeholder="Enter customer ID"
              required
            />
            
            <FormField
              label="Payment Method"
              name="paymentMethod"
              type="select"
              value={createFormData.paymentMethod}
              onChange={(value) => setCreateFormData({ ...createFormData, paymentMethod: value })}
              required
              options={[
                { value: 'CASH', label: 'Cash' },
                { value: 'CARD', label: 'Card' },
                { value: 'BANK_TRANSFER', label: 'Bank Transfer' }
              ]}
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Items</label>
              {createFormData.items.map((item, index) => (
                <div key={index} className="flex space-x-2">
                  <FormField
                    label="Book ID"
                    name={`bookId-${index}`}
                    type="number"
                    value={item.bookId}
                    onChange={(value) => {
                      const newItems = [...createFormData.items];
                      newItems[index].bookId = value;
                      setCreateFormData({ ...createFormData, items: newItems });
                    }}
                    placeholder="Book ID"
                    required
                  />
                  <FormField
                    label="Quantity"
                    name={`quantity-${index}`}
                    type="number"
                    value={item.quantity}
                    onChange={(value) => {
                      const newItems = [...createFormData.items];
                      newItems[index].quantity = value;
                      setCreateFormData({ ...createFormData, items: newItems });
                    }}
                    placeholder="Quantity"
                    required
                  />
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
              >
                Create Order
              </button>
            </div>
          </form>
        </Modal>

        <StatusUpdateModal
          isOpen={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setSelectedOrder(null);
          }}
          onUpdate={(newStatus) => selectedOrder && handleStatusUpdate(selectedOrder, newStatus)}
          currentStatus={selectedOrder?.status || ''}
          availableStatuses={
            selectedOrder?.type === 'BILL'
              ? [
                  { value: 'PENDING', label: 'Pending', description: 'Bill is waiting for payment' },
                  { value: 'PAID', label: 'Paid', description: 'Bill has been paid' },
                  { value: 'CANCELLED', label: 'Cancelled', description: 'Bill has been cancelled' }
                ]
              : selectedOrder?.type === 'REQUEST'
              ? [
                  { value: 'PENDING', label: 'Pending', description: 'Request is waiting for approval' },
                  { value: 'APPROVED', label: 'Approved', description: 'Request has been approved' },
                  { value: 'REJECTED', label: 'Rejected', description: 'Request has been rejected' },
                  { value: 'HOLD', label: 'On Hold', description: 'Request is on hold' }
                ]
              : [
                  { value: 'PENDING', label: 'Pending', description: 'Return is waiting for approval' },
                  { value: 'APPROVED', label: 'Approved', description: 'Return has been approved' },
                  { value: 'REJECTED', label: 'Rejected', description: 'Return has been rejected' }
                ]
          }
          title={`Update ${selectedOrder?.type || 'Order'} Status`}
          loading={statusUpdateLoading}
        />
      </div>
    </Layout>
  );
};

export default OrderHistory;