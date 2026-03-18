import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./features/auth/context/AuthContext";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";

import LoginPage from "./features/auth/pages/LoginPage";
import SignupPage from "./features/auth/pages/SignupPage";
import AuthCallbackPage from "./features/auth/pages/AuthCallbackPage";

import UserLayout from "./features/user/components/UserLayout";
import UserDashboard from "./features/user/pages/UserDashboard";

import AdminLayout from "./features/admin/components/AdminLayout";
import AdminDashboard from "./features/admin/pages/AdminDashboard";
import UserManagementPage from "./features/admin/user/pages/UserManagementPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Protected — USER routes (all share UserLayout) */}
          <Route
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/user/dashboard" element={<UserDashboard />} />
            {/*<Route path="/user/bookings" element={<UserBookingsPage />} />
            <Route path="/user/tickets" element={<UserTicketsPage />} />
            <Route
              path="/user/notifications"
              element={<UserNotificationsPage />}
            />*/}
          </Route>

          {/* Protected — ADMIN only (all share AdminLayout) */}
          <Route
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            {/* <Route path="/admin/facilities" element={<FacilitiesPage />} /> */}
            {/* <Route path="/admin/bookings" element={<BookingsPage />} /> */}
            {/* <Route path="/admin/tickets" element={<TicketsPage />} /> */}
            {/* <Route path="/admin/notifications" element={<NotificationsPage />} /> */}
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
