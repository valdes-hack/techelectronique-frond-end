import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Laptop, Gamepad2, ShieldCheck, Truck, Headphones, Mail, MapPin, Phone } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Footer = () => {
    const { settings } = useAppContext();
    return (
        <footer className="bg-apple-gray dark:bg-[#050505] pt-20 pb-10 px-6 border-t border-apple-border dark:border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="text-2xl font-black text-apple-dark dark:text-white italic mb-4 block">
                            {settings?.siteName?.toUpperCase() || 'TECHSTORE.'}
                        </Link>
                        <p className="text-sm text-apple-dark/50 dark:text-white/40 leading-relaxed mb-6">
                            La référence high-tech au Cameroun. <br/>
                            Qualité certifiée, garantie locale et livraison express.
                        </p>
                        <div className="space-y-3">
                            <p className="text-xs text-apple-dark/60 dark:text-white/50 flex items-center gap-2">
                                <Phone size={14} className="text-apple-blue" /> {settings?.contactPhone || '+237 600 000 000'}
                            </p>
                            <p className="text-xs text-apple-dark/60 dark:text-white/50 flex items-center gap-2">
                                <Mail size={14} className="text-apple-blue" /> {settings?.contactEmail || 'contact@techstore.cm'}
                            </p>
                            <p className="text-xs text-apple-dark/60 dark:text-white/50 flex items-center gap-2">
                                <MapPin size={14} className="text-apple-blue" /> {settings?.contactAddress || 'Douala, Cameroun'}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-black uppercase text-apple-dark dark:text-white mb-6 tracking-widest">Shopping</h4>
                        <ul className="space-y-4 text-sm text-apple-dark/60 dark:text-white/50 font-medium">
                            <li><Link to="/catalog" className="hover:text-apple-blue transition-colors">Tous les produits</Link></li>
                            <li><Link to="/category/smartphones" className="hover:text-apple-blue transition-colors">Smartphones</Link></li>
                            <li><Link to="/category/laptops" className="hover:text-apple-blue transition-colors">Ordinateurs</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-black uppercase text-apple-dark dark:text-white mb-6 tracking-widest">Aide & Support</h4>
                        <ul className="space-y-4 text-sm text-apple-dark/60 dark:text-white/50 font-medium">
                            <li><Link to="/support" className="hover:text-apple-blue transition-colors">SAV & Garantie</Link></li>
                            <li><Link to="/shipping" className="hover:text-apple-blue transition-colors">Zones de livraison</Link></li>
                            <li><Link to="/track-order" className="hover:text-apple-blue transition-colors">Suivre mon colis</Link></li>
                        </ul>
                    </div>

                    <div className="bg-white/50 dark:bg-white/5 p-6 rounded-3xl border border-white/20">
                        <h4 className="text-xs font-black uppercase text-apple-dark dark:text-white mb-4 tracking-widest">Newsletter</h4>
                        <p className="text-[11px] text-apple-dark/40 dark:text-white/30 mb-4 font-bold uppercase">Rejoignez le futur</p>
                        <form className="flex gap-2">
                            <input type="email" placeholder="Email" className="flex-1 bg-white dark:bg-black/20 border-none rounded-full px-4 text-xs outline-none" />
                            <button className="bg-apple-dark dark:bg-apple-blue text-white p-2 rounded-full px-4 text-[10px] font-bold">OK</button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-apple-dark/5 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[11px] text-apple-dark/40 dark:text-white/30 font-medium italic">© {new Date().getFullYear()} {settings?.siteName || 'TechStore'} - {settings?.contactAddress || 'Douala, Cameroun'}.</p>
                    <div className="flex space-x-6 text-[11px] text-apple-dark/40 dark:text-white/30 font-bold uppercase tracking-widest">
                        <Link to="/terms" className="hover:text-apple-blue">Mentions</Link>
                        <Link to="/privacy" className="hover:text-apple-blue">Confidentialité</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;