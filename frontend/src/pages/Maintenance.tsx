import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Users, Settings, Plus, Edit, Trash2, Save, X } from "lucide-react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import { useToast } from "../contexts/ToastContext";
import { usersApi } from "../lib/apiService";

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'CLERK';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description: string;
  type: 'string' | 'number' | 'boolean';
}

const Maintenance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'CLERK' as 'ADMIN' | 'CLERK',
    password: '',
  });
  const [settingFormData, setSettingFormData] = useState({
    key: '',
    value: '',
    description: '',
    type: 'string' as 'string' | 'number' | 'boolean',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');

  const { showSuccess, showError } = useToast();

  const loadUsers = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      const response = await usersApi.getAll({ page, limit: 10, search: searchTerm });
      setUsers(response.data);
      setPagination(response.pagination || pagination);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = () => {
    // Mock system settings - in a real app, these would come from an API
    const mockSettings: SystemSetting[] = [
      {
        id: '1',
        key: 'system_name',
        value: 'Nehemiah Publishing Management System',
        description: 'The name of the system',
        type: 'string'
      },
      {
        id: '2',
        key: 'max_books_per_request',
        value: '50',
        description: 'Maximum number of books that can be requested at once',
        type: 'number'
      },
      {
        id: '3',
        key: 'auto_approve_requests',
        value: 'false',
        description: 'Automatically approve book requests',
        type: 'boolean'
      },
      {
        id: '4',
        key: 'notification_email',
        value: 'admin@nehemiah-publishing.com',
        description: 'Email address for system notifications',
        type: 'string'
      },
      {
        id: '5',
        key: 'low_stock_threshold',
        value: '10',
        description: 'Minimum stock level before low stock alert',
        type: 'number'
      }
    ];
    setSettings(mockSettings);
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else {
      loadSettings();
    }
  }, [activeTab]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...userFormData,
        password: userFormData.password || undefined,
      };

      if (editingUser) {
        await usersApi.update(editingUser.id, data);
        showSuccess('User updated successfully');
      } else {
        await usersApi.create(data);
        showSuccess('User created successfully');
      }

      setIsUserModalOpen(false);
      setUserFormData({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        role: 'CLERK',
        password: '',
      });
      setEditingUser(null);
      loadUsers(pagination.page, search);
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      password: '',
    });
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersApi.delete(id);
        showSuccess('User deleted successfully');
        loadUsers(pagination.page, search);
      } catch (error: any) {
        showError(error.message);
      }
    }
  };

  const handleEditSetting = (setting: SystemSetting) => {
    setEditingSetting(setting);
    setSettingFormData({
      key: setting.key,
      value: setting.value,
      description: setting.description,
      type: setting.type,
    });
    setIsSettingsModalOpen(true);
  };

  const handleSaveSetting = () => {
    const updatedSettings = settings.map(setting => 
      setting.id === editingSetting?.id 
        ? { ...setting, value: settingFormData.value }
        : setting
    );
    setSettings(updatedSettings);
    setIsSettingsModalOpen(false);
    setEditingSetting(null);
    showSuccess('Setting updated successfully');
  };

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    if (activeTab === 'users') {
      loadUsers(1, searchTerm);
    }
  };

  const handlePageChange = (page: number) => {
    if (activeTab === 'users') {
      loadUsers(page, search);
    }
  };

  const userColumns = [
    {
      key: 'username',
      label: 'Username',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'firstName',
      label: 'First Name',
    },
    {
      key: 'lastName',
      label: 'Last Name',
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'ADMIN' 
            ? 'bg-red-100 text-red-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const userActions = (row: User) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleEditUser(row)}
        className="text-blue-600 hover:text-blue-900"
        title="Edit User"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleDeleteUser(row.id)}
        className="text-red-600 hover:text-red-900"
        title="Delete User"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-gray-600">Manage system settings and users</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="h-4 w-4 inline mr-2" />
              System Settings
            </button>
          </nav>
        </div>

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">User Management</h2>
                <p className="text-gray-600">Manage system users and roles</p>
              </div>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setUserFormData({
                    username: '',
                    email: '',
                    firstName: '',
                    lastName: '',
                    role: 'CLERK',
                    password: '',
                  });
                  setIsUserModalOpen(true);
                }}
                className="btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </button>
            </div>

            <DataTable
              columns={userColumns}
              data={users}
              loading={loading}
              pagination={pagination}
              onPageChange={handlePageChange}
              onSearch={handleSearch}
              searchPlaceholder="Search users..."
              actions={userActions}
            />
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">System Settings</h2>
              <p className="text-gray-600">Configure system parameters</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {settings.map((setting) => (
                <div key={setting.id} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{setting.key}</h3>
                      <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
                      <div className="mt-2">
                        <span className="text-sm text-gray-700">
                          Current Value: <strong>{setting.value}</strong>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEditSetting(setting)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Modal */}
        <Modal
          isOpen={isUserModalOpen}
          onClose={() => {
            setIsUserModalOpen(false);
            setEditingUser(null);
            setUserFormData({
              username: '',
              email: '',
              firstName: '',
              lastName: '',
              role: 'CLERK',
              password: '',
            });
          }}
          title={editingUser ? 'Edit User' : 'Add User'}
        >
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Username"
                name="username"
                value={userFormData.username}
                onChange={(value) => setUserFormData({ ...userFormData, username: value })}
                required
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={userFormData.email}
                onChange={(value) => setUserFormData({ ...userFormData, email: value })}
                required
              />
              <FormField
                label="First Name"
                name="firstName"
                value={userFormData.firstName}
                onChange={(value) => setUserFormData({ ...userFormData, firstName: value })}
                required
              />
              <FormField
                label="Last Name"
                name="lastName"
                value={userFormData.lastName}
                onChange={(value) => setUserFormData({ ...userFormData, lastName: value })}
                required
              />
              <FormField
                label="Role"
                name="role"
                type="select"
                value={userFormData.role}
                onChange={(value) => setUserFormData({ ...userFormData, role: value as 'ADMIN' | 'CLERK' })}
                required
                options={[
                  { value: 'CLERK', label: 'Clerk' },
                  { value: 'ADMIN', label: 'Admin' },
                ]}
              />
              <FormField
                label={editingUser ? "New Password (leave blank to keep current)" : "Password"}
                name="password"
                type="password"
                value={userFormData.password}
                onChange={(value) => setUserFormData({ ...userFormData, password: value })}
                required={!editingUser}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingUser ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Settings Modal */}
        <Modal
          isOpen={isSettingsModalOpen}
          onClose={() => {
            setIsSettingsModalOpen(false);
            setEditingSetting(null);
          }}
          title="Edit Setting"
        >
          {editingSetting && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Setting Key</label>
                <p className="mt-1 text-sm text-gray-900">{editingSetting.key}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{editingSetting.description}</p>
              </div>
              <FormField
                label="Value"
                name="value"
                type={editingSetting.type === 'number' ? 'number' : editingSetting.type === 'boolean' ? 'select' : 'text'}
                value={settingFormData.value}
                onChange={(value) => setSettingFormData({ ...settingFormData, value })}
                required
                options={editingSetting.type === 'boolean' ? [
                  { value: 'true', label: 'True' },
                  { value: 'false', label: 'False' },
                ] : undefined}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSetting}
                  className="btn-primary"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default Maintenance;