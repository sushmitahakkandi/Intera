import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spinner } from '@shared/components/Common';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';

// Layouts
import AdminLayout from '../layouts/AdminLayout/AdminLayout';

// Admin Pages
const Dashboard = lazy(() => import('../pages/Dashboard'));
const AdminProducts = lazy(() => import('../pages/Products'));
const Inventory = lazy(() => import('../pages/Inventory'));
const AddProduct = lazy(() => import('../pages/AddProduct'));
const EditProduct = lazy(() => import('../pages/EditProduct'));
const Categories = lazy(() => import('../pages/Categories'));
const AdminOrders = lazy(() => import('../pages/Orders'));
const Customers = lazy(() => import('../pages/Customers'));
const AdminReviews = lazy(() => import('../pages/Reviews'));
const Coupons = lazy(() => import('../pages/Coupons'));
const Analytics = lazy(() => import('../pages/Analytics'));
const SellerPanel = lazy(() => import('../pages/SellerPanel'));
const Settings = lazy(() => import('../pages/Settings'));
const Profile = lazy(() => import('../pages/Profile'));
const BulkOperations = lazy(() => import('../pages/BulkOperations'));
const Notifications = lazy(() => import('../pages/Notifications'));
const OrderDetail = lazy(() => import('../pages/OrderDetail'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const VerifyOTP = lazy(() => import('../pages/VerifyOTP'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const Error404 = lazy(() => import('../pages/Error404'));

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
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/* Admin Auth Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/register" element={<Register />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/verify-otp" element={<VerifyOTP />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />
        
        {/* Protected Admin Pages inside AdminLayout */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="edit-product/:id" element={<EditProduct />} />
            <Route path="categories" element={<Categories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:orderId" element={<OrderDetail />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="customers" element={<Customers />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="seller-panel" element={<SellerPanel />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="bulk-operations" element={<BulkOperations />} />
          </Route>
        </Route>

        {/* Fallback 404 handler */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Suspense>
  );
}
