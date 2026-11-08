import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // 1. On va chercher les infos dans sessionStorage au lieu de localStorage ✨
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(sessionStorage.getItem('techstore_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = sessionStorage.getItem('techstore_user');
        
        if (token && savedUser && savedUser !== "undefined" && savedUser !== "null") {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Erreur session", e);
                sessionStorage.clear();
            }
        }
        setLoading(false);
    }, [token]);

    const login = (userData, userToken) => {
        // 2. On enregistre en sessionStorage : s'effacera à la fermeture du navigateur ! 🪄
        sessionStorage.setItem('techstore_token', userToken);
        sessionStorage.setItem('techstore_user', JSON.stringify(userData));
        
        setToken(userToken);
        setUser(userData);
    };

    const logout = () => {
        // 3. On vide tout proprement
        sessionStorage.clear();
        setUser(null);
        setToken(null);
    };

    const hasPermission = (p) => user?.permissions?.includes(p);
    const isAdmin = () => user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';

    return (
        <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!user, login, logout, hasPermission, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);








import React, { createContext, useState, useContext, useEffect } from 'react';
import CartService from '../services/cart.service';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], totalAmount: 0, totalItems: 0 });
    const [isOpen, setIsOpen] = useState(false);
    const [sessionId] = useState(() => {
        let id = localStorage.getItem('techstore_session_id');
        if (!id) {
            id = 'sess-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('techstore_session_id', id);
        }
        return id;
    });

    const refreshCart = async () => {
        try {
            const res = await CartService.getCart(sessionId);
            if (res && res.status === 'success') {
                setCart(res.data);
            }
        } catch (e) { console.error("Erreur de synchro", e); }
    };

    useEffect(() => { refreshCart(); }, [sessionId]);

    const addToCart = async (productId, variantId = null, quantity = 1) => {
        try {
            const res = await CartService.addToCart({ productId, variantId, quantity }, sessionId);
            if (res.status === 'success') {
                await refreshCart(); // On attend la synchro ✨
                setIsOpen(true);
            }
        } catch (e) { alert("Plus de stock !"); }
    };

    // LOGIQUE DE QUANTITÉ CORRIGÉE ✨
    const updateQty = async (itemId, newQty) => {
        if (newQty < 1) {
            await removeItem(itemId);
            return;
        }
        try {
            // On attend que le serveur dise OK
            const res = await CartService.updateQuantity(itemId, newQty, sessionId);
            if (res.status === 'success') {
                await refreshCart(); // On recharge les prix et le total
            }
        } catch (e) {
            console.error("Erreur de mise à jour quantité", e);
        }
    };

    const removeItem = async (itemId) => {
        try {
            const res = await CartService.removeItem(itemId, sessionId);
            if (res.status === 'success') {
                await refreshCart();
            }
        } catch (e) { console.error(e); }
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeItem, updateQty, isOpen, setIsOpen, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PrivateRoute, AdminRoute } from './ProtectedRoute';

// --- PAGES PUBLIQUES ---
import Home from '../pages/public/Home'; 
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Catalog from '../pages/public/Catalog';
import ProductDetail from '../pages/public/ProductDetail';

// --- PAGES CLIENTS (Privées) ---
import Profile from '../pages/client/Profile';
import MyOrders from '../pages/client/MyOrders';

// --- PAGES ADMINISTRATION (Privées ROLE_ADMIN) ---
import AdminProducts from '../pages/admin/Products';
import AdminUsers from '../pages/admin/Users';
import AdminOrders from '../pages/admin/Orders';
import AdminCategories from '../pages/admin/Categories';

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
            {/* Route par défaut /admin : on arrive sur l'inventaire produits */}
            <Route path="/admin" element={
                <AdminRoute>
                    <AdminProducts /> 
                </AdminRoute>
            } />
            
            <Route path="/admin/products" element={
                <AdminRoute>
                    <AdminProducts />
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

            <Route path="/admin/categories" element={
                <AdminRoute>
                    <AdminCategories />
                </AdminRoute>
            } />

            {/* 4. LE FILET DE SÉCURITÉ (Toujours en dernier !) */}
            <Route path="*" element={
                <div className="pt-60 text-center select-none">
                    <h1 className="text-9xl font-black italic text-apple-dark opacity-5 tracking-tighter">404</h1>
                    <p className="text-xl font-bold text-slate-400 mt-[-40px]">Perdu dans la tech, mon Valdes ? 🍎</p>
                </div>
            } />
        </Routes>
    );
};

export default AppRouter;

import api from '../api/axiosConfig';

const OrderService = {
    // Créer la commande
    createOrder: async (orderData) => {
        const response = await api.post('orders', orderData);
        return response.data; // Renvoie { status: "success", data: { id: ... } }
    },

    // Voir mes commandes (Client)
    getMyOrders: async () => {
        const response = await api.get('orders');
        return response.data; // Renvoie { status: "success", data: [...] }
    }
};

export default OrderService;

import axios from 'axios';

/**
 * Configuration de l'instance Axios pour TechStore
 */
const baseApi = axios.create({
    // On récupère l'URL depuis le .env et on s'assure qu'elle se termine par un slash
    baseURL: import.meta.env.VITE_API_URL.endsWith('/') 
        ? import.meta.env.VITE_API_URL 
        : `${import.meta.env.VITE_API_URL}/`,
    headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// ==========================================
// 🛡️ INTERCEPTEUR DE REQUÊTE
// ==========================================
baseApi.interceptors.request.use(
    (config) => {
        // 1. Récupération du token
        const token = sessionStorage.getItem('techstore_token');
        
        // 2. Vérification si le token existe et n'est pas une chaîne "null"/"undefined"
        if (token && token !== "null" && token !== "undefined") {
            
            // Nettoyage du token (enlève les guillemets superflus si présents)
            const cleanToken = token.replace(/"/g, '');
            
            // Ajout du header Authorization
            config.headers.Authorization = `Bearer ${cleanToken}`;
            
            console.log(`✅ [Axios] Token envoyé pour : ${config.url}`);
        } else {
            console.warn(`⚠️ [Axios] Aucun token trouvé pour la requête : ${config.url}`);
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ==========================================
// 🚨 INTERCEPTEUR DE RÉPONSE
// ==========================================
baseApi.interceptors.response.use(
    (response) => {
        // Si tout va bien, on renvoie juste la réponse
        return response;
    },
    (error) => {
        if (error.response) {
            const status = error.response.status;

            if (status === 403) {
                console.error("🚫 ERREUR 403 : Accès refusé ! L'utilisateur n'est pas ADMIN ou le token est invalide.");
            } else if (status === 401) {
                console.error("🔑 ERREUR 401 : Session expirée ou non connectée. Redirection login ?");
                // Optionnel : localStorage.removeItem('techstore_token'); // Nettoie le mauvais token
            }
        } else if (error.request) {
            console.error("🌐 ERREUR RÉSEAU : Le serveur ne répond pas (vérifie que ton backend sur 8080 est lancé).");
        }
        
        return Promise.reject(error);
    }
);

export default baseApi;

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Link, useNavigate } from 'react-router-dom'; // Import intégré ici
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth } from '../../context/AuthContext';
import AddressService from '../../services/address.service';
import { MapPin, Plus, Trash2, Home, Navigation, Loader2, CheckCircle, X, ShoppingBag, ChevronRight } from 'lucide-react'; // Icônes ajoutées ici
import Button from '../../components/common/Button';

// Fix icône Marqueur pour Leaflet (obligatoire en React)
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Composant pour déplacer la caméra de la carte automatiquement vers la position détectée
const ChangeView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 16);
    }, [center]);
    return null;
};

const Profile = () => {
    const { user, logout } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    
    // Position initiale centrée sur Bafoussam (5.47, 10.41)
    const [mapCenter, setMapCenter] = useState([5.4777, 10.4176]); 
    
    // L'état de l'adresse incluant désormais Latitude et Longitude ✨
    const [newAddr, setNewAddr] = useState({ 
        label: '', 
        street: '', 
        city: '', 
        region: '', 
        phone: '',
        latitude: null,
        longitude: null 
    });

    useEffect(() => { loadAddresses(); }, []);

    // ✨ TRIGGER AUTOMATIQUE : Quand on ouvre le formulaire, on lance la localisation
    useEffect(() => {
        if (showAdd) {
            handleAutoLocate();
        }
    }, [showAdd]);

    const loadAddresses = async () => {
        try {
            const res = await AddressService.getMyAddresses();
            if (res.status === 'success') setAddresses(res.data || []);
        } catch (e) { console.error("Erreur de chargement des adresses", e); }
    };

    const handleAutoLocate = () => {
        if (!navigator.geolocation) return;
        setIsLocating(true);
        
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            await fetchAddressFromCoords(latitude, longitude);
        }, (err) => {
            setIsLocating(false);
            console.warn("L'utilisateur a refusé la géolocalisation");
        });
    };

    const fetchAddressFromCoords = async (lat, lon) => {
        setIsLocating(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await response.json();
            const a = data.address;

            const city = a.city || a.town || a.village || "Bafoussam";
            const region = a.state || "Ouest";
            const street = a.road || a.suburb || a.neighbourhood || "Lieu détecté par GPS";

            setNewAddr(prev => ({
                ...prev,
                street: street,
                city: city,
                region: region,
                phone: prev.phone || user?.phone || "",
                latitude: lat, 
                longitude: lon  
            }));
            setMapCenter([lat, lon]);
        } catch (error) {
            console.error("Erreur API de géocodage", error);
        } finally {
            setIsLocating(false);
        }
    };

    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                fetchAddressFromCoords(e.latlng.lat, e.latlng.lng);
            },
        });
        return <Marker position={mapCenter} />;
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            label: newAddr.label.trim(),
            street: newAddr.street.trim(),
            city: newAddr.city.trim(),
            region: newAddr.region.trim(),
            phone: newAddr.phone.trim(),
            latitude: newAddr.latitude,  
            longitude: newAddr.longitude, 
            country: "Cameroun"
        };

        console.log("📤 Envoi de l'adresse au serveur Spring Boot :", payload);

        try {
            const res = await AddressService.addAddress(payload);
            if(res.status === 'success') {
                setShowAdd(false);
                setNewAddr({ label: '', street: '', city: '', region: '', phone: '', latitude: null, longitude: null });
                loadAddresses();
                alert("Super ! Ton point de livraison est enregistré ! 🏠✨");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Erreur lors de l'enregistrement.";
            alert("Erreur : " + errorMsg);
        }
    };

    if (!user) return <div className="h-screen flex items-center justify-center font-bold italic opacity-20">Connexion en cours...</div>;

    return (
        <div className="max-w-7xl mx-auto px-6 py-16 animate-in fade-in duration-1000">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* 1. CARTE PROFIL (GAUCHE) */}
                <div className="space-y-6">
                    <div className="bg-[#111421] text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group border border-white/5">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/30 transition-all"></div>
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-indigo-500 rounded-3xl flex items-center justify-center text-3xl font-black mb-8 shadow-xl">
                                {user.firstName?.charAt(0)}
                            </div>
                            <h2 className="text-3xl font-black italic tracking-tighter leading-tight">{user.firstName} <br/> {user.lastName}</h2>
                            <p className="opacity-40 text-xs font-mono mt-4 tracking-widest">{user.email}</p>
                            <div className="mt-4 inline-flex items-center text-[9px] font-black text-indigo-400 bg-white/5 px-4 py-2 rounded-full uppercase">
                                <CheckCircle size={12} className="mr-2"/> Accès {user.role} actif
                            </div>
                            
                            {/* BOUTON SUIVRE MES COMMANDES (Placé correctement) ✨ */}
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <Link 
                                    to="/my-orders" 
                                    className="flex items-center justify-between w-full p-4 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg text-white"
                                >
                                    <div className="flex items-center space-x-3">
                                        <ShoppingBag size={20} />
                                        <span className="text-sm">Suivre mes commandes</span>
                                    </div>
                                    <ChevronRight size={16} />
                                </Link>
                            </div>

                            <button onClick={logout} className="block mt-8 text-[10px] font-black uppercase text-red-500 hover:text-red-400 transition-all border-b border-red-500/20 pb-1">Se déconnecter</button>
                        </div>
                    </div>
                </div>

                {/* 2. GESTION ADRESSES (DROITE) */}
                <div className="lg:col-span-2 space-y-12">
                    <div className="flex justify-between items-center px-4">
                        <div>
                            <h3 className="text-4xl font-black italic tracking-tighter text-slate-900 leading-none">Adresses.</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Mes zones de livraison</p>
                        </div>
                        <button 
                            onClick={() => setShowAdd(!showAdd)} 
                            className={`p-5 rounded-full shadow-2xl transition-all hover:scale-110 ${showAdd ? 'bg-red-500 text-white rotate-45' : 'bg-indigo-600 text-white shadow-indigo-100'}`}
                        >
                            <Plus size={30} strokeWidth={3}/>
                        </button>
                    </div>

                    {showAdd && (
                        <div className="bg-slate-50 p-6 md:p-12 rounded-[3.5rem] border border-slate-200 shadow-inner space-y-10 animate-in slide-in-from-top-12 duration-500">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest flex items-center bg-white px-5 py-2.5 rounded-full shadow-sm">
                                    {isLocating ? <Loader2 className="animate-spin mr-2" size={14}/> : <Navigation className="mr-2" size={14}/>}
                                    {isLocating ? "Acquisition GPS..." : "Localisation temps réel"}
                                </span>
                                <button onClick={() => setShowAdd(false)} className="text-slate-300 hover:text-red-500 transition-colors p-2"><X size={28}/></button>
                            </div>

                            <div className="h-80 w-full rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl relative z-0">
                                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <ChangeView center={mapCenter} />
                                    <MapClickHandler />
                                </MapContainer>
                            </div>

                            <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-black ml-5 uppercase opacity-30">Libellé (Ex: Maison, Travail)</label>
                                    <input className="w-full p-5 rounded-2xl bg-white border-none font-black text-slate-800 outline-none focus:ring-4 focus:ring-indigo-600/5 shadow-sm" value={newAddr.label} onChange={e=>setNewAddr({...newAddr, label:e.target.value})} required placeholder="ex: Domicile de Valdes"/>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-black ml-5 uppercase opacity-30 text-indigo-500">Adresse / Rue identifiée</label>
                                    <input className="w-full p-5 rounded-2xl bg-white border-none font-bold text-indigo-600 shadow-sm" value={newAddr.street} onChange={e=>setNewAddr({...newAddr, street:e.target.value})} required/>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[9px] font-black ml-5 uppercase opacity-30">Numéro de téléphone</label>
                                    <input placeholder="6xx xxx xxx" className="p-5 rounded-2xl bg-white border-none font-bold text-slate-700 shadow-sm" value={newAddr.phone} onChange={e=>setNewAddr({...newAddr, phone:e.target.value})} required/>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[9px] font-black ml-5 uppercase opacity-30">Ville de livraison</label>
                                    <input placeholder="Ville" className="p-5 rounded-2xl bg-white border-none font-bold text-slate-700 shadow-sm" value={newAddr.city} readOnly/>
                                </div>
                                
                                <div className="md:col-span-2 pt-6">
                                    <Button type="submit" className="w-full py-6 text-base font-black shadow-2xl shadow-indigo-100 uppercase tracking-widest">Enregistrer l'emplacement</Button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
                        {addresses.map(addr => (
                            <div key={addr.id} className="p-8 rounded-[3rem] bg-white border border-slate-50 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden border-t-8 border-t-indigo-600">
                                <div className="flex justify-between items-start mb-10 relative z-10">
                                    <div className="p-4 bg-slate-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                        <Home size={24}/>
                                    </div>
                                    <button onClick={() => { if(window.confirm("Bébé, on efface cette zone ?")) AddressService.deleteAddress(addr.id).then(()=>loadAddresses()); }} className="text-slate-200 hover:text-red-500 transition-colors p-2">
                                        <Trash2 size={24}/>
                                    </button>
                                </div>
                                <div className="relative z-10">
                                    <h4 className="font-black text-slate-400 uppercase text-[10px] tracking-tighter mb-1 italic">{addr.label}</h4>
                                    <p className="font-black text-2xl text-slate-800 leading-tight tracking-tighter">{addr.street}</p>
                                    <p className="text-sm font-bold text-indigo-500 mt-2">{addr.city} • {addr.region}</p>
                                    <div className="flex space-x-2 mt-4 opacity-30 font-mono text-[9px] font-black italic">
                                        <span>LAT: {addr.latitude?.toFixed(4) || 'N/A'}</span>
                                        <span>LON: {addr.longitude?.toFixed(4) || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="absolute right-0 bottom-0 opacity-[0.03] -mb-10 -mr-10 group-hover:scale-110 transition-transform">
                                    <MapPin size={250}/>
                                </div>
                            </div>
                        ))}
                    </div>

                    {!showAdd && addresses.length === 0 && (
                        <div className="py-28 text-center border-4 border-dashed border-slate-100 rounded-[4rem] bg-slate-50/10">
                            <div className="p-8 bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <MapPin size={40} className="text-slate-200" strokeWidth={1}/>
                            </div>
                            <p className="font-black italic text-2xl text-slate-200">Votre carnet est encore vide, Valdes.</p>
                            <p className="text-sm text-slate-300 mt-2 font-medium">Ajoutez un lieu de livraison pour passer votre commande.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;