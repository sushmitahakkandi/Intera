import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiShoppingCart, FiHeart, FiX, FiCheck, FiAlertTriangle, FiInfo, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// ==========================================
// 1. BUTTON
// ==========================================
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-large transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white focus:ring-primary',
    secondary: 'bg-secondary hover:bg-secondary-hover text-white focus:ring-secondary',
    danger: 'bg-danger hover:bg-red-600 text-white focus:ring-danger',
    success: 'bg-success hover:bg-green-600 text-white focus:ring-success',
    outline: 'border border-primary text-primary hover:bg-primary-light focus:ring-primary',
    ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-gray-300'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

// ==========================================
// 2. INPUT
// ==========================================
export const Input = React.forwardRef(({
  label,
  error,
  type = 'text',
  className = '',
  id,
  ...props
}, ref) => {
  return (
    <div className="w-full mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        type={type}
        className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-large text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${error ? 'border-danger focus:ring-danger' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger font-medium">{error}</p>}
    </div>
  );
});

// ==========================================
// 3. TEXTAREA
// ==========================================
export const Textarea = React.forwardRef(({
  label,
  error,
  rows = 4,
  className = '',
  id,
  ...props
}, ref) => {
  return (
    <div className="w-full mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-large text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${error ? 'border-danger focus:ring-danger' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger font-medium">{error}</p>}
    </div>
  );
});

// ==========================================
// 4. DROPDOWN
// ==========================================
export const Dropdown = React.forwardRef(({
  label,
  options = [],
  error,
  className = '',
  id,
  ...props
}, ref) => {
  return (
    <div className="w-full mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-large text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${error ? 'border-danger focus:ring-danger' : ''} ${className}`}
        {...props}
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-danger font-medium">{error}</p>}
    </div>
  );
});

// ==========================================
// 5. CHECKBOX & 6. RADIO
// ==========================================
export const Checkbox = React.forwardRef(({ label, error, className = '', id, ...props }, ref) => {
  return (
    <div className="mb-4">
      <label className="inline-flex items-center cursor-pointer">
        <input
          id={id}
          ref={ref}
          type="checkbox"
          className={`w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded focus:ring-2 focus:ring-offset-0 ${className}`}
          {...props}
        />
        {label && <span className="ml-2 text-sm text-gray-700">{label}</span>}
      </label>
      {error && <p className="mt-1 text-xs text-danger font-medium">{error}</p>}
    </div>
  );
});

export const Radio = React.forwardRef(({ label, error, className = '', id, ...props }, ref) => {
  return (
    <div className="mb-4">
      <label className="inline-flex items-center cursor-pointer">
        <input
          id={id}
          ref={ref}
          type="radio"
          className={`w-4 h-4 text-primary focus:ring-primary border-gray-300 focus:ring-2 focus:ring-offset-0 ${className}`}
          {...props}
        />
        {label && <span className="ml-2 text-sm text-gray-700">{label}</span>}
      </label>
      {error && <p className="mt-1 text-xs text-danger font-medium">{error}</p>}
    </div>
  );
});

// ==========================================
// 7. MODAL
// ==========================================
export const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-40"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white w-full max-w-lg rounded-large shadow-premium overflow-hidden z-10"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">{title}</h3>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <FiX size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[75vh]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// 8. DRAWER
// ==========================================
export const Drawer = ({ isOpen, onClose, title, position = 'right', children }) => {
  const isRight = position === 'right';
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-40"
          />

          {/* Drawer Body */}
          <motion.div
            initial={{ x: isRight ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRight ? '100%' : '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className={`relative bg-white w-full max-w-sm h-full shadow-premium flex flex-col z-10 ${
              isRight ? 'ml-auto' : 'mr-auto'
            }`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">{title}</h3>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <FiX size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// 9. CARD
// ==========================================
export const Card = ({ children, className = '', hoverEffect = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-large border border-gray-100 p-5 shadow-premium ${
        hoverEffect ? 'hover:shadow-premium-hover hover:border-gray-200 transition-all duration-300' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

// ProductCard has been moved to user components to ensure shared package remains context-independent.

// ==========================================
// 11. CATEGORY CARD
// ==========================================
export const CategoryCard = ({ category, onClick }) => {
  return (
    <Card hoverEffect onClick={onClick} className="flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full overflow-hidden bg-primary-light flex items-center justify-center mb-3">
        <LazyImage src={category.image} alt={category.name} className="w-full h-full object-cover" />
      </div>
      <h5 className="font-semibold text-gray-800 text-sm mb-1">{category.name}</h5>
      <span className="text-xs text-gray-400 font-medium">{category.count} Products</span>
    </Card>
  );
};

// ==========================================
// 12. TABLE
// ==========================================
export const Table = ({ headers = [], data = [], renderRow }) => {
  return (
    <div className="w-full overflow-x-auto border border-gray-100 rounded-large shadow-sm">
      <table className="w-full text-left border-collapse bg-white">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
          {data.length > 0 ? (
            data.map((row, index) => renderRow(row, index))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-6 py-8 text-center text-gray-400">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// ==========================================
// 13. PAGINATION
// ==========================================
export const Pagination = ({ currentPage = 1, totalPages = 5, onPageChange }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing Page <span className="font-semibold">{currentPage}</span> of{' '}
            <span className="font-semibold">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2.5 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-40"
            >
              <FiChevronLeft size={16} />
            </button>
            {(() => {
              const pages = [];
              const maxVisible = 5;
              if (totalPages <= maxVisible) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                let start = Math.max(2, currentPage - 1);
                let end = Math.min(totalPages - 1, currentPage + 1);
                if (currentPage <= 2) {
                  end = 4;
                } else if (currentPage >= totalPages - 1) {
                  start = totalPages - 3;
                }
                if (start > 2) {
                  pages.push('...');
                }
                for (let i = start; i <= end; i++) {
                  pages.push(i);
                }
                if (end < totalPages - 1) {
                  pages.push('...');
                }
                pages.push(totalPages);
              }
              return pages.map((page, idx) => {
                if (page === '...') {
                  return (
                    <span
                      key={`dots-${idx}`}
                      className="relative inline-flex items-center px-3.5 py-2 text-sm font-semibold text-gray-500 ring-1 ring-inset ring-gray-300 select-none bg-gray-50"
                    >
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 ${
                      currentPage === page
                        ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                    }`}
                  >
                    {page}
                  </button>
                );
              });
            })()}
            <button
              onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2.5 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-40"
            >
              <FiChevronRight size={16} />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 14. SEARCH BAR
// ==========================================
export const SearchBar = ({ placeholder = "Search for furniture...", value, onChange, onSubmit }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit(value);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full pl-11 pr-4 py-2 border border-gray-200 rounded-large text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
      />
      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
    </div>
  );
};

// ==========================================
// 15. FILTER PANEL
// ==========================================
export const FilterPanel = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  maxPrice = 150000,
  currentPrice = 150000,
  onPriceChange
}) => {
  return (
    <Card className="flex flex-col gap-6 w-full md:w-64">
      <div>
        <h4 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-3 mb-4">Category</h4>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => onSelectCategory(null)}
            className={`text-left text-sm py-1 font-medium transition-colors ${
              !selectedCategory ? 'text-primary font-bold' : 'text-gray-600 hover:text-primary'
            }`}
          >
            All Products
          </button>
          {categories.map((c, i) => (
            <button
              key={i}
              onClick={() => onSelectCategory(c.name)}
              className={`text-left text-sm py-1 font-medium transition-colors ${
                selectedCategory === c.name ? 'text-primary font-bold' : 'text-gray-600 hover:text-primary'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-3 mb-4">Price Range</h4>
        <input
          type="range"
          min="0"
          max={maxPrice}
          value={currentPrice}
          onChange={(e) => onPriceChange && onPriceChange(parseInt(e.target.value))}
          className="w-full accent-primary mb-2"
        />
        <div className="flex justify-between text-xs font-semibold text-gray-500">
          <span>₹0</span>
          <span>₹{currentPrice.toLocaleString()}</span>
        </div>
      </div>
    </Card>
  );
};

// ==========================================
// 16. LOADER & 17. SPINNER
// ==========================================
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };
  return (
    <div className={`animate-spin rounded-full border-t-primary border-r-transparent border-b-primary border-l-transparent ${sizes[size]} ${className}`} />
  );
};

export const Loader = ({ loading }) => {
  if (!loading) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-20 backdrop-blur-sm">
      <Card className="flex flex-col items-center justify-center p-6 bg-white shadow-premium">
        <Spinner size="lg" className="mb-4" />
        <span className="text-sm font-semibold text-gray-700">Loading...</span>
      </Card>
    </div>
  );
};

// ==========================================
// 18. EMPTY STATE & 19. ERROR STATE
// ==========================================
export const EmptyState = ({ title = 'No results found', description = 'We couldn\'t find what you were looking for.' }) => {
  return (
    <div className="text-center py-12 px-4 flex flex-col items-center justify-center">
      <FiInfo className="text-gray-300 mb-4" size={48} />
      <h3 className="font-bold text-gray-700 text-lg mb-1">{title}</h3>
      <p className="text-gray-400 text-sm max-w-sm">{description}</p>
    </div>
  );
};

export const ErrorState = ({ message = 'An error occurred. Please try again.' }) => {
  return (
    <div className="text-center py-12 px-4 flex flex-col items-center justify-center">
      <FiAlertTriangle className="text-danger mb-4" size={48} />
      <h3 className="font-bold text-gray-700 text-lg mb-1">Oops, something went wrong</h3>
      <p className="text-gray-400 text-sm max-w-sm">{message}</p>
    </div>
  );
};

// ==========================================
// 20. BADGE
// ==========================================
export const Badge = ({ children, status = 'success' }) => {
  const styles = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}>
      {children}
    </span>
  );
};

// ==========================================
// 21. AVATAR
// ==========================================
export const Avatar = ({ src, name = 'User', size = 'md' }) => {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base'
  };

  return (
    <div className={`relative flex items-center justify-center rounded-full overflow-hidden bg-primary-light font-bold text-primary ${sizes[size]}`}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

// ==========================================
// 22. PROFILE CARD
// ==========================================
export const ProfileCard = ({ user }) => {
  return (
    <Card className="flex items-center gap-4">
      <Avatar name={user?.name} />
      <div>
        <h4 className="font-bold text-gray-800 text-sm">{user?.name || 'Guest User'}</h4>
        <span className="text-xs text-gray-400 capitalize">{user?.role || 'Guest'}</span>
      </div>
    </Card>
  );
};

// ==========================================
// 23. CONFIRMATION DIALOG
// ==========================================
export const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title = "Are you sure?", message = "This action cannot be undone." }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-5">
        <p className="text-sm text-gray-600">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>Confirm</Button>
        </div>
      </div>
    </Modal>
  );
};

// ==========================================
// 24. STEPPER
// ==========================================
export const Stepper = ({ steps = [], currentStep = 0 }) => {
  return (
    <div className="flex items-center justify-between w-full max-w-lg mx-auto py-6">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              index <= currentStep ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'
            }`}>
              {index + 1}
            </span>
            <span className={`text-xs font-bold transition-all duration-300 ${index <= currentStep ? 'text-gray-800' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${index < currentStep ? 'bg-primary' : 'bg-gray-100'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ==========================================
// 25. LAZY IMAGE
// ==========================================
export const LazyImage = ({ src, alt, className = '', ...props }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState(src);
  const fallbackSrc = props.fallbackSrc || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Crect width='800' height='800' fill='%23f3f4f6'/%3E%3Cpath d='M120 530l160-170 120 110 90-90 190 200H120z' fill='%23e5e7eb'/%3E%3Ccircle cx='300' cy='280' r='52' fill='%23e5e7eb'/%3E%3C/svg%3E";

  React.useEffect(() => {
    if (src !== currentSrc) {
      setCurrentSrc(src);
      setLoaded(false);
    }
  }, [src, currentSrc]);

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={currentSrc}
        alt={alt}
        loading={props.loading || 'lazy'}
        decoding="async"
        fetchPriority={props.fetchPriority}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          if (e.currentTarget.dataset.fallbackApplied === 'true') {
            setLoaded(true);
            return;
          }

          e.currentTarget.dataset.fallbackApplied = 'true';
          e.currentTarget.src = fallbackSrc;
          setLoaded(true);
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        {...props}
      />
    </div>
  );
};
