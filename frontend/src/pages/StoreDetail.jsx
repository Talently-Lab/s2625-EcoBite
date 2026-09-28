import { Routes, Route } from 'react-router-dom'
import Navbar from "../components/common/Navbar";
import FoodCard from "../components/food/FoodCard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      {/* 
        El ":id" es un parámetro dinámico. 
        Permite que la misma vista (StoreDetail) sirva para cualquier tienda.
      */}
      <Route path="/store/:id" element={<StoreDetail />} />
      <Route path="/product/:id" element={<ProductDetail />} />
    </Routes>
  )
}
