import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight, Zap, ShieldCheck, Truck, Headphones, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductService from '../../services/product.service';

const Home = () => {
    const { scrollYProgress } = useScroll();
    const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    const [stats, setStats] = useState({ products: 0, categories: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch simple stats
                const cats = await ProductService.getCategories();
                const prods = await ProductService.getAll(0, 1);
                
                setStats({
                    categories: cats?.data?.length || 12,
                    products: prods?.totalElements || 1500
                });
            } catch (err) {
                console.error("Erreur chargement stats:", err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="bg-apple-white dark:bg-[#0b0e14] transition-colors duration-500 overflow-hidden">
            
            {/* HERO SECTION - PREMIUM APPLE STYLE */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 text-center px-4 md:px-6">
                
                {/* Background Gradient Orbs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
                    <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-[-10%] left-[40%] w-[35vw] h-[35vw] bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"></div>
                </div>

                <motion.div 
                    style={{ y: yHero, opacity: opacityHero }}
                    className="relative z-10 flex flex-col items-center max-w-6xl mx-auto w-full"
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-apple-dark/5 dark:bg-white/5 border border-apple-dark/10 dark:border-white/10 mb-8 backdrop-blur-md"
                    >
                        <Zap size={14} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-apple-dark dark:text-white">Nouvelle Collection 2025</span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-apple-dark to-gray-500 dark:from-white dark:to-gray-500 leading-[0.9] pb-4"
                    >
                        Le futur.<br/>Entre vos mains.
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="mt-6 text-lg md:text-2xl text-apple-dark/60 dark:text-white/60 max-w-2xl font-medium"
                    >
                        Découvrez une collection d'exception, conçue pour repousser les limites du possible. La technologie réinventée.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="mt-10 flex flex-col sm:flex-row gap-6 items-center"
                    >
                        <Link to="/catalog" className="bg-apple-dark dark:bg-white text-white dark:text-apple-dark px-10 py-4 rounded-full font-black text-sm tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 dark:shadow-white/10 flex items-center group">
                            Découvrir 
                            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                        </Link>
                        <Link to="/category/apple" className="text-apple-dark dark:text-white font-black text-sm tracking-widest uppercase flex items-center group hover:opacity-70 transition-opacity">
                            L'écosystème Apple
                            <ChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" size={18} />
                        </Link>
                    </motion.div>
                </motion.div>

                {/* IMAGE DU PRODUIT HÉRO */}
                <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                    className="relative z-10 mt-20 w-full max-w-5xl px-4"
                >
                    <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 flex flex-col justify-end p-10">
                            <h3 className="text-white text-3xl font-black italic">MacBook Pro M3 Max</h3>
                            <p className="text-white/80 font-medium mt-2">La machine ultime pour les créateurs.</p>
                        </div>
                        <img 
                            src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=2000" 
                            alt="MacBook Pro" 
                            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-1000"
                        />
                    </div>
                </motion.div>
            </section>

            {/* SECTION BENTO GRID - LE LOOK PRO */}
            <section className="py-24 px-4 md:px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Carte 1 - Grande */}
                    <Link to="/catalog?q=iphone" className="lg:col-span-2 h-[500px] rounded-[2.5rem] overflow-hidden relative group cursor-pointer bg-black">
                        <div className="absolute inset-0 z-10 p-12 flex flex-col items-start text-white">
                            <span className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">Nouveau</span>
                            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-4">iPhone 15 Pro</h2>
                            <p className="text-lg opacity-80 max-w-sm">Titane forgé. Puce A17 Pro. Le design à son apogée.</p>
                        </div>
                        <img 
                            src="https://images.unsplash.com/photo-1695048133142-1a20484d256e?auto=format&fit=crop&q=80&w=1000" 
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                            alt="iPhone 15 Pro"
                        />
                    </Link>

                    {/* Carte 2 - Petite */}
                    <Link to="/catalog?q=audio" className="h-[500px] rounded-[2.5rem] overflow-hidden relative group cursor-pointer bg-white dark:bg-[#161926] border border-gray-100 dark:border-white/5 shadow-xl">
                        <div className="absolute inset-0 z-10 p-10 flex flex-col items-center text-center text-apple-dark dark:text-white mt-8">
                            <h2 className="text-3xl font-black italic tracking-tighter mb-2">AirPods Max</h2>
                            <p className="text-sm opacity-60">Son haute fidélité. Magie absolue.</p>
                        </div>
                        <img 
                            src="https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&q=80&w=1000" 
                            className="absolute bottom-0 w-full h-[70%] object-cover group-hover:scale-110 transition-transform duration-700"
                            alt="AirPods Max"
                        />
                    </Link>
                </div>
            </section>

            {/* STATS DYNAMIQUES */}
            <section className="py-20 px-4 md:px-6 border-y border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="max-w-7xl mx-auto flex flex-col items-center">
                    <div className="mb-12 text-center">
                        <Activity className="mx-auto text-indigo-500 mb-4" size={32} />
                        <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter text-apple-dark dark:text-white">L'écosystème TechStore</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                        <div className="text-center">
                            <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-500">
                                {stats.products}+
                            </div>
                            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-apple-dark/50 dark:text-white/40">Produits High-Tech</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-emerald-500">
                                {stats.categories}
                            </div>
                            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-apple-dark/50 dark:text-white/40">Catégories</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-500">
                                24h
                            </div>
                            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-apple-dark/50 dark:text-white/40">Livraison Express</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-500 to-red-500">
                                100%
                            </div>
                            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-apple-dark/50 dark:text-white/40">Garantie Qualité</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="py-24 px-4 md:px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="flex flex-col items-center text-center group cursor-default">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-all duration-300">
                            <Truck size={32} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-black text-apple-dark dark:text-white mb-3">Livraison Rapide</h3>
                        <p className="text-sm text-apple-dark/60 dark:text-white/50 leading-relaxed max-w-xs">Partout au Cameroun. Suivi en temps réel de votre commande jusqu'à votre porte.</p>
                    </div>

                    <div className="flex flex-col items-center text-center group cursor-default">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-all duration-300">
                            <ShieldCheck size={32} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-black text-apple-dark dark:text-white mb-3">Garantie Certifiée</h3>
                        <p className="text-sm text-apple-dark/60 dark:text-white/50 leading-relaxed max-w-xs">Tous nos produits bénéficient d'une garantie constructeur officielle.</p>
                    </div>

                    <div className="flex flex-col items-center text-center group cursor-default">
                        <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20 transition-all duration-300">
                            <Headphones size={32} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-xl font-black text-apple-dark dark:text-white mb-3">Support Premium</h3>
                        <p className="text-sm text-apple-dark/60 dark:text-white/50 leading-relaxed max-w-xs">Une équipe d'experts tech à votre disposition 7j/7 pour vous accompagner.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;