import { Link } from "react-router-dom";

export default function Cart() {
  return (
    <div className="min-h-screen bg-white text-gray-900 max-w-md mx-auto border-x border-gray-100 font-sans pb-24">
      <header className="px-4 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-10">
        <Link to="/catalog" className="text-xl">
          ←
        </Link>
        <span className="font-bold text-base text-gray-900">Tu pedido</span>
        <span className="text-xs text-gray-500">1 producto</span>
      </header>

      <main className="p-4 space-y-6">
        {/* Item en carrito */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
            🖼️
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-xs text-gray-900">
              Hamburguesa Patagónica
            </h3>
            <p className="text-[10px] text-gray-500">
              Vegano - Libre de glúten
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs font-bold border border-gray-200 rounded-lg w-max px-2 py-0.5">
              <button>-</button>
              <span>1</span>
              <button>+</button>
            </div>
          </div>

          <span className="font-bold text-xs text-gray-900 self-start">
            $26.750
          </span>
        </div>

        <button className="text-xs text-gray-500 font-medium flex items-center gap-1">
          + Agregar más productos
        </button>

        {/* Tarjeta de Impacto / CO2 */}
        <div className="border border-gray-200 rounded-xl p-4 space-y-2 bg-gray-50/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">
            AHORRO ESTIMADO DE CO₂
          </span>
          <p className="text-lg font-bold text-gray-900">3.4 kg CO₂</p>
          <div className="h-2 w-full bg-gray-200 rounded-full"></div>
        </div>

        {/* Resumen de costos */}
        <div className="space-y-2 text-xs">
          <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px] block mb-1">
            Resumen
          </span>
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>+$0</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery</span>
            <span>+$1200</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Packaging</span>
            <span>+$0</span>
          </div>
          <hr className="border-gray-100 my-2" />
          <div className="flex justify-between font-bold text-sm text-gray-900">
            <span>Total</span>
            <span>$27.950</span>
          </div>
        </div>
      </main>

      {/* Botón flotante Confirmar */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-4 z-10">
        // ✅ DESPUÉS (Corregido):
        <Link
          to="/profile"
          className="w-full bg-black text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-between"
        >
          <span>Confirmar pedido</span>
          <span>$27.950</span>
        </Link>
      </footer>
    </div>
  );
}
