// src/layouts/DashboardLayout.jsx
// Job-seeker/recruiter dashboard shell: sidebar + top navbar + page content.
// Sidebar/DashboardNavbar used to live in their own files under
// src/components — they were only ever used here, so they now live in this
// one "main" file instead.
import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, Heart, Bell, Settings, LogOut, Briefcase,
  Moon, Sun, ArrowLeft, Menu, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LogoutConfirmationModal from '../components/LogoutConfirmationModal';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
  { to: '/dashboard/saved-jobs', label: 'Saved Jobs', icon: Heart },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];
// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Close the mobile drawer whenever the user navigates to a different page
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`dashboard-drawer w-64 bg-white border-r border-slate-200 fixed inset-y-0 left-0 flex flex-col z-50 transition-transform duration-200 dark:bg-slate-900 dark:border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-16 flex items-center justify-between gap-2 px-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">JobPortal</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-1">
          <Link
            to="/"
            className="lg:hidden w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-3*3 font-bold text-red-600 hover:bg-red-50 transition dark:hover:bg-red-900/30"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
};

// ---------------------------------------------------------------------------
// Top navbar
// ---------------------------------------------------------------------------
const DashboardNavbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-0 lg:left-64 z-30 flex items-center justify-between px-4 sm:px-6 dark:bg-slate-900 dark:border-slate-800 gap-2">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 transition dark:hover:bg-slate-700 shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <Link
          to="/"
          className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary-600 transition dark:text-slate-300 dark:hover:text-primary-400 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
        <h1 className="font-semibold text-slate-800 dark:text-slate-100 truncate">My Dashboard</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 transition dark:hover:bg-slate-700"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          ) : (
            <Sun className="w-5 h-5 text-slate-300" />
          )}
        </button>
        <button className="p-2 rounded-lg hover:bg-slate-100 transition dark:hover:bg-slate-700">
          <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center dark:bg-primary-900/40 shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-primary-600" />
            )}
          </div>
          <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-200">{user?.name || 'User'}</span>
        </div>
      </div>
    </header>
  );
};

// ---------------------------------------------------------------------------
// DashboardLayout
// ---------------------------------------------------------------------------
const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout min-h-screen flex bg-slate-50 dark:bg-slate-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 min-w-0 lg:ml-64">
        <DashboardNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="p-4 sm:p-6 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
