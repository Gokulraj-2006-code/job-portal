// src/layouts/RecruiterLayout.jsx
// Recruiter dashboard shell: sidebar + top navbar + page content.
// Now matches AdminLayout design with search, notifications, and consistent styling.
import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Users, Building2, Settings, LogOut,
  Moon, Sun, Search, X, Bell, Mail, Menu, User, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { adminService } from '../services/adminService';
import LogoutConfirmationModal from '../components/LogoutConfirmationModal';

const navItems = [
  { to: '/recruiter', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/recruiter/jobs', label: 'My Jobs', icon: Briefcase },
  { to: '/recruiter/applications', label: 'Applications', icon: Users },
  { to: '/recruiter/messages', label: 'Messages', icon: Mail },
  { to: '/recruiter/company', label: 'Company Profile', icon: Building2 },
  { to: '/recruiter/settings', label: 'Settings', icon: Settings },
];

const pageTitles = {
  '/recruiter': 'Dashboard Overview',
  '/recruiter/jobs': 'My Jobs',
  '/recruiter/applications': 'Applications',
  '/recruiter/messages': 'Messages',
  '/recruiter/company': 'Company Profile',
  '/recruiter/settings': 'Settings',
  '/recruiter/profile': 'My Profile',
};

// Pages that have a searchable list/table
const searchablePages = ['/recruiter/jobs', '/recruiter/applications'];

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
const RecruiterSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
        className={`w-64 bg-slate-900 text-slate-300 fixed inset-y-0 left-0 flex flex-col z-50 transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-16 flex items-center justify-between gap-2 px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">Recruiter Panel</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:bg-slate-800"
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
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-red-400 hover:bg-slate-800 transition"
          >
            <LogOut className="w-4 h-4" />
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
const RecruiterNavbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');
  const [notifications, setNotifications] = useState({ newApplications: 0, unreadMessages: 0 });
  const notifRef = useRef(null);
  const searchInputRef = useRef(null);

  const isSearchable = searchablePages.includes(location.pathname);

  // Fetch notifications (new applications + unread messages)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const messages = await adminService.getMessages();
        setNotifications({
          newApplications: 0,
          unreadMessages: messages.filter((m) => !m.read).length,
        });
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSearchValue(searchParams.get('q') || '');
    setIsSearchOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  const updateQuery = (value) => {
    setSearchValue(value);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  const handleClearSearch = () => {
    updateQuery('');
    setIsSearchOpen(false);
  };

  const totalNotifications = notifications.newApplications + notifications.unreadMessages;
  const title = pageTitles[location.pathname] || 'Recruiter Portal';

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'R';
    return user.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-0 lg:left-64 z-30 flex items-center justify-between px-4 sm:px-6 dark:bg-slate-900 dark:border-slate-800 gap-2 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 transition dark:hover:bg-slate-700 shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        {!isSearchOpen && (
          <h1 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-4 shrink-0">
        {isSearchOpen ? (
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-1.5 w-32 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onChange={(e) => updateQuery(e.target.value)}
              placeholder={isSearchable ? `Search ${title.toLowerCase()}...` : 'No search on this page'}
              disabled={!isSearchable}
              className="bg-transparent text-sm outline-none flex-1 min-w-0 disabled:cursor-not-allowed"
            />
            <button onClick={handleClearSearch} aria-label="Close search">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 transition dark:hover:bg-slate-700"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        )}

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

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg hover:bg-slate-100 transition dark:hover:bg-slate-700"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            {totalNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {totalNotifications}
              </span>
            )}
          </button>
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-72 max-w-[90vw] bg-white rounded-xl shadow-lg border border-slate-200 py-2 dark:bg-slate-800 dark:border-slate-700">
              {totalNotifications === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500">No new notifications</p>
              ) : (
                <>
                  {notifications.newApplications > 0 && (
                    <Link to="/recruiter/applications" onClick={() => setIsNotifOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
                      <Users className="w-4 h-4 text-blue-500 shrink-0" />
                      {notifications.newApplications} new application(s)
                    </Link>
                  )}
                  {notifications.unreadMessages > 0 && (
                    <Link to="/recruiter/messages" onClick={() => setIsNotifOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
                      <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                      {notifications.unreadMessages} unread message(s)
                    </Link>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Clickable User Profile - links to company profile */}
        <Link 
          to="/recruiter/company" 
          className="flex items-center gap-2 hover:opacity-80 transition group"
          title="View company profile"
        >
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center dark:bg-primary-900/40 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/60 transition overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-semibold text-primary-600 dark:text-primary-300">
                {getUserInitials()}
              </span>
            )}
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 block leading-tight">
              {user?.name || 'Recruiter'}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 block leading-tight">
              Company Profile
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};

// ---------------------------------------------------------------------------
// RecruiterLayout
// ---------------------------------------------------------------------------
const RecruiterLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-layout min-h-screen flex bg-slate-50 dark:bg-slate-900">
      <RecruiterSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 min-w-0 lg:ml-64">
        <RecruiterNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="p-4 sm:p-6 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RecruiterLayout;