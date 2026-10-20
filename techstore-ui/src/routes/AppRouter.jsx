import React, { Suspense, lazy } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { PrivateRoute, AdminRoute } from './ProtectedRoute';

// ─── SKELETON LOADER UNIVERSEL POUR PAGES PUBLIQUES ET CLIENTS ───────────────
const PageSkeleton = () => (
    <div className="min-h-screen bg-apple-white dark:bg-[#0b0e14] py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="space-y-3">
            <div className="h-8 bg-gray-200 dark:bg-white/5 rounded-2xl w-48" />
            <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-xl w-72" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-[#161926] rounded-3xl p-4 space-y-4 border border-transparent dark:border-white/5">
                    <div className="aspect-square bg-gray-200 dark:bg-white/5 rounded-2xl" />
                    <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-xl w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-xl w-1/2" />
                </div>
            ))}
        </div>
    </div>
);

// ─── SKELETON ADMIN (GARANTIT QUE LA SIDEBAR NE DISPARAÎT JAMAIS LORS D'UN CHANGEMENT D'ONGLET) ─
const AdminSkeleton = () => (
    <div className="flex h-screen overflow-hidden bg-[#0b0e14] text-gray-300">
        {/* Sidebar squelette fixe à gauche */}
        <div style={{ width: '260px' }} className="h-full border-r border-white/5 bg-[#111421] p-6 space-y-6 hidden lg:flex flex-col shrink-0">
            <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 animate-pulse" />
                <div className="space-y-1.5">
                    <div className="h-4 bg-white/10 rounded w-20 animate-pulse" />
                    <div className="h-2 bg-white/5 rounded w-14 animate-pulse" />
                </div>
            </div>
            <div className="space-y-2 pt-4 flex-1">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="h-11 bg-white/5 rounded-2xl animate-pulse" />
                ))}
            </div>
        </div>

        {/* Zone centrale */}
        <div className="flex-1 flex flex-col min-w-0">
            <div className="h-16 border-b border-white/5 bg-[#0b0e14]/50 flex items-center justify-between px-8">
                <div className="h-5 bg-white/10 rounded-lg w-28 animate-pulse" />
                <div className="h-8 bg-white/10 rounded-xl w-24 animate-pulse" />
            </div>
            <div className="p-8 space-y-6 flex-1 overflow-hidden">
                <div className="h-8 bg-white/10 rounded-2xl w-64 animate-pulse" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-[#161926] border border-white/5 rounded-3xl p-5 animate-pulse space-y-3">
                            <div className="h-3 bg-white/10 rounded w-1/3" />
                            <div className="h-6 bg-white/10 rounded w-1/2" />
                        </div>
                    ))}
                </div>
                <div className="h-72 bg-[#161926] border border-white/5 rounded-[2.5rem] animate-pulse" />
            </div>
        </div>
    </div>
);

// ─── PAGES PUBLIQUES (lazy) ───────────────────────────────────────────────────
const Home          = lazy(() => import('../pages/public/Home'));
const Login         = lazy(() => import('../pages/auth/Login'));
const Register      = lazy(() => import('../pages/auth/Register'));
const Catalog       = lazy(() => import('../pages/public/Catalog'));
const Promotions    = lazy(() => import('../pages/public/Promotions'));
const ProductDetail = lazy(() => import('../pages/public/ProductDetail'));
const CheckoutPage  = lazy(() => import('../pages/public/CheckoutPage'));
const TrackOrder    = lazy(() => import('../pages/public/TrackOrder'));

// ─── PAGES CLIENT (lazy) ─────────────────────────────────────────────────────
const Profile  = lazy(() => import('../pages/client/Profile'));
const MyOrders = lazy(() => import('../pages/client/MyOrders'));

// ─── PAGES ADMIN (lazy) ──────────────────────────────────────────────────────
const Dashboard      = lazy(() => import('../pages/admin/Dashboard'));
const AdminProducts  = lazy(() => import('../pages/admin/Products'));
const AdminPromotions= lazy(() => import('../pages/admin/Promotions'));
const AdminCategories= lazy(() => import('../pages/admin/Categories'));
const AdminSuppliers = lazy(() => import('../pages/admin/Suppliers'));
const StockSupply    = lazy(() => import('../pages/admin/StockSupply'));
const AdminUsers     = lazy(() => import('../pages/admin/Users'));
const AdminOrders    = lazy(() => import('../pages/admin/Orders'));
const AdminSettings  = lazy(() => import('../pages/admin/Settings'));
const HistoryPage    = lazy(() => import('../pages/admin/HistoryPage'));
const StatsPage      = lazy(() => import('../pages/admin/StatsPage'));

const AppRouter = () => {
    return (
        <Routes>
            {/* 1. ROUTES PUBLIQUES */}
            <Route path="/" element={<Suspense fallback={<PageSkeleton />}><Home /></Suspense>} />
            <Route path="/login" element={<Suspense fallback={<PageSkeleton />}><Login /></Suspense>} />
            <Route path="/register" element={<Suspense fallback={<PageSkeleton />}><Register /></Suspense>} />
            <Route path="/catalog" element={<Suspense fallback={<PageSkeleton />}><Catalog /></Suspense>} />
            <Route path="/promotions" element={<Suspense fallback={<PageSkeleton />}><Promotions /></Suspense>} />
            <Route path="/category/:slug" element={<Suspense fallback={<PageSkeleton />}><Catalog /></Suspense>} />
            <Route path="/product/:slug" element={<Suspense fallback={<PageSkeleton />}><ProductDetail /></Suspense>} />
            <Route path="/checkout" element={<Suspense fallback={<PageSkeleton />}><CheckoutPage /></Suspense>} />
            <Route path="/track" element={<Suspense fallback={<PageSkeleton />}><TrackOrder /></Suspense>} />

            {/* 2. ESPACE CLIENT */}
            <Route path="/profile" element={<PrivateRoute><Suspense fallback={<PageSkeleton />}><Profile /></Suspense></PrivateRoute>} />
            <Route path="/my-orders" element={<PrivateRoute><Suspense fallback={<PageSkeleton />}><MyOrders /></Suspense></PrivateRoute>} />

            {/* 3. CENTRE DE CONTRÔLE ADMIN AVEC SUSPENSE DÉDIÉ (SIDEBAR PERSISTANTE) */}
            <Route path="/admin" element={<AdminRoute><Suspense fallback={<AdminSkeleton />}><Dashboard /></Suspense></AdminRoute>} />
            <Route path="/admin/dashboard" element={<AdminRoute><Suspense fallback={<AdminSkeleton />}><Dashboard /></Suspense></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><Suspense fallback={<AdminSkeleton />}><AdminProducts /></Suspense></AdminRoute>} />
            <Route path="/admin/promotions" element={<AdminRoute><Suspense fallback={<AdminSkeleton />}><AdminPromotions /></Suspense></AdminRoute>} />
            <Route path="/admin/stock" element={<AdminRoute><Suspense fallback={<AdminSkeleton />}><StockSupply /></Suspense></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><Suspense fallback={<AdminSkeleton />}><AdminCategories /></Suspense></AdminRoute>} />
            <Route path="/admin/suppliers" element={<AdminRoute><Suspense fallback={<AdminSkeleton />}><AdminSuppliers /></Suspense></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><Suspense fallback={<AdminSkeleton />}><AdminUsers /></Suspense></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><Suspense fallback={<AdminSkeleton />}><AdminOrders /></Suspense></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><Suspense fallback={<AdminSkeleton />}><AdminSettings /></Suspense></AdminRoute>} />
            <Route path="/admin/history" element={<AdminRoute><Suspense fallback={<AdminSkeleton />}><HistoryPage /></Suspense></AdminRoute>} />
            <Route path="/admin/stats" element={<AdminRoute><Suspense fallback={<AdminSkeleton />}><StatsPage /></Suspense></AdminRoute>} />

            {/* 4. PAGE 404 */}
            <Route path="*" element={
                <div className="pt-60 text-center select-none bg-white dark:bg-[#0b0e14] min-h-screen">
                    <h1 className="text-9xl font-black italic text-gray-900 dark:text-white opacity-5 tracking-tighter">404</h1>
                    <p className="text-xl font-bold text-slate-400 mt-[-40px]">Perdu dans la tech ? 🍎</p>
                    <Link to="/" className="mt-8 inline-block text-indigo-500 font-bold hover:underline text-sm">
                        Retourner à l'accueil
                    </Link>
                </div>
            } />
        </Routes>
    );
};

export default AppRouter;