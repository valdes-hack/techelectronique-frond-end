import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, ShoppingBag, Star, ShieldCheck, 
    Truck, RotateCcw, Cpu, MessageCircle, Minus, Plus 
} from 'lucide-react';
import ProductService from '../../services/product.service';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import ProductCard from '../../components/product/ProductCard';
import { getFullImageUrl } from '../../utils/imageUtils';

const ProductDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart(); 
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [currentVariant, setCurrentVariant] = useState(null);

    const parseJSON = (str) => { try { return JSON.parse(str); } catch (e) { return {}; } };

    useEffect(() => {
        const fetchAllInfo = async () => {
            setLoading(true);
            try {
                const res = await ProductService.getBySlug(slug);
                if (res && res.status === 'success') {
                    const data = res.data;
                    setProduct(data);

                    if (data.variants && data.variants.length > 0) {
                        const firstVariant = data.variants[0];
                        setCurrentVariant(firstVariant);
                        setSelectedAttributes(parseJSON(firstVariant.attributes));
                    }

                    // Charger produits de la même marque
                    const allRes = await ProductService.getAll(0, 20);
                    if (allRes && allRes.status === 'success') {
                        const list = allRes.data.content || allRes.data || [];
                        setSimilarProducts(list.filter(p => p.brand === data.brand && p.id !== data.id).slice(0, 4));
                    }
                }
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchAllInfo();
        window.scrollTo(0, 0);
    }, [slug]);

    // Extraction dynamique des options (Gigas, Couleurs...)
    const optionsMap = useMemo(() => {
        if (!product?.variants) return {};
        const map = {};
        product.variants.forEach(v => {
            const attrs = parseJSON(v.attributes);
            Object.entries(attrs).forEach(([key, value]) => {
                if (!map[key]) map[key] = new Set();
                map[key].add(value);
            });
        });
        Object.keys(map).forEach(key => map[key] = Array.from(map[key]));
        return map;
    }, [product]);

    const handleSelectAttribute = (key, value) => {
        const newSelected = { ...selectedAttributes, [key]: value };
        setSelectedAttributes(newSelected);
        const match = product.variants.find(v => {
            const vAttrs = parseJSON(v.attributes);
            return Object.entries(newSelected).every(([k, val]) => vAttrs[k] === val);
        });
        if (match) setCurrentVariant(match);
    };

    const unitPrice = currentVariant ? currentVariant.price : (product?.discountPrice || product?.basePrice || 0);
    const totalPrice = unitPrice * quantity;

    const openWhatsApp = () => {
        const msg = encodeURIComponent(`Bonjour TechStore ! Je souhaite commander : ${product.name} (${quantity} unité(s)).`);
        window.open(`https://wa.me/237686669222?text=${msg}`, '_blank');
    };

    

    // Images display array
    const displayImages = useMemo(() => {
        if (!product) return [];
        let imgs = [];
        if (product.images && product.images.length > 0) {
            imgs = product.images.map(img => getFullImageUrl(img.url));
        } else if (product.imageUrl) {
            imgs = [getFullImageUrl(product.imageUrl)];
        } else {
            imgs = [getFullImageUrl(null)];
        }
        return imgs;
    }, [product]);

    if (loading) return (
        <div className={`min-h-screen flex items-center justify-center font-bold animate-pulse ${isDark ? 'bg-[#0b0e14] text-indigo-400' : 'bg-white text-indigo-600'}`}>
            EXPÉRIENCE TECHSTORE...
        </div>
    );
    
    if (!product) return (
        <div className={`min-h-screen pt-40 text-center text-xl font-bold uppercase opacity-20 ${isDark ? 'bg-[#0b0e14] text-white' : 'bg-white text-black'}`}>
            Produit introuvable 🍎
        </div>
    );

    return (
        <div className={`min-h-screen relative pt-24 md:pt-32 pb-20 transition-colors duration-500 ${isDark ? 'bg-[#0b0e14] text-white' : 'bg-[#F5F5F7] text-slate-900'}`}>
            <div className="max-w-7xl mx-auto px-6">
                
                {/* Back button */}
                <button onClick={() => navigate(-1)} className={`flex items-center hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-8 transition-all ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <ChevronLeft size={16} /> Retour au catalogue
                </button>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
                    
                    {/* GAUCHE : VISUELS */}
                    <div className="w-full lg:w-1/2">
                        <div className="sticky top-32 z-0">
                            <div className={`rounded-[3rem] p-8 md:p-12 flex items-center justify-center h-[400px] md:h-[550px] overflow-hidden transition-colors ${isDark ? 'bg-[#161926] border border-white/5 shadow-2xl shadow-black/50' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/50'}`}>
                                <AnimatePresence mode="wait">
                                    <motion.img 
                                        key={activeImg}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        transition={{ duration: 0.4 }}
                                        src={displayImages[activeImg]} 
                                        className="w-full h-full object-contain hover:scale-[2] cursor-zoom-in transition-transform duration-200 ease-out"
                                        onMouseMove={(e) => {
                                            const { left, top, width, height } = e.target.getBoundingClientRect();
                                            const x = ((e.clientX - left) / width) * 100;
                                            const y = ((e.clientY - top) / height) * 100;
                                            e.target.style.transformOrigin = `${x}% ${y}%`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transformOrigin = "center center";
                                        }}
                                        onError={(e) => { 
                                            e.target.onerror = null; 
                                            e.target.src = "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=600"; 
                                        }}
                                    />
                                </AnimatePresence>
                            </div>
                            
                            {/* Thumbnails */}
                            {displayImages.length > 1 && (
                                <div className="flex justify-center space-x-4 mt-8 overflow-x-auto pb-4 custom-scrollbar">
                                    {displayImages.map((img, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => setActiveImg(i)} 
                                            className={`w-20 h-20 rounded-2xl p-2 transition-all flex-shrink-0 border-2 overflow-hidden ${
                                                activeImg === i 
                                                ? 'border-indigo-600 shadow-lg shadow-indigo-500/20 scale-110' 
                                                : isDark ? 'border-white/5 bg-[#161926] opacity-50 hover:opacity-100' : 'border-slate-200 bg-white opacity-60 hover:opacity-100'
                                            }`}
                                        >
                                            <img src={img} className="w-full h-full object-contain" alt={`Miniature ${i}`} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DROITE : CONFIGURATION */}
                    <div className="w-full lg:w-1/2 flex flex-col pt-4">
                        <div className={`border-b pb-8 mb-8 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-indigo-500 font-black uppercase tracking-widest text-[10px]">{product.brand || 'Premium'}</span>
                                <div className="flex items-center space-x-1 bg-yellow-400/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold">
                                    <Star size={14} fill="currentColor" /> <span>{product.ratingAvg?.toFixed(1) || '5.0'}</span>
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mt-2 mb-4 leading-none">{product.name}</h1>
                            
                            <p className={`text-sm font-bold mt-4 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {product.description || "Découvrez la perfection technologique. Un design affiné, des performances exceptionnelles et une expérience utilisateur inégalée."}
                            </p>
                        </div>

                        {/* ATTRIBUTS DYNAMIQUES */}
                        <div className="space-y-8 mb-10">
                            {Object.entries(optionsMap).map(([title, values]) => (
                                <div key={title} className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{title}</h3>
                                        <span className={`text-[10px] font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedAttributes[title]}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {values.map(val => {
                                            const isSelected = selectedAttributes[title] === val;
                                            return (
                                                <button 
                                                    key={val}
                                                    onClick={() => handleSelectAttribute(title, val)}
                                                    className={`px-6 py-3 rounded-2xl text-xs font-bold border-2 transition-all ${
                                                        isSelected 
                                                        ? (isDark ? 'bg-white border-white text-black shadow-lg shadow-white/10' : 'bg-slate-900 border-slate-900 text-white shadow-lg') 
                                                        : (isDark ? 'border-white/10 text-slate-400 hover:border-white/30 hover:text-white' : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-900')
                                                    }`}
                                                >
                                                    {val}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* QUANTITÉ */}
                        <div className={`mb-10 p-6 rounded-[2rem] flex items-center justify-between border ${isDark ? 'bg-[#161926] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                            <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Quantité</span>
                            <div className="flex items-center space-x-6">
                                <button onClick={() => quantity > 1 && setQuantity(quantity-1)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-50 hover:bg-slate-200 text-slate-900'}`}><Minus size={16}/></button>
                                <span className="text-2xl font-black">{quantity}</span>
                                <button onClick={() => setQuantity(quantity+1)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-50 hover:bg-slate-200 text-slate-900'}`}><Plus size={16}/></button>
                            </div>
                        </div>

                        {/* PRIX ET ACTIONS */}
                        <div className={`mt-auto p-8 rounded-[2.5rem] border ${isDark ? 'bg-indigo-600/10 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-100'} space-y-6`}>
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Prix Total</span>
                                    <span className="text-4xl md:text-5xl font-black tracking-tighter leading-none">{totalPrice.toLocaleString()} F</span>
                                </div>
                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${product.stockQty > 0 ? (isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600") : "bg-red-500/20 text-red-400"}`}>
                                    {product.stockQty > 0 ? "En Stock" : "Rupture"}
                                </span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button onClick={() => addToCart(product.id, currentVariant?.id, quantity)} className="flex-1 py-5 text-sm uppercase tracking-widest shadow-2xl shadow-indigo-500/30">
                                    Ajouter au panier
                                </Button>
                                <button onClick={openWhatsApp} className={`p-5 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 shadow-xl ${isDark ? 'bg-[#161926] text-green-400 border border-white/5' : 'bg-white text-green-500 border border-slate-100'}`}>
                                    <MessageCircle size={24} />
                                </button>
                            </div>
                        </div>

                        {/* RÉASSURANCE */}
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className={`flex items-center p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                <Truck size={16} className="mr-3 text-indigo-500" /> Livraison Express
                            </div>
                            <div className={`flex items-center p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                <ShieldCheck size={16} className="mr-3 text-indigo-500" /> Garantie 1 an
                            </div>
                        </div>

                    </div>
                </div>

                {/* BAS DE PAGE : SPECIFICATIONS */}
                {product.specifications && Object.keys(parseJSON(product.specifications)).length > 0 && (
                    <div className={`mt-24 pt-20 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                        <div className="mb-12">
                            <h2 className="text-4xl font-black italic tracking-tighter">Fiche technique<span className="text-indigo-500">.</span></h2>
                            <p className={`text-xs font-bold uppercase tracking-widest mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Les détails qui comptent.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
                            {Object.entries(parseJSON(product.specifications)).map(([key, val]) => (
                                <div key={key} className={`p-6 rounded-[2rem] border ${isDark ? 'bg-[#161926] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-3">{key}</p>
                                    <p className="text-lg font-bold leading-snug">{val}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PRODUITS SIMILAIRES */}
                {similarProducts.length > 0 && (
                    <div className={`mt-24 pt-20 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                        <div className="mb-12 flex justify-between items-end">
                            <div>
                                <h3 className="text-4xl font-black tracking-tighter italic">Pour aller plus loin<span className="text-indigo-500">.</span></h3>
                                <p className={`text-xs font-bold uppercase tracking-widest mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Même marque, même excellence.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {similarProducts.map(p => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;