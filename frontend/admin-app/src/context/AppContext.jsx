import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

// Sample product data based on the provided blueprint image
const MOCK_PRODUCTS = [
  {
    id: 'p1',
    name: 'Luxury Modern Sofa',
    category: 'Sofa',
    price: 24999,
    originalPrice: 32999,
    discount: 24,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewsCount: 256,
    stock: 20,
    material: 'Solid Wood, Fabric',
    dimensions: '220cm x 90cm x 85cm',
    colors: ['#A66A2C', '#2B2B2B', '#E5E5E5'],
    description: 'Comfort meets elegance. Perfect for your modern home and cozy living. Crafted with high-resiliency foam cushions and durable textured fabric upholstery.'
  },
  {
    id: 'p2',
    name: 'Wooden Chair',
    category: 'Chair',
    price: 2499,
    originalPrice: 4999,
    discount: 50,
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
    reviewsCount: 112,
    stock: 35,
    material: 'Teak Wood',
    dimensions: '60cm x 60cm x 90cm',
    colors: ['#A66A2C', '#2B2B2B'],
    description: 'Classic handcrafted wooden chair made of premium teak wood. Durable and ergonomically designed for maximum comfort.'
  },
  {
    id: 'p3',
    name: 'King Size Bed',
    category: 'Bed',
    price: 34999,
    originalPrice: 45999,
    discount: 23,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewsCount: 88,
    stock: 15,
    material: 'Engineered Wood, Velvet Upholstery',
    dimensions: '200cm x 180cm x 110cm',
    colors: ['#2B2B2B', '#E5E5E5'],
    description: 'Luxurious king-size bed with premium velvet headboard and solid support structure. Perfect for a restful sleep.'
  },
  {
    id: 'p4',
    name: 'Dining Table',
    category: 'Dining',
    price: 15999,
    originalPrice: 19999,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    reviewsCount: 64,
    stock: 18,
    material: 'Oak Wood, Steel Legs',
    dimensions: '160cm x 90cm x 75cm',
    colors: ['#A66A2C', '#2B2B2B'],
    description: 'Modern 6-seater dining table with premium oak finish and powder-coated steel legs. Fits nicely into any dining space.'
  },
  {
    id: 'p5',
    name: 'Office Chair',
    category: 'Chair',
    price: 9999,
    originalPrice: 12999,
    discount: 23,
    image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
    reviewsCount: 145,
    stock: 25,
    material: 'Mesh, Nylon Base',
    dimensions: '65cm x 65cm x 120cm',
    colors: ['#2B2B2B'],
    description: 'Ergonomic high-back office chair with adjustable lumbar support, armrests, and headrest. Breathable mesh back for productivity.'
  },
  {
    id: 'p6',
    name: 'Center Table',
    category: 'Tables',
    price: 6999,
    originalPrice: 8999,
    discount: 22,
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80',
    rating: 4.4,
    reviewsCount: 52,
    stock: 40,
    material: 'Glass, Metal Base',
    dimensions: '90cm x 90cm x 45cm',
    colors: ['#2B2B2B', '#E5E5E5'],
    description: 'Elegant coffee table with tempered glass top and geometrical metal base. Perfect accent piece for your living room.'
  }
];

export const AppProvider = ({ children }) => {
  // Authentication State
  const [user, setUser] = useState(() => {
    // Initial mock login user for development and presentation
    return {
      name: 'Basavaraj H G',
      email: 'basavaraj@gmail.com',
      role: 'customer' // 'customer', 'admin', or 'seller'
    };
  });
  const [token, setToken] = useState('placeholder-jwt-token');

  // Shopping Cart State
  const [cartItems, setCartItems] = useState([]);

  // Wishlist State
  const [wishlistItems, setWishlistItems] = useState([]);

  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminSidebarCollapsed, setAdminSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Products List State (allows adding/editing for admin pages locally in state)
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  // Categories list
  const [categories, setCategories] = useState([
    { id: 'c1', name: 'Sofa', count: 12, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=200&q=80' },
    { id: 'c2', name: 'Chair', count: 28, image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=200&q=80' },
    { id: 'c3', name: 'Bed', count: 15, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=200&q=80' },
    { id: 'c4', name: 'Dining', count: 8, image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=200&q=80' },
    { id: 'c5', name: 'Tables', count: 19, image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=200&q=80' },
    { id: 'c6', name: 'Storage', count: 10, image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=200&q=80' }
  ]);

  // Orders State (for customer and admin side displays)
  const [orders, setOrders] = useState([
    {
      id: 'MHV123456',
      customer: 'Basavaraj H G',
      email: 'basavaraj@gmail.com',
      date: '20 July 2026',
      total: 36997,
      status: 'Delivered',
      items: [
        { name: 'Luxury Modern Sofa', qty: 1, price: 24999 },
        { name: 'Center Table', qty: 1, price: 6999 },
        { name: 'Wooden Chair', qty: 2, price: 2499 }
      ]
    },
    {
      id: 'MHV123457',
      customer: 'Sneha M',
      email: 'sneha@gmail.com',
      date: '02 July 2026',
      total: 28499,
      status: 'Shipped',
      items: [
        { name: 'King Size Bed', qty: 1, price: 34999 }
      ]
    },
    {
      id: 'MHV123458',
      customer: 'Rahul R',
      email: 'rahul@gmail.com',
      date: '04 July 2026',
      total: 17939,
      status: 'Pending',
      items: [
        { name: 'Dining Table', qty: 1, price: 15999 }
      ]
    }
  ]);

  // Coupons State
  const [coupons, setCoupons] = useState([
    { id: 'cp1', code: 'SUMMER20', discount: '20% OFF', expiry: '2026-08-31', status: 'Active' },
    { id: 'cp2', code: 'FESTIVAL10', discount: '10% OFF', expiry: '2026-09-15', status: 'Active' },
    { id: 'cp3', code: 'NEWUSER15', discount: '15% OFF', expiry: '2026-07-31', status: 'Inactive' }
  ]);

  // Auth Functions
  const login = (email, password, role = 'customer') => {
    setUser({
      name: email.split('@')[0],
      email: email,
      role: role
    });
    setToken('sample-jwt-token-after-login');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setCartItems([]);
  };

  const switchRole = (newRole) => {
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  // Cart Functions
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
        categories,
        setCategories,
        orders,
        setOrders,
        coupons,
        setCoupons,
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
