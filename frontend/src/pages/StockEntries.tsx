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
  const [isBookFormModalOpen, setIsBookFormModalOpen] = useState(false);
  const [isBooksModalOpen, setIsBooksModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<StockEntry | null>(null);
  const [formData, setFormData] = useState({
    bookId: '',
    quantity: '',
    location: '',
  });
  const [bookFormData, setBookFormData] = useState({
    id: '',
    isbn: '',
    title: '',
    description: '',
    price: '',
    publisher: '',
    publishedDate: '',
    edition: '',
    format: '',
    pages: '',
    language: '',
    authors: [] as string[],
  });
  const [authors, setAuthors] = useState<any[]>([]);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [booksSearch, setBooksSearch] = useState('');
  const [booksLoading, setBooksLoading] = useState(false);
  const [booksPagination, setBooksPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
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

  const loadBooksForManage = async (page = 1, searchTerm = '') => {
    try {
      setBooksLoading(true);
      const response = await booksApi.getAll({ page, limit: 10, search: searchTerm });
      setBooks(response.data);
      setBooksPagination(response.pagination || booksPagination);
    } catch (error: any) {
      showError('Failed to load books');
    } finally {
      setBooksLoading(false);
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

  useEffect(() => {
    loadStockEntries();
    loadBooks();
    loadAuthors();
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
      render: (_: any, row: StockEntry) => (
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

        <div className="flex justify-end">
          <button
            onClick={() => {
              setBooksSearch('');
              setBookFormData({ id: '', isbn: '', title: '', description: '', price: '', publisher: '', publishedDate: '', edition: '', format: '', pages: '', language: '', authors: [] });
              setIsBooksModalOpen(true);
              loadBooksForManage(1, '');
            }}
            className="btn-secondary text-sm"
          >
            Manage Books
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

        <Modal
          isOpen={isBooksModalOpen}
          onClose={() => {
            setIsBooksModalOpen(false);
            setBookFormData({ id: '', isbn: '', title: '', description: '', price: '', publisher: '', publishedDate: '', edition: '', format: '', pages: '', language: '', authors: [] });
          }}
          title="Manage Books"
          size="xl"
        >
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-64">
                  <input
                    type="text"
                    placeholder="Search books..."
                    value={booksSearch}
                    onChange={(e) => {
                      setBooksSearch(e.target.value);
                      loadBooksForManage(1, e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setBookFormData({ id: '', isbn: '', title: '', description: '', price: '', publisher: '', publishedDate: '', edition: '', format: '', pages: '', language: '', authors: [] });
                      setIsBookFormModalOpen(true);
                    }}
                  >
                    Add Book
                  </button>
                  <input
                    type="text"
                    placeholder="New author name"
                    value={newAuthorName}
                    onChange={(e) => setNewAuthorName(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    className="btn-secondary"
                    onClick={async () => {
                      if (!newAuthorName.trim()) return;
                      try {
                        await booksApi.createAuthor({ name: newAuthorName.trim() });
                        setNewAuthorName('');
                        loadAuthors();
                        showSuccess('Author added');
                      } catch (err: any) {
                        showError(err.message || 'Failed to add author');
                      }
                    }}
                  >
                    Add Author
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publisher</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {books.map((b) => (
                      <tr key={b.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.isbn}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.publisher}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => {
                            setBookFormData({
                                id: String(b.id),
                                isbn: b.isbn || '',
                                title: b.title || '',
                                description: b.description || '',
                                price: String(b.price ?? ''),
                                publisher: b.publisher || '',
                                publishedDate: b.publishedDate ? new Date(b.publishedDate).toISOString().slice(0, 10) : '',
                                edition: b.bookDetails?.edition || '',
                                format: b.bookDetails?.format || '',
                                pages: String(b.bookDetails?.pages ?? ''),
                                language: b.bookDetails?.language || '',
                                authors: (b.bookAuthors || []).map((ba: any) => String(ba.authorId)),
                              });
                              setIsBookFormModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 inline" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={async () => {
                              if (!window.confirm('Delete this book?')) return;
                              try {
                                await booksApi.delete(b.id);
                                loadBooksForManage(booksPagination.page, booksSearch);
                                showSuccess('Book deleted');
                              } catch (err: any) {
                                showError(err.message || 'Failed to delete book');
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  className="btn-secondary"
                  disabled={booksPagination.page <= 1 || booksLoading}
                  onClick={() => loadBooksForManage(booksPagination.page - 1, booksSearch)}
                >
                  Prev
                </button>
                <button
                  className="btn-secondary"
                  disabled={booksPagination.page >= booksPagination.totalPages || booksLoading}
                  onClick={() => loadBooksForManage(booksPagination.page + 1, booksSearch)}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Book form moved to submodal */}
          </div>
        </Modal>

        <Modal
          isOpen={isBookFormModalOpen}
          onClose={() => {
            setIsBookFormModalOpen(false);
            setBookFormData({ id: '', isbn: '', title: '', description: '', price: '', publisher: '', publishedDate: '', edition: '', format: '', pages: '', language: '', authors: [] });
          }}
          title={bookFormData.id ? 'Edit Book' : 'Add Book'}
          size="lg"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const payloadCreate = {
                  isbn: bookFormData.isbn,
                  title: bookFormData.title,
                  description: bookFormData.description,
                  price: parseFloat(bookFormData.price),
                  publisher: bookFormData.publisher,
                  publishedDate: bookFormData.publishedDate,
                  authors: bookFormData.authors.map((a) => parseInt(a, 10)),
                  edition: bookFormData.edition,
                  format: bookFormData.format,
                  pages: parseInt(bookFormData.pages, 10),
                  language: bookFormData.language,
                } as any;

                if (bookFormData.id) {
                  const payloadUpdate = {
                    title: bookFormData.title,
                    description: bookFormData.description,
                    price: parseFloat(bookFormData.price),
                    publisher: bookFormData.publisher,
                    publishedDate: bookFormData.publishedDate,
                  } as any;
                  await booksApi.update(parseInt(bookFormData.id, 10), payloadUpdate);
                  showSuccess('Book updated');
                } else {
                  await booksApi.create(payloadCreate);
                  showSuccess('Book created');
                }
                setIsBookFormModalOpen(false);
                setBookFormData({ id: '', isbn: '', title: '', description: '', price: '', publisher: '', publishedDate: '', edition: '', format: '', pages: '', language: '', authors: [] });
                loadBooksForManage(booksPagination.page, booksSearch);
                loadBooks();
              } catch (err: any) {
                showError(err.message || 'Failed to save book');
              }
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="ISBN" name="isbn" value={bookFormData.isbn} onChange={(v) => setBookFormData({ ...bookFormData, isbn: v })} required={!bookFormData.id} />
              <FormField label="Title" name="title" value={bookFormData.title} onChange={(v) => setBookFormData({ ...bookFormData, title: v })} required />
              <FormField label="Description" name="description" type="textarea" rows={2} value={bookFormData.description} onChange={(v) => setBookFormData({ ...bookFormData, description: v })} />
              <FormField label="Price" name="price" type="number" value={bookFormData.price} onChange={(v) => setBookFormData({ ...bookFormData, price: v })} required />
              <FormField label="Publisher" name="publisher" value={bookFormData.publisher} onChange={(v) => setBookFormData({ ...bookFormData, publisher: v })} required />
              <FormField label="Published Date" name="publishedDate" type="date" value={bookFormData.publishedDate} onChange={(v) => setBookFormData({ ...bookFormData, publishedDate: v })} required />
              <FormField label="Edition" name="edition" value={bookFormData.edition} onChange={(v) => setBookFormData({ ...bookFormData, edition: v })} required={!bookFormData.id} />
              <FormField label="Format" name="format" value={bookFormData.format} onChange={(v) => setBookFormData({ ...bookFormData, format: v })} required={!bookFormData.id} />
              <FormField label="Pages" name="pages" type="number" value={bookFormData.pages} onChange={(v) => setBookFormData({ ...bookFormData, pages: v })} required={!bookFormData.id} />
              <FormField label="Language" name="language" value={bookFormData.language} onChange={(v) => setBookFormData({ ...bookFormData, language: v })} required={!bookFormData.id} />
              <div className="mb-4 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Authors<span className="text-red-500 ml-1">*</span></label>
                <select
                  multiple
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                  value={bookFormData.authors}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                    setBookFormData({ ...bookFormData, authors: selected });
                  }}
                >
                  {authors.map((a) => (
                    <option key={a.id} value={String(a.id)}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" className="btn-secondary" onClick={() => setBookFormData({ id: '', isbn: '', title: '', description: '', price: '', publisher: '', publishedDate: '', edition: '', format: '', pages: '', language: '', authors: [] })}>Clear</button>
              <button type="submit" className="btn-primary">{bookFormData.id ? 'Update Book' : 'Create Book'}</button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default StockEntries;
