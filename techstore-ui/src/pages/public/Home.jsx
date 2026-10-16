import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, Zap, ShieldCheck, Truck, Headphones, Star,
    Award, ArrowRight, TrendingUp, ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductService from '../../services/product.service';
import { useAppContext } from '../../context/AppContext';
import { getFullImageUrl } from '../../utils/imageUtils';

// ─── UTILITAIRE IMAGE ───
const getProductImage = (p) => {
    if (!p) return "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=600";
    if (p.mainImageUrl) return p.mainImageUrl;
    if (p.imageUrl) return getFullImageUrl(p.imageUrl);
    if (p.images && p.images.length > 0) {
        const primaryImg = p.images.find(img => img.isPrimary) || p.images[0];
        if (primaryImg?.url) return getFullImageUrl(primaryImg.url);
    }
    return "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=600";
};

// ─── COMPOSANTS RÉUTILISABLES ───
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
            </div>
            <div className="flex-1 flex flex-col">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{prod.brand}</p>
                <h3 className="font-bold text-sm text-apple-dark dark:text-white line-clamp-2 leading-snug flex-1">{prod.name}</h3>
                <div className="flex items-center gap-1 mt-2 mb-3">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} className={i < Math.round(prod.ratingAvg || 4.5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'} />
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
            <Link to={linkTo} className="shrink-0 text-xs font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-400 flex items-center gap-1 group transition-colors">
                {linkText}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        )}
    </div>
);

const TestimonialCard = ({ name, role, text, rating }) => (
    <div className="border border-gray-100 dark:border-white/5 rounded-[1.75rem] p-6 bg-white dark:bg-[#161926] flex flex-col gap-4 h-full">
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
            ))}
        </div>
        <p className="text-sm text-apple-dark/70 dark:text-white/60 leading-relaxed flex-1">"{text}"</p>
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-white/5">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm flex-shrink-0">
                {name[0]}
            </div>
            <div>
                <p className="font-black text-sm text-apple-dark dark:text-white">{name}</p>
                <p className="text-[10px] font-medium text-gray-400">{role}</p>
            </div>
        </div>
    </div>
);

// ═══════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════

const Home = () => {
    const { settings } = useAppContext();
    const siteName = settings?.siteName || "PEOC";

    const { scrollYProgress } = useScroll();
    const yHero = useTransform(scrollYProgress, [0, 0.4], [0, 120]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

    const [allProducts, setAllProducts] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
    const [loading, setLoading] = useState(true);

    const poultryImg = getProductImage(allProducts.find(p => p.name?.toLowerCase().includes('poulet') || p.name?.toLowerCase().includes('volaille'))) || "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1200&q=80";
    const incubatorImg = getProductImage(allProducts.find(p => p.name?.toLowerCase().includes('couveuse'))) || "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80";
    const feedImg = getProductImage(allProducts.find(p => p.name?.toLowerCase().includes('aliment'))) || "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=600&q=80";
    const healthImg = getProductImage(allProducts.find(p => p.name?.toLowerCase().includes('soin') || p.name?.toLowerCase().includes('vitamine'))) || "https://images.unsplash.com/photo-1599443015574-be5fe8a05783?auto=format&fit=crop&w=600&q=80";

    // Hero slides
    const heroSlides = [];

    if (settings?.heroVideoUrl) {
        heroSlides.push({
            type: 'video',
            badge: "L'Expérience PEOC",
            title: settings.siteName || "PEOC",
            subtitle: "Petit Éleveur de l'Ouest Cameroun.",
            cta: "Découvrir",
            ctaLink: "/catalog",
            video: getFullImageUrl(settings.heroVideoUrl),
            accent: "from-indigo-500 to-purple-600",
        });
    }

    if (settings?.heroImagesUrls?.length > 0) {
        settings.heroImagesUrls.forEach((url, i) => {
            heroSlides.push({
                type: 'image',
                badge: i === 0 ? "Sélection Officielle" : "Découverte",
                title: settings.siteName || "PEOC",
                subtitle: "Votre référence pour l'élevage et équipements au Cameroun.",
                cta: "Découvrir",
                ctaLink: "/catalog",
                image: getFullImageUrl(url),
                accent: ["from-indigo-500 to-purple-600", "from-blue-500 to-cyan-600"][i % 2],
            });
        });
    } else if (settings?.heroImageUrl) {
        heroSlides.push({
            type: 'image',
            badge: "Sélection Officielle",
            title: settings.siteName || "PEOC",
            subtitle: "Votre référence pour l'élevage et équipements au Cameroun.",
            cta: "Découvrir",
            ctaLink: "/catalog",
            image: getFullImageUrl(settings.heroImageUrl),
            accent: "from-indigo-500 to-purple-600",
        });
    }

    if (heroSlides.length === 0) {
        heroSlides.push({
            type: 'image',
            badge: "PEOC Sélection 2026",
            title: "Élevage Moderne & Performant",
            subtitle: "Poussins de qualité, couveuses fiables et équipements d'élevage.",
            cta: "Explorer",
            ctaLink: "/catalog",
            image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=2000&q=80",
            accent: "from-indigo-500 to-purple-600",
        });
    }

    const testimonials = [
        { name: "Marie K.", role: "Avicultrice à Bafoussam", rating: 5, text: "Commande reçue en moins de 24h. Les poussins sont vigoureux et zéro perte. Je recommande vivement PEOC !" },
        { name: "Jean-Paul N.", role: "Éleveur à Dschang", rating: 5, text: "Ma couveuse fonctionne à merveille avec un taux d'éclosion remarquable. Service client très réactif !" },
        { name: "Amina T.", role: "Ferme Agro-Pastorale", rating: 5, text: "Aliments de première qualité et conseils avisés. Mes poulets ont atteint un poids idéal en temps record." },
        { name: "Eric M.", role: "Éleveur Professionnel", rating: 5, text: "PEOC est la référence incontournable pour l'élevage. Matériels robustes et livraison ponctuelle !" },
    ];

    // Auto-scroll hero
    useEffect(() => {
        if (heroSlides.length <= 1) return;
        const duration = heroSlides[currentHeroSlide]?.type === 'video' ? 12000 : 6000;
        const id = setTimeout(() => setCurrentHeroSlide(s => (s + 1) % heroSlides.length), duration);
        return () => clearTimeout(id);
    }, [heroSlides.length, currentHeroSlide]);

    // Fetch data
    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [prods] = await Promise.allSettled([
                    ProductService.getAll(0, 16),
                ]);

                if (prods.status === 'fulfilled') {
                    const all = prods.value?.data?.content || prods.value?.data || [];
                    setAllProducts(all);
                    setTrendingProducts(all.slice(0, 6));
                }
            } catch (err) {
                console.error("Erreur chargement home:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const slide = heroSlides[currentHeroSlide] || heroSlides[0];

    return (
        <div className="bg-white dark:bg-[#0b0e14] transition-colors duration-500 overflow-x-hidden">

            {/* ══════════════════════════════════════
                1️⃣  HERO — BANNIÈRE PRINCIPALE
            ══════════════════════════════════════ */}
            <section className="relative min-h-[85vh] sm:min-h-screen flex items-end pb-16 sm:pb-24 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentHeroSlide}
                        initial={{ opacity: 0, scale: 1.06 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        {slide.type === 'video' ? (
                            <video src={slide.video} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        ) : (
                            <img src={slide.image} alt="Hero" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                        <div className={`absolute inset-0 bg-gradient-to-br ${slide.accent} opacity-20`} />
                    </motion.div>
                </AnimatePresence>

                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] bg-indigo-500/20 rounded-full blur-[120px] animate-blob" />
                    <div className="absolute top-[20%] right-[5%] w-[30vw] h-[30vw] bg-blue-500/20 rounded-full blur-[120px]" />
                </div>

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
                            transition={{ duration: 0.7 }}
                            className="max-w-3xl"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-5 sm:mb-7">
                                <Zap size={12} className="text-indigo-300" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">{slide.badge}</span>
                            </div>

                            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.9] pb-2">
                                {slide.title}
                            </h1>

                            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-white/70 max-w-xl leading-relaxed">
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
                                    className="border border-white/30 text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-black text-xs sm:text-sm tracking-widest uppercase hover:bg-white/10 active:scale-95 transition-all"
                                >
                                    Catalogue
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex items-center gap-3 mt-10 sm:mt-12">
                        <button
                            onClick={() => setCurrentHeroSlide(s => (s - 1 + heroSlides.length) % heroSlides.length)}
                            className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="flex items-center gap-2">
                            {heroSlides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentHeroSlide(i)}
                                    className={`rounded-full transition-all ${i === currentHeroSlide ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/30'}`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentHeroSlide(s => (s + 1) % heroSlides.length)}
                            className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* ══════════════════════════════════════
                2️⃣  CATÉGORIES — BENTO GRID
            ══════════════════════════════════════ */}
            <section className="py-20 sm:py-24 px-5 sm:px-6 max-w-7xl mx-auto">
                <SectionHeader
                    label="Collections"
                    title="L'univers PEOC Élevage"
                    subtitle="Découvrez nos matériels et sélections phares"
                    linkTo="/catalog"
                    linkText="Tout explorer"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    <Link to="/catalog?q=volaille" className="sm:col-span-2 h-[380px] sm:h-[480px] rounded-[2rem] overflow-hidden relative group bg-black">
                        <div className="absolute inset-0 z-10 p-8 sm:p-12 flex flex-col items-start text-white">
                            <span className="text-[9px] font-black uppercase mb-2 opacity-60">Sélection 2026</span>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic mb-3">Volailles & Poussins</h2>
                            <p className="text-sm opacity-70 max-w-xs">Poussins d'un jour, Goliaths, poulets de chair et pondeuses vaccinées.</p>
                            <div className="mt-auto flex items-center gap-2 text-white/80 text-xs font-black group-hover:gap-3 transition-all">
                                Explorer <ArrowRight size={14} />
                            </div>
                        </div>
                        <img src={poultryImg} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700" alt="Volailles" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    </Link>

                    <Link to="/catalog?q=couveuse" className="h-[220px] sm:h-[224px] rounded-[2rem] overflow-hidden relative group bg-gray-100 dark:bg-[#161926]">
                        <div className="absolute inset-0 z-10 p-7 flex flex-col text-apple-dark dark:text-white">
                            <span className="text-[9px] font-black uppercase opacity-50 mb-1">Matériel & Éclosion</span>
                            <h2 className="text-2xl font-black italic">Couveuses Auto</h2>
                            <p className="text-xs opacity-50 mt-1">Haut taux d'éclosion & contrôle digital</p>
                        </div>
                        <img src={incubatorImg} className="absolute bottom-0 right-0 h-[65%] w-auto object-contain p-4 group-hover:scale-110 transition-transform duration-700" alt="Couveuses" loading="lazy" />
                    </Link>

                    <Link to="/catalog?q=aliment" className="h-[220px] sm:h-[224px] rounded-[2rem] overflow-hidden relative group bg-black">
                        <div className="absolute inset-0 z-10 p-7 flex flex-col text-white">
                            <span className="text-[9px] font-black uppercase opacity-50 mb-1">Nutrition</span>
                            <h2 className="text-2xl font-black italic">Aliments & Granulés</h2>
                            <p className="text-xs opacity-50 mt-1">Démarrage, croissance et finition</p>
                        </div>
                        <img src={feedImg} className="absolute bottom-0 right-0 h-[60%] w-auto object-contain p-4 opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700" alt="Aliments" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </Link>

                    <Link to="/catalog?q=sante" className="h-[220px] sm:h-[224px] rounded-[2rem] overflow-hidden relative group bg-gradient-to-br from-emerald-600 to-teal-700">
                        <div className="absolute inset-0 z-10 p-7 flex flex-col text-white">
                            <span className="text-[9px] font-black uppercase opacity-70 mb-1">Santé & Hygiène</span>
                            <h2 className="text-2xl font-black italic">Soins Vétérinaires</h2>
                            <p className="text-xs opacity-70 mt-1">Vitamines, vaccins & désinfectants</p>
                        </div>
                        <img src={healthImg} className="absolute bottom-0 right-0 h-[65%] w-auto object-contain p-4 opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700" alt="Soins" loading="lazy" />
                    </Link>
                </div>
            </section>

            {/* ══════════════════════════════════════
                3️⃣  PRODUITS EN TENDANCE
            ══════════════════════════════════════ */}
            <section className="py-20 sm:py-24 px-5 sm:px-6 max-w-7xl mx-auto">
                <SectionHeader
                    label="Tendances"
                    title="Top du Moment"
                    subtitle="Les produits les plus populaires cette semaine"
                    linkTo="/catalog"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="rounded-[1.75rem] bg-gray-100 dark:bg-[#161926] animate-pulse h-72" />
                        ))
                    ) : (
                        trendingProducts.map((prod, i) => (
                            <motion.div
                                key={prod.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.07 }}
                            >
                                <Link
                                    to={`/product/${prod.slug}`}
                                    className="flex items-center gap-4 sm:gap-5 p-4 rounded-[1.5rem] border border-gray-100 dark:border-white/5 bg-white dark:bg-[#161926] hover:shadow-xl hover:-translate-y-0.5 transition-all group"
                                >
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1rem] bg-gray-50 dark:bg-[#111421] flex items-center justify-center shrink-0">
                                        <img src={getProductImage(prod)} alt={prod.name} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1 mb-1">
                                            <TrendingUp size={10} className="text-indigo-400 shrink-0" />
                                            <span className="text-[9px] font-black uppercase text-indigo-400">#{i + 1} Tendance</span>
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
                        ))
                    )}
                </div>
            </section>

            {/* ══════════════════════════════════════
                4️⃣  PRÉSENTATION DU SITE
            ══════════════════════════════════════ */}
            <section className="py-20 sm:py-24 px-5 sm:px-6 bg-gray-50 dark:bg-white/[0.02] border-y border-gray-100 dark:border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-3 block">Nos Engagements</span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter text-apple-dark dark:text-white">Pourquoi {siteName} ?</h2>
                        <p className="text-apple-dark/50 dark:text-white/50 mt-3 text-sm sm:text-base max-w-2xl mx-auto">
                            Nous vous offrons la meilleure expérience d'achat et d'accompagnement agro-pastoral au Cameroun
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-16 sm:mb-20">
                        {[
                            { icon: Truck, color: "indigo", title: "Livraison Rapide", text: "Partout au Cameroun, transport sécurisé." },
                            { icon: ShieldCheck, color: "emerald", title: "Garantie & Suivi", text: "Matériel testé et accompagnement technique." },
                            { icon: Headphones, color: "purple", title: "Support 7j/7", text: "Conseils d'éleveurs chevronnés." },
                            { icon: Award, color: "amber", title: "100% Qualité", text: "Souches vigoureuses et certifiées." },
                        ].map(({ icon: Icon, color, title, text }, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="flex flex-col items-center text-center group"
                            >
                                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-${color}-50 dark:bg-${color}-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-300`}>
                                    <Icon size={28} className={`text-${color}-600 dark:text-${color}-400`} />
                                </div>
                                <h3 className="text-base sm:text-lg font-black text-apple-dark dark:text-white mb-2">{title}</h3>
                                <p className="text-xs sm:text-sm text-apple-dark/50 dark:text-white/40 leading-relaxed">{text}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center mb-12">
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
                </div>
            </section>

        </div>
    );
};

export default Home;
