import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Users, Settings, Plus, Edit, Trash2, Save, X, BookOpen } from "lucide-react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import { useToast } from "../contexts/ToastContext";
import { usersApi, booksApi, schoolsApi } from "../lib/apiService";

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

interface Book {
  id: number;
  isbn: string;
  title: string;
  description?: string;
  price: number;
  publisher: string;
  publishedDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bookAuthors: Array<{
    author: {
      id: number;
      name: string;
    };
  }>;
  bookDetails: Array<{
    edition: string;
    format: string;
    pages: number;
    language: string;
  }>;
}

interface Author {
  id: number;
  name: string;
  biography?: string;
}

interface School {
  id: number;
  schoolName: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

const Maintenance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'books' | 'schools' | 'settings'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'CLERK' as 'ADMIN' | 'CLERK',
    password: '',
  });
  const [bookFormData, setBookFormData] = useState({
    isbn: '',
    title: '',
    description: '',
    price: '',
    publisher: '',
    publishedDate: '',
    authors: [] as number[],
    edition: '',
    format: '',
    pages: '',
    language: '',
  });
  const [authorFormData, setAuthorFormData] = useState({
    name: '',
    biography: '',
  });
  const [schoolFormData, setSchoolFormData] = useState({
    schoolName: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
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

  const loadBooks = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      const response = await booksApi.getAll({ page, limit: 10, search: searchTerm });
      setBooks(response.data);
      setPagination(response.pagination || pagination);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAuthors = async () => {
    try {
      const response = await booksApi.getAuthors({ limit: 1000 });
      setAuthors(response.data);
    } catch (error: any) {
      showError('Failed to load authors');
    }
  };

  const loadSchools = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      const response = await schoolsApi.getAll({ page, limit: 10, search: searchTerm });
      setSchools(response.data);
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
    } else if (activeTab === 'books') {
      loadBooks();
      loadAuthors();
    } else if (activeTab === 'schools') {
      loadSchools();
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

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        isbn: bookFormData.isbn,
        title: bookFormData.title,
        description: bookFormData.description,
        price: parseFloat(bookFormData.price),
        publisher: bookFormData.publisher,
        publishedDate: bookFormData.publishedDate,
        authors: bookFormData.authors,
        edition: bookFormData.edition,
        format: bookFormData.format,
        pages: parseInt(bookFormData.pages),
        language: bookFormData.language,
      };

      if (editingBook) {
        await booksApi.update(editingBook.id, data);
        showSuccess('Book updated successfully');
      } else {
        await booksApi.create(data);
        showSuccess('Book created successfully');
      }

      setIsBookModalOpen(false);
      setBookFormData({
        isbn: '',
        title: '',
        description: '',
        price: '',
        publisher: '',
        publishedDate: '',
        authors: [],
        edition: '',
        format: '',
        pages: '',
        language: '',
      });
      setEditingBook(null);
      loadBooks(pagination.page, search);
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setBookFormData({
      isbn: book.isbn,
      title: book.title,
      description: book.description || '',
      price: book.price.toString(),
      publisher: book.publisher,
      publishedDate: book.publishedDate.split('T')[0],
      authors: book.bookAuthors.map(ba => ba.author.id),
      edition: book.bookDetails[0]?.edition || '',
      format: book.bookDetails[0]?.format || '',
      pages: book.bookDetails[0]?.pages.toString() || '',
      language: book.bookDetails[0]?.language || '',
    });
    setIsBookModalOpen(true);
  };

  const handleDeleteBook = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await booksApi.delete(id);
        showSuccess('Book deleted successfully');
        loadBooks(pagination.page, search);
      } catch (error: any) {
        showError(error.message);
      }
    }
  };

  const handleCreateAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await booksApi.createAuthor(authorFormData);
      showSuccess('Author created successfully');
      setIsAuthorModalOpen(false);
      setAuthorFormData({ name: '', biography: '' });
      loadAuthors();
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSchool) {
        await schoolsApi.update(editingSchool.id, schoolFormData);
        showSuccess('School updated successfully');
      } else {
        await schoolsApi.create(schoolFormData);
        showSuccess('School created successfully');
      }
      setIsSchoolModalOpen(false);
      setSchoolFormData({
        schoolName: '',
        email: '',
        phone: '',
        address: '',
        contactPerson: '',
      });
      setEditingSchool(null);
      loadSchools(pagination.page, search);
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleEditSchool = (school: School) => {
    setEditingSchool(school);
    setSchoolFormData({
      schoolName: school.schoolName,
      email: school.email,
      phone: school.phone,
      address: school.address,
      contactPerson: school.contactPerson,
    });
    setIsSchoolModalOpen(true);
  };

  const handleDeleteSchool = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this school?')) {
      try {
        await schoolsApi.delete(id);
        showSuccess('School deleted successfully');
        loadSchools(pagination.page, search);
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
    } else if (activeTab === 'books') {
      loadBooks(1, searchTerm);
    } else if (activeTab === 'schools') {
      loadSchools(1, searchTerm);
    }
  };

  const handlePageChange = (page: number) => {
    if (activeTab === 'users') {
      loadUsers(page, search);
    } else if (activeTab === 'books') {
      loadBooks(page, search);
    } else if (activeTab === 'schools') {
      loadSchools(page, search);
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

  const bookColumns = [
    {
      key: 'title',
      label: 'Title',
      render: (value: string, row: Book) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">ISBN: {row.isbn}</div>
        </div>
      ),
    },
    {
      key: 'publisher',
      label: 'Publisher',
    },
    {
      key: 'price',
      label: 'Price',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: 'bookAuthors',
      label: 'Authors',
      render: (value: any[]) => (
        <div className="text-sm">
          {value.map((ba, index) => (
            <span key={ba.author.id}>
              {ba.author.name}
              {index < value.length - 1 && ', '}
            </span>
          ))}
        </div>
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

  const bookActions = (row: Book) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleEditBook(row)}
        className="text-blue-600 hover:text-blue-900"
        title="Edit Book"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleDeleteBook(row.id)}
        className="text-red-600 hover:text-red-900"
        title="Delete Book"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const schoolColumns = [
    {
      key: 'schoolName',
      label: 'School Name',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    {
      key: 'contactPerson',
      label: 'Contact Person',
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
  ];

  const schoolActions = (row: School) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleEditSchool(row)}
        className="text-blue-600 hover:text-blue-900"
        title="Edit School"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleDeleteSchool(row.id)}
        className="text-red-600 hover:text-red-900"
        title="Delete School"
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
              onClick={() => setActiveTab('books')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'books'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen className="h-4 w-4 inline mr-2" />
              Book Management
            </button>
            <button
              onClick={() => setActiveTab('schools')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schools'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              School Management
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

        {/* Book Management Tab */}
        {activeTab === 'books' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Book Management</h2>
                <p className="text-gray-600">Manage books and authors</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsAuthorModalOpen(true)}
                  className="btn-secondary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Author
                </button>
                <button
                  onClick={() => {
                    setEditingBook(null);
                    setBookFormData({
                      isbn: '',
                      title: '',
                      description: '',
                      price: '',
                      publisher: '',
                      publishedDate: '',
                      authors: [],
                      edition: '',
                      format: '',
                      pages: '',
                      language: '',
                    });
                    setIsBookModalOpen(true);
                  }}
                  className="btn-primary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Book
                </button>
              </div>
            </div>

            <DataTable
              columns={bookColumns}
              data={books}
              loading={loading}
              pagination={pagination}
              onPageChange={handlePageChange}
              onSearch={handleSearch}
              searchPlaceholder="Search books..."
              actions={bookActions}
            />
          </div>
        )}

        {/* School Management Tab */}
        {activeTab === 'schools' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">School Management</h2>
                <p className="text-gray-600">Manage schools and their information</p>
              </div>
              <button
                onClick={() => {
                  setEditingSchool(null);
                  setSchoolFormData({
                    schoolName: '',
                    email: '',
                    phone: '',
                    address: '',
                    contactPerson: '',
                  });
                  setIsSchoolModalOpen(true);
                }}
                className="btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add School
              </button>
            </div>

            <DataTable
              columns={schoolColumns}
              data={schools}
              loading={loading}
              pagination={pagination}
              onPageChange={handlePageChange}
              onSearch={handleSearch}
              searchPlaceholder="Search schools..."
              actions={schoolActions}
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

        {/* Book Modal */}
        <Modal
          isOpen={isBookModalOpen}
          onClose={() => {
            setIsBookModalOpen(false);
            setEditingBook(null);
            setBookFormData({
              isbn: '',
              title: '',
              description: '',
              price: '',
              publisher: '',
              publishedDate: '',
              authors: [],
              edition: '',
              format: '',
              pages: '',
              language: '',
            });
          }}
          title={editingBook ? 'Edit Book' : 'Add Book'}
          size="lg"
        >
          <form onSubmit={handleCreateBook} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="ISBN"
                name="isbn"
                value={bookFormData.isbn}
                onChange={(value) => setBookFormData({ ...bookFormData, isbn: value })}
                required
              />
              <FormField
                label="Title"
                name="title"
                value={bookFormData.title}
                onChange={(value) => setBookFormData({ ...bookFormData, title: value })}
                required
              />
              <FormField
                label="Publisher"
                name="publisher"
                value={bookFormData.publisher}
                onChange={(value) => setBookFormData({ ...bookFormData, publisher: value })}
                required
              />
              <FormField
                label="Price"
                name="price"
                type="number"
                step="0.01"
                value={bookFormData.price}
                onChange={(value) => setBookFormData({ ...bookFormData, price: value })}
                required
              />
              <FormField
                label="Published Date"
                name="publishedDate"
                type="date"
                value={bookFormData.publishedDate}
                onChange={(value) => setBookFormData({ ...bookFormData, publishedDate: value })}
                required
              />
              <FormField
                label="Edition"
                name="edition"
                value={bookFormData.edition}
                onChange={(value) => setBookFormData({ ...bookFormData, edition: value })}
                required
              />
              <FormField
                label="Format"
                name="format"
                value={bookFormData.format}
                onChange={(value) => setBookFormData({ ...bookFormData, format: value })}
                required
              />
              <FormField
                label="Pages"
                name="pages"
                type="number"
                value={bookFormData.pages}
                onChange={(value) => setBookFormData({ ...bookFormData, pages: value })}
                required
              />
              <FormField
                label="Language"
                name="language"
                value={bookFormData.language}
                onChange={(value) => setBookFormData({ ...bookFormData, language: value })}
                required
              />
            </div>
            
            <FormField
              label="Description"
              name="description"
              value={bookFormData.description}
              onChange={(value) => setBookFormData({ ...bookFormData, description: value })}
              type="textarea"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Authors</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {authors.map((author) => (
                  <label key={author.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={bookFormData.authors.includes(author.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBookFormData({
                            ...bookFormData,
                            authors: [...bookFormData.authors, author.id]
                          });
                        } else {
                          setBookFormData({
                            ...bookFormData,
                            authors: bookFormData.authors.filter(id => id !== author.id)
                          });
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">{author.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingBook ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Author Modal */}
        <Modal
          isOpen={isAuthorModalOpen}
          onClose={() => {
            setIsAuthorModalOpen(false);
            setAuthorFormData({ name: '', biography: '' });
          }}
          title="Add Author"
        >
          <form onSubmit={handleCreateAuthor} className="space-y-4">
            <FormField
              label="Author Name"
              name="name"
              value={authorFormData.name}
              onChange={(value) => setAuthorFormData({ ...authorFormData, name: value })}
              required
            />
            <FormField
              label="Biography"
              name="biography"
              value={authorFormData.biography}
              onChange={(value) => setAuthorFormData({ ...authorFormData, biography: value })}
              type="textarea"
            />
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsAuthorModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Create Author
              </button>
            </div>
          </form>
        </Modal>

        {/* School Modal */}
        <Modal
          isOpen={isSchoolModalOpen}
          onClose={() => {
            setIsSchoolModalOpen(false);
            setEditingSchool(null);
            setSchoolFormData({
              schoolName: '',
              email: '',
              phone: '',
              address: '',
              contactPerson: '',
            });
          }}
          title={editingSchool ? 'Edit School' : 'Add School'}
          size="lg"
        >
          <form onSubmit={handleCreateSchool} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="School Name"
                name="schoolName"
                value={schoolFormData.schoolName}
                onChange={(value) => setSchoolFormData({ ...schoolFormData, schoolName: value })}
                required
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={schoolFormData.email}
                onChange={(value) => setSchoolFormData({ ...schoolFormData, email: value })}
                required
              />
              <FormField
                label="Phone"
                name="phone"
                value={schoolFormData.phone}
                onChange={(value) => setSchoolFormData({ ...schoolFormData, phone: value })}
                required
              />
              <FormField
                label="Contact Person"
                name="contactPerson"
                value={schoolFormData.contactPerson}
                onChange={(value) => setSchoolFormData({ ...schoolFormData, contactPerson: value })}
                required
              />
            </div>
            
            <FormField
              label="Address"
              name="address"
              value={schoolFormData.address}
              onChange={(value) => setSchoolFormData({ ...schoolFormData, address: value })}
              type="textarea"
              required
            />

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsSchoolModalOpen(false)}
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
      </div>
    </Layout>
  );
};

export default Maintenance;