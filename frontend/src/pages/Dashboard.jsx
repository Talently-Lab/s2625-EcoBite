import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aquí consumiremos los datos de la API del dashboard o pedidos
    // Usaremos datos simulados si el backend no está levantado por Docker
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Simulación de carga de datos del panel administrador
        setTimeout(() => {
          setStats({
            totalOrders: 15,
            totalRevenue: 450.50,
            activeUsers: 8
          });
          setOrders([
            { id: 101, customer: 'Ana Pérez', total: 45.00, status: 'Completado' },
            { id: 102, customer: 'Carlos Gómez', total: 32.50, status: 'En proceso' },
            { id: 103, customer: 'María Rodríguez', total: 60.00, status: 'Pendiente' }
          ]);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Cargando panel de administración...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Panel de Administración (Dashboard)</h1>

      {/* Tarjetas de Métricas / KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Total de Pedidos</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Ingresos Totales</p>
          <p className="text-3xl font-bold text-green-600 mt-2">${stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Usuarios Activos</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.activeUsers}</p>
        </div>
      </div>

      {/* Tabla de Gestión de Pedidos Recientes */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Últimos Pedidos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'Completado' ? 'bg-green-100 text-green-800' :
                      order.status === 'En proceso' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}