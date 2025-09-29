import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Maintenance from "./pages/Maintenance";
import Inventory from "./pages/Inventory";
import StockEntries from "./pages/StockEntries";
import BookRequests from "./pages/BookRequests";
import BillingPayment from "./pages/BillingPayment";
import ReturnedBooks from "./pages/ReturnedBooks";
import Reports from "./pages/Reports";
import RegistrationApprovals from "./pages/RegistrationApprovals";
import OrderHistory from "./pages/OrderHistory";
import Schools from "./pages/Schools";
import RequestOrder from "./pages/RequestOrder";
import RequestReturn from "./pages/RequestReturn";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Maintenance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stock-entries"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <StockEntries />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book-requests"
              element={
                <ProtectedRoute>
                  <BookRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing-payment"
              element={
                <ProtectedRoute>
                  <BillingPayment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/returned-books"
              element={
                <ProtectedRoute>
                  <ReturnedBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/registration-approvals"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <RegistrationApprovals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-history"
              element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schools"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Schools />
                </ProtectedRoute>
              }
            />
            <Route
              path="/request-order"
              element={
                <ProtectedRoute requiredRole="CLERK">
                  <RequestOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/request-return"
              element={
                <ProtectedRoute requiredRole="CLERK">
                  <RequestReturn />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
