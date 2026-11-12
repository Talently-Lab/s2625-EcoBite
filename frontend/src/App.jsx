import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Home from "./pages/Home";
import StoreDetail from "./pages/StoreDetail";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import PedidoDetalle from "./pages/PedidoDetalle";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Landing from "./pages/Landing";
import CheckoutProcess from "./pages/CheckoutProcess";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import RegistrarRestaurante from "./pages/RegistrarRestaurante";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Home />} />{" "}
          {/* <-- Añadida para evitar el error en blanco */}
          <Route path="/store/:id" element={<StoreDetail />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/pedidos/:pedidoId" element={<PedidoDetalle />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/checkout/process" element={<CheckoutProcess />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route
            path="/register/store-basic"
            element={<RegistrarRestaurante />}
          />
          <Route
            path="/register/store-details"
            element={<RegistrarRestaurante />}
          />
          <Route
            path="/register/store-validation"
            element={<RegistrarRestaurante />}
          />
          <Route path="/register/success" element={<RegistrarRestaurante />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
