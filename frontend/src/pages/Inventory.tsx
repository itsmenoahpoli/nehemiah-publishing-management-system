import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Package, Warehouse, Plus, ArrowRight, BookOpen, RotateCcw } from "lucide-react";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import { useToast } from "../contexts/ToastContext";
import { stockEntriesApi, inventoryApi } from "../lib/apiService";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";

const Inventory: React.FC = () => {
  const [warehouse, setWarehouse] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [warehouseFormData, setWarehouseFormData] = useState({
    bookId: '',
    quantity: '',
    location: ''
  });
  const [schoolFormData, setSchoolFormData] = useState({
    schoolId: '',
    bookId: '',
    quantity: ''
  });
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const [w, s, b] = await Promise.all([
          inventoryApi.getWarehouse({ page: 1, limit: 100 }),
          inventoryApi.getSchools({ page: 1, limit: 100 }),
          api.get("/books", { params: { page: 1, limit: 100 } })
        ]);
        setWarehouse(w.data || []);
        setSchools(s.data || []);
        setBooks(b.data.data || []);
      } catch (error: any) {
        if (error.message.includes('Access token required') || error.message.includes('Unauthorized')) {
          showError('Please log in to view inventory data');
        } else {
          showError(`Failed to load inventory data: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleCreateWarehouseStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await stockEntriesApi.create({
        bookId: parseInt(warehouseFormData.bookId),
        quantity: parseInt(warehouseFormData.quantity),
        location: warehouseFormData.location
      });
      showSuccess('Warehouse stock created successfully');
      setIsWarehouseModalOpen(false);
      setWarehouseFormData({ bookId: '', quantity: '', location: '' });
      const response = await inventoryApi.getWarehouse({ page: 1, limit: 100 });
      setWarehouse(response.data || []);
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleCreateSchoolInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      showError('School inventory creation is not yet implemented. Please use the existing book request or return flow.');
      setIsSchoolModalOpen(false);
      setSchoolFormData({ schoolId: '', bookId: '', quantity: '' });
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">Manage warehouse and school inventory</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Warehouse className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  Warehouse Stock
                </h3>
              </div>
              <button
                onClick={() => setIsWarehouseModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Stock
              </button>
            </div>
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Book
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ISBN
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {warehouse.map((row) => (
                      <tr key={row.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {row.book?.title}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {row.book?.isbn}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {row.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Package className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  School Inventory
                </h3>
              </div>
              <button
                onClick={() => setIsSchoolModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Inventory
              </button>
            </div>
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        School
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Book
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schools.map((row) => (
                      <tr key={row.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {row.school?.schoolName}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {row.book?.title}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {row.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <Modal
          isOpen={isWarehouseModalOpen}
          onClose={() => setIsWarehouseModalOpen(false)}
          title="Add Warehouse Stock"
          size="md"
        >
          <form onSubmit={handleCreateWarehouseStock} className="space-y-4">
            <FormField
              label="Book"
              type="select"
              value={warehouseFormData.bookId}
              onChange={(e) => setWarehouseFormData({ ...warehouseFormData, bookId: e.target.value })}
              required
            >
              <option value="">Select a book</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} - {book.isbn}
                </option>
              ))}
            </FormField>
            
            <FormField
              label="Quantity"
              type="number"
              value={warehouseFormData.quantity}
              onChange={(e) => setWarehouseFormData({ ...warehouseFormData, quantity: e.target.value })}
              placeholder="Enter quantity"
              required
              min="1"
            />
            
            <FormField
              label="Location"
              type="text"
              value={warehouseFormData.location}
              onChange={(e) => setWarehouseFormData({ ...warehouseFormData, location: e.target.value })}
              placeholder="Enter storage location"
              required
            />
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsWarehouseModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
              >
                Add Stock
              </button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={isSchoolModalOpen}
          onClose={() => setIsSchoolModalOpen(false)}
          title="Manage School Inventory"
          size="lg"
        >
          <div className="py-6">
            <div className="text-center mb-6">
              <Package className="mx-auto h-12 w-12 text-blue-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">School Inventory Management</h3>
              <p className="mt-1 text-sm text-gray-500">
                School inventory is managed through book requests and returns. Choose how you'd like to manage inventory:
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={() => {
                  setIsSchoolModalOpen(false);
                  navigate('/book-requests');
                }}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">Book Requests</p>
                  <p className="text-sm text-gray-500">Approve book requests from schools</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setIsSchoolModalOpen(false);
                  navigate('/returned-books');
                }}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <div className="flex-shrink-0">
                  <RotateCcw className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">Returned Books</p>
                  <p className="text-sm text-gray-500">Process book returns and inventory updates</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSchoolModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Inventory;
