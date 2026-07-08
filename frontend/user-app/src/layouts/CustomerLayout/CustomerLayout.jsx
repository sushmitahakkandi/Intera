import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FiShoppingCart, FiHeart, FiUser, FiPhoneCall, FiArrowUp, FiMenu, FiX, FiSearch } from 'react-icons/fi';
import { Toaster, toast } from 'react-hot-toast';
import { Loader, Button, Avatar } from '@shared/components/Common';

export default function CustomerLayout() {
  const { cartCount, wishlistItems, user, logout, loading } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/shop?search=${searchVal.trim()}`);
    }
  };

  // Breadcrumbs Generation
  const pathnames = location.pathname.split('/').filter((x) => x);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'Collections', path: '/collections' },
    { label: 'AI Decor', path: '/ai-decor' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Toast provider */}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Loader loading={loading} />

      {/* Responsive Navbar */}
      <header className="sticky top-0 bg-white shadow-sm z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-primary tracking-wide font-sans flex items-center">
              M<span className="text-secondary text-base font-bold ml-0.5">AHAVEER</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold hover:text-primary transition-colors tracking-wide ${
                  location.pathname === link.path ? 'text-primary' : 'text-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search bar & Actions */}
          <div className="hidden lg:flex items-center gap-4 flex-1 max-w-xs mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-large text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            </form>
          </div>

          <div className="flex items-center gap-4">
            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 text-secondary hover:text-primary transition-colors">
              <FiHeart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-secondary hover:text-primary transition-colors">
              <FiShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Menu */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1 focus:outline-none"
                >
                  <Avatar name={user.name} size="sm" />
                </button>
              ) : (
                <Link to="/login" className="p-2 text-secondary hover:text-primary transition-colors">
                  <FiUser size={20} />
                </Link>
              )}

              {/* Profile Dropdown */}
              {profileDropdownOpen && user && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-large shadow-premium py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs text-gray-400 font-medium">Logged in as</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                  </div>
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">My Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">My Orders</Link>

                  <button
                    onClick={() => { logout(); setProfileDropdownOpen(false); toast.success('Logged out successfully'); }}
                    className="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-gray-50 font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-secondary hover:text-primary focus:outline-none"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-3 shadow-md">
            <form onSubmit={handleSearchSubmit} className="relative w-full mb-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-large text-xs focus:outline-none bg-gray-50"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-semibold py-2 border-b border-gray-50 hover:text-primary ${
                  location.pathname === link.path ? 'text-primary' : 'text-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Dynamic Breadcrumbs Section */}
      {location.pathname !== '/' && pathnames.length > 0 && (
        <section className="bg-gray-50 border-b border-gray-100 py-3.5 px-4">
          <div className="max-w-7xl mx-auto text-xs font-semibold text-gray-500 flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-primary">Home</Link>
            {pathnames.map((name, index) => {
              const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
              const isLast = index === pathnames.length - 1;
              const formattedName = name.replace(/-/g, ' ');
              return (
                <React.Fragment key={name}>
                  <span>/</span>
                  {isLast ? (
                    <span className="text-gray-800 capitalize">{formattedName}</span>
                  ) : (
                    <Link to={routeTo} className="hover:text-primary capitalize">{formattedName}</Link>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-gray-300 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white text-lg font-bold mb-4 tracking-wide font-sans">
              M<span className="text-primary">AHAVEER</span>
            </h4>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Premium smart furniture crafted to inspire, beautify and enhance your dream space.
            </p>
          </div>
          <div>
            <h5 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Quick Links</h5>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link to="/shop" className="hover:text-primary transition-colors">Shop All</Link></li>
              <li><Link to="/collections" className="hover:text-primary transition-colors">Collections</Link></li>
              <li><Link to="/ai-decor" className="hover:text-primary transition-colors">AI Decor Room</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">Our Story</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Customer Care</h5>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
              <li><Link to="/orders" className="hover:text-primary transition-colors">Order Tracking</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Return Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Contact Info</h5>
            <ul className="flex flex-col gap-2.5 text-sm text-gray-400">
              <li>Davangere, Karnataka, India - 577004</li>
              <li>Email: support@mahaveer.com</li>
              <li>Phone: +91 9741212888</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 py-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Mahaveer Smart Furniture Hub. All Rights Reserved. Built with Premium React.
        </div>
      </footer>

      {/* Floating WhatsApp Action Widget */}
      <a
        href="https://wa.me/919741212888?text=Hello%20Mahaveer%20Furniture%20Hub"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 p-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 z-50 flex items-center justify-center hover:scale-105"
      >
        <FiPhoneCall size={20} className="animate-pulse" />
      </a>

      {/* Scroll to Top Trigger */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-24 p-4 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover transition-all duration-300 z-50 flex items-center justify-center hover:scale-105"
        >
          <FiArrowUp size={20} />
        </button>
      )}
    </div>
  );
}
