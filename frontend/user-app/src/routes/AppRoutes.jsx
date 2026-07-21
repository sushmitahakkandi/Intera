import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spinner } from '@shared/components/Common';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';

// Layouts
import CustomerLayout from '../layouts/CustomerLayout/CustomerLayout';
import AuthLayout from '../layouts/AuthLayout/AuthLayout';

// Lazy Loaded Pages
const Home = lazy(() => import('../pages/Home'));
const Shop = lazy(() => import('../pages/Shop'));
const Collections = lazy(() => import('../pages/Collections'));
const AIDashboard = lazy(() => import('../pages/AIDashboard'));
const AIRoomRecommendation = lazy(() => import('../pages/AIRoomRecommendation'));
const AIColorMatching = lazy(() => import('../pages/AIColorMatching'));
const AIInteriorAssistant = lazy(() => import('../pages/AIInteriorAssistant'));
const AIAssistant = lazy(() => import('../pages/AIAssistant'));
const ProductDetails = lazy(() => import('../pages/ProductDetails'));
const Cart = lazy(() => import('../pages/Cart'));
const Checkout = lazy(() => import('../pages/Checkout'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const OrderTracking = lazy(() => import('../pages/OrderTracking'));
const Orders = lazy(() => import('../pages/Orders'));
const Profile = lazy(() => import('../pages/Profile'));
const Reviews = lazy(() => import('../pages/Reviews'));
const About = lazy(() => import('../pages/About'));
const Contact = lazy(() => import('../pages/Contact'));
const Error404 = lazy(() => import('../pages/Error404'));

// Auth Pages
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const VerifyOTP = lazy(() => import('../pages/VerifyOTP'));

// Centered loading page fallback
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Customer Public Layout & Pages */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="collections" element={<Collections />} />
          
          {/* AI Decor routes */}
          <Route path="ai-decor" element={<AIDashboard />} />
          <Route path="ai-decor/dashboard" element={<AIDashboard />} />
          <Route path="ai-decor/room-recommendation" element={<AIRoomRecommendation />} />
          <Route path="ai-decor/color-matching" element={<AIColorMatching />} />
          <Route path="ai-decor/interior-assistant" element={<AIInteriorAssistant />} />

          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />

          {/* Protected Customer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['customer', 'admin']} />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="order-tracking" element={<OrderTracking />} />
            <Route path="orders" element={<Orders />} />
            <Route path="profile" element={<Profile />} />
            <Route path="reviews" element={<Reviews />} />
          </Route>
        </Route>

        {/* Authentication Pages inside AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="verify-otp" element={<VerifyOTP />} />
        </Route>

        {/* Fallback 404 handler */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Suspense>
  );
}
