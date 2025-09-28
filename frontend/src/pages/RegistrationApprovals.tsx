import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Users, Check, X, Eye } from "lucide-react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import { useToast } from "../contexts/ToastContext";
import { registrationsApi } from "../lib/apiService";

interface SchoolRegistration {
  id: number;
  schoolName: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  isApproved: boolean;
  createdAt: string;
}

const RegistrationApprovals: React.FC = () => {
  const [registrations, setRegistrations] = useState<SchoolRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<SchoolRegistration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { showSuccess, showError } = useToast();

  const loadRegistrations = async (page = 1, searchTerm = '', status = '') => {
    try {
      setLoading(true);
      const response = await registrationsApi.getAll({ 
        page, 
        limit: 10, 
        search: searchTerm,
        status: status === 'approved' ? 'approved' : status === 'pending' ? 'pending' : ''
      });
      setRegistrations(response.data);
      setPagination(response.pagination || pagination);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await registrationsApi.approve(id);
      showSuccess('School registration approved successfully');
      loadRegistrations(pagination.page, search, statusFilter);
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleReject = async (id: number) => {
    if (window.confirm('Are you sure you want to reject this registration? This action cannot be undone.')) {
      try {
        await registrationsApi.reject(id);
        showSuccess('School registration rejected successfully');
        loadRegistrations(pagination.page, search, statusFilter);
      } catch (error: any) {
        showError(error.message);
      }
    }
  };

  const handleView = (registration: SchoolRegistration) => {
    setSelectedRegistration(registration);
    setIsModalOpen(true);
  };

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    loadRegistrations(1, searchTerm, statusFilter);
  };

  const handlePageChange = (page: number) => {
    loadRegistrations(page, search, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    loadRegistrations(1, search, status);
  };

  const columns = [
    {
      key: 'schoolName',
      label: 'School Name',
      render: (value: string, row: SchoolRegistration) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'contactPerson',
      label: 'Contact Person',
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    {
      key: 'isApproved',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value ? 'Approved' : 'Pending'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Registration Date',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const actions = (row: SchoolRegistration) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleView(row)}
        className="text-blue-600 hover:text-blue-900"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>
      {!row.isApproved && (
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Registration Approvals
          </h1>
          <p className="text-gray-600">
            Approve or reject school registrations
          </p>
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
              onClick={() => handleStatusFilter('pending')}
              className={`px-3 py-1 rounded-md text-sm ${
                statusFilter === 'pending' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => handleStatusFilter('approved')}
              className={`px-3 py-1 rounded-md text-sm ${
                statusFilter === 'approved' 
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
          data={registrations}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          searchPlaceholder="Search by school name or email..."
          actions={actions}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRegistration(null);
          }}
          title="School Registration Details"
        >
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">School Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRegistration.schoolName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRegistration.contactPerson}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRegistration.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRegistration.phone}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRegistration.address}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedRegistration.isApproved 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedRegistration.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedRegistration.createdAt).toLocaleDateString()}
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
                {!selectedRegistration.isApproved && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedRegistration.id);
                        setIsModalOpen(false);
                      }}
                      className="btn-primary bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedRegistration.id);
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
      </div>
    </Layout>
  );
};

export default RegistrationApprovals;
