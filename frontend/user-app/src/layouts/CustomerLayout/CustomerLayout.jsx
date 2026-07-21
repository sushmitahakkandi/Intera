import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FiShoppingCart, FiHeart, FiUser, FiPhoneCall, FiArrowUp, FiMenu, FiX, FiSearch } from 'react-icons/fi';
import { Toaster, toast } from 'react-hot-toast';
import { Loader, Button, Avatar } from '@shared/components/Common';

export default function CustomerLayout() {
  const { cartCount, wishlistItems, user, logout, loading, products, isBackendOffline } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [mobileAiOpen, setMobileAiOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const newlyAddedProducts = products ? [...products].slice(0, 3) : [];

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
    { label: 'Smart Studio', path: '/ai-decor' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  const aiDecorLinks = [
    { label: 'Studio Command Center', path: '/ai-decor' },
    { label: 'Smart Space Architect', path: '/ai-decor/room-recommendation' },
    { label: 'Chroma & Palette Matcher', path: '/ai-decor/color-matching' },
    { label: 'Virtual Interior Concierge', path: '/ai-decor/interior-assistant' }
  ];

  const isChatPage = location.pathname === '/ai-decor/interior-assistant';

  return (
    <div className={`flex flex-col min-h-screen bg-background ${isChatPage ? 'h-screen overflow-hidden' : ''}`}>
      {/* Toast provider */}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Loader loading={loading} />

      {/* Connection warning banner */}
      {isBackendOffline && (
        <div className="bg-amber-600 text-white text-xs font-bold text-center py-2.5 px-4 shadow-md flex items-center justify-center gap-2 z-50 relative animate-pulse">
          <span>⚠️ Backend Server is offline. Please run <strong>npm run dev</strong> in the root folder to start all services (Backend + Database).</span>
        </div>
      )}

      {/* Responsive Navbar */}
      {!isChatPage && (
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
              {navLinks.map((link) => {
                if (link.label === 'Smart Studio') {
                  return (
                    <div key={link.path} className="relative group py-2">
                      <Link
                        to="/ai-decor"
                        className={`text-sm font-semibold hover:text-primary transition-colors tracking-wide flex items-center gap-1 ${
                          location.pathname.startsWith('/ai-decor') ? 'text-primary' : 'text-secondary'
                        }`}
                      >
                        Smart Studio <span className="text-[9px] ml-1 transition-transform duration-200 group-hover:rotate-180">▼</span>
                      </Link>
                      {/* Dropdown Menu */}
                      <div className="absolute left-0 top-full pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                        <div className="bg-white border border-gray-100 rounded-large shadow-premium py-2">
                          {aiDecorLinks.map((subLink) => (
                            <Link
                              key={subLink.path}
                              to={subLink.path}
                              className={`block px-4 py-2.5 text-xs font-semibold hover:bg-gray-50 hover:text-primary transition-colors ${
                                (subLink.path === '/ai-decor' && (location.pathname === '/ai-decor' || location.pathname === '/ai-decor/dashboard')) || location.pathname === subLink.path
                                  ? 'text-primary bg-primary-light/30'
                                  : 'text-gray-700'
                              }`}
                            >
                              {subLink.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-semibold hover:text-primary transition-colors tracking-wide ${
                      location.pathname === link.path ? 'text-primary' : 'text-secondary'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Search bar & Actions */}
            <div className="hidden lg:flex items-center gap-4 flex-1 max-w-xs mx-6">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-large text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />

                {/* Autocomplete Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-large shadow-premium p-4 z-50 flex flex-col gap-4 max-h-96 overflow-y-auto">
                    <div>
                      <h5 className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-2">Popular Searches</h5>
                      <div className="flex flex-wrap gap-2">
                        {['Sofa', 'Chair', 'Bed', 'Dining', 'Tables', 'Storage'].map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setSearchVal('');
                              navigate(`/shop?category=${cat}`);
                            }}
                            className="px-2.5 py-1 bg-gray-50 hover:bg-primary-light hover:text-primary border border-gray-150 rounded-large text-xs font-semibold text-gray-600 transition-colors"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {newlyAddedProducts.length > 0 && (
                      <div>
                        <h5 className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-2">Newly Added Products</h5>
                        <div className="flex flex-col gap-2">
                          {newlyAddedProducts.map(prod => (
                            <div
                              key={prod.id}
                              onClick={() => {
                                setSearchVal('');
                                navigate(`/product/${prod.id}`);
                              }}
                              className="flex items-center gap-3 p-1.5 hover:bg-gray-50 rounded-large cursor-pointer transition-colors"
                            >
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-8 h-8 rounded-md object-cover border border-gray-100"
                                onError={(e) => { e.target.src = 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/sofa/img-0.webp' }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-800 truncate text-left">{prod.name}</p>
                                <p className="text-[10px] font-bold text-primary text-left">₹{prod.price.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                    <Link to="/reviews" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">My Reviews</Link>

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
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-large text-xs focus:outline-none bg-gray-50"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />

                {/* Mobile Autocomplete Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-large shadow-premium p-4 z-50 flex flex-col gap-4 max-h-96 overflow-y-auto">
                    <div>
                      <h5 className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-2">Popular Searches</h5>
                      <div className="flex flex-wrap gap-2">
                        {['Sofa', 'Chair', 'Bed', 'Dining', 'Tables', 'Storage'].map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setSearchVal('');
                              navigate(`/shop?category=${cat}`);
                            }}
                            className="px-2.5 py-1 bg-gray-50 hover:bg-primary-light hover:text-primary border border-gray-150 rounded-large text-xs font-semibold text-gray-600 transition-colors"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {newlyAddedProducts.length > 0 && (
                      <div>
                        <h5 className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-2">Newly Added Products</h5>
                        <div className="flex flex-col gap-2">
                          {newlyAddedProducts.map(prod => (
                            <div
                              key={prod.id}
                              onClick={() => {
                                setSearchVal('');
                                navigate(`/product/${prod.id}`);
                              }}
                              className="flex items-center gap-3 p-1.5 hover:bg-gray-50 rounded-large cursor-pointer transition-colors"
                            >
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-8 h-8 rounded-md object-cover border border-gray-100"
                                onError={(e) => { e.target.src = 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/sofa/img-0.webp' }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-800 truncate text-left">{prod.name}</p>
                                <p className="text-[10px] font-bold text-primary text-left">₹{prod.price.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </form>
              {navLinks.map((link) => {
                if (link.label === 'Smart Studio') {
                  return (
                    <div key={link.path} className="flex flex-col border-b border-gray-50">
                      <button
                        onClick={() => setMobileAiOpen(!mobileAiOpen)}
                        className={`text-sm font-semibold py-2 flex items-center justify-between hover:text-primary transition-colors text-left focus:outline-none ${
                          location.pathname.startsWith('/ai-decor') ? 'text-primary' : 'text-secondary'
                        }`}
                      >
                        <span>Smart Studio</span>
                        <span className={`text-[10px] transition-transform duration-200 ${mobileAiOpen ? 'rotate-180' : ''}`}>▼</span>
                      </button>
                      {mobileAiOpen && (
                        <div className="pl-4 py-1.5 flex flex-col gap-2 bg-gray-50 rounded-large mb-2 border border-gray-100">
                          {aiDecorLinks.map((subLink) => (
                            <Link
                              key={subLink.path}
                              to={subLink.path}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setMobileAiOpen(false);
                              }}
                              className={`text-xs font-semibold py-2 hover:text-primary transition-colors ${
                                (subLink.path === '/ai-decor' && (location.pathname === '/ai-decor' || location.pathname === '/ai-decor/dashboard')) || location.pathname === subLink.path
                                  ? 'text-primary'
                                  : 'text-gray-600'
                              }`}
                            >
                              {subLink.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
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
                );
              })}
            </div>
          )}
        </header>
      )}

      {/* Dynamic Breadcrumbs Section */}
      {!isChatPage && location.pathname !== '/' && pathnames.length > 0 && (
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
      <main className={`flex-grow ${isChatPage ? 'h-full overflow-hidden' : ''}`}>
        <Outlet />
      </main>

      {/* Footer */}
      {!isChatPage && (
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
                <li><Link to="/ai-decor" className="hover:text-primary transition-colors">Smart Studio</Link></li>
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
      )}

      {/* Floating WhatsApp Action Widget */}
      {!isChatPage && (
        <a
          href="https://wa.me/919741212888?text=Hello%20Mahaveer%20Furniture%20Hub"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 p-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 z-50 flex items-center justify-center hover:scale-105"
        >
          <FiPhoneCall size={20} className="animate-pulse" />
        </a>
      )}

      {/* Scroll to Top Trigger */}
      {!isChatPage && showScrollTop && (
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
