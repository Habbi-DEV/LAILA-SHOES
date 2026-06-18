import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-rose-950 text-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/icon-luxury.png" alt="LAILA SHOES" className="w-12 h-12 rounded-full shadow-md" />
              <div className="flex flex-col items-start">
                <span className="text-3xl font-bold tracking-[0.3em] text-white" style={{ fontFamily: 'serif' }}>LAILA</span>
                <span className="text-xs tracking-[0.5em] text-rose-300 -mt-1">SHOES</span>
              </div>
            </div>
            <p className="text-rose-300 text-sm leading-relaxed">Votre destination pour les sacs et sandales élégants. Qualité et style à prix abordables.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wider text-sm">NAVIGATION</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-rose-300 hover:text-white text-sm transition-colors">Accueil</Link>
              <Link to="/shop" className="text-rose-300 hover:text-white text-sm transition-colors">Boutique</Link>
              <Link to="/shop?category=sacs" className="text-rose-300 hover:text-white text-sm transition-colors">Sacs</Link>
              <Link to="/shop?category=sandales" className="text-rose-300 hover:text-white text-sm transition-colors">Sandales</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wider text-sm">CONTACT</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-rose-300 text-sm">
                <Phone size={14} />
                <span dir="ltr">+213 555 123 456</span>
              </div>
              <div className="flex items-center gap-2 text-rose-300 text-sm">
                <Mail size={14} />
                <span>contact@lailashoes.dz</span>
              </div>
              <div className="flex items-center gap-2 text-rose-300 text-sm">
                <MapPin size={14} />
                <span>Algérie</span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wider text-sm">SUIVEZ-NOUS</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-rose-900 hover:bg-rose-800 flex items-center justify-center transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-rose-900 hover:bg-rose-800 flex items-center justify-center transition-colors">
                <Facebook size={18} />
              </a>
            </div>
            <div className="mt-6 p-4 bg-rose-900/50 rounded-lg">
              <p className="text-rose-200 text-xs mb-1">Paiement à la livraison</p>
              <p className="text-rose-300 text-xs">Livraison partout en Algérie</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-rose-900 text-center">
          <p className="text-rose-400 text-xs tracking-wider">© 2025 LAILA SHOES. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}