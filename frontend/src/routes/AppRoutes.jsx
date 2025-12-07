import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import Loader from "../components/tools/Loader";

// Lazy load pages
const Home = lazy(() => import("../pages/Home"));
const Products = lazy(() => import("../pages/Products"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Details = lazy(() =>
  import("../pages/Details").then((module) => ({ default: module.Details }))
);
const Cart = lazy(() => import("../components/tools/Cart"));
const NotFound = lazy(() => import("../pages/NotFound"));
const UserOrders = lazy(() => import("../pages/Orders"));
const OrdersHistory = lazy(() => import("../pages/OrdersHistory"));
const ProfileUser = lazy(() => import("../pages/Profile"));

// Admin pages
const AdminLayout = lazy(() => import("../layouts/admin/AdminLayout"));
const AdminStats = lazy(() => import("../pages/admin/AdminStats"));
const AdminUsers = lazy(() => import("../pages/admin/AdminUsers"));
const AdminProducts = lazy(() => import("../pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("../pages/admin/AdminOrders"));
const AdminCategories = lazy(() => import("../pages/admin/AdminCategories"));
const AdminCoupons = lazy(() => import("../pages/admin/AdminCoupons"));
const AdminReviews = lazy(() => import("../pages/admin/AdminReviews"));

// Seller pages
const Dashboard = lazy(() => import("../layouts/seller/Dashboard"));
const Overview = lazy(() => import("../pages/seller/Overview"));
const SellerProducts = lazy(() => import("../pages/seller/Products"));
const AddProduct = lazy(() => import("../pages/seller/AddProduct"));
const EditProduct = lazy(() => import("../pages/seller/EditProduct"));
const ProductDetails = lazy(() => import("../pages/seller/ProductDetails"));
const Orders = lazy(() => import("../pages/seller/Orders"));
const Coupons = lazy(() => import("../pages/seller/Coupons"));
const AddCoupon = lazy(() => import("../pages/seller/AddCoupon"));
const EditCoupon = lazy(() => import("../pages/seller/EditCoupon"));
const Notifications = lazy(() => import("../pages/seller/Notifications"));
const Profile = lazy(() => import("../pages/seller/Profile"));
const PendingApproval = lazy(() => import("../pages/seller/PendingApproval"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
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
          <Route
            path="profile/user"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <ProfileUser />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="orders/history"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <OrdersHistory />
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
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* Seller Pending Approval - Outside Dashboard Layout */}
        <Route
          path="/seller/pending"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <PendingApproval />
            </ProtectedRoute>
          }
        />

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
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="orders" element={<Orders />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="coupons/add" element={<AddCoupon />} />
          <Route path="coupons/edit/:id" element={<EditCoupon />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
