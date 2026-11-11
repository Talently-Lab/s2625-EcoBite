import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Obtenemos la URL base de la API desde la variable de entorno (Render o local)
        const apiUrl = import.meta.env.VITE_API_URL || 'https://s2625-ecobite.onrender.com/api';
        
        // Realizamos la petición apuntando correctamente a la URL completa del backend
        const response = await fetch(`${apiUrl}/dashboard/stats`);
        
        if (!response.ok) {
          throw new Error("Error al obtener los datos del servidor");
        }
        
        const data = await response.json();
        
        // Mapeamos la data real del backend
        setStats({
          totalOrders: data.totalOrders || 0,
          totalRevenue: data.totalRevenue || 0,
          activeUsers: data.activeUsers || 0,
        });
        setOrders(data.recentOrders || []);
        
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary">Cargando panel de administración...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Panel de Administración (Dashboard)
      </h1>

      {/* Tarjetas de Métricas / KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Total de Pedidos</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {stats.totalOrders}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Ingresos Totales</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            ${stats.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Usuarios Activos</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {stats.activeUsers}
          </p>
        </div>
      </div>

      {/* Tabla de Gestión de Pedidos Recientes */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Últimos Pedidos
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ${Number(order.total || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === "Completado"
                            ? "bg-green-100 text-green-800"
                            : order.status === "En proceso"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay pedidos recientes disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}