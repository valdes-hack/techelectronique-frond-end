import React from 'react';
import { 
    LayoutDashboard, Box, Users, ShoppingCart, 
    BarChart3, Settings, Sun, Moon, Zap, History,
    ChevronLeft, ChevronRight, X, Layers, Truck, PackagePlus, LogOut, Globe 
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ width, setWidth, isMobileOpen, setIsMobileOpen }) => {
    const { theme, toggleTheme } = useTheme();
    const { logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const isCollapsed = width < 140;

    const toggleCollapse = () => {
        setWidth(isCollapsed ? 260 : 80);
    };

    const menuItems = [
        { icon: <LayoutDashboard size={22}/>, label: "Dashboard", path: "/admin" },
        { icon: <Box size={22}/>, label: "Produits", path: "/admin/products" },
        { icon: <PackagePlus size={22}/>, label: "Ravitaillement", path: "/admin/stock" },
        { icon: <Layers size={22}/>, label: "Catégories", path: "/admin/categories" },
        { icon: <Truck size={22}/>, label: "Fournisseurs", path: "/admin/suppliers" },
        { icon: <Users size={22}/>, label: "Utilisateurs", path: "/admin/users" },
        { icon: <ShoppingCart size={22}/>, label: "Commandes", path: "/admin/orders" },
        { icon: <History size={22}/>, label: "Historique", path: "/admin/history" },
        { icon: <BarChart3 size={22}/>, label: "Statistiques", path: "/admin/stats" },
        { icon: <Settings size={22}/>, label: "Paramètres", path: "/admin/settings" },
    ];

    const sidebarClasses = `
        fixed lg:relative z-[150] h-full transition-all duration-300 border-r
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${theme === 'dark' ? 'bg-[#111421] border-white/5' : 'bg-white border-gray-200'}
    `;

    return (
        <>
            {/* Overlay Mobile */}
            {isMobileOpen && (
                <div 
                    onClick={() => setIsMobileOpen(false)} 
                    className="fixed inset-0 bg-black/60 z-[140] lg:hidden backdrop-blur-sm animate-in fade-in duration-300" 
                />
            )}

            <aside style={{ width: `${width}px` }} className={sidebarClasses}>
                
                {/* Bouton Rétractation (Desktop) */}
                <button 
                    onClick={toggleCollapse}
                    className="hidden lg:flex absolute -right-3 top-20 bg-[#6366f1] text-white rounded-full p-1 shadow-lg z-50 hover:scale-110 transition-transform"
                >
                    {isCollapsed ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>}
                </button>

                {/* LOGO */}
                <div className={`p-6 flex items-center justify-between ${isCollapsed ? 'lg:justify-center' : 'space-x-3'}`}>
                    <div className="flex items-center space-x-3">
                        <div className="bg-[#6366f1] p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                            <Zap size={22} fill="white" />
                        </div>
                        {(!isCollapsed || isMobileOpen) && (
                            <span className={`text-xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                                AdminHub
                            </span>
                        )}
                    </div>
                    <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-2 opacity-50"><X size={20}/></button>
                </div>

                {/* NAVIGATION */}
                <nav className="flex-1 px-3 mt-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => (
                        <Link 
                            key={item.path} 
                            to={item.path}
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center rounded-2xl p-3.5 transition-all ${
                                location.pathname === item.path 
                                ? 'bg-[#6366f1] text-white shadow-lg shadow-indigo-500/30' 
                                : theme === 'dark' ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5' : 'text-slate-500 hover:bg-gray-100'
                            } ${isCollapsed && !isMobileOpen ? 'lg:justify-center' : 'space-x-4'}`}
                        >
                            {item.icon}
                            {(!isCollapsed || isMobileOpen) && (
                                <span className="text-sm font-bold tracking-tight">{item.label}</span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* FOOTER SIDEBAR */}
                <div className={`p-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                    <Link 
                        to="/"
                        className={`flex items-center w-full p-3 rounded-xl hover:bg-emerald-500/10 text-emerald-500 transition-all mb-2 ${isCollapsed && !isMobileOpen ? 'justify-center' : 'space-x-3'}`}
                    >
                        <Globe size={20} />
                        {(!isCollapsed || isMobileOpen) && (
                            <span className="text-sm font-bold">Retour au site</span>
                        )}
                    </Link>

                    <button 
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }} 
                        className={`flex items-center w-full p-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-all mb-2 ${isCollapsed && !isMobileOpen ? 'justify-center' : 'space-x-3'}`}
                    >
                        <LogOut size={20} />
                        {(!isCollapsed || isMobileOpen) && (
                            <span className="text-sm font-bold">Déconnexion</span>
                        )}
                    </button>

                    <button 
                        onClick={toggleTheme} 
                        className={`flex items-center w-full p-3 rounded-xl hover:bg-white/5 transition-all ${isCollapsed && !isMobileOpen ? 'justify-center' : 'space-x-3'}`}
                    >
                        {theme === 'dark' ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20} className="text-indigo-600"/>}
                        {(!isCollapsed || isMobileOpen) && (
                            <span className="text-sm font-bold ml-3">Mode {theme === 'dark' ? 'Clair' : 'Sombre'}</span>
                        )}
                    </button>
                    
                    <div className={`mt-4 p-3 rounded-2xl flex items-center ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'} ${isCollapsed && !isMobileOpen ? 'justify-center' : 'space-x-3'}`}>
                        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">V</div>
                        {(!isCollapsed || isMobileOpen) && (
                            <div className="overflow-hidden ml-3">
                                <p className={`text-[10px] font-black truncate uppercase ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Valdes Admin</p>
                                <p className="text-[9px] opacity-40 truncate">Propriétaire</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* POIGNÉE DE REDIMENSIONNEMENT */}
                <div 
                    onMouseDown={(e) => {
                        const onMove = (moveEvent) => setWidth(Math.max(80, Math.min(moveEvent.clientX, 350)));
                        const onUp = () => window.removeEventListener('mousemove', onMove);
                        window.addEventListener('mousemove', onMove);
                        window.addEventListener('mouseup', onUp);
                    }} 
                    className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-[#6366f1] transition-all hidden lg:block" 
                />
            </aside>
        </>
    );
};

export default AdminSidebar;