import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { CreditCard, DollarSign, Plus, Eye, Check, Edit } from "lucide-react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import StatusUpdateModal from "../components/StatusUpdateModal";
import { useToast } from "../contexts/ToastContext";
import { billingApi, booksApi } from "../lib/apiService";
import { formatCurrency } from "../lib/utils";

interface Bill {
  id: number;
  billNumber: string;
  customerId: number;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  paymentMethod?: string;
  paidAmount?: number;
  paidAt?: string;
  createdAt: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  billDetails: {
    id: number;
    bookId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    book: {
      id: number;
      title: string;
      isbn: string;
    };
  }[];
}

const BillingPayment: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    items: [{ bookId: '', quantity: '' }],
  });
  const [paymentData, setPaymentData] = useState({
    paidAmount: '',
    paymentMethod: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  const loadBills = async (page = 1, searchTerm = '', status = '') => {
    try {
      setLoading(true);
      const response = await billingApi.getAll({ 
        page, 
        limit: 10, 
        search: searchTerm,
        status: status || undefined
      });
      setBills(response.data);
      setPagination(response.pagination || pagination);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    try {
      const response = await booksApi.getAll({ limit: 1000 });
      setBooks(response.data);
    } catch (error: any) {
      showError('Failed to load books');
    }
  };

  useEffect(() => {
    loadBills();
    loadBooks();
  }, []);

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        customer: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone,
          address: formData.customerAddress,
        },
        items: formData.items
          .filter(item => item.bookId && item.quantity)
          .map(item => ({
            bookId: parseInt(item.bookId),
            quantity: parseInt(item.quantity),
          })),
      };

      await billingApi.create(data);
      showSuccess('Bill created successfully');
      setIsModalOpen(false);
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        items: [{ bookId: '', quantity: '' }],
      });
      loadBills(pagination.page, search, statusFilter);
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;

    try {
      await billingApi.processPayment(selectedBill.id, {
        paidAmount: parseFloat(paymentData.paidAmount),
        paymentMethod: paymentData.paymentMethod,
      });
      showSuccess('Payment processed successfully');
      setIsPaymentModalOpen(false);
      setPaymentData({ paidAmount: '', paymentMethod: '' });
      setSelectedBill(null);
      loadBills(pagination.page, search, statusFilter);
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleView = (bill: Bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const handlePayment = (bill: Bill) => {
    setSelectedBill(bill);
    setPaymentData({
      paidAmount: bill.totalAmount.toString(),
      paymentMethod: '',
    });
    setIsPaymentModalOpen(true);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedBill) return;
    
    try {
      setStatusUpdateLoading(true);
      await billingApi.updateStatus(selectedBill.id, newStatus);
      showSuccess(`Bill status updated to ${newStatus} successfully`);
      setIsStatusModalOpen(false);
      setSelectedBill(null);
      loadBills(pagination.page, search, statusFilter);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { bookId: '', quantity: '' }],
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index),
      });
    }
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    loadBills(1, searchTerm, statusFilter);
  };

  const handlePageChange = (page: number) => {
    loadBills(page, search, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    loadBills(1, search, status);
  };

  const columns = [
    {
      key: 'billNumber',
      label: 'Bill Number',
    },
    {
      key: 'customer.name',
      label: 'Customer',
      render: (value: string, row: Bill) => (
        <div>
          <div className="font-medium text-gray-900">{row.customer.name}</div>
          <div className="text-sm text-gray-500">{row.customer.email}</div>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      render: (value: number | string | null | undefined) => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return `$${numValue && !isNaN(numValue) ? numValue.toFixed(2) : '0.00'}`;
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'PAID' 
            ? 'bg-green-100 text-green-800'
            : value === 'CANCELLED'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const actions = (row: Bill) => (
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
          setSelectedBill(row);
          setIsStatusModalOpen(true);
        }}
        className="text-purple-600 hover:text-purple-900"
        title="Update Status"
      >
        <Edit className="h-4 w-4" />
      </button>
      {row.status === 'PENDING' && (
        <button
          onClick={() => handlePayment(row)}
          className="text-green-600 hover:text-green-900"
          title="Process Payment"
        >
          <Check className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Billing & Payment
          </h1>
          <p className="text-gray-600">Manage bills and process payments</p>
        </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Bill
          </button>
          </div>

        <div className="flex items-center space-x-4 mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => handleStatusFilter('')}
              className={`px-3 py-1 rounded-md text-sm ${
                statusFilter === '' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              All
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
              onClick={() => handleStatusFilter('CANCELLED')}
              className={`px-3 py-1 rounded-md text-sm ${
                statusFilter === 'CANCELLED' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={bills}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          searchPlaceholder="Search by bill number or customer..."
          actions={actions}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBill(null);
          }}
          title={selectedBill ? 'Bill Details' : 'Create New Bill'}
          size="lg"
        >
          {selectedBill ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bill Number</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBill.billNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedBill.status === 'PAID' 
                      ? 'bg-green-100 text-green-800'
                      : selectedBill.status === 'CANCELLED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedBill.status}
                        </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBill.customer.name}</p>
                  <p className="text-sm text-gray-500">{selectedBill.customer.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                  <p className="mt-1 text-sm text-gray-900">${selectedBill.totalAmount ? selectedBill.totalAmount.toFixed(2) : '0.00'}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bill Items</label>
                <div className="space-y-2">
                  {selectedBill.billDetails.map((detail, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{detail.book.title}</p>
                          <p className="text-sm text-gray-500">ISBN: {detail.book.isbn}</p>
                          <p className="text-sm text-gray-500">Quantity: {detail.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${detail.totalPrice.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">${detail.unitPrice.toFixed(2)} each</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
                {selectedBill.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      handlePayment(selectedBill);
                      setIsModalOpen(false);
                    }}
                    className="btn-primary"
                  >
                    Process Payment
                        </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateBill} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Customer Name"
                  name="customerName"
                  value={formData.customerName}
                  onChange={(value) => setFormData({ ...formData, customerName: value })}
                  required
                />
                <FormField
                  label="Customer Email"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(value) => setFormData({ ...formData, customerEmail: value })}
                  required
                />
                <FormField
                  label="Customer Phone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={(value) => setFormData({ ...formData, customerPhone: value })}
                  required
                />
                <FormField
                  label="Customer Address"
                  name="customerAddress"
                  value={formData.customerAddress}
                  onChange={(value) => setFormData({ ...formData, customerAddress: value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bill Items</label>
                {formData.items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        label="Book"
                        name={`bookId_${index}`}
                        type="select"
                        value={item.bookId}
                        onChange={(value) => updateItem(index, 'bookId', value)}
                        required
                        options={books.map(book => ({
                          value: book.id.toString(),
                          label: `${book.title} (${book.isbn})`
                        }))}
                      />
                      <FormField
                        label="Quantity"
                        name={`quantity_${index}`}
                        type="number"
                        value={item.quantity}
                        onChange={(value) => updateItem(index, 'quantity', value)}
                        required
                      />
                      <div className="flex items-end">
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <DollarSign className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addItem}
                  className="btn-secondary text-sm"
                >
                  Add Another Item
                </button>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Bill
                </button>
              </div>
            </form>
          )}
        </Modal>

        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedBill(null);
            setPaymentData({ paidAmount: '', paymentMethod: '' });
          }}
          title="Process Payment"
        >
          {selectedBill && (
            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bill Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBill.billNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                    <p className="mt-1 text-sm text-gray-900">${selectedBill.totalAmount ? selectedBill.totalAmount.toFixed(2) : '0.00'}</p>
                  </div>
          </div>
        </div>

              <FormField
                label="Paid Amount"
                name="paidAmount"
                type="number"
                value={paymentData.paidAmount}
                onChange={(value) => setPaymentData({ ...paymentData, paidAmount: value })}
                required
              />

              <FormField
                label="Payment Method"
                name="paymentMethod"
                type="select"
                value={paymentData.paymentMethod}
                onChange={(value) => setPaymentData({ ...paymentData, paymentMethod: value })}
                required
                options={[
                  { value: 'CASH', label: 'Cash' },
                  { value: 'CARD', label: 'Card' },
                  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                ]}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Process Payment
                </button>
              </div>
            </form>
          )}
        </Modal>

        <StatusUpdateModal
          isOpen={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setSelectedBill(null);
          }}
          onUpdate={handleStatusUpdate}
          currentStatus={selectedBill?.status || ''}
          availableStatuses={[
            { value: 'PENDING', label: 'Pending', description: 'Bill is waiting for payment' },
            { value: 'PAID', label: 'Paid', description: 'Bill has been paid' },
            { value: 'CANCELLED', label: 'Cancelled', description: 'Bill has been cancelled' }
          ]}
          title="Update Bill Status"
          loading={statusUpdateLoading}
        />
      </div>
    </Layout>
  );
};

export default BillingPayment;
