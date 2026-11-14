import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#3D2314] font-sans flex flex-col justify-between">
      {/* Header superior */}
      <header className="px-6 py-4 flex items-center gap-2 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold tracking-tight text-[#3A2E2B]">
            EcoBite
          </span>
          <span className="text-xl leading-none">🚲</span>
        </div>
      </header>

      {/* Contenido principal: En celular va en columna, en computadora se divide en dos columnas (Imagen a la izq, Textos a la der) */}
      <main className="max-w-6xl mx-auto w-full px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center my-auto">
        {/* Imagen Hero */}
        <div className="w-full h-72 sm:h-96 rounded-3xl overflow-hidden shadow-md">
          {" "}
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80"
            alt="Grupo comiendo sustentable"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Textos y Botones */}
        <div className="space-y-6 text-center sm:text-left flex flex-col justify-center">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-bold text-[#3D2314] leading-tight">
              Pedí rico. <br />
              Elegí sustentable.
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-md mx-auto sm:mx-0">
              Tu comida favorita en la puerta de tu casa, reduciendo tu impacto
              ambiental y cuidando el planeta en cada pedido.
            </p>
          </div>

          <div className="space-y-3 max-w-sm mx-auto sm:mx-0 w-full pt-2">
            <button
              onClick={() => navigate("/register")}
              className="w-full py-4 bg-[#3D2314] hover:bg-[#2A180D] text-white font-semibold text-sm rounded-2xl transition shadow-md cursor-pointer"
            >
              Crear cuenta
            </button>

            <button
              onClick={() => navigate("/login")}
              className="w-full py-4 bg-white border border-[#3D2314] hover:bg-gray-50 text-[#3D2314] font-semibold text-sm rounded-2xl transition cursor-pointer"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </main>

      {/* Footer simple para espacio inferior */}
      <footer className="py-6 text-center text-xs text-gray-400">
        EcoBite © 2026 — Todos los derechos reservados
      </footer>
    </div>
  );
}
