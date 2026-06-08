import React, { useState, useCallback, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import NotificationBell from './NotificationBell'; 
import { ListFilter, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AdminLayout = ({ children, filters }) => {
    // ---------------------------------------------------------
    // 1. ÉTATS : STRUCTURE & RÉACTIVITÉ
    // ---------------------------------------------------------
    const [sideWidth, setSideWidth] = useState(260);
    const [filterWidth, setFilterWidth] = useState(320);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(true);

    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // ---------------------------------------------------------
    // 2. LOGIQUE DE REDIMENSIONNEMENT DYNAMIQUE
    // ---------------------------------------------------------
    const startResizeLeft = useCallback((e) => {
        e.preventDefault();
        const onMove = (m) => {
            if (m.clientX >= 80 && m.clientX <= 400) setSideWidth(m.clientX);
        };
        const onUp = () => window.removeEventListener('mousemove', onMove);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, []);

    const startResizeRight = useCallback((e) => {
        e.preventDefault();
        const onMove = (m) => {
            const newWidth = window.innerWidth - m.clientX;
            if (newWidth >= 280 && newWidth <= 500) setFilterWidth(newWidth);
        };
        const onUp = () => window.removeEventListener('mousemove', onMove);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, []);

    // Responsive : Fermeture auto des filtres si l'écran est petit
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1280) setIsFilterOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className={`flex h-screen overflow-hidden transition-all duration-500 ${
            isDark ? 'bg-[#0b0e14] text-gray-300' : 'bg-[#f4f7fe] text-slate-700'
        }`}>
            
            {/* OVERLAY FLOU (Z-INDEX 140) */}
            {(isMobileNavOpen || (isFilterOpen && filters && window.innerWidth < 1024)) && (
                <div 
                    onClick={() => { setIsMobileNavOpen(false); setIsFilterOpen(false); }} 
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-[140] lg:hidden animate-in fade-in duration-300" 
                />
            )}
            
            {/* SEGMENT 1 : NAVIGATION GAUCHE */}
            <AdminSidebar 
                width={sideWidth} 
                setWidth={setSideWidth}
                onResize={startResizeLeft}
                isMobileOpen={isMobileNavOpen}
                setIsMobileOpen={setIsMobileNavOpen}
            />

            {/* SEGMENT 2 : ZONE CENTRALE (DASHBOARD) */}
            <div className="flex-1 flex flex-col min-w-0 relative h-full">
                
                {/* HEADER SUPÉRIEUR (GÉRER TEMPS RÉEL) */}
                <header className={`flex justify-between items-center p-4 lg:px-8 border-b transition-all ${
                    isDark ? 'bg-[#0b0e14]/50 border-white/5' : 'bg-white/80 border-slate-200'
                } backdrop-blur-md z-30`}>
                    
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setIsMobileNavOpen(true)} className="lg:hidden p-2.5 bg-indigo-600/10 text-indigo-500 rounded-xl">
                            <Menu size={22}/>
                        </button>
                        <h1 className="font-black italic tracking-tighter text-indigo-500 text-2xl select-none uppercase">AdminHub</h1>
                    </div>

                    <div className="flex items-center space-x-4 md:space-x-8">
                        {/* 🔔 HUB TEMPS RÉEL (Produits, Commandes, Fournisseurs) */}
                        <NotificationBell />

                        {/* TOGGLE FILTRES */}
                        {filters && (
                            <button 
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                                    isFilterOpen 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                                    : 'bg-indigo-600/10 text-indigo-500 hover:bg-indigo-600/20'
                                }`}
                            >
                                <ListFilter size={16} />
                                <span className="hidden sm:inline">{isFilterOpen ? 'Fermer' : 'Filtres'}</span>
                            </button>
                        )}
                    </div>
                </header>

                {/* CONTENU DE LA PAGE (MAIN) */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 custom-scrollbar scroll-smooth">
                    {children}
                </main>
            </div>

            {/* SEGMENT 3 : PANNEAU DES FILTRES (DROIT) */}
            {filters && isFilterOpen && (
                <aside 
                    style={{ width: `${filterWidth}px` }}
                    className={`fixed lg:relative top-0 right-0 z-[150] h-full flex flex-col transition-all duration-300 border-l animate-in slide-in-from-right-full ${
                        isDark ? 'bg-[#111421] border-white/5 shadow-2xl' : 'bg-white border-gray-200 shadow-xl'
                    }`}
                >
                    {/* Poignée de redimensionnement Desktop */}
                    <div 
                        onMouseDown={startResizeRight} 
                        className="absolute left-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-indigo-500 transition-colors hidden lg:block z-50" 
                    />
                    
                    <div className="p-8 flex flex-col h-full overflow-hidden">
                        {/* Injection dynamique de la logique de filtrage par page */}
                        {React.cloneElement(filters, { 
                            onClose: () => setIsFilterOpen(false)
                        })}
                    </div>
                </aside>
            )}
        </div>
    );
};

export default AdminLayout;