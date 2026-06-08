import React from 'react';
// ✨ AJOUT DE "Link" DANS L'IMPORT CI-DESSOUS ✨
import { Routes, Route, Link } from 'react-router-dom';
import { PrivateRoute, AdminRoute } from './ProtectedRoute';

// --- PAGES PUBLIQUES ---
import Home from '../pages/public/Home'; 
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Catalog from '../pages/public/Catalog';
import ProductDetail from '../pages/public/ProductDetail';
import CheckoutPage from '../pages/public/CheckoutPage';

// --- PAGES CLIENTS (Privées) ---
import Profile from '../pages/client/Profile';
import MyOrders from '../pages/client/MyOrders';

// --- PAGES ADMINISTRATION (Privées ROLE_ADMIN) ---
import Dashboard from '../pages/admin/Dashboard'; 
import AdminProducts from '../pages/admin/Products';
import AdminCategories from '../pages/admin/Categories';
import AdminSuppliers from '../pages/admin/Suppliers';
import StockSupply from '../pages/admin/StockSupply';
import AdminUsers from '../pages/admin/Users';
import AdminOrders from '../pages/admin/Orders';
import AdminSettings from '../pages/admin/Settings';

const AppRouter = () => {
    return (
        <Routes>
            {/* 1. ROUTES PUBLIQUES */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/category/:slug" element={<Catalog />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* 2. ESPACE CLIENT (Nécessite connexion) */}
            <Route path="/profile" element={
                <PrivateRoute>
                    <Profile />
                </PrivateRoute>
            } />
            <Route path="/my-orders" element={
                <PrivateRoute>
                    <MyOrders />
                </PrivateRoute>
            } />

            {/* 3. CENTRE DE CONTRÔLE ADMIN (Nécessite ROLE_ADMIN) */}
            <Route path="/admin" element={
                <AdminRoute>
                    <Dashboard /> 
                </AdminRoute>
            } />
            
            <Route path="/admin/dashboard" element={
                <AdminRoute>
                    <Dashboard />
                </AdminRoute>
            } />

            <Route path="/admin/products" element={
                <AdminRoute>
                    <AdminProducts />
                </AdminRoute>
            } />

            <Route path="/admin/stock" element={
                <AdminRoute>
                    <StockSupply />
                </AdminRoute>
            } />

            <Route path="/admin/categories" element={
                <AdminRoute>
                    <AdminCategories />
                </AdminRoute>
            } />

            <Route path="/admin/suppliers" element={
                <AdminRoute>
                    <AdminSuppliers />
                </AdminRoute>
            } />

            <Route path="/admin/users" element={
                <AdminRoute>
                    <AdminUsers />
                </AdminRoute>
            } />

            <Route path="/admin/orders" element={
                <AdminRoute>
                    <AdminOrders />
                </AdminRoute>
            } />

            <Route path="/admin/settings" element={
                <AdminRoute>
                    <AdminSettings />
                </AdminRoute>
            } />

            {/* 4. LE FILET DE SÉCURITÉ (404) */}
            <Route path="*" element={
                <div className="pt-60 text-center select-none bg-white dark:bg-apple-dark min-h-screen">
                    <h1 className="text-9xl font-black italic text-apple-dark dark:text-white opacity-5 tracking-tighter">404</h1>
                    <p className="text-xl font-bold text-slate-400 mt-[-40px]">Perdu dans la tech, mon Valdes ? 🍎</p>
                    <Link to="/" className="mt-8 inline-block text-apple-blue font-bold hover:underline text-sm">
                        Retourner à l'accueil
                    </Link>
                </div>
            } />
        </Routes>
    );
};

export default AppRouter;