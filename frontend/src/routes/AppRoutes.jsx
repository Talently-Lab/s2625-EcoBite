import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Catalog from '../pages/Catalog'
import StoreDetail from '../pages/StoreDetail'
import Cart from '../pages/Cart'
import Profile from '../pages/Profile'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/product/:id" element={<StoreDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  )
}