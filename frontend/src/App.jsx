import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { JobProvider } from './context/JobContext';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import RecruiterLayout from './layouts/RecruiterLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import JobApply from './pages/JobApply';
import Companies from './pages/Companies';
import CompanyDetails from './pages/CompanyDetails';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminJobs from './pages/AdminJobs';
import AdminCompanies from './pages/AdminCompanies';
import AdminApplications from './pages/AdminApplications';
import AdminMessages from './pages/AdminMessages';
import AdminAuditLog from './pages/AdminAuditLog';
import AdminSettings from './pages/AdminSettings';
import AdminProfile from './pages/AdminProfile';
import Profile from './pages/Profile';
import SavedJobs from './pages/SavedJobs';
import AppliedJobs from './pages/AppliedJobs';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import RecruiterDashboard from './pages/RecruiterDashboard';
import RecruiterJobs from './pages/RecruiterJobs';
import RecruiterApplications from './pages/RecruiterApplications';
import RecruiterCompany from './pages/RecruiterCompany';
import RecruiterMessages from './pages/RecruiterMessages';
// ---------------------------------------------------------------------------
// Route guards
// ProtectedRoute/AdminRoute used to live in their own files under
// src/routes — they were only ever used here, so they now live in this one
// "main" file instead.
// ---------------------------------------------------------------------------
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return <Outlet />;
};

const AdminRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') return <Outlet />;
  return <Navigate to={user?.role === 'recruiter' ? '/recruiter' : '/dashboard'} replace />;
};

const RecruiterRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'recruiter') return <Outlet />;
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <JobProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="register" element={<Register />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="jobs" element={<Jobs />} />
                <Route path="jobs/:id" element={<JobDetails />} />
                <Route path="companies" element={<Companies />} />
                <Route path="companies/:id" element={<CompanyDetails />} />
              </Route>

              {/* Login - standalone, no header/footer */}
              <Route path="/login" element={<Login />} />

              {/* Job Application Form - separate page, protected */}
              <Route path="/jobs/:id/apply" element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route index element={<JobApply />} />
                </Route>
              </Route>

              {/* Applied Jobs - separate page, not part of the dashboard shell */}
              <Route path="/applied-jobs" element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route index element={<AppliedJobs />} />
                </Route>
              </Route>

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="saved-jobs" element={<SavedJobs />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Route>

              {/* Recruiter Routes */}
              <Route path="/recruiter" element={<RecruiterRoute />}>
                <Route element={<RecruiterLayout />}>
                  <Route index element={<RecruiterDashboard />} />
                  <Route path="jobs" element={<RecruiterJobs />} />
                  <Route path="applications" element={<RecruiterApplications />} />
                  <Route path="messages" element={<RecruiterMessages />} />
                  <Route path="company" element={<RecruiterCompany />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="jobs" element={<AdminJobs />} />
                  <Route path="companies" element={<AdminCompanies />} />
                  <Route path="applications" element={<AdminApplications />} />
                  <Route path="analytics" element={<AdminDashboard />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="audit-log" element={<AdminAuditLog />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="profile" element={<AdminProfile />} />
                </Route>
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </JobProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;