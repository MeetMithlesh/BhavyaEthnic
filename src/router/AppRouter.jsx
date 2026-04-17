import { BrowserRouter, Route, Routes } from "react-router-dom";
import CustomerLayout from "../components/layout/CustomerLayout";
import AdminLayout from "../components/admin/AdminLayout";
import Home from "../pages/customer/Home";
import Shop from "../pages/customer/Shop";
import ProductDetail from "../pages/customer/ProductDetail";
import { Login, Register } from "../pages/customer/Auth";
import Checkout from "../pages/customer/Checkout";
import UserDashboard from "../pages/customer/UserDashboard";
import Wishlist from "../pages/customer/Wishlist";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ProductManager from "../pages/admin/ProductManager";
import OrderManager from "../pages/admin/OrderManager";
import NotFound from "../pages/NotFound";
import { AdminRoute, ProtectedRoute } from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="collections" element={<Shop />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="orders" element={<OrderManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
