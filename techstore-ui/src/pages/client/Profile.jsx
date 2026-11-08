import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Link, useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth } from '../../context/AuthContext';
import AddressService from '../../services/address.service';
import api from '../../api/axiosConfig';
import { 
    MapPin, Plus, Trash2, Home, Navigation, Loader2, CheckCircle, 
    X, ShoppingBag, ChevronRight, Star, FileText, Package, Clock, 
    Printer, ExternalLink, Sparkles
} from 'lucide-react';
import Button from '../../components/common/Button';

// Fix icône Marqueur pour Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 16);
    }, [center]);
    return null;
};

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Onglets du compte client
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'reviews' | 'addresses'

    // ── Commandes ──
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // ── Avis et Notes ──
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    // ── Adresses ──
    const [addresses, setAddresses] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [mapCenter, setMapCenter] = useState([5.4777, 10.4176]); 
    const [newAddr, setNewAddr] = useState({ 
        label: '', 
        street: '', 
        city: '', 
        region: '', 
        phone: '',
        latitude: null, 
        longitude: null 
    });

    useEffect(() => {
        loadAddresses();
        loadOrders();
        loadReviews();
    }, []);

    useEffect(() => {
        if (showAdd) handleAutoLocate();
    }, [showAdd]);

    const loadOrders = async () => {
        setLoadingOrders(true);
        try {
            const res = await api.get('/orders');
            if (res.data && res.data.status === 'success') {
                setOrders(res.data.data || []);
            }
        } catch (e) {
            console.error("Erreur chargement commandes", e);
        } finally {
            setLoadingOrders(false);
        }
    };

    const loadReviews = async () => {
        setLoadingReviews(true);
        try {
            const res = await api.get('/reviews/me');
            if (res.data && res.data.status === 'success') {
                setReviews(res.data.data || []);
            }
        } catch (e) {
            console.error("Erreur chargement avis", e);
        } finally {
            setLoadingReviews(false);
        }
    };

    const loadAddresses = async () => {
        try {
            const res = await AddressService.getMyAddresses();
            if (res.status === 'success') setAddresses(res.data || []);
        } catch (e) { 
            console.error("Erreur de chargement des adresses", e); 
        }
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

        try {
            const res = await AddressService.addAddress(payload);
            if(res.status === 'success') {
                setShowAdd(false);
                setNewAddr({ label: '', street: '', city: '', region: '', phone: '', latitude: null, longitude: null });
                loadAddresses();
                alert("Votre point de livraison a été enregistré avec succès !");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Erreur lors de l'enregistrement.";
            alert("Erreur : " + errorMsg);
        }
    };

    if (!user) return <div className="h-screen flex items-center justify-center font-bold italic opacity-20">Connexion en cours...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                
                {/* ── 1. COLONNE GAUCHE : CARTE IDENTITÉ CLIENT ── */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#111421] text-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-white/5">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/30 transition-all" />
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-3xl font-black mb-6 shadow-xl shadow-indigo-600/30">
                                {user.firstName?.charAt(0)}
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter leading-tight">
                                {user.firstName} <br/> {user.lastName}
                            </h2>
                            <p className="opacity-50 text-xs font-mono mt-3 tracking-widest">{user.email}</p>
                            
                            <div className="mt-4 inline-flex items-center text-[10px] font-black text-indigo-400 bg-white/5 px-4 py-1.5 rounded-full uppercase tracking-wider border border-white/5">
                                <CheckCircle size={12} className="mr-2 text-emerald-400"/> Compte {user.role || 'Client'}
                            </div>

                            {/* Statistiques Rapides */}
                            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-white/10">
                                <div className="p-3 bg-white/5 rounded-2xl text-center">
                                    <span className="text-xl font-black text-white block">{orders.length}</span>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Achats</span>
                                </div>
                                <div className="p-3 bg-white/5 rounded-2xl text-center">
                                    <span className="text-xl font-black text-amber-400 block">{reviews.length}</span>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Avis & Notes</span>
                                </div>
                            </div>

                            <button
                                onClick={logout}
                                className="block w-full mt-8 text-center text-xs font-black uppercase tracking-wider text-red-400 hover:text-red-300 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 transition-all border border-red-500/20"
                            >
                                Se déconnecter
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── 2. COLONNE DROITE : ONGLETS & SECTIONS GÉRÉES ── */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Navigation par Onglets */}
                    <div className="flex border-b border-gray-200 dark:border-white/10 overflow-x-auto no-scrollbar gap-2 sm:gap-4 pb-2">
                        {[
                            { id: 'orders', label: 'Commandes & Factures', icon: ShoppingBag, count: orders.length },
                            { id: 'reviews', label: 'Mes Notes & Avis', icon: Star, count: reviews.length },
                            { id: 'addresses', label: 'Adresses de livraison', icon: MapPin, count: addresses.length }
                        ].map(t => {
                            const Icon = t.icon;
                            const isCurrent = activeTab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id)}
                                    className={`flex items-center gap-2 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                                        isCurrent
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                            : 'text-gray-500 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                                    }`}
                                >
                                    <Icon size={16} />
                                    <span>{t.label}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                        isCurrent ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-400'
                                    }`}>
                                        {t.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* ── SECTION 1 : COMMANDES & FACTURES ── */}
                    {activeTab === 'orders' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">
                                        Historique des Commandes & Factures
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Consultez vos reçus d'achat et imprimez vos factures officielles PEOC.
                                    </p>
                                </div>
                            </div>

                            {loadingOrders ? (
                                <div className="py-12 flex items-center justify-center text-gray-500">
                                    <Loader2 size={24} className="animate-spin text-indigo-600 mr-2" />
                                    <span className="text-xs font-bold">Chargement de vos commandes...</span>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="p-12 text-center rounded-[2.5rem] bg-gray-50 dark:bg-[#161926] border border-gray-100 dark:border-white/5 space-y-4">
                                    <Package size={48} className="text-gray-400 mx-auto" />
                                    <h4 className="text-base font-black text-slate-800 dark:text-white">Aucun achat enregistré</h4>
                                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                                        Parcourez les rayons et couveuses pour passer votre première commande.
                                    </p>
                                    <Link to="/catalog" className="inline-block px-6 py-3 rounded-full bg-indigo-600 text-white text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors">
                                        Voir le catalogue
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map(order => (
                                        <div
                                            key={order.id}
                                            onClick={() => navigate(`/my-orders/${order.id}`)}
                                            className="p-6 rounded-[2rem] bg-white dark:bg-[#161926] border border-gray-100 dark:border-white/5 shadow-xl hover:shadow-2xl hover:border-indigo-500/30 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                                                    <FileText size={22} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-mono font-black text-slate-400">
                                                            N° {order.orderNumber || order.id}
                                                        </span>
                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                            order.status === 'LIVRE' || order.status === 'COMPLETED'
                                                                ? 'bg-emerald-500/10 text-emerald-500'
                                                                : 'bg-indigo-500/10 text-indigo-500'
                                                        }`}>
                                                            {order.status || 'Confirmée'}
                                                        </span>
                                                    </div>
                                                    <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
                                                        {(order.totalAmount || 0).toLocaleString('fr-FR')} FCFA
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                                                        <Clock size={11} /> {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : 'Date récente'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-white/5">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/my-orders/${order.id}`);
                                                    }}
                                                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                                                >
                                                    <Printer size={13} /> Facture
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── SECTION 2 : MES NOTES & AVIS ── */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">
                                        Mes Notes & Avis sur mes Achats
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Retrouvez les évaluations et retours d'expérience que vous avez partagés.
                                    </p>
                                </div>
                            </div>

                            {loadingReviews ? (
                                <div className="py-12 flex items-center justify-center text-gray-500">
                                    <Loader2 size={24} className="animate-spin text-amber-500 mr-2" />
                                    <span className="text-xs font-bold">Chargement de vos avis...</span>
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="p-12 text-center rounded-[2.5rem] bg-gray-50 dark:bg-[#161926] border border-gray-100 dark:border-white/5 space-y-4">
                                    <Star size={48} className="text-amber-400 mx-auto" />
                                    <h4 className="text-base font-black text-slate-800 dark:text-white">Aucun avis rédigé</h4>
                                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                                        Lorsque vous recevez un produit, vous pouvez lui attribuer une note depuis le détail de votre commande.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map(review => (
                                        <div
                                            key={review.id}
                                            className="p-6 rounded-[2rem] bg-white dark:bg-[#161926] border border-gray-100 dark:border-white/5 shadow-xl space-y-2.5"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                                    {review.authorName || 'Produit noté'}
                                                </h4>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            className={i < (review.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-700'}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {review.title && (
                                                <p className="text-xs font-bold text-indigo-500 italic">
                                                    « {review.title} »
                                                </p>
                                            )}

                                            {review.body && (
                                                <p className="text-xs text-gray-600 dark:text-gray-400 font-normal leading-relaxed">
                                                    {review.body}
                                                </p>
                                            )}

                                            <div className="pt-2 text-[10px] text-gray-400 flex items-center justify-between border-t border-gray-50 dark:border-white/5">
                                                <span>Avis certifié acheteur</span>
                                                <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString('fr-FR') : ''}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── SECTION 3 : ADRESSES DE LIVRAISON ── */}
                    {activeTab === 'addresses' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">
                                        Adresses de Livraison
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Vos points de livraison géolocalisés par GPS</p>
                                </div>
                                <button 
                                    onClick={() => setShowAdd(!showAdd)} 
                                    className={`p-3.5 rounded-2xl shadow-xl transition-all ${
                                        showAdd ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'
                                    }`}
                                >
                                    {showAdd ? <X size={20} /> : <Plus size={20} />}
                                </button>
                            </div>

                            {/* Formulaire Carte GPS */}
                            {showAdd && (
                                <div className="bg-slate-50 dark:bg-[#161926] p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-inner space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest flex items-center bg-white dark:bg-white/5 px-4 py-2 rounded-full shadow-sm">
                                            {isLocating ? <Loader2 className="animate-spin mr-2" size={13}/> : <Navigation className="mr-2" size={13}/>}
                                            {isLocating ? "Acquisition GPS..." : "Position GPS"}
                                        </span>
                                    </div>

                                    <div className="h-64 w-full rounded-2xl overflow-hidden border-4 border-white dark:border-white/10 shadow-lg relative z-0">
                                        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                            <ChangeView center={mapCenter} />
                                            <MapClickHandler />
                                        </MapContainer>
                                    </div>

                                    <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Libellé (Ex: Ferme, Domicile)</label>
                                            <input 
                                                className="w-full p-3.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500" 
                                                value={newAddr.label} 
                                                onChange={e => setNewAddr({...newAddr, label: e.target.value})} 
                                                required 
                                                placeholder="ex: Ferme avicole de Valdes"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-black uppercase text-indigo-500 block mb-1">Adresse détectée</label>
                                            <input 
                                                className="w-full p-3.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold text-indigo-600 dark:text-indigo-400 outline-none" 
                                                value={newAddr.street} 
                                                onChange={e => setNewAddr({...newAddr, street: e.target.value})} 
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Téléphone de contact</label>
                                            <input 
                                                placeholder="6xx xxx xxx" 
                                                className="w-full p-3.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white outline-none" 
                                                value={newAddr.phone} 
                                                onChange={e => setNewAddr({...newAddr, phone: e.target.value})} 
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Ville</label>
                                            <input 
                                                className="w-full p-3.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white outline-none" 
                                                value={newAddr.city} 
                                                readOnly
                                            />
                                        </div>
                                        <div className="md:col-span-2 pt-2">
                                            <Button type="submit" className="w-full py-4 text-xs font-black uppercase tracking-wider">
                                                Enregistrer cette adresse
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Liste des adresses */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.map(addr => (
                                    <div key={addr.id} className="p-6 rounded-[2rem] bg-white dark:bg-[#161926] border border-gray-100 dark:border-white/5 shadow-xl relative overflow-hidden group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-indigo-50 dark:bg-white/5 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                                <Home size={18} />
                                            </div>
                                            <button 
                                                onClick={() => { 
                                                    if(window.confirm("Supprimer cette adresse de livraison ?")) {
                                                        AddressService.deleteAddress(addr.id).then(() => loadAddresses());
                                                    }
                                                }} 
                                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <h4 className="font-black text-slate-400 uppercase text-[10px] tracking-wider mb-1">
                                            {addr.label}
                                        </h4>
                                        <p className="font-black text-base text-slate-800 dark:text-white leading-tight">
                                            {addr.street}
                                        </p>
                                        <p className="text-xs font-bold text-indigo-500 mt-1">
                                            {addr.city} • {addr.region}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {!showAdd && addresses.length === 0 && (
                                <div className="py-16 text-center border-2 border-dashed border-gray-200 dark:border-white/5 rounded-[2.5rem]">
                                    <MapPin size={36} className="text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-gray-500">Aucune adresse enregistrée</p>
                                    <p className="text-xs text-gray-400 mt-1">Ajoutez un lieu de livraison pour vos futures commandes.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
