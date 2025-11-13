import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import Home from "../pages/Home";
import Products from "../pages/Products";
import Login from "../pages/Login";
import Register from "../pages/Register";
import { Details } from "../pages/Details";
import Cart from "../components/tools/Cart";
import ProtectedRoute from "../components/ProtectedRoute";
import NotFound from "../pages/NotFound";
import AdminLayout from "../layouts/admin/AdminLayout";
import AdminStats from "../pages/admin/AdminStats";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminOrders from "../pages/admin/AdminOrders";
import Dashboard from "../layouts/seller/Dashboard";
import Overview from "../pages/seller/Overview";
import SellerProducts from "../pages/seller/Products";
import Orders from "../pages/seller/Orders";
import Coupons from "../pages/seller/Coupons";
import Notifications from "../pages/seller/Notifications";
import Profile from "../pages/seller/Profile";
import UserOrders from "../pages/Orders";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* public routes */}
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<Details />} />
        <Route path="cart" element={<Cart />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
        {/* private route */}
        <Route
          path="orders/user"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserOrders />
            </ProtectedRoute>
          }
        ></Route>
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
        <Route path="*" element={<NotFound />} />
      </Route>
      {/* Seller Dashboard Routes */}
      <Route
        path="/seller"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="products" element={<SellerProducts />} />
        <Route path="orders" element={<Orders />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
