import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Check, X, Clock, Eye, AlertCircle, Plus } from "lucide-react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import { useToast } from "../contexts/ToastContext";
import { bookRequestsApi, booksApi, schoolsApi } from "../lib/apiService";

interface BookRequest {
  id: number;
  schoolId: number;
  bookId: number;
  quantity: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HOLD';
  createdAt: string;
  school: {
    id: number;
    schoolName: string;
    email: string;
    phone: string;
  };
  book: {
    id: number;
    title: string;
    isbn: string;
    price: number;
  };
}

const BookRequests: React.FC = () => {
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<BookRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [schools, setSchools] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [createFormData, setCreateFormData] = useState({
    schoolId: '',
    bookId: '',
    quantity: ''
  });

  const { showSuccess, showError } = useToast();

  const loadRequests = async (page = 1, searchTerm = '', status = '') => {
    try {
      setLoading(true);
      const response = await bookRequestsApi.getAll({
        page,
        limit: 10,
        search: searchTerm,
        status: status || undefined
      });
      setRequests(response.data);
      setPagination(response.pagination || pagination);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    loadSchoolsAndBooks();
  }, []);

  const loadSchoolsAndBooks = async () => {
    try {
      const [schoolsRes, booksRes] = await Promise.all([
        schoolsApi.getAll({ limit: 100, status: 'approved' }),
        booksApi.getAll({ limit: 100 })
      ]);
      setSchools(schoolsRes.data || []);
      setBooks(booksRes.data || []);
    } catch (error: any) {
      showError('Failed to load schools and books data');
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bookRequestsApi.create({
        schoolId: parseInt(createFormData.schoolId),
        bookId: parseInt(createFormData.bookId),
        quantity: parseInt(createFormData.quantity)
      });
      showSuccess('Book request created successfully');
      setIsCreateModalOpen(false);
      setCreateFormData({ schoolId: '', bookId: '', quantity: '' });
      loadRequests(pagination.page, search, statusFilter);
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await bookRequestsApi.approve(id);
      showSuccess('Book request approved successfully');
      loadRequests(pagination.page, search, statusFilter);
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleReject = async (id: number) => {
    if (window.confirm('Are you sure you want to reject this request?')) {
      try {
        await bookRequestsApi.reject(id);
        showSuccess('Book request rejected successfully');
        loadRequests(pagination.page, search, statusFilter);
      } catch (error: any) {
        showError(error.message);
      }
    }
  };

  const handleHold = async () => {
    try {
      // This would need a new API endpoint for hold status
      showError('Hold functionality is not yet implemented');
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleView = (request: BookRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    loadRequests(1, searchTerm, statusFilter);
  };

  const handlePageChange = (page: number) => {
    loadRequests(page, search, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    loadRequests(1, search, status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'HOLD':
        return 'bg-orange-100 text-orange-800';
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Check className="h-4 w-4" />;
      case 'REJECTED':
        return <X className="h-4 w-4" />;
      case 'HOLD':
        return <Clock className="h-4 w-4" />;
      case 'PENDING':
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const columns = [
    {
      key: 'school.schoolName',
      label: 'School',
      render: (_value: string, row: BookRequest) => (
        <div>
          <div className="font-medium text-gray-900">{row.school.schoolName}</div>
          <div className="text-sm text-gray-500">{row.school.email}</div>
        </div>
      ),
    },
    {
      key: 'book.title',
      label: 'Book',
      render: (_value: string, row: BookRequest) => (
        <div>
          <div className="font-medium text-gray-900">{row.book.title}</div>
          <div className="text-sm text-gray-500">ISBN: {row.book.isbn}</div>
        </div>
      ),
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (value: number) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {getStatusIcon(value)}
          <span className="ml-1">{value}</span>
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Request Date',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const actions = (row: BookRequest) => (
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
            onClick={() => handleHold()}
            className="text-orange-600 hover:text-orange-900"
            title="Put on Hold"
          >
            <Clock className="h-4 w-4" />
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
      {row.status === 'HOLD' && (
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
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Book Requests</h1>
            <p className="text-gray-600">Manage book requests from schools</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </button>
        </div>

        {/* Status Filters */}
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
          data={requests}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          searchPlaceholder="Search by school name or book title..."
          actions={actions}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRequest(null);
          }}
          title="Book Request Details"
          size="lg"
        >
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">School</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.school.schoolName}</p>
                  <p className="text-sm text-gray-500">{selectedRequest.school.email}</p>
                  <p className="text-sm text-gray-500">{selectedRequest.school.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {getStatusIcon(selectedRequest.status)}
                    <span className="ml-1">{selectedRequest.status}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Book</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.book.title}</p>
                  <p className="text-sm text-gray-500">ISBN: {selectedRequest.book.isbn}</p>
                  <p className="text-sm text-gray-500">Price: ${selectedRequest.book.price}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.quantity}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Request Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedRequest.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Value</label>
                  <p className="mt-1 text-sm text-gray-900">
                    ${(selectedRequest.book.price * selectedRequest.quantity).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
                {selectedRequest.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedRequest.id);
                        setIsModalOpen(false);
                      }}
                      className="btn-primary bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleHold();
                        setIsModalOpen(false);
                      }}
                      className="btn-secondary bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Put on Hold
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedRequest.id);
                        setIsModalOpen(false);
                      }}
                      className="btn-secondary bg-red-600 hover:bg-red-700 text-white"
                    >
                      Reject
                    </button>
                  </>
                )}
                {selectedRequest.status === 'HOLD' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedRequest.id);
                        setIsModalOpen(false);
                      }}
                      className="btn-primary bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedRequest.id);
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
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Book Request"
          size="md"
        >
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <FormField
              label="School"
              name="schoolId"
              type="select"
              value={createFormData.schoolId}
              onChange={(value) => setCreateFormData({ ...createFormData, schoolId: value })}
              required
              options={[
                { value: '', label: 'Select a school' },
                ...schools.map((school) => ({
                  value: school.id,
                  label: school.schoolName
                }))
              ]}
            />
            
            <FormField
              label="Book"
              name="bookId"
              type="select"
              value={createFormData.bookId}
              onChange={(value) => setCreateFormData({ ...createFormData, bookId: value })}
              required
              options={[
                { value: '', label: 'Select a book' },
                ...books.map((book) => ({
                  value: book.id,
                  label: `${book.title} - ${book.isbn}`
                }))
              ]}
            />
            
            <FormField
              label="Quantity"
              name="quantity"
              type="number"
              value={createFormData.quantity}
              onChange={(value) => setCreateFormData({ ...createFormData, quantity: value })}
              placeholder="Enter quantity"
              required
            />
            
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
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
              >
                Create Request
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default BookRequests;