import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./features/auth/context/AuthContext";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";

import LoginPage from "./features/auth/pages/LoginPage";
import SignupPage from "./features/auth/pages/SignupPage";
import AuthCallbackPage from "./features/auth/pages/AuthCallbackPage";
import UserNotificationsPage from "./features/notifications/pages/UserNotificationsPage";
import UserLayout from "./features/user/components/UserLayout";
import UserDashboard from "./features/user/pages/UserDashboard";
import NotificationPage from "./features/admin/pages/NotificationPage";
import AdminLayout from "./features/admin/components/AdminLayout";
import AdminDashboard from "./features/admin/pages/AdminDashboard";
import UserManagementPage from "./features/admin/user/pages/UserManagementPage";
import MyTicketsPage from "./features/tickets/pages/MyTicketsPage";
import SubmitTicketPage from "./features/tickets/pages/SubmitTicketPage";
import TicketDetailPage from "./features/tickets/pages/TicketDetailPage";
import AssignedTicketsPage from "./features/tickets/pages/AssignedTicketsPage";
import AdminTicketsPage from "./features/admin/tickets/pages/AdminTicketsPage";

// ── Facility routes ───────────────────────────────────────────────────────────
import FacilitiesCataloguePage from "./features/admin/facilities/pages/FacilitiesCataloguePage";
import FacilitiesAnalyticsPage from "./features/admin/facilities/pages/FacilitiesAnalyticsPage";
import UserFacilitiesPage from "./features/facilities/pages/UserFacilitiesPage";

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

          {/* Protected — USER routes */}
          <Route
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route
              path="/user/notifications"
              element={<UserNotificationsPage />}
            />
            <Route path="/user/tickets" element={<MyTicketsPage />} />
            <Route path="/user/tickets/new" element={<SubmitTicketPage />} />
            <Route
              path="/user/tickets/assigned"
              element={<AssignedTicketsPage />}
            />
            <Route path="/user/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route
              path="/user/notifications"
              element={<UserNotificationsPage />}
            />
            {/* ── User Facilities ── */}
            <Route path="/user/facilities" element={<UserFacilitiesPage />} />
          </Route>

          {/* Protected — ADMIN only */}
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
            <Route path="/admin/tickets" element={<AdminTicketsPage />} />
            <Route path="/admin/notifications" element={<NotificationPage />} />
            {/* <Route path="/admin/facilities" element={<FacilitiesPage />} /> */}
            {/* <Route path="/admin/bookings" element={<BookingsPage />} /> */}
            {/* <Route path="/admin/tickets" element={<TicketsPage />} /> */}

            {/* ── Facility routes ── */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            {/* ── Admin Facilities ── */}
            <Route
              path="/admin/facilities"
              element={<FacilitiesCataloguePage />}
            />
            <Route
              path="/admin/facilities/analytics"
              element={<FacilitiesAnalyticsPage />}
            />
            <Route path="/admin/notifications" element={<NotificationPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
