import { useState, useEffect } from 'react';
import { Clock, Truck, CheckCircle, XCircle, Eye, X } from 'lucide-react';

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700', icon: Clock },
  shipped: { label: 'Expédié', color: 'bg-blue-100 text-blue-700', icon: Truck },
  delivered: { label: 'Livré', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-700', icon: XCircle }
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const url = filter === 'all' ? '/api/orders' : `/api/orders?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      fetchOrders();
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'all' ? 'bg-rose-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Toutes</button>
          <button onClick={() => setFilter('pending')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'pending' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>En attente</button>
          <button onClick={() => setFilter('shipped')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'shipped' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Expédiées</button>
          <button onClick={() => setFilter('delivered')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Livrées</button>
          <button onClick={() => setFilter('cancelled')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Annulées</button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Aucune commande trouvée</div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const cfg = statusConfig[order.status] || statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <div key={order.id} className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-gray-900">#{order.id}</span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${cfg.color}`}>
                        <Icon size={12} /> {cfg.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div><span className="text-gray-400">Client:</span> <span className="font-medium">{order.customer_name}</span></div>
                      <div><span className="text-gray-400">Tél:</span> <span className="font-medium" dir="ltr">{order.customer_phone}</span></div>
                      <div><span className="text-gray-400">Wilaya:</span> <span className="font-medium">{order.wilaya}</span></div>
                      <div><span className="text-gray-400">Date:</span> <span className="font-medium">{new Date(order.created_at).toLocaleDateString('fr-FR')}</span></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-900">{parseInt(order.total_amount).toLocaleString()} DA</span>
                    <button onClick={() => setSelectedOrder(order)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Eye size={16} className="text-gray-500" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Commande #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="font-medium text-gray-900">Informations client</h3>
                <p className="text-sm text-gray-600">Nom: <span className="font-medium">{selectedOrder.customer_name}</span></p>
                <p className="text-sm text-gray-600">Tél: <span className="font-medium" dir="ltr">{selectedOrder.customer_phone}</span></p>
                <p className="text-sm text-gray-600">Wilaya: <span className="font-medium">{selectedOrder.wilaya}</span></p>
                <p className="text-sm text-gray-600">Adresse: <span className="font-medium">{selectedOrder.address}</span></p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-3">Produits commandés</h3>
                <div className="space-y-2">
                  {selectedOrder.order_items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{item.product_name}</p>
                        <div className="flex gap-2 text-xs text-gray-400">
                          {item.color && <span>{item.color}</span>}
                          {item.size && <span>• Pointure: {item.size}</span>}
                          <span>• x{item.quantity}</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">{(item.price * item.quantity).toLocaleString()} DA</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-rose-700">{parseInt(selectedOrder.total_amount).toLocaleString()} DA</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Changer le statut</h3>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(statusConfig).map(([key, cfg]) => (
                    <button key={key} onClick={() => updateStatus(selectedOrder.id, key)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${selectedOrder.status === key ? cfg.color + ' border-current' : 'border-gray-200 hover:bg-gray-50'}`}>
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}