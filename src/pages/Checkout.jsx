import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra',
  'Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret',
  'Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda',
  'Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem',
  "M'Sila",'Mascara','Ouargla','Oran','El Bayadh','Illizi',
  'Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt',
  'El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla',
  'Naâma','Aïn Témouchent','Ghardaïa','Relizane','Timimoun',
  'Bordj Badji Mokhtar','Ouled Djellal','Béni Abbès','In Salah',
  'In Guezzam','Touggourt','Djanet',"El M'Ghair",'El Meniaa'
];

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    wilaya: '',
    address: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.customer_name.trim()) e.customer_name = 'Le nom est requis';
    if (!form.customer_phone.trim()) e.customer_phone = 'Le téléphone est requis';
    else if (!/^[0-9+\s]{8,15}$/.test(form.customer_phone.trim())) e.customer_phone = 'Numéro invalide';
    if (!form.wilaya) e.wilaya = 'La wilaya est requise';
    if (!form.address.trim()) e.address = "L'adresse est requise";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          total_amount: totalPrice,
          items: items.map(i => ({
            product_id: i.product_id,
            product_name: i.product_name,
            quantity: i.quantity,
            price: i.price,
            color: i.color,
            size: i.size
          }))
        })
      });
      if (res.ok) {
        setSuccess(true);
        clearCart();
      }
    } catch (err) {
      console.error('Order error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 pt-14 sm:pt-20 md:pt-24 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Check size={32} className="text-green-600 sm:hidden" />
            <Check size={40} className="text-green-600 hidden sm:block" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3" style={{ fontFamily: 'serif' }}>Commande confirmée !</h1>
          <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">Merci pour votre commande. Nous vous contacterons bientôt pour confirmer la livraison.</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-medium transition-colors text-sm sm:text-base">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-14 sm:pt-20 md:pt-24 flex items-center justify-center">
        <div className="text-center px-4">
          <ShoppingBag size={48} className="text-gray-300 mx-auto mb-3 sm:mb-4" />
          <p className="text-gray-400 text-base sm:text-lg mb-3 sm:mb-4">Votre panier est vide</p>
          <Link to="/shop" className="text-rose-600 hover:text-rose-700 font-medium text-sm sm:text-base">Découvrir nos produits</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-14 sm:pt-20 md:pt-24">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <Link to="/shop" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-rose-700 transition-colors mb-4 sm:mb-6 text-xs sm:text-sm">
          <ArrowLeft size={14} />
          Continuer les achats
        </Link>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-5 sm:mb-8" style={{ fontFamily: 'serif' }}>Passer la commande</h1>

        <div className="grid md:grid-cols-5 gap-5 sm:gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Informations de livraison</h2>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Nom complet *</label>
                  <input type="text" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} className={`w-full border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 ${errors.customer_name ? 'border-red-400' : 'border-gray-300'}`} placeholder="Votre nom" />
                  {errors.customer_name && <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.customer_name}</p>}
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Numéro de téléphone *</label>
                  <input type="tel" value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })} className={`w-full border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 ${errors.customer_phone ? 'border-red-400' : 'border-gray-300'}`} placeholder="05XX XXX XXX" dir="ltr" />
                  {errors.customer_phone && <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.customer_phone}</p>}
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Wilaya *</label>
                  <select value={form.wilaya} onChange={e => setForm({ ...form, wilaya: e.target.value })} className={`w-full border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 ${errors.wilaya ? 'border-red-400' : 'border-gray-300'}`}>
                    <option value="">Sélectionnez votre wilaya</option>
                    {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                  {errors.wilaya && <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.wilaya}</p>}
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Adresse complète *</label>
                  <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className={`w-full border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none ${errors.address ? 'border-red-400' : 'border-gray-300'}`} rows={3} placeholder="Rue, quartier, commune..." />
                  {errors.address && <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.address}</p>}
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3">
              <div className="text-amber-600 mt-0.5 text-base sm:text-lg">💰</div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-amber-800">Paiement à la livraison</p>
                <p className="text-[10px] sm:text-xs text-amber-600 mt-0.5">Vous payez en espèces à la réception</p>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="w-full bg-rose-700 hover:bg-rose-800 active:bg-rose-900 disabled:bg-rose-400 text-white py-3 sm:py-4 rounded-xl font-medium tracking-wider transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
              {submitting ? <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'CONFIRMER LA COMMANDE'}
            </button>
          </form>

          {/* Order Summary */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm sticky top-20 sm:top-24">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Récapitulatif</h2>
              <div className="space-y-2.5 sm:space-y-3 mb-3 sm:mb-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 sm:gap-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-rose-50 flex-shrink-0">
                      {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={14} className="text-rose-300" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                      <div className="flex gap-1 text-[10px] sm:text-xs text-gray-400">
                        {item.color && <span>{item.color}</span>}
                        {item.size && <span>• {item.size}</span>}
                        <span>• x{item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">{(item.price * item.quantity).toLocaleString()} DA</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 sm:pt-4 space-y-1.5 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                  <span>Sous-total</span>
                  <span>{totalPrice.toLocaleString()} DA</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                  <span>Livraison</span>
                  <span>Calculée après</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-1.5 sm:pt-2 border-t border-gray-100 text-sm sm:text-base">
                  <span>Total</span>
                  <span>{totalPrice.toLocaleString()} DA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
