// src/layouts/MainLayout.jsx
// Public site shell: Header + announcement banner + page content + Footer.
// Header/Footer/AnnouncementBanner used to live in their own files under
// src/components — they were only ever used here, so they now live in this
// one "main" file instead of being spread across several small subfiles.
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Navigate, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  Briefcase, Moon, Sun, User, LogOut, Menu, X, FileText,
  Search, Megaphone, Github, Twitter, Linkedin, Mail, Heart, LayoutDashboard,
  Home, Building2, Info,
} from 'lucide-react';
import LogoutConfirmationModal from '../components/LogoutConfirmationModal';

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  const mobileMenuButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(e.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setIsSearchOpen(false);
    navigate(q ? `/jobs?search=${encodeURIComponent(q)}` : '/jobs');
    setSearchQuery('');
  };

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
      setIsUserMenuOpen(false);
    }
  };

  const handleAvatarError = (e) => {
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff`;
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 dark:bg-slate-900 dark:border-slate-800">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">JobPortal</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <NavLink
                to="/jobs"
                className={({ isActive }) =>
                  `transition ${isActive ? 'text-primary-600 font-semibold dark:text-primary-400' : 'text-slate-600 hover:text-primary-600 dark:text-slate-300'}`
                }
              >
                Jobs
              </NavLink>
              <NavLink
                to="/companies"
                className={({ isActive }) =>
                  `transition ${isActive ? 'text-primary-600 font-semibold dark:text-primary-400' : 'text-slate-600 hover:text-primary-600 dark:text-slate-300'}`
                }
              >
                Companies
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `transition ${isActive ? 'text-primary-600 font-semibold dark:text-primary-400' : 'text-slate-600 hover:text-primary-600 dark:text-slate-300'}`
                }
              >
                About
              </NavLink>
              {isAuthenticated && (
                <NavLink
                  to="/applied-jobs"
                  className={({ isActive }) =>
                    `flex items-center gap-1 transition ${isActive ? 'text-primary-600 font-semibold dark:text-primary-400' : 'text-slate-600 hover:text-primary-600 dark:text-slate-300'}`
                  }
                >
                  Applied Jobs
                </NavLink>
              )}
            </nav>

            <div className="flex items-center gap-2 sm:gap-4">
              {location.pathname !== '/about' && (
                isSearchOpen ? (
                  <form
                    onSubmit={handleSearchSubmit}
                    className="header-search-form flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-1.5 w-40 sm:w-64"
                  >
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search jobs, companies..."
                      className="bg-transparent text-sm outline-none flex-1 min-w-0"
                    />
                    <button type="button" onClick={() => setIsSearchOpen(false)} aria-label="Close search">
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition dark:hover:bg-slate-700"
                    aria-label="Search"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )
              )}

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-slate-100 transition dark:hover:bg-slate-700"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>

              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition dark:hover:bg-slate-700"
                    aria-label="User menu"
                  >
                    <img
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff`}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full"
                      onError={handleAvatarError}
                    />
                    <span className="hidden md:inline text-sm font-medium">
                      {user?.name}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 dark:bg-slate-800 dark:border-slate-700">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 transition dark:hover:bg-slate-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Dashboard
                      </Link>
                      
                      <hr className="my-1 dark:border-slate-700" />
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setShowLogoutModal(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition dark:hover:bg-red-900/30"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3 ml-2">
                  <Link
                    to="/login"
                    className="px-5 py-2 rounded-full border border-primary-600 text-primary-600 font-semibold text-sm hover:bg-primary-50 transition"
                  >
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary text-sm">
                    Get Started
                  </Link>
                </div>
              )}

              <button
                ref={mobileMenuButtonRef}
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition dark:hover:bg-slate-700"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer — same design/animation/spacing/colors as the
          Admin Panel's drawer (AdminLayout.jsx AdminSidebar): fixed dark
          slide-in panel + backdrop, only ever shown below the md breakpoint
          since the public site uses a top navbar (not a persistent sidebar)
          at desktop widths. */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-200 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <div
        ref={mobileMenuRef}
        className={`w-64 bg-slate-900 text-slate-300 fixed inset-y-0 left-0 flex flex-col z-50 transition-transform duration-200 md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between gap-2 px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">JobPortal</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavLink
            to="/"
            end
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <Home className="w-4 h-4" />
            Home
          </NavLink>
          <NavLink
            to="/jobs"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <Briefcase className="w-4 h-4" />
            Jobs
          </NavLink>
          <NavLink
            to="/companies"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <Building2 className="w-4 h-4" />
            Companies
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <Info className="w-4 h-4" />
            About
          </NavLink>
          <NavLink
            to="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <Mail className="w-4 h-4" />
            Contact
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink
                to="/applied-jobs"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                <FileText className="w-4 h-4" />
                Applied Jobs
              </NavLink>
              <NavLink
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-1">
          {isAuthenticated ? (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setShowLogoutModal(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-red-400 hover:bg-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-slate-700 text-slate-200 hover:bg-slate-800 transition"
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>

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
// Announcement banner
// ---------------------------------------------------------------------------
const AnnouncementBanner = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.get('/settings/announcement').then((data) => {
      if (isMounted) setAnnouncement(data);
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  if (!announcement || !announcement.active || dismissed || !announcement.message) return null;

  return (
    <div className="bg-primary-600 text-white text-sm">
      <div className="container-custom py-2 flex items-center justify-between gap-4">
        <span className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 shrink-0" />
          {announcement.message}
        </span>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss announcement">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 dark:text-slate-500">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">JobPortal</span>
            </Link>
            <p className="text-sm max-w-sm">
              Find your dream job with our AI-powered job matching platform.
              Connect with top companies and advance your career.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              <li><Link to="/jobs" className="hover:text-white transition">Browse Jobs</Link></li>
              <li><Link to="/companies" className="hover:text-white transition">Companies</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-white transition">Help Center</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} JobPortal. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition" aria-label="GitHub">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-white transition" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-white transition" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-white transition" aria-label="Email">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ---------------------------------------------------------------------------
// MainLayout
// ---------------------------------------------------------------------------
const MainLayout = () => {
  const { user, isAuthenticated } = useAuth();

  // An admin session should never fall back to the public job-seeker site -
  // no matter which public route they land on, send them back to the
  // Admin Panel so the admin layout/nav is always what they see.
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Same idea for recruiters - they should always land in the Recruiter
  // Portal, not the job-seeker's public/dashboard experience.
  if (isAuthenticated && user?.role === 'recruiter') {
    return <Navigate to="/recruiter" replace />;
  }

  return (
    <div className="main-layout min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <AnnouncementBanner />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
