import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Products from '../pages/Products';
import Login from '../pages/Login';
import Register from '../pages/Register';
import { Details } from '../pages/Details';
import ProtectedRoute from '../components/ProtectedRoute';
import NotFound from '../pages/NotFound';
import AdminLayout from '../layouts/admin/AdminLayout';
import AdminStats from '../pages/admin/AdminStats';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminOrders from '../pages/admin/AdminOrders';
import SellerDashboard from '../pages/SellerDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* public routes */}
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<Details />} />
        <Route path="login" element={<Login />} />
        <Route
          path="seller"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="stats" replace />} />
        <Route path="stats" element={<AdminStats />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="*" element={<Navigate to="stats" replace />} />
      </Route>
    </Routes>
  );
}
