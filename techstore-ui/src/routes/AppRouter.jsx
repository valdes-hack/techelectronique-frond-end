import React, { Suspense, lazy } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { PrivateRoute, AdminRoute } from './ProtectedRoute';

// ─── SKELETON LOADER UNIVERSEL (Style YouTube / Skeleton fluide, AUCUN rond qui tourne) ─────
const PageSkeleton = () => (
    <div className="min-h-screen bg-apple-white dark:bg-[#0b0e14] py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-8 animate-pulse">
        {/* Top header placeholder */}
        <div className="space-y-3">
            <div className="h-8 bg-gray-200 dark:bg-white/5 rounded-2xl w-48" />
            <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-xl w-72" />
        </div>

        {/* Content grid placeholder */}
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
        <Suspense fallback={<PageSkeleton />}>
            <Routes>
                {/* 1. ROUTES PUBLIQUES */}
                <Route path="/"                element={<Home />} />
                <Route path="/login"           element={<Login />} />
                <Route path="/register"        element={<Register />} />
                <Route path="/catalog"         element={<Catalog />} />
                <Route path="/promotions"      element={<Promotions />} />
                <Route path="/category/:slug"  element={<Catalog />} />
                <Route path="/product/:slug"   element={<ProductDetail />} />
                <Route path="/checkout"        element={<CheckoutPage />} />
                <Route path="/track"           element={<TrackOrder />} />

                {/* 2. ESPACE CLIENT */}
                <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/my-orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />

                {/* 3. CENTRE DE CONTRÔLE ADMIN */}
                <Route path="/admin"                element={<AdminRoute><Dashboard /></AdminRoute>} />
                <Route path="/admin/dashboard"      element={<AdminRoute><Dashboard /></AdminRoute>} />
                <Route path="/admin/products"       element={<AdminRoute><AdminProducts /></AdminRoute>} />
                <Route path="/admin/promotions"     element={<AdminRoute><AdminPromotions /></AdminRoute>} />
                <Route path="/admin/stock"          element={<AdminRoute><StockSupply /></AdminRoute>} />
                <Route path="/admin/categories"     element={<AdminRoute><AdminCategories /></AdminRoute>} />
                <Route path="/admin/suppliers"      element={<AdminRoute><AdminSuppliers /></AdminRoute>} />
                <Route path="/admin/users"          element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin/orders"         element={<AdminRoute><AdminOrders /></AdminRoute>} />
                <Route path="/admin/settings"       element={<AdminRoute><AdminSettings /></AdminRoute>} />
                <Route path="/admin/history"        element={<AdminRoute><HistoryPage /></AdminRoute>} />
                <Route path="/admin/stats"          element={<AdminRoute><StatsPage /></AdminRoute>} />

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
        </Suspense>
    );
};

export default AppRouter;