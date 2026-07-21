import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const AppContext = createContext();

// S3 Base URL - permanent cloud storage
const S3_BASE = 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com';

// API Base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CATEGORY_IMAGE_FALLBACKS = {
  Sofa: `${S3_BASE}/cache/sofa/img-0.webp`,
  Chair: `${S3_BASE}/cache/chair/img-0.webp`,
  Bed: `${S3_BASE}/cache/bed/img-0.webp`,
  Dining: `${S3_BASE}/cache/dining/img-0.webp`,
  Tables: `${S3_BASE}/cache/tables/img-0.webp`,
  Storage: `${S3_BASE}/cache/storage/img-0.webp`
};

const getFallbackImage = (category) => CATEGORY_IMAGE_FALLBACKS[category] || `${S3_BASE}/cache/sofa/img-0.webp`;

export const AppProvider = ({ children }) => {
  // Authentication State
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('mhv_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('mhv_admin_token');
    return stored && stored !== 'placeholder-jwt-token' ? stored : null;
  });

  // Shopping Cart State
  const [cartItems, setCartItems] = useState([]);

  // Wishlist State
  const [wishlistItems, setWishlistItems] = useState([]);

  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminSidebarCollapsed, setAdminSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Products List State — always populated from DB, starts empty while fetching
  const [products, setProducts] = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [isBackendOffline, setIsBackendOffline] = useState(false);

  // Categories list — images point directly to S3 (permanent, no localhost dependency)
  const [categories, setCategories] = useState([
    { id: 'c1', name: 'Sofa',    count: 450, image: `${S3_BASE}/categories/sofa-thumbnail.webp` },
    { id: 'c2', name: 'Chair',   count: 401, image: `${S3_BASE}/categories/chair-thumbnail.webp` },
    { id: 'c3', name: 'Bed',     count: 400, image: `${S3_BASE}/categories/bed-thumbnail.webp` },
    { id: 'c4', name: 'Dining',  count: 350, image: `${S3_BASE}/categories/dining-thumbnail.webp` },
    { id: 'c5', name: 'Tables',  count: 450, image: `${S3_BASE}/categories/tables-thumbnail.webp` },
    { id: 'c6', name: 'Storage', count: 450, image: `${S3_BASE}/categories/storage-thumbnail.webp` }
  ]);

  // Set Axios auth header
  useEffect(() => {
    if (token && token !== 'placeholder-jwt-token') {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load live seeded products from database
  const fetchProducts = async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const maxAttempts = 5;
    const retryDelayMs = 1500;

    try {
      setLoading(true);
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const res = await axios.get(`${API_BASE}/api/products?limit=2500`);
          const dbProducts = res.data.products || [];

          if (dbProducts.length > 0) {
            const normalized = dbProducts.map(item => {
              const origPrice = item.price || 0;
              const discPrice = item.discountPrice || origPrice;
              const discountPct = origPrice > 0 ? Math.round(((origPrice - discPrice) / origPrice) * 100) : 0;
              const categoryName = item.category?.name || 'Sofa';
              const thumbnailUrl = item.thumbnailUrl && !item.thumbnailUrl.includes('/products/general/thumbnail.webp')
                ? item.thumbnailUrl
                : getFallbackImage(categoryName);

              return {
                id: item._id,
                name: item.name,
                category: categoryName,
                price: discPrice,
                originalPrice: origPrice,
                discount: discountPct,
                image: thumbnailUrl,
                images: item.imageUrls ? Object.values(item.imageUrls).filter(Boolean) : [],
                rating: item.rating || 5.0,
                reviewsCount: item.reviewCount || 0,
                stock: item.stock || 0,
                material: item.material?.name || 'Wood',
                color: item.color?.hex || '#8B4513',
                colorName: item.color?.name || 'Brown',
                dimensions: item.dimensions || 'N/A',
                colors: [item.color?.hex || '#8B4513'],
                description: item.description || ''
              };
            });

            setProducts(normalized);
            setProductsLoaded(true);
            setIsBackendOffline(false);

            // Dynamically compute category counts from actual DB products
            const counts = {};
            normalized.forEach(p => {
              const cat = p.category;
              counts[cat] = (counts[cat] || 0) + 1;
            });

            setCategories(prev => prev.map(c => ({
              ...c,
              count: counts[c.name] || c.count
            })));
          }

          return true;
        } catch (err) {
          if (attempt === maxAttempts) {
            throw err;
          }
          await sleep(retryDelayMs);
        }
      }
    } catch (err) {
      console.error("Error fetching db products inside admin-app context:", err);
      setIsBackendOffline(true);
      setProductsLoaded(true);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    let retryTimeoutId;

    const run = async () => {
      const ok = await fetchProducts();
      if (!ok && !cancelled) {
        retryTimeoutId = setTimeout(run, 5000);
      }
    };

    run();

    return () => {
      cancelled = true;
      if (retryTimeoutId) {
        clearTimeout(retryTimeoutId);
      }
    };
  }, []);

  // Connect to Socket.io for real-time updates
  useEffect(() => {
    const socket = io(API_BASE);

    socket.on('connect', () => {
      console.log('Socket.io: Connected to backend on admin-app');
    });

    socket.on('catalog_changed', () => {
      console.log('Socket.io: Received catalog_changed event. Fetching updated products...');
      fetchProducts();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Orders State (for admin side displays)
  const [orders, setOrders] = useState([]);

  // Dashboard Stats State (users, orders, sales)
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalSales: 0
  });

  // Fetch orders from database
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/orders`);
      setOrders(res.data || []);
    } catch (err) {
      console.error("Error loading orders from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard overview statistics (total users, orders, sales)
  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/meta/dashboard`);
      setDashboardStats(res.data || { totalUsers: 0, totalOrders: 0, totalSales: 0 });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    }
  };

  // Update order status (Admin operation)
  const updateOrderStatus = async (id, status) => {
    try {
      setLoading(true);
      const res = await axios.put(`${API_BASE}/api/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => {
        const orderId = o.orderId || o.id;
        if (orderId === id) {
          return { ...o, status: res.data.order?.status || status };
        }
        return o;
      }));
      // Refresh dashboard stats when order status is changed
      fetchDashboardStats();
      return true;
    } catch (err) {
      console.error("Error updating order status:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Coupons State
  const [coupons, setCoupons] = useState([]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/coupons`);
      const normalized = (res.data || []).map(c => ({
        id: c._id,
        code: c.code,
        discount: c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue.toLocaleString()} OFF`,
        expiry: new Date(c.expiryDate).toISOString().split('T')[0],
        status: c.status,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minPurchase: c.minPurchase,
        description: c.description
      }));
      setCoupons(normalized);
    } catch (err) {
      console.error("Error fetching coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchDashboardStats();
      fetchCoupons();
    }
  }, [token]);

  // Auth Functions
  const login = async (email, password, role = 'admin') => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      const { token: jwtToken, user: userData } = res.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('mhv_admin_user', JSON.stringify(userData));
      localStorage.setItem('mhv_admin_token', jwtToken);
      return userData;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Login failed';
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mhv_admin_user');
    localStorage.removeItem('mhv_admin_token');
    setCartItems([]);
    setOrders([]);
  };

  const switchRole = (newRole) => {
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      localStorage.setItem('mhv_admin_user', JSON.stringify(updated));
    }
  };
  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity: parseInt(quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Wishlist Functions
  const toggleWishlist = (product) => {
    setWishlistItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  // Derived metrics
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        token,
        login,
        logout,
        switchRole,
        products,
        setProducts,
        productsLoaded,
        isBackendOffline,
        fetchProducts,
        categories,
        setCategories,
        orders,
        setOrders,
        fetchOrders,
        updateOrderStatus,
        dashboardStats,
        fetchDashboardStats,
        coupons,
        setCoupons,
        fetchCoupons,
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        wishlistItems,
        toggleWishlist,
        isInWishlist,
        sidebarOpen,
        setSidebarOpen,
        adminSidebarCollapsed,
        setAdminSidebarCollapsed,
        loading,
        setLoading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
