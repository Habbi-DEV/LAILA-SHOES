import { useState, useEffect } from 'react';
import { BarChart3, ShoppingBag, Package, AlertTriangle, TrendingUp, DollarSign, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const statusIcons = {
    pending: <Clock size={14} />,
    shipped: <Truck size={14} />,
    delivered: <CheckCircle size={14} />,
    cancelled: <XCircle size={14} />
  };
  const statusLabels = {
    pending: 'En attente',
    shipped: 'Expédié',
    delivered: 'Livré',
    cancelled: 'Annulé'
  };
  const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    shipped: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-rose-600" />
            </div>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalRevenue?.toLocaleString() || 0} DA</p>
          <p className="text-sm text-gray-500">Chiffre d'affaires</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingBag size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
          <p className="text-sm text-gray-500">Commandes totales</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.pendingOrders || 0}</p>
          <p className="text-sm text-gray-500">Commandes en attente</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Package size={20} className="text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
          <p className="text-sm text-gray-500">Produits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={20} className="text-rose-600" />
            <h2 className="text-lg font-semibold text-gray-900">Ventes par statut</h2>
          </div>
          <div className="space-y-4">
            {stats?.salesByStatus && Object.entries(stats.salesByStatus).map(([status, amount]) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    {statusIcons[status]}
                    {statusLabels[status]}
                  </span>
                  <span className="text-sm font-medium">{amount.toLocaleString()} DA</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      status === 'delivered' ? 'bg-green-500' :
                      status === 'shipped' ? 'bg-blue-500' :
                      status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (amount / Math.max(1, stats.totalRevenue)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-rose-600" />
            <h2 className="text-lg font-semibold text-gray-900">Meilleures ventes</h2>
          </div>
          {stats?.bestSellers?.length > 0 ? (
            <div className="space-y-3">
              {stats.bestSellers.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="w-8 h-8 bg-rose-100 text-rose-700 rounded-lg flex items-center justify-center font-bold text-sm">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-rose-700">{item.total_sold} vendus</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Aucune vente encore</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Commandes récentes</h2>
          {stats?.recentOrders?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">#{order.id} - {order.customer_name}</p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${statusColors[order.status]}`}>
                      {statusIcons[order.status]}
                      {statusLabels[order.status]}
                    </span>
                    <span className="text-sm font-semibold">{parseInt(order.total_amount).toLocaleString()} DA</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Aucune commande</p>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={20} className="text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">Alertes de stock</h2>
          </div>
          {stats?.lowStockProducts?.length > 0 ? (
            <div className="space-y-3">
              {stats.lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    {p.name_ar && <p className="text-xs text-gray-500" dir="rtl">{p.name_ar}</p>}
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {p.stock === 0 ? 'Rupture' : `${p.stock} restants`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-600 text-sm flex items-center gap-2"><CheckCircle size={16} /> Tous les stocks sont OK</p>
          )}
        </div>
      </div>
    </div>
  );
}