import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, ChevronDown, Package, Sun, Moon, Bell, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import ProductService from '../../services/product.service';
import NotificationBell from '../admin/NotificationBell';
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';
import SpotlightSearch from './SpotlightSearch';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isProductsOpen, setIsProductsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    
    const { isAuthenticated, user, isAdmin } = useAuth();
    const { setIsOpen, cart } = useCart();
    const { settings } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();

    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await ProductService.getCategories();
                if (res && res.data) setCategories(res.data);
            } catch (err) { console.error(err); }
        };
        fetchCats();
    }, []);

    // Handle global keyboard shortcut Cmd+K or Ctrl+K to open search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <div className="fixed top-0 w-full z-[100] transition-all duration-500 px-0 md:px-6 pt-0 md:pt-4">
            <nav className={`mx-auto max-w-7xl transition-all duration-500 ${
                isScrolled 
                ? 'md:rounded-2xl bg-white dark:bg-[#0b0e14] border border-gray-100 dark:border-white/5 shadow-lg py-4 px-8' 
                : 'bg-transparent py-6 px-4'
            }`}>
                <div className="flex justify-between items-center gap-8">
                    
                    {/* LOGO STYLE APPLE */}
                    <Link to="/" className="flex items-center space-x-2 shrink-0 group">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                            <span className="font-bold text-xl">{settings?.siteName ? settings.siteName.charAt(0).toUpperCase() : 'T'}</span>
                        </div>
                        <span className="text-xl font-bold text-apple-dark dark:text-white uppercase tracking-wide">
                            {settings?.siteName || 'TechStore'}
                        </span>
                    </Link>

                    {/* MENU CENTRAL - NAVIGATION */}
                    <div className="hidden lg:flex items-center bg-gray-50 dark:bg-white/5 rounded-full px-2 py-1 border border-transparent dark:border-white/5">
                        <Link to="/" className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${location.pathname === '/' ? 'text-indigo-600' : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600'}`}>ACCUEIL</Link>
                        <Link to="/catalog" className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${location.pathname === '/catalog' ? 'text-indigo-600' : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600'}`}>BOUTIQUE</Link>
                        
                        <div className="relative group" onMouseEnter={() => setIsProductsOpen(true)} onMouseLeave={() => setIsProductsOpen(false)}>
                            <button className="flex items-center space-x-1 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 transition-colors">
                                <span>RAYONS</span>
                                <ChevronDown size={14} className={`transition-transform duration-300 ${isProductsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isProductsOpen && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-[#161926] rounded-3xl shadow-2xl border border-apple-border/50 dark:border-white/10 p-3 overflow-hidden backdrop-blur-xl"
                                    >
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-500 p-3">Parcourir</p>
                                        <div className="grid grid-cols-1 gap-1">
                                            {categories.map((cat) => (
                                                <Link key={cat.id} to={`/category/${cat.slug}`} className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-indigo-600/10 dark:hover:bg-indigo-500/10 text-sm font-bold text-apple-dark/80 dark:text-white/80 transition-all group/item" onClick={() => setIsProductsOpen(false)}>
                                                    <Package size={16} className="text-indigo-500 opacity-50 group-hover/item:opacity-100" />
                                                    <span>{cat.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* RECHERCHE - SPOTLIGHT */}
                    <div className="hidden md:flex flex-1 max-w-sm relative group cursor-pointer" onClick={() => setIsSearchOpen(true)}>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-dark/30 dark:text-white/20 group-hover:text-indigo-500 transition-colors">
                            <Search size={18} />
                        </div>
                        <div className="w-full bg-apple-dark/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl py-3 px-12 text-xs font-bold text-gray-400 transition-all hover:bg-apple-dark/10 dark:hover:bg-white/10 flex justify-between items-center">
                            <span>Rechercher...</span>
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-white/10 px-2 py-1 rounded-md shadow-sm border dark:border-white/5">
                                <span className="text-lg leading-none">⌘</span> K
                            </span>
                        </div>
                    </div>

                    {/* ACTIONS DROITE */}
                    <div className="flex items-center space-x-3">
                        
                        {/* THEME TOGGLE */}
                        <button onClick={toggleTheme} className="p-3 rounded-2xl bg-white/5 dark:bg-white/5 hover:scale-110 transition-all text-apple-dark dark:text-white border border-white/5">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-yellow-400" />}
                        </button>

                        {/* ADMIN DASHBOARD LINK */}
                        {isAdmin() && (
                            <Link to="/admin" className="hidden sm:flex items-center space-x-2 bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 px-4 py-2.5 rounded-2xl font-bold text-xs hover:scale-105 transition-transform border border-indigo-500/10">
                                <Settings size={16} />
                                <span className="uppercase tracking-widest text-[10px]">Gestion</span>
                            </Link>
                        )}

                        {/* NOTIFICATIONS (VISIBLE UNIQUEMENT POUR ADMIN) */}
                        {isAdmin() && (
                            <div className="relative border-x border-white/10 px-3">
                                <NotificationBell theme={theme} />
                            </div>
                        )}

                        {/* PANIER */}
                        <button onClick={() => setIsOpen(true)} className="p-3 rounded-2xl bg-white/5 dark:bg-white/5 hover:scale-110 transition-all text-apple-dark dark:text-white relative border border-white/5">
                            <ShoppingBag size={20} />
                            {cart?.totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] w-5 h-5 rounded-lg flex items-center justify-center font-black shadow-lg">
                                    {cart.totalItems}
                                </span>
                            )}
                        </button>

                        {/* COMPTE */}
                        <Link to={isAuthenticated ? "/profile" : "/login"} 
                              className="flex items-center space-x-3 bg-apple-dark dark:bg-indigo-600 text-white pl-2 pr-5 py-2 rounded-2xl font-black text-xs hover:scale-105 transition-all shadow-xl shadow-indigo-500/20">
                            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                                <User size={16} />
                            </div>
                            <span className="hidden sm:block uppercase tracking-tighter">{isAuthenticated ? (user?.firstName || "Profil") : "Login"}</span>
                        </Link>
                        
                        {/* MENU MOBILE */}
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-3 text-apple-dark dark:text-white">
                            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Composant Spotlight Search Global */}
            <SpotlightSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </div>
    );
};

export default Navbar;