import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, ChevronDown, Package, Sun, Moon, Settings, LogOut } from 'lucide-react';
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

    const { isAuthenticated, user, isAdmin, logout } = useAuth();
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

    // Fermer menu mobile au changement de route
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsProductsOpen(false);
    }, [location.pathname]);

    // Bloquer scroll body quand menu mobile ouvert
    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    if (location.pathname.startsWith('/admin')) return null;

    const isDark = theme === 'dark';
    const siteName = settings?.siteName || 'TechStore';
    const siteInitial = siteName.charAt(0).toUpperCase();

    const navLinks = [
        { to: '/', label: 'Accueil' },
        { to: '/catalog', label: 'Boutique' },
    ];

    return (
        <>
            <div className="fixed top-0 w-full z-[100] transition-all duration-500 px-0 md:px-5 pt-0 md:pt-3">
                <nav className={`mx-auto max-w-7xl transition-all duration-500 ${
                    isScrolled
                        ? 'md:rounded-2xl bg-white dark:bg-[#0b0e14] border border-gray-100 dark:border-white/5 shadow-lg shadow-black/5 py-3 px-4 md:px-6'
                        : 'bg-transparent py-4 px-4 md:px-2'
                }`}>
                    <div className="flex items-center justify-between gap-3 md:gap-6">

                        {/* ── LOGO ── */}
                        <Link to="/" className="flex items-center gap-2 shrink-0 group">
                            <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                                <span className="font-bold text-base md:text-lg">{siteInitial}</span>
                            </div>
                            <span className="text-base md:text-lg font-bold text-apple-dark dark:text-white uppercase tracking-wide hidden sm:block">
                                {siteName}
                            </span>
                        </Link>

                        {/* ── NAV CENTRALE (desktop) ── */}
                        <div className="hidden lg:flex items-center bg-gray-50 dark:bg-white/5 rounded-full px-2 py-1 border border-transparent dark:border-white/5 shrink-0">
                            {navLinks.map(({ to, label }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded-full ${
                                        location.pathname === to
                                            ? 'text-indigo-600 bg-white dark:bg-white/10 shadow-sm'
                                            : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600'
                                    }`}
                                >
                                    {label}
                                </Link>
                            ))}

                            {/* Dropdown Rayons */}
                            <div
                                className="relative"
                                onMouseEnter={() => setIsProductsOpen(true)}
                                onMouseLeave={() => setIsProductsOpen(false)}
                            >
                                <button className="flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition-colors">
                                    Rayons
                                    <ChevronDown size={13} className={`transition-transform duration-300 ${isProductsOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isProductsOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 8 }}
                                            transition={{ duration: 0.18 }}
                                            className="absolute top-full left-0 mt-2 w-60 bg-white dark:bg-[#161926] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 p-2 overflow-hidden"
                                        >
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-500 px-3 pt-2 pb-1">Parcourir</p>
                                            {categories.map((cat) => (
                                                <Link
                                                    key={cat.id}
                                                    to={`/category/${cat.slug}`}
                                                    onClick={() => setIsProductsOpen(false)}
                                                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-indigo-500/10 text-sm font-bold text-apple-dark/80 dark:text-white/80 transition-all group/item"
                                                >
                                                    <Package size={15} className="text-indigo-500 opacity-50 group-hover/item:opacity-100 shrink-0" />
                                                    <span className="truncate">{cat.name}</span>
                                                </Link>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* ── RECHERCHE (desktop & tablette) ── */}
                        <div
                            className="hidden md:flex flex-1 max-w-xs lg:max-w-sm relative group cursor-pointer"
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-dark/30 dark:text-white/20 group-hover:text-indigo-500 transition-colors" />
                            <div className="w-full bg-apple-dark/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl py-2.5 px-10 text-xs font-bold text-gray-400 hover:bg-apple-dark/10 dark:hover:bg-white/10 transition-all flex justify-between items-center">
                                <span>Rechercher...</span>
                                <span className="hidden lg:flex items-center gap-1 text-[10px] font-black bg-white dark:bg-white/10 px-2 py-0.5 rounded-md shadow-sm border dark:border-white/5">
                                    <span className="text-base leading-none">⌘</span> K
                                </span>
                            </div>
                        </div>

                        {/* ── ACTIONS DROITE ── */}
                        <div className="flex items-center gap-1 sm:gap-2">

                            {/* Recherche icône — mobile uniquement */}
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="md:hidden p-2.5 rounded-xl text-apple-dark dark:text-white hover:bg-apple-dark/5 dark:hover:bg-white/5 transition-colors"
                                aria-label="Rechercher"
                            >
                                <Search size={20} />
                            </button>

                            {/* Theme toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2.5 rounded-xl bg-apple-dark/5 dark:bg-white/5 hover:scale-110 transition-all text-apple-dark dark:text-white border border-white/5"
                                aria-label="Changer le thème"
                            >
                                {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
                            </button>

                            {/* Admin — tablette+ */}
                            {isAdmin() && (
                                <Link
                                    to="/admin"
                                    className="hidden sm:flex items-center gap-1.5 bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 px-3 py-2 rounded-xl font-bold text-[10px] hover:scale-105 transition-transform border border-indigo-500/10 uppercase tracking-widest"
                                >
                                    <Settings size={14} />
                                    <span className="hidden md:block">Gestion</span>
                                </Link>
                            )}

                            {/* Notifications admin */}
                            {isAdmin() && (
                                <div className="relative hidden sm:block border-x border-white/10 px-2">
                                    <NotificationBell theme={theme} />
                                </div>
                            )}

                            {/* Panier */}
                            <button
                                onClick={() => setIsOpen(true)}
                                className="p-2.5 rounded-xl bg-apple-dark/5 dark:bg-white/5 hover:scale-110 transition-all text-apple-dark dark:text-white relative border border-white/5"
                                aria-label="Panier"
                            >
                                <ShoppingBag size={19} />
                                {cart?.totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[9px] w-4 h-4 rounded-md flex items-center justify-center font-black shadow-lg">
                                        {cart.totalItems > 9 ? '9+' : cart.totalItems}
                                    </span>
                                )}
                            </button>

                            {/* Compte — caché sur mobile (dans le menu mobile à la place) */}
                            <Link
                                to={isAuthenticated ? "/profile" : "/login"}
                                className="hidden sm:flex items-center gap-2 bg-apple-dark dark:bg-indigo-600 text-white pl-2 pr-4 py-2 rounded-xl font-black text-xs hover:scale-105 transition-all shadow-lg shadow-indigo-500/20"
                            >
                                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                                    <User size={14} />
                                </div>
                                <span className="hidden md:block uppercase tracking-tighter">
                                    {isAuthenticated ? (user?.firstName || "Profil") : "Login"}
                                </span>
                            </Link>

                            {/* Déconnexion rapide — tablette+ */}
                            {isAuthenticated && (
                                <button
                                    onClick={() => { logout(); navigate('/'); }}
                                    className="hidden sm:flex p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all text-red-500"
                                    aria-label="Se déconnecter"
                                >
                                    <LogOut size={17} />
                                </button>
                            )}

                            {/* Burger menu — mobile uniquement */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2.5 rounded-xl text-apple-dark dark:text-white hover:bg-apple-dark/5 dark:hover:bg-white/5 transition-colors"
                                aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div
                                        key={isMobileMenuOpen ? 'close' : 'open'}
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                                    </motion.div>
                                </AnimatePresence>
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            {/* ══════════════════════════════════════
                MENU MOBILE — DRAWER FULL SCREEN
            ══════════════════════════════════════ */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="mobile-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm lg:hidden"
                        />

                        {/* Drawer depuis le haut */}
                        <motion.div
                            key="mobile-menu"
                            initial={{ opacity: 0, y: -16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                            className={`fixed top-0 left-0 right-0 z-[95] lg:hidden pt-20 pb-8 px-5 rounded-b-[2rem] border-b shadow-2xl ${
                                isDark
                                    ? 'bg-[#0d1019] border-white/5'
                                    : 'bg-white border-gray-100'
                            }`}
                        >
                            {/* Liens principaux */}
                            <div className="space-y-1 mb-6">
                                {navLinks.map(({ to, label }) => (
                                    <Link
                                        key={to}
                                        to={to}
                                        className={`flex items-center justify-between px-4 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-colors ${
                                            location.pathname === to
                                                ? 'bg-indigo-600 text-white'
                                                : isDark
                                                    ? 'text-white/80 hover:bg-white/5'
                                                    : 'text-slate-800 hover:bg-gray-50'
                                        }`}
                                    >
                                        {label}
                                        {location.pathname === to && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                                        )}
                                    </Link>
                                ))}

                                {/* Rayons (accordéon mobile) */}
                                <div>
                                    <button
                                        onClick={() => setIsProductsOpen(!isProductsOpen)}
                                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-colors ${
                                            isDark ? 'text-white/80 hover:bg-white/5' : 'text-slate-800 hover:bg-gray-50'
                                        }`}
                                    >
                                        Rayons
                                        <ChevronDown size={16} className={`transition-transform duration-300 ${isProductsOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isProductsOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className={`mx-2 mt-1 mb-2 rounded-2xl overflow-hidden border ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                                                    {categories.map((cat) => (
                                                        <Link
                                                            key={cat.id}
                                                            to={`/category/${cat.slug}`}
                                                            className={`flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors ${
                                                                isDark
                                                                    ? 'text-white/70 hover:bg-white/5 hover:text-white'
                                                                    : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
                                                            }`}
                                                        >
                                                            <Package size={14} className="text-indigo-500 shrink-0" />
                                                            {cat.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Séparateur */}
                            <div className={`h-px mb-5 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />

                            {/* Actions utilisateur */}
                            <div className="space-y-3">
                                <Link
                                    to={isAuthenticated ? "/profile" : "/login"}
                                    className="flex items-center gap-3 px-4 py-3.5 bg-apple-dark dark:bg-indigo-600 text-white rounded-2xl font-black text-sm hover:opacity-90 active:scale-95 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                        <User size={16} />
                                    </div>
                                    {isAuthenticated ? (user?.firstName || "Mon Profil") : "Se connecter"}
                                </Link>

                                {isAdmin() && (
                                    <Link
                                        to="/admin"
                                        className="flex items-center gap-3 px-4 py-3.5 bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 rounded-2xl font-black text-sm border border-indigo-500/10 hover:opacity-90 transition-opacity"
                                    >
                                        <Settings size={16} />
                                        Tableau de bord
                                    </Link>
                                )}

                                {isAuthenticated && (
                                    <button
                                        onClick={() => { logout(); navigate('/'); setIsMobileMenuOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3.5 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl font-black text-sm hover:opacity-90 transition-opacity"
                                    >
                                        <LogOut size={16} />
                                        Se déconnecter
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Spotlight Search */}
            <SpotlightSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
};

export default Navbar;