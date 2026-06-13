import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import {
    ChevronRight, Zap, ShieldCheck, Truck, Headphones, Star,
    Award, Clock, ArrowRight, Flame, TrendingUp, Tag, Mail,
    CheckCircle, X, ChevronLeft, Play
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductService from '../../services/product.service';
import { useAppContext } from '../../context/AppContext';
import { getFullImageUrl } from '../../utils/imageUtils';

/* ─────────────────────────────────────────────
   HOOKS UTILITAIRES
───────────────────────────────────────────── */

// Compteur animé
const useCounter = (target, duration = 2000, start = false) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start || target === 0) return;
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, start, duration]);
    return count;
};

// Countdown timer
const useCountdown = (targetHours = 8) => {
    const [time, setTime] = useState({ h: targetHours, m: 0, s: 0 });
    useEffect(() => {
        const end = Date.now() + targetHours * 3600 * 1000;
        const tick = () => {
            const diff = Math.max(0, end - Date.now());
            setTime({
                h: Math.floor(diff / 3600000),
                m: Math.floor((diff % 3600000) / 60000),
                s: Math.floor((diff % 60000) / 1000),
            });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);
    return time;
};

/* ─────────────────────────────────────────────
   SOUS-COMPOSANTS
───────────────────────────────────────────── */

const getProductImage = (p) => {
    if (!p) return "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=600";
    if (p.mainImageUrl) {
        return p.mainImageUrl;
    }
    if (p.imageUrl) {
        return getFullImageUrl(p.imageUrl);
    } else if (p.images && p.images.length > 0) {
        const primaryImg = p.images.find(img => img.isPrimary) || p.images[0];
        if (primaryImg && primaryImg.url) {
            return getFullImageUrl(primaryImg.url);
        }
    }
    return "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=600";
};

// Carte produit réutilisable
const ProductCard = ({ prod, index = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
    >
        <Link
            to={`/product/${prod.slug}`}
            className="group flex flex-col border border-gray-100 dark:border-white/5 rounded-[1.75rem] p-4 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-500 bg-white dark:bg-[#161926] h-full"
        >
            <div className="h-44 sm:h-48 w-full rounded-[1.25rem] overflow-hidden mb-4 bg-gray-50 dark:bg-[#111421] relative flex items-center justify-center">
                <img
                    src={getProductImage(prod)}
                    alt={prod.name}
                    className="h-[80%] w-auto object-contain group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                />
                {prod.discountPrice && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full">
                        -{Math.round((1 - prod.discountPrice / prod.basePrice) * 100)}%
                    </div>
                )}
                {prod.isNew && (
                    <div className="absolute top-2 left-2 bg-indigo-500 text-white text-[10px] font-black px-2 py-1 rounded-full">
                        NEW
                    </div>
                )}
            </div>
            <div className="flex-1 flex flex-col">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{prod.brand}</p>
                <h3 className="font-bold text-sm text-apple-dark dark:text-white line-clamp-2 leading-snug flex-1">{prod.name}</h3>
                <div className="flex items-center gap-1 mt-2 mb-3">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={10}
                            className={i < Math.round(prod.ratingAvg || 4.5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}
                        />
                    ))}
                    <span className="text-[10px] text-gray-400 ml-1">({prod.reviewCount || 0})</span>
                </div>
                <div className="flex items-center gap-2">
                    <p className="font-black text-indigo-500">{(prod.discountPrice || prod.basePrice)?.toLocaleString()} F</p>
                    {prod.discountPrice && (
                        <p className="text-xs text-gray-400 line-through">{prod.basePrice?.toLocaleString()} F</p>
                    )}
                </div>
            </div>
        </Link>
    </motion.div>
);

// Section header réutilisable
const SectionHeader = ({ label, title, subtitle, linkTo, linkText = "Voir tout" }) => (
    <div className="flex items-start sm:items-center justify-between mb-10 flex-col sm:flex-row gap-3">
        <div>
            {label && (
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2 block">{label}</span>
            )}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter text-apple-dark dark:text-white leading-tight">{title}</h2>
            {subtitle && <p className="text-apple-dark/50 dark:text-white/50 mt-2 text-sm sm:text-base">{subtitle}</p>}
        </div>
        {linkTo && (
            <Link
                to={linkTo}
                className="shrink-0 text-xs font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-400 flex items-center gap-1 group transition-colors"
            >
                {linkText}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        )}
    </div>
);

// Carte témoignage
const TestimonialCard = ({ name, role, text, rating, avatar }) => (
    <div className="border border-gray-100 dark:border-white/5 rounded-[1.75rem] p-6 bg-white dark:bg-[#161926] flex flex-col gap-4 h-full">
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
            ))}
        </div>
        <p className="text-sm text-apple-dark/70 dark:text-white/60 leading-relaxed flex-1">"{text}"</p>
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-white/5">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm flex-shrink-0">
                {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : name[0]}
            </div>
            <div>
                <p className="font-black text-sm text-apple-dark dark:text-white">{name}</p>
                <p className="text-[10px] font-medium text-gray-400">{role}</p>
            </div>
        </div>
    </div>
);

/* ─────────────────────────────────────────────
   COMPOSANT PRINCIPAL
───────────────────────────────────────────── */

const Home = () => {
    const { settings } = useAppContext();
    const siteName = settings?.siteName || "TechStore";

    const { scrollYProgress } = useScroll();
    const yHero = useTransform(scrollYProgress, [0, 0.4], [0, 120]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

    const statsRef = useRef(null);
    const statsInView = useInView(statsRef, { once: true });

    const [stats, setStats] = useState({ products: 0, categories: 0 });
    const [groupedCategories, setGroupedCategories] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [flashSaleProducts, setFlashSaleProducts] = useState([]);
    const [heroProducts, setHeroProducts] = useState([]);
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
    const [loading, setLoading] = useState(true);

    const countdown = useCountdown(8);

    const productsCount = useCounter(stats.products, 1800, statsInView);
    const categoriesCount = useCounter(stats.categories, 1200, statsInView);

    // Image dynamiques pour le Bento Grid extraites des produits réels
    const appleImg = getProductImage(allProducts.find(p => p.brand?.toLowerCase() === 'apple')) || "https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&w=1200&q=80";
    const audioImg = getProductImage(allProducts.find(p => p.slug?.includes('airpods') || p.name?.toLowerCase().includes('airpods') || p.slug?.includes('audio') || p.name?.toLowerCase().includes('audio'))) || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80";
    const laptopImg = getProductImage(allProducts.find(p => p.category?.slug === 'laptops' || p.slug?.includes('macbook') || p.slug?.includes('laptop'))) || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80";
    const gamingImg = getProductImage(allProducts.find(p => p.slug?.includes('playstation') || p.slug?.includes('gaming') || p.slug?.includes('ps5'))) || "https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=600&q=80";

    // Slides hero — images récupérées dynamiquement via produits ou fallback Unsplash queries
    const heroSlides = [];

    if (settings?.heroImageUrl) {
        heroSlides.push({
            badge: "Sélection Officielle",
            title: settings.siteName || "TechStore",
            subtitle: "Votre destination High-Tech de référence au Cameroun.",
            cta: "Découvrir",
            ctaLink: "/catalog",
            image: getFullImageUrl(settings.heroImageUrl),
            accent: "from-indigo-500 to-purple-600",
        });
    }

    if (heroProducts.length > 0) {
        heroProducts.slice(0, 3).forEach((p, i) => {
            const pImg = getProductImage(p);
            const fallbackImage = ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=2000&q=80",
                                   "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=2000&q=80",
                                   "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=2000&q=80"][i] || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=2000&q=80";

            heroSlides.push({
                badge: "Nouveauté 2026",
                title: p.name,
                subtitle: p.description ? (p.description.length > 100 ? p.description.slice(0, 100) + "..." : p.description) : "La technologie au summum de l'excellence.",
                cta: "Découvrir",
                ctaLink: `/product/${p.slug}`,
                image: pImg || fallbackImage,
                accent: ["from-indigo-500 to-purple-600", "from-blue-500 to-cyan-600", "from-violet-500 to-pink-600"][i] || "from-indigo-500 to-purple-600",
            });
        });
    }

    if (heroSlides.length === 0) {
        heroSlides.push(
            {
                badge: "Collection Premium 2026",
                title: "Technologie Réinventée",
                subtitle: "Découvrez une expérience au-delà des limites du possible.",
                cta: "Explorer",
                ctaLink: "/catalog",
                image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=2000&q=80",
                accent: "from-indigo-500 to-purple-600",
            },
            {
                badge: "Audio & Son",
                title: "Immersion Totale",
                subtitle: "Son haute fidélité, confort absolu, design iconique.",
                cta: "Écouter",
                ctaLink: "/catalog?q=audio",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=2000&q=80",
                accent: "from-blue-500 to-cyan-600",
            },
            {
                badge: "Mobilité Pro",
                title: "Performance Mobile",
                subtitle: "Smartphones et accessoires pour les professionnels exigeants.",
                cta: "Voir",
                ctaLink: "/catalog?q=mobile",
                image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=2000&q=80",
                accent: "from-violet-500 to-pink-600",
            }
        );
    }

    const testimonials = [
        { name: "Marie K.", role: "Designer UI/UX", rating: 5, text: "Commande reçue en moins de 24h à Douala. Produits authentiques, packaging impeccable. Je recommande sans hésiter !" },
        { name: "Jean-Paul N.", role: "Développeur Web", rating: 5, text: "Mon MacBook Pro est arrivé en parfait état. Le service client a été réactif et professionnel. Vraiment top." },
        { name: "Amina T.", role: "Photographe", rating: 4, text: "Super expérience ! L'interface du site est fluide et les produits correspondent exactement à la description. Satisfaite !" },
        { name: "Eric M.", role: "Ingénieur IT", rating: 5, text: "TechStore est ma boutique de référence au Cameroun. Qualité irréprochable et prix compétitifs. Bravo à l'équipe !" },
    ];

    // Auto-scroll hero
    useEffect(() => {
        if (heroSlides.length === 0) return;
        const id = setInterval(() => setCurrentHeroSlide(s => (s + 1) % heroSlides.length), 6000);
        return () => clearInterval(id);
    }, [heroSlides.length]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [cats, prods, grouped] = await Promise.allSettled([
                    ProductService.getCategories(),
                    ProductService.getAll(0, 16),
                    ProductService.getGroupedCategories(),
                ]);

                if (cats.status === 'fulfilled') {
                    setStats(prev => ({ ...prev, categories: cats.value?.data?.length || 12 }));
                }
                if (prods.status === 'fulfilled') {
                    const all = prods.value?.data?.content || prods.value?.data || [];
                    const total = prods.value?.data?.totalElements || all.length;
                    setStats(prev => ({ ...prev, products: total }));
                    setAllProducts(all);
                    setFeaturedProducts(all.slice(0, 8));
                    setTrendingProducts(all.slice(0, 6));
                    setFlashSaleProducts(all.filter(p => p.discountPrice).slice(0, 4));
                    setHeroProducts(all.slice(0, 3));
                }
                if (grouped.status === 'fulfilled' && grouped.value?.status === 'success') {
                    setGroupedCategories(grouped.value.data);
                }
            } catch (err) {
                console.error("Erreur chargement home:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail('');
        }
    };

    const slide = heroSlides[currentHeroSlide] || heroSlides[0];

    return (
        <div className="bg-white dark:bg-[#0b0e14] transition-colors duration-500 overflow-x-hidden">

            {/* ══════════════════════════════════════
                HERO — SLIDER DYNAMIQUE
            ══════════════════════════════════════ */}
            <section className="relative min-h-[85vh] sm:min-h-screen flex items-end pb-16 sm:pb-24 overflow-hidden">

                {/* Fond image animé */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentHeroSlide}
                        initial={{ opacity: 0, scale: 1.06 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        <img
                            src={slide.image}
                            alt="Hero"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                        <div className={`absolute inset-0 bg-gradient-to-br ${slide.accent} opacity-20`} />
                    </motion.div>
                </AnimatePresence>

                {/* Orbs d'ambiance */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] bg-indigo-500/20 rounded-full blur-[120px] animate-blob" />
                    <div className="absolute top-[20%] right-[5%] w-[30vw] h-[30vw] bg-blue-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
                </div>

                {/* Contenu */}
                <motion.div
                    style={{ y: yHero, opacity: opacityHero }}
                    className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentHeroSlide}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="max-w-3xl"
                        >
                            <motion.div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-5 sm:mb-7">
                                <Zap size={12} className="text-indigo-300" />
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white">{slide.badge}</span>
                            </motion.div>

                            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.9] pb-2">
                                {slide.title}
                            </h1>

                            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-white/70 max-w-xl leading-relaxed">
                                {slide.subtitle}
                            </p>

                            <div className="mt-8 sm:mt-10 flex flex-wrap gap-4">
                                <Link
                                    to={slide.ctaLink}
                                    className="bg-white text-apple-dark px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-black text-xs sm:text-sm tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center group"
                                >
                                    {slide.cta}
                                    <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                                </Link>
                                <Link
                                    to="/catalog"
                                    className="border border-white/30 text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-black text-xs sm:text-sm tracking-widest uppercase hover:bg-white/10 active:scale-95 transition-all backdrop-blur-sm"
                                >
                                    Catalogue
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Contrôles slider */}
                    <div className="flex items-center gap-3 mt-10 sm:mt-12">
                        <button
                            onClick={() => setCurrentHeroSlide(s => (s - 1 + heroSlides.length) % heroSlides.length)}
                            className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                            aria-label="Slide précédent"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="flex items-center gap-2">
                            {heroSlides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentHeroSlide(i)}
                                    className={`rounded-full transition-all duration-300 ${i === currentHeroSlide ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`}
                                    aria-label={`Slide ${i + 1}`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentHeroSlide(s => (s + 1) % heroSlides.length)}
                            className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                            aria-label="Slide suivant"
                        >
                            <ChevronRight size={16} />
                        </button>
                        <span className="text-white/40 text-xs font-black uppercase tracking-widest ml-2">
                            {String(currentHeroSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
                        </span>
                    </div>
                </motion.div>
            </section>

            {/* ══════════════════════════════════════
                STATS BAR
            ══════════════════════════════════════ */}
            <section
                ref={statsRef}
                className="py-10 sm:py-0 sm:h-[110px] flex items-center px-5 sm:px-6 border-y border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]"
            >
                <div className="max-w-7xl mx-auto w-full">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">
                        {[
                            { value: `${productsCount}+`, label: "Produits High-Tech", gradient: "from-indigo-500 to-purple-500" },
                            { value: categoriesCount, label: "Catégories", gradient: "from-blue-500 to-emerald-500" },
                            { value: "24h", label: "Livraison Express", gradient: "from-amber-500 to-orange-500" },
                            { value: "100%", label: "Garantie Qualité", gradient: "from-pink-500 to-red-500" },
                        ].map((stat, i) => (
                            <div key={i} className="text-center group">
                                <div className={`text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br ${stat.gradient} group-hover:scale-110 transition-transform duration-300`}>
                                    {stat.value}
                                </div>
                                <p className="mt-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-apple-dark/50 dark:text-white/40">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════
                BENTO GRID — CATÉGORIES VEDETTES
            ══════════════════════════════════════ */}
            <section className="py-20 sm:py-24 px-5 sm:px-6 max-w-7xl mx-auto">
                <SectionHeader
                    label="Collections"
                    title="L'univers High-Tech"
                    subtitle="Découvrez nos catégories phares"
                    linkTo="/catalog"
                    linkText="Tout explorer"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

                    {/* Grande carte */}
                    <Link
                        to="/catalog?q=apple"
                        className="sm:col-span-2 h-[380px] sm:h-[480px] rounded-[2rem] overflow-hidden relative group cursor-pointer bg-black"
                    >
                        <div className="absolute inset-0 z-10 p-8 sm:p-12 flex flex-col items-start text-white">
                            <span className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-60">Icône 2026</span>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter mb-3">Écosystème Apple</h2>
                            <p className="text-sm sm:text-base opacity-70 max-w-xs">iPhone, Mac, iPad, AirPods — un univers connecté et cohérent.</p>
                            <div className="mt-auto flex items-center gap-2 text-white/80 text-xs font-black uppercase tracking-widest group-hover:gap-3 transition-all">
                                Explorer <ArrowRight size={14} />
                            </div>
                        </div>
                        <img
                            src={appleImg}
                            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
                            alt="Apple"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    </Link>

                    {/* Petite carte 1 */}
                    <Link
                        to="/catalog?q=audio"
                        className="h-[220px] sm:h-[224px] rounded-[2rem] overflow-hidden relative group cursor-pointer bg-[#f5f5f7] dark:bg-[#161926]"
                    >
                        <div className="absolute inset-0 z-10 p-7 flex flex-col text-apple-dark dark:text-white">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">Son & Musique</span>
                            <h2 className="text-2xl font-black italic tracking-tighter">AirPods Pro</h2>
                            <p className="text-xs opacity-50 mt-1">Réduction de bruit adaptative</p>
                        </div>
                        <img
                            src={audioImg}
                            className="absolute bottom-0 right-0 h-[65%] w-auto object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                            alt="AirPods"
                            loading="lazy"
                        />
                    </Link>

                    {/* Petite carte 2 */}
                    <Link
                        to="/catalog?q=laptop"
                        className="h-[220px] sm:h-[224px] rounded-[2rem] overflow-hidden relative group cursor-pointer bg-[#111] dark:bg-[#0d1117]"
                    >
                        <div className="absolute inset-0 z-10 p-7 flex flex-col text-white">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">Productivité</span>
                            <h2 className="text-2xl font-black italic tracking-tighter">MacBook Pro</h2>
                            <p className="text-xs opacity-50 mt-1">Puce M4 — Puissance ultime</p>
                        </div>
                        <img
                            src={laptopImg}
                            className="absolute bottom-0 right-0 h-[60%] w-auto object-contain p-4 opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                            alt="MacBook"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </Link>

                    {/* Petite carte 3 */}
                    <Link
                        to="/catalog?q=gaming"
                        className="h-[220px] sm:h-[224px] rounded-[2rem] overflow-hidden relative group cursor-pointer bg-gradient-to-br from-violet-600 to-indigo-700"
                    >
                        <div className="absolute inset-0 z-10 p-7 flex flex-col text-white">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">Gaming</span>
                            <h2 className="text-2xl font-black italic tracking-tighter">Haute Performance</h2>
                            <p className="text-xs opacity-70 mt-1">Setup gamer de niveau pro</p>
                        </div>
                        <img
                            src={gamingImg}
                            className="absolute bottom-0 right-0 h-[65%] w-auto object-contain p-4 opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700"
                            alt="Gaming"
                            loading="lazy"
                        />
                    </Link>
                </div>
            </section>

            {/* ══════════════════════════════════════
                PRODUITS EN VEDETTE
            ══════════════════════════════════════ */}
            <section className="py-20 sm:py-24 px-5 sm:px-6 max-w-7xl mx-auto">
                <SectionHeader
                    label="Sélection"
                    title="Produits en Vedette"
                    subtitle="Les meilleures offres du moment"
                    linkTo="/catalog"
                />
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="rounded-[1.75rem] bg-gray-100 dark:bg-[#161926] animate-pulse h-72 sm:h-80" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {(featuredProducts.length > 0 ? featuredProducts : [...Array(8)].map((_, i) => ({
                            id: i, slug: '#', name: 'Produit Premium', brand: 'Brand', basePrice: 99900, ratingAvg: 4.5, reviewCount: 12,
                            mainImageUrl: `https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80`
                        }))).map((prod, i) => (
                            <ProductCard key={prod.id} prod={prod} index={i} />
                        ))}
                    </div>
                )}
            </section>

            {/* ══════════════════════════════════════
                FLASH SALE — COUNTDOWN
            ══════════════════════════════════════ */}
            {(flashSaleProducts.length > 0 || !loading) && (
                <section className="py-20 sm:py-24 px-5 sm:px-6 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-[-20%] left-[30%] w-[50vw] h-[50vw] bg-indigo-500/20 rounded-full blur-[150px]" />
                        <div className="absolute bottom-[-20%] right-[10%] w-[30vw] h-[30vw] bg-purple-500/20 rounded-full blur-[100px]" />
                    </div>
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 mb-4">
                                    <Flame size={12} className="text-red-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Offre Limitée</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter text-white">Flash Sale</h2>
                                <p className="text-white/50 mt-2 text-sm">Les meilleures remises, pour quelques heures seulement</p>
                            </div>
                            {/* Countdown */}
                            <div className="flex items-center gap-3 sm:gap-4">
                                <Clock size={16} className="text-white/40 shrink-0" />
                                {[
                                    { val: countdown.h, label: "H" },
                                    { val: countdown.m, label: "M" },
                                    { val: countdown.s, label: "S" },
                                ].map((t, i) => (
                                    <React.Fragment key={i}>
                                        {i > 0 && <span className="text-white/30 font-black text-xl">:</span>}
                                        <div className="text-center min-w-[52px] bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                                            <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                                                {String(t.val).padStart(2, '0')}
                                            </div>
                                            <div className="text-[9px] font-black uppercase tracking-widest text-white/40">{t.label}</div>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                            {(flashSaleProducts.length > 0 ? flashSaleProducts : featuredProducts.slice(0, 4)).map((prod, i) => (
                                <ProductCard key={prod.id} prod={{ ...prod, discountPrice: prod.discountPrice || Math.round(prod.basePrice * 0.8) }} index={i} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ══════════════════════════════════════
                TENDANCES
            ══════════════════════════════════════ */}
            <section className="py-20 sm:py-24 px-5 sm:px-6 max-w-7xl mx-auto">
                <SectionHeader
                    label="Tendances"
                    title="Top du Moment"
                    subtitle="Les produits les plus populaires cette semaine"
                    linkTo="/catalog"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {(trendingProducts.length > 0 ? trendingProducts : [...Array(6)].map((_, i) => ({
                        id: i, slug: '#', name: 'Produit Tendance', brand: 'Brand', basePrice: 149900, ratingAvg: 4.8,
                        reviewCount: 24, mainImageUrl: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80`
                    }))).map((prod, i) => (
                        <motion.div
                            key={prod.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.07 }}
                        >
                            <Link
                                to={`/product/${prod.slug}`}
                                className="flex items-center gap-4 sm:gap-5 p-4 rounded-[1.5rem] border border-gray-100 dark:border-white/5 bg-white dark:bg-[#161926] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
                            >
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1rem] bg-gray-50 dark:bg-[#111421] flex items-center justify-center shrink-0 overflow-hidden">
                                    <img
                                        src={prod.mainImageUrl}
                                        alt={prod.name}
                                        className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1 mb-1">
                                        <TrendingUp size={10} className="text-indigo-400 shrink-0" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">#{i + 1} Tendance</span>
                                    </div>
                                    <h3 className="font-bold text-sm text-apple-dark dark:text-white truncate">{prod.name}</h3>
                                    <p className="text-[10px] text-gray-400 font-medium mt-0.5 truncate">{prod.brand}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="font-black text-sm text-indigo-500">{(prod.discountPrice || prod.basePrice)?.toLocaleString()} F</span>
                                        <div className="flex items-center gap-0.5">
                                            <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                            <span className="text-[10px] text-gray-400">{prod.ratingAvg || 4.8}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════
                CATÉGORIES GROUPÉES (DYNAMIQUES)
            ══════════════════════════════════════ */}
            {groupedCategories?.map((group) => (
                <section key={group.categoryId} className="py-20 sm:py-24 px-5 sm:px-6 max-w-7xl mx-auto border-t border-gray-100 dark:border-white/5">
                    <SectionHeader
                        title={group.categoryName}
                        linkTo={`/category/${group.categorySlug}`}
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {group.products?.slice(0, 4).map((prod, i) => (
                            <ProductCard key={prod.id} prod={prod} index={i} />
                        ))}
                    </div>
                </section>
            ))}

            {/* ══════════════════════════════════════
                BANNIÈRE AVANTAGES
            ══════════════════════════════════════ */}
            <section className="py-20 sm:py-24 px-5 sm:px-6 bg-gray-50 dark:bg-white/[0.02] border-y border-gray-100 dark:border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-3 block">Nos Engagements</span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter text-apple-dark dark:text-white">Pourquoi {siteName} ?</h2>
                        <p className="text-apple-dark/50 dark:text-white/50 mt-3 text-sm sm:text-base max-w-2xl mx-auto">
                            Nous vous offrons la meilleure expérience d'achat High-Tech au Cameroun
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                        {[
                            { icon: Truck, color: "indigo", title: "Livraison Rapide", text: "Partout au Cameroun, suivi en temps réel inclus." },
                            { icon: ShieldCheck, color: "emerald", title: "Garantie Officielle", text: "Tous nos produits certifiés par les constructeurs." },
                            { icon: Headphones, color: "purple", title: "Support 7j/7", text: "Experts tech disponibles pour vous accompagner." },
                            { icon: Award, color: "amber", title: "100% Authentique", text: "Produits vérifiés et validés avant expédition." },
                        ].map(({ icon: Icon, color, title, text }, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="flex flex-col items-center text-center group"
                            >
                                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-${color}-50 dark:bg-${color}-500/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-${color}-100 dark:group-hover:bg-${color}-500/20 transition-all duration-300`}>
                                    <Icon size={28} className={`text-${color}-600 dark:text-${color}-400`} />
                                </div>
                                <h3 className="text-base sm:text-lg font-black text-apple-dark dark:text-white mb-2">{title}</h3>
                                <p className="text-xs sm:text-sm text-apple-dark/50 dark:text-white/40 leading-relaxed">{text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════
                TÉMOIGNAGES
            ══════════════════════════════════════ */}
            <section className="py-20 sm:py-24 px-5 sm:px-6 max-w-7xl mx-auto">
                <div className="text-center mb-14">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-3 block">Avis Clients</span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter text-apple-dark dark:text-white">Ils nous font confiance</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <TestimonialCard {...t} />
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════
                NEWSLETTER
            ══════════════════════════════════════ */}
            <section className="py-20 sm:py-24 px-5 sm:px-6 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-30%] left-[-10%] w-[60vw] h-[60vw] bg-white/5 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-30%] right-[-10%] w-[50vw] h-[50vw] bg-white/5 rounded-full blur-[100px]" />
                </div>
                <div className="max-w-2xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
                        <Mail size={12} className="text-white/70" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Newsletter Exclusive</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter text-white mb-4">
                        Ne ratez aucune offre
                    </h2>
                    <p className="text-white/70 text-sm sm:text-base mb-8 max-w-md mx-auto">
                        Recevez en avant-première nos offres exclusives, nouveautés et promotions Flash Sale.
                    </p>
                    <AnimatePresence mode="wait">
                        {subscribed ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center gap-3 bg-white/10 border border-white/20 rounded-full px-8 py-4"
                            >
                                <CheckCircle size={20} className="text-emerald-300" />
                                <span className="text-white font-black text-sm">Parfait ! Vous êtes inscrit(e) 🎉</span>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onSubmit={handleSubscribe}
                                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                            >
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="votre@email.com"
                                    required
                                    className="flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-medium focus:outline-none focus:border-white/40 backdrop-blur-sm"
                                />
                                <button
                                    type="submit"
                                    className="px-8 py-3.5 rounded-full bg-white text-indigo-700 font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shrink-0 shadow-xl"
                                >
                                    S'inscrire
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                    <p className="text-white/40 text-xs mt-4">Pas de spam. Désabonnement en un clic.</p>
                </div>
            </section>

            {/* ══════════════════════════════════════
                CALL TO ACTION FINAL
            ══════════════════════════════════════ */}
            <section className="py-20 sm:py-24 px-5 sm:px-6 max-w-5xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-4 block">Rejoignez-nous</span>
                    <h2 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter text-apple-dark dark:text-white leading-tight mb-6">
                        Prêt à découvrir<br />le futur du tech ?
                    </h2>
                    <p className="text-apple-dark/50 dark:text-white/50 text-base sm:text-lg max-w-xl mx-auto mb-10">
                        Des milliers de clients satisfaits à Douala et partout au Cameroun. Votre expérience High-Tech commence ici.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            to="/catalog"
                            className="bg-apple-dark dark:bg-white text-white dark:text-apple-dark px-10 py-4 rounded-full font-black text-xs sm:text-sm tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20 dark:shadow-white/10 flex items-center group"
                        >
                            Explorer le catalogue
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                        </Link>
                        <Link
                            to="/catalog?q=promo"
                            className="border border-apple-dark/20 dark:border-white/20 text-apple-dark dark:text-white px-10 py-4 rounded-full font-black text-xs sm:text-sm tracking-widest uppercase hover:bg-apple-dark/5 dark:hover:bg-white/5 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Tag size={14} />
                            Voir les promos
                        </Link>
                    </div>
                </motion.div>
            </section>

        </div>
    );
};

export default Home;
