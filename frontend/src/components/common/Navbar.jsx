import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext' // Ajusta esta ruta según la ubicación de tu CartContext

export default function Navbar() {
  const { cart } = useCart()

  // Calculamos la cantidad total de productos en el carrito
  const totalItems = cart ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-ecobrand-700">
          <span className="text-2xl">🌱</span>
          <span>EcoBite</span>
        </Link>

        {/* Buscador central */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar comercios, panaderías, platos..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-ecobrand-500 focus:bg-white transition"
            />
            <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm">🔍</span>
          </div>
        </div>

        {/* Links & Carrito */}
        <div className="flex items-center gap-4">
          <Link to="/catalog" className="text-sm font-medium text-gray-600 hover:text-ecobrand-600 transition hidden sm:inline-block">
            Explorar
          </Link>

          {/* Enlace de Carrito con Contador Dinámico */}
          <Link to="/cart" className="relative p-2 text-gray-600 hover:text-ecobrand-600 transition" title="Ver carrito">
            <span className="text-xl">🛒</span>
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-ecobrand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Avatar Perfil / Login */}
          <Link 
            to="/profile" 
            className="h-8 w-8 rounded-full bg-ecobrand-100 border border-ecobrand-500 text-ecobrand-700 font-bold flex items-center justify-center text-xs hover:bg-ecobrand-200 transition"
            title="Mi Perfil"
          >
            CP
          </Link>
        </div>

      </div>
    </header>
  )
}