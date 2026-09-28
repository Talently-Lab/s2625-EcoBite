import { Link } from 'react-router-dom'

export default function Profile() {
  return (
    <div className="min-h-screen bg-white text-gray-900 max-w-md mx-auto border-x border-gray-100 font-sans pb-12">
      <header className="px-4 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-10">
        <span className="font-bold text-base text-gray-900">Mi impacto</span>
        <span className="text-xs text-gray-400">Septiembre 2026</span>
      </header>

      <main className="p-4 space-y-5">
        {/* Perfil de Usuario */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 font-bold">
            👤
          </div>
          <div>
            <h2 className="font-bold text-sm text-gray-900">Pedro Ramírez</h2>
            <span className="text-[10px] bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium inline-block mt-0.5">
              🔄 47 pedidos sustentables
            </span>
          </div>
        </div>

        {/* Total CO2 Ahorrado con Progreso Circular Simulado */}
        <div className="border border-gray-200 rounded-2xl p-4 space-y-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            TOTAL CO₂ AHORRADO ESTE MES
          </span>

          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full border-4 border-gray-100 border-t-black border-r-black flex items-center justify-center shrink-0">
              <span className="text-xs font-bold">73%</span>
            </div>
            <div>
              <p className="text-base font-extrabold text-gray-900">18,7 kg</p>
              <p className="text-[10px] text-gray-500">de tu objetivo mensual de 25 kg</p>
              <div className="mt-2 space-y-0.5 text-[10px] text-gray-500">
                <p>▪ Ahorrado: 18,7 kg</p>
                <p>▪ Restante: 6,3 kg</p>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Principales en Grilla */}
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
            MÉTRICAS PRINCIPALES
          </span>

          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-200 rounded-xl p-3">
              <span className="text-xl font-extrabold text-gray-900 block">47</span>
              <span className="text-[10px] text-gray-500">pedidos sustentables</span>
              <span className="text-[10px] font-bold text-gray-400 block mt-2">Órdenes</span>
            </div>

            <div className="border border-gray-200 rounded-xl p-3">
              <span className="text-xl font-extrabold text-gray-900 block">14</span>
              <span className="text-[10px] text-gray-500">días de racha</span>
              <span className="text-[10px] font-bold text-gray-400 block mt-2">Racha</span>
            </div>

            <div className="border border-gray-200 rounded-xl p-3">
              <span className="text-sm font-extrabold text-gray-900 block">2kg de CO₂</span>
              <span className="text-[10px] text-gray-500">ahorrado este mes</span>
              <span className="text-[9px] text-gray-400 block mt-1">Por uso de packaging biodegradable</span>
            </div>

            <div className="border border-gray-200 rounded-xl p-3">
              <span className="text-sm font-extrabold text-gray-900 block">12kg de CO₂</span>
              <span className="text-[10px] text-gray-500">ahorrado este mes</span>
              <span className="text-[9px] text-gray-400 block mt-1">Por uso de transportes ecológicos</span>
            </div>
          </div>
        </div>

        {/* Ahorro semanal bar chart mockup */}
        <div className="border border-gray-200 rounded-2xl p-4">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">
            AHORRO SEMANAL DE CO₂
          </span>
          <div className="flex items-end justify-between h-16 gap-1 px-2">
            {[40, 65, 30, 80, 95, 50, 70].map((height, idx) => (
              <div key={idx} className="w-full bg-black rounded-t" style={{ height: `${height}%` }}></div>
            ))}
          </div>
        </div>

        <div className="text-center pt-2">
          <Link to="/" className="text-xs text-gray-500 font-medium hover:underline">
            ← Volver a la Home
          </Link>
        </div>
      </main>
    </div>
  )
}