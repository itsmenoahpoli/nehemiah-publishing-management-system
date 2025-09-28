import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Plus, Edit, Trash2 } from "lucide-react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import { useToast } from "../contexts/ToastContext";
import { stockEntriesApi, booksApi } from "../lib/apiService";

interface StockEntry {
  id: number;
  bookId: number;
  quantity: number;
  location: string;
  createdAt: string;
  book: {
    id: number;
    title: string;
    isbn: string;
  };
}

const StockEntries: React.FC = () => {
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<StockEntry | null>(null);
  const [formData, setFormData] = useState({
    bookId: '',
    quantity: '',
    location: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');

  const { showSuccess, showError } = useToast();

  const loadStockEntries = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      const response = await stockEntriesApi.getAll({ page, limit: 10, search: searchTerm });
      setStockEntries(response.data);
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
    loadStockEntries();
    loadBooks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        bookId: parseInt(formData.bookId),
        quantity: parseInt(formData.quantity),
        location: formData.location,
      };

      if (editingEntry) {
        await stockEntriesApi.update(editingEntry.id, data);
        showSuccess('Stock entry updated successfully');
      } else {
        await stockEntriesApi.create(data);
        showSuccess('Stock entry created successfully');
      }

      setIsModalOpen(false);
      setFormData({ bookId: '', quantity: '', location: '' });
      setEditingEntry(null);
      loadStockEntries(pagination.page, search);
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleEdit = (entry: StockEntry) => {
    setEditingEntry(entry);
    setFormData({
      bookId: entry.bookId.toString(),
      quantity: entry.quantity.toString(),
      location: entry.location,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this stock entry?')) {
      try {
        await stockEntriesApi.delete(id);
        showSuccess('Stock entry deleted successfully');
        loadStockEntries(pagination.page, search);
      } catch (error: any) {
        showError(error.message);
      }
    }
  };

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    loadStockEntries(1, searchTerm);
  };

  const handlePageChange = (page: number) => {
    loadStockEntries(page, search);
  };

  const columns = [
    {
      key: 'book.title',
      label: 'Book',
      render: (value: any, row: StockEntry) => (
        <div>
          <div className="font-medium text-gray-900">{row.book.title}</div>
          <div className="text-sm text-gray-500">ISBN: {row.book.isbn}</div>
        </div>
      ),
    },
    {
      key: 'quantity',
      label: 'Quantity',
    },
    {
      key: 'location',
      label: 'Location',
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const actions = (row: StockEntry) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleEdit(row)}
        className="text-blue-600 hover:text-blue-900"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleDelete(row.id)}
        className="text-red-600 hover:text-red-900"
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
            <h1 className="text-2xl font-bold text-gray-900">Stock Entries</h1>
            <p className="text-gray-600">Add and manage stock entries</p>
          </div>
          <button
            onClick={() => {
              setEditingEntry(null);
              setFormData({ bookId: '', quantity: '', location: '' });
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Stock Entry
          </button>
        </div>

        <DataTable
          columns={columns}
          data={stockEntries}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          searchPlaceholder="Search by book title or ISBN..."
          actions={actions}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingEntry(null);
            setFormData({ bookId: '', quantity: '', location: '' });
          }}
          title={editingEntry ? 'Edit Stock Entry' : 'Add Stock Entry'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Book"
              name="bookId"
              type="select"
              value={formData.bookId}
              onChange={(value) => setFormData({ ...formData, bookId: value })}
              required
              options={books.map(book => ({
                value: book.id.toString(),
                label: `${book.title} (${book.isbn})`
              }))}
            />
            <FormField
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={(value) => setFormData({ ...formData, quantity: value })}
              placeholder="Enter quantity"
              required
            />
            <FormField
              label="Location"
              name="location"
              value={formData.location}
              onChange={(value) => setFormData({ ...formData, location: value })}
              placeholder="Enter location"
              required
            />
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingEntry ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default StockEntries;
