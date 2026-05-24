import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, ShoppingBag, Star, ShieldCheck, 
    Truck, RotateCcw, Cpu, MessageCircle, Minus, Plus 
} from 'lucide-react';
import ProductService from '../../services/product.service';
import { useCart } from '../../context/CartContext';
import Button from '../../components/common/Button';
import ProductCard from '../../components/product/ProductCard';

const ProductDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart(); 

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

    if (loading) return <div className="h-screen flex items-center justify-center text-indigo-600 font-bold animate-pulse">EXPÉRIENCE TECHSTORE...</div>;
    if (!product) return <div className="pt-40 text-center text-xl font-bold uppercase opacity-20">Produit introuvable 🍎</div>;

    return (
        <div className="bg-white min-h-screen relative pt-10 md:pt-16">
            <div className="max-w-7xl mx-auto px-6 py-6">
                
                {/* Back button */}
                <button onClick={() => navigate(-1)} className="flex items-center text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-6 transition-all">
                    <ChevronLeft size={16} /> Retour
                </button>

                <div className="flex flex-col lg:flex-row gap-10 lg:gap-20">
                    
                    {/* GAUCHE : VISUELS (Pas d'empilement sur la navbar) */}
                    <div className="w-full lg:w-1/2">
                        <div className="sticky top-32 z-0"> {/* z-0 pour laisser la navbar passer au-dessus ✨ */}
                            <div className="bg-[#f5f5f7] rounded-[2.5rem] p-8 flex items-center justify-center h-[350px] md:h-[500px] overflow-hidden">
                                <motion.img 
                                    key={activeImg}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    src={product.images?.[activeImg]?.url || "https://placehold.co/600"} 
                                    className="max-h-full object-contain mix-blend-multiply transition-transform duration-700 hover:scale-105"
                                />
                            </div>
                            
                            {/* Thumbnails */}
                            <div className="flex justify-center space-x-3 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                                {product.images?.map((img, i) => (
                                    <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-xl p-1 bg-white border-2 transition-all flex-shrink-0 ${activeImg === i ? 'border-indigo-600 shadow-md scale-110' : 'border-slate-100 opacity-40'}`}>
                                        <img src={img.url} className="w-full h-full object-contain" alt="thumb" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* DROITE : CONFIGURATION */}
                    <div className="w-full lg:w-1/2 flex flex-col pt-4">
                        <div className="border-b border-slate-100 pb-8 mb-8">
                            <span className="text-indigo-600 font-black uppercase tracking-widest text-[10px]">{product.brand}</span>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mt-2 mb-4 leading-tight">{product.name}</h1>
                            
                            <div className="flex items-center space-x-3">
                                <div className="bg-yellow-400/10 text-yellow-600 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                                    <Star size={14} fill="currentColor" className="mr-1" /> {product.ratingAvg || '5.0'}
                                </div>
                                <span className={`text-xs font-bold ${product.stockQty > 0 ? "text-green-500" : "text-red-400"}`}>
                                    {product.stockQty > 0 ? "● En stock" : "○ Rupture"}
                                </span>
                            </div>
                        </div>

                        {/* ATTRIBUTS DYNAMIQUES */}
                        <div className="space-y-8 mb-10">
                            {Object.entries(optionsMap).map(([title, values]) => (
                                <div key={title} className="space-y-3">
                                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{title}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {values.map(val => (
                                            <button 
                                                key={val}
                                                onClick={() => handleSelectAttribute(title, val)}
                                                className={`px-5 py-2.5 rounded-2xl text-xs font-bold border-2 transition-all ${selectedAttributes[title] === val ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'border-slate-100 text-slate-500 hover:border-slate-300'}`}
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* QUANTITÉ */}
                        <div className="mb-10 p-5 rounded-3xl bg-slate-50/50 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase text-slate-400">Quantité</span>
                            <div className="flex items-center space-x-4">
                                <button onClick={() => quantity > 1 && setQuantity(quantity-1)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 hover:text-indigo-600 transition-colors"><Minus size={16}/></button>
                                <span className="text-lg font-black">{quantity}</span>
                                <button onClick={() => setQuantity(quantity+1)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 hover:text-indigo-600 transition-colors"><Plus size={16}/></button>
                            </div>
                        </div>

                        {/* PRIX ET ACTIONS (Barre fixe sur mobile ?) */}
                        <div className="mt-auto space-y-4">
                            <div className="flex justify-between items-end p-2">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase opacity-30 tracking-widest">Total</span>
                                    <span className="text-4xl font-black tracking-tighter">{totalPrice.toLocaleString()} F</span>
                                </div>
                                <div onClick={openWhatsApp} className="p-4 bg-green-500 text-white rounded-full cursor-pointer hover:bg-green-600 transition-all shadow-xl shadow-green-200">
                                    <MessageCircle size={24} />
                                </div>
                            </div>
                            <Button onClick={() => addToCart(product.id, currentVariant?.id, quantity)} className="w-full py-5 text-lg uppercase tracking-widest shadow-2xl shadow-indigo-200">
                                Ajouter au sac
                            </Button>
                        </div>
                    </div>
                </div>

                {/* BAS DE PAGE : SPECIFICATIONS */}
                <div className="mt-24 pt-20 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {product.specifications && Object.entries(parseJSON(product.specifications)).map(([key, val]) => (
                        <div key={key}>
                            <p className="text-[10px] font-black uppercase text-indigo-500 mb-2">{key}</p>
                            <p className="text-xl font-bold text-slate-800 leading-tight">{val}</p>
                        </div>
                    ))}
                </div>

                {/* PRODUITS SIMILAIRES */}
                {similarProducts.length > 0 && (
                    <div className="mt-32 pt-20 border-t border-slate-100">
                        <h3 className="text-2xl font-black tracking-tighter mb-12 italic opacity-30">Même Marque.</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {similarProducts.map(p => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;