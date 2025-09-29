import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Plus, Edit, Trash2, Check, X, Eye } from "lucide-react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import { useToast } from "../contexts/ToastContext";
import { schoolsApi } from "../lib/apiService";

interface School {
  id: number;
  schoolName: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

const Schools: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: '',
    isApproved: false,
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

  const loadSchools = async (page = 1, searchTerm = '', status = '') => {
    try {
      setLoading(true);
      const response = await schoolsApi.getAll({
        page,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(status && { status }),
      });
      setSchools(response.data);
      setPagination(response.pagination || pagination);
    } catch (error: any) {
      showError(error.message || 'Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSchool) {
        await schoolsApi.update(editingSchool.id, formData);
        showSuccess('School updated successfully');
      } else {
        await schoolsApi.create(formData);
        showSuccess('School created successfully');
      }

      setIsModalOpen(false);
      setFormData({
        schoolName: '',
        address: '',
        contactPerson: '',
        phone: '',
        email: '',
        isApproved: false,
      });
      setEditingSchool(null);
      loadSchools(pagination.page, search, statusFilter);
    } catch (error: any) {
      showError(error.message || 'Failed to save school');
    }
  };

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    setFormData({
      schoolName: school.schoolName,
      address: school.address,
      contactPerson: school.contactPerson,
      phone: school.phone,
      email: school.email,
      isApproved: school.isApproved,
    });
    setIsModalOpen(true);
  };

  const handleView = (school: School) => {
    setSelectedSchool(school);
    setIsViewModalOpen(true);
  };

  const handleApprove = async (id: number) => {
    try {
      await schoolsApi.approve(id);
      showSuccess('School approved successfully');
      loadSchools(pagination.page, search, statusFilter);
    } catch (error: any) {
      showError(error.message || 'Failed to approve school');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this school?')) {
      try {
        await schoolsApi.delete(id);
        showSuccess('School deleted successfully');
        loadSchools(pagination.page, search, statusFilter);
      } catch (error: any) {
        showError(error.message || 'Failed to delete school');
      }
    }
  };

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    loadSchools(1, searchTerm, statusFilter);
  };

  const handlePageChange = (page: number) => {
    loadSchools(page, search, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    loadSchools(1, search, status);
  };

  const getStatusColor = (isApproved: boolean) => {
    return isApproved
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusIcon = (isApproved: boolean) => {
    return isApproved ? (
      <Check className="h-4 w-4" />
    ) : (
      <X className="h-4 w-4" />
    );
  };

  const columns = [
    {
      key: 'schoolName',
      label: 'School Name',
      render: (value: string, row: School) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'contactPerson',
      label: 'Contact Person',
      render: (value: string, row: School) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.phone}</div>
        </div>
      ),
    },
    {
      key: 'address',
      label: 'Address',
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: 'isApproved',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {getStatusIcon(value)}
          <span className="ml-1">{value ? 'Approved' : 'Pending'}</span>
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const actions = (row: School) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleView(row)}
        className="text-blue-600 hover:text-blue-900"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleEdit(row)}
        className="text-blue-600 hover:text-blue-900"
        title="Edit"
      >
        <Edit className="h-4 w-4" />
      </button>
      {!row.isApproved && (
        <button
          onClick={() => handleApprove(row.id)}
          className="text-green-600 hover:text-green-900"
          title="Approve"
        >
          <Check className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={() => handleDelete(row.id)}
        className="text-red-600 hover:text-red-900"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schools</h1>
            <p className="text-gray-600">Manage school registrations and approvals</p>
          </div>
          <button
            onClick={() => {
              setEditingSchool(null);
              setFormData({
                schoolName: '',
                address: '',
                contactPerson: '',
                phone: '',
                email: '',
                isApproved: false,
              });
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add School
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
          data={schools}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          searchPlaceholder="Search by school name, contact person, or email..."
          actions={actions}
        />

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSchool(null);
            setFormData({
              schoolName: '',
              address: '',
              contactPerson: '',
              phone: '',
              email: '',
              isApproved: false,
            });
          }}
          title={editingSchool ? 'Edit School' : 'Add School'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="School Name"
                name="schoolName"
                value={formData.schoolName}
                onChange={(value) => setFormData({ ...formData, schoolName: value })}
                placeholder="Enter school name"
                required
              />
              
              <FormField
                label="Contact Person"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={(value) => setFormData({ ...formData, contactPerson: value })}
                placeholder="Enter contact person name"
                required
              />
              
              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                placeholder="Enter email address"
                required
              />
              
              <FormField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                placeholder="Enter phone number"
                required
              />
            </div>
            
            <FormField
              label="Address"
              name="address"
              value={formData.address}
              onChange={(value) => setFormData({ ...formData, address: value })}
              placeholder="Enter school address"
              required
            />

            {editingSchool && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isApproved"
                  checked={formData.isApproved}
                  onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isApproved" className="ml-2 block text-sm text-gray-900">
                  Approved
                </label>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingSchool ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedSchool(null);
          }}
          title="School Details"
          size="lg"
        >
          {selectedSchool && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">School Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSchool.schoolName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSchool.isApproved)}`}>
                    {getStatusIcon(selectedSchool.isApproved)}
                    <span className="ml-1">{selectedSchool.isApproved ? 'Approved' : 'Pending'}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSchool.contactPerson}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSchool.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSchool.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedSchool.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-sm text-gray-900">{selectedSchool.address}</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
                {!selectedSchool.isApproved && (
                  <button
                    onClick={() => {
                      handleApprove(selectedSchool.id);
                      setIsViewModalOpen(false);
                    }}
                    className="btn-primary bg-green-600 hover:bg-green-700"
                  >
                    Approve School
                  </button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default Schools;
