import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { RotateCcw, Check, X, Eye, Plus } from "lucide-react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import { useToast } from "../contexts/ToastContext";
import { returnsApi, registrationsApi, booksApi } from "../lib/apiService";

interface ReturnedBook {
  id: number;
  returnNumber: string;
  schoolId: number;
  totalAmount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  returnedBookDetails: {
    id: number;
    bookId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    reason?: string;
    book: {
      id: number;
      title: string;
      isbn: string;
    };
  }[];
}

const ReturnedBooks: React.FC = () => {
  const [returns, setReturns] = useState<ReturnedBook[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnedBook | null>(null);
  const [formData, setFormData] = useState({
    schoolId: '',
    items: [{ bookId: '', quantity: '', reason: '' }],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { showSuccess, showError } = useToast();

  const loadReturns = async (page = 1, searchTerm = '', status = '') => {
    try {
      setLoading(true);
      const response = await returnsApi.getAll({ 
        page, 
        limit: 10, 
        search: searchTerm,
        status: status || undefined
      });
      setReturns(response.data);
      setPagination(response.pagination || pagination);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSchools = async () => {
    try {
      const response = await registrationsApi.getAll({ limit: 1000, status: 'approved' });
      setSchools(response.data);
    } catch (error: any) {
      showError('Failed to load schools');
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
    loadReturns();
    loadSchools();
    loadBooks();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await returnsApi.approve(id);
      showSuccess('Return approved successfully');
      loadReturns(pagination.page, search, statusFilter);
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleReject = async (id: number) => {
    if (window.confirm('Are you sure you want to reject this return?')) {
      try {
        await returnsApi.reject(id);
        showSuccess('Return rejected successfully');
        loadReturns(pagination.page, search, statusFilter);
      } catch (error: any) {
        showError(error.message);
      }
    }
  };

  const handleReceive = async (id: number) => {
    try {
      // This would need a new API endpoint for receive status
      await returnsApi.update(id, { status: 'RECEIVED' });
      showSuccess('Return marked as received');
      loadReturns(pagination.page, search, statusFilter);
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleView = (returnItem: ReturnedBook) => {
    setSelectedReturn(returnItem);
    setIsModalOpen(true);
  };

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        schoolId: parseInt(formData.schoolId),
        items: formData.items
          .filter(item => item.bookId && item.quantity)
          .map(item => ({
            bookId: parseInt(item.bookId),
            quantity: parseInt(item.quantity),
            reason: item.reason,
          })),
      };

      await returnsApi.create(data);
      showSuccess('Return request created successfully');
      setIsCreateModalOpen(false);
      setFormData({ schoolId: '', items: [{ bookId: '', quantity: '', reason: '' }] });
      loadReturns(pagination.page, search, statusFilter);
    } catch (error: any) {
      showError(error.message);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { bookId: '', quantity: '', reason: '' }],
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
    loadReturns(1, searchTerm, statusFilter);
  };

  const handlePageChange = (page: number) => {
    loadReturns(page, search, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    loadReturns(1, search, status);
  };

  const columns = [
    {
      key: 'returnNumber',
      label: 'Return Number',
    },
    {
      key: 'schoolId',
      label: 'School',
      render: (value: number, row: ReturnedBook) => {
        const school = schools.find(s => s.id === value);
        return school ? school.schoolName : 'Unknown School';
      },
    },
    {
      key: 'returnedBookDetails',
      label: 'Books',
      render: (value: any[]) => `${value.length} books`,
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
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
          value === 'APPROVED' 
            ? 'bg-green-100 text-green-800'
            : value === 'REJECTED'
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

        const actions = (row: ReturnedBook) => (
          <div className="flex space-x-2">
            <button
              onClick={() => handleView(row)}
              className="text-blue-600 hover:text-blue-900"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            {row.status === 'PENDING' && (
              <>
                <button
                  onClick={() => handleApprove(row.id)}
                  className="text-green-600 hover:text-green-900"
                  title="Approve"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleReject(row.id)}
                  className="text-red-600 hover:text-red-900"
                  title="Reject"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
            {row.status === 'APPROVED' && (
              <button
                onClick={() => handleReceive(row.id)}
                className="text-blue-600 hover:text-blue-900"
                title="Mark as Received"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Returned Books</h1>
            <p className="text-gray-600">Manage returned books from schools</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Return
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
              onClick={() => handleStatusFilter('APPROVED')}
              className={`px-3 py-1 rounded-md text-sm ${
                statusFilter === 'APPROVED' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => handleStatusFilter('REJECTED')}
              className={`px-3 py-1 rounded-md text-sm ${
                statusFilter === 'REJECTED' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={returns}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          searchPlaceholder="Search by return number..."
          actions={actions}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReturn(null);
          }}
          title="Return Details"
          size="lg"
        >
          {selectedReturn && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Return Number</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReturn.returnNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedReturn.status === 'APPROVED' 
                      ? 'bg-green-100 text-green-800'
                      : selectedReturn.status === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedReturn.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                  <p className="mt-1 text-sm text-gray-900">${selectedReturn.totalAmount ? selectedReturn.totalAmount.toFixed(2) : '0.00'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedReturn.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Returned Books</label>
                <div className="space-y-2">
                  {selectedReturn.returnedBookDetails.map((detail, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{detail.book.title}</p>
                          <p className="text-sm text-gray-500">ISBN: {detail.book.isbn}</p>
                          <p className="text-sm text-gray-500">Quantity: {detail.quantity}</p>
                          {detail.reason && (
                            <p className="text-sm text-gray-500">Reason: {detail.reason}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${detail.totalPrice ? detail.totalPrice.toFixed(2) : '0.00'}</p>
                          <p className="text-sm text-gray-500">${detail.unitPrice ? detail.unitPrice.toFixed(2) : '0.00'} each</p>
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
                {selectedReturn.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedReturn.id);
                        setIsModalOpen(false);
                      }}
                      className="btn-primary bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedReturn.id);
                        setIsModalOpen(false);
                      }}
                      className="btn-secondary bg-red-600 hover:bg-red-700 text-white"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setFormData({ schoolId: '', items: [{ bookId: '', quantity: '', reason: '' }] });
          }}
          title="Create Return Request"
          size="lg"
        >
          <form onSubmit={handleCreateReturn} className="space-y-4">
            <FormField
              label="School"
              name="schoolId"
              type="select"
              value={formData.schoolId}
              onChange={(value) => setFormData({ ...formData, schoolId: value })}
              required
              options={schools.map(school => ({
                value: school.id.toString(),
                label: school.schoolName
              }))}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Returned Books</label>
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
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <FormField
                    label="Reason (Optional)"
                    name={`reason_${index}`}
                    type="textarea"
                    value={item.reason}
                    onChange={(value) => updateItem(index, 'reason', value)}
                    rows={2}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="btn-secondary text-sm"
              >
                Add Another Book
              </button>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Create Return
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default ReturnedBooks;
