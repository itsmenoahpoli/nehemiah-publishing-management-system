import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Plus, X, RotateCcw } from "lucide-react";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import { useToast } from "../contexts/ToastContext";
import { returnsApi, booksApi, schoolsApi } from "../lib/apiService";
import { formatCurrency } from "../lib/utils";

interface Book {
  id: number;
  title: string;
  isbn: string;
  price: number;
  publisher: string;
}

interface School {
  id: number;
  schoolName: string;
  email: string;
  phone: string;
}

interface ReturnItem {
  bookId: string;
  quantity: string;
  reason: string;
}

const RequestReturn: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    schoolId: '',
    items: [{ bookId: '', quantity: '', reason: '' } as ReturnItem],
  });
  const [search, setSearch] = useState('');

  const { showSuccess, showError } = useToast();

  const loadBooks = async (searchTerm = '') => {
    try {
      setLoading(true);
      const response = await booksApi.getAll({ 
        limit: 1000, 
        search: searchTerm 
      });
      setBooks(response.data);
    } catch (error: any) {
      showError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const loadSchools = async () => {
    try {
      const response = await schoolsApi.getAll({ 
        limit: 1000, 
        status: 'approved' 
      });
      setSchools(response.data);
    } catch (error: any) {
      showError('Failed to load schools');
    }
  };

  useEffect(() => {
    loadBooks();
    loadSchools();
  }, []);

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    loadBooks(searchTerm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validItems = formData.items.filter(item => 
        item.bookId && item.quantity && parseInt(item.quantity) > 0
      );

      if (validItems.length === 0) {
        showError('Please add at least one book to return');
        return;
      }

      const data = {
        schoolId: parseInt(formData.schoolId),
        items: validItems.map(item => ({
          bookId: parseInt(item.bookId),
          quantity: parseInt(item.quantity),
          reason: item.reason,
        })),
      };

      await returnsApi.create(data);
      showSuccess('Return request submitted successfully');
      setIsModalOpen(false);
      setFormData({
        schoolId: '',
        items: [{ bookId: '', quantity: '', reason: '' }],
      });
    } catch (error: any) {
      showError(error.message || 'Failed to submit return request');
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

  const updateItem = (index: number, field: keyof ReturnItem, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const getTotalAmount = () => {
    return formData.items.reduce((total, item) => {
      if (item.bookId && item.quantity) {
        const book = books.find(b => b.id === parseInt(item.bookId));
        if (book) {
          return total + (book.price * parseInt(item.quantity));
        }
      }
      return total;
    }, 0);
  };

  const getSelectedBooks = () => {
    return formData.items
      .filter(item => item.bookId)
      .map(item => {
        const book = books.find(b => b.id === parseInt(item.bookId));
        return book ? { ...book, quantity: parseInt(item.quantity) } : null;
      })
      .filter(Boolean);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Request Return</h1>
            <p className="text-gray-600">Request to return books to the publisher</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            New Return Request
          </button>
        </div>

        {/* Available Books */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Available Books for Return</h2>
            <div className="w-64">
              <input
                type="text"
                placeholder="Search books..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <div key={book.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-medium text-gray-900 mb-2">{book.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">ISBN: {book.isbn}</p>
                  <p className="text-sm text-gray-500 mb-2">Publisher: {book.publisher}</p>
                  <p className="text-lg font-semibold text-blue-600">{formatCurrency(book.price)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Return Request Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setFormData({
              schoolId: '',
              items: [{ bookId: '', quantity: '', reason: '' }],
            });
          }}
          title="Request Return"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="School"
              name="schoolId"
              type="select"
              value={formData.schoolId}
              onChange={(value) => setFormData({ ...formData, schoolId: value })}
              required
              options={[
                { value: '', label: 'Select a school' },
                ...schools.map(school => ({
                  value: school.id.toString(),
                  label: school.schoolName
                }))
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Books to Return
              </label>
              {formData.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Book"
                      name={`bookId_${index}`}
                      type="select"
                      value={item.bookId}
                      onChange={(value) => updateItem(index, 'bookId', value)}
                      required
                      options={[
                        { value: '', label: 'Select a book' },
                        ...books.map(book => ({
                          value: book.id.toString(),
                          label: `${book.title} - ${formatCurrency(book.price)}`
                        }))
                      ]}
                    />
                    <FormField
                      label="Quantity"
                      name={`quantity_${index}`}
                      type="number"
                      value={item.quantity}
                      onChange={(value) => updateItem(index, 'quantity', value)}
                      required
                      min="1"
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
                    label="Reason for Return"
                    name={`reason_${index}`}
                    type="textarea"
                    value={item.reason}
                    onChange={(value) => updateItem(index, 'reason', value)}
                    placeholder="Enter reason for returning this book..."
                    rows={2}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="btn-secondary text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Book
              </button>
            </div>

            {/* Return Summary */}
            {getSelectedBooks().length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Return Summary</h3>
                <div className="space-y-2">
                  {getSelectedBooks().map((book, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{book.title} x {book.quantity}</span>
                      <span>{formatCurrency(Number(book.price) * Number(book.quantity))}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total Refund:</span>
                    <span>{formatCurrency(getTotalAmount())}</span>
                  </div>
                </div>
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
                Submit Return Request
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default RequestReturn;
