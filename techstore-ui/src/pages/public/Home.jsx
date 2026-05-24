import React, { useEffect } from 'react'; // <--- LE FIX EST ICI ✨
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const Home = () => {
    
    // NOTRE TEST DE LA VÉRITÉ
    useEffect(() => {
        console.log("🚀 Lancement du test brut...");
        fetch('http://localhost:8080/api/v1/categories')
            .then(res => {
                console.log("🕵️‍♂️ RÉSULTAT DU TEST BRUT (Status) :", res.status);
                if (res.status === 200) console.log("✅ HOURRA ! L'URL est bonne, c'est Axios qui bloque !");
                if (res.status === 404) console.log("❌ ZUT ! Même sans Axios, l'URL est introuvable...");
                return res.json();
            })
            .then(data => console.log("📦 DONNÉES REÇUES :", data))
            .catch(err => console.error("💥 ERREUR RÉSEAU :", err));
    }, []);

    // ... Le reste de ton composant Home (le return etc.)
    return (
        <div className="bg-white select-none">
            
            {/* HERO SECTION - L'IMMERSION TOTALE */}
           <section className="relative min-h-screen flex flex-col items-center pt-32 md:pt-48 pb-20 text-center px-6 overflow-hidden">
    
    {/* Conteneur de texte pour mieux contrôler l'espacement */}
    <div className="flex flex-col items-center max-w-6xl mx-auto">
        
        {/* Petit texte au-dessus du titre */}
        <motion.span 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-apple-blue font-bold tracking-[0.2em] mb-6 text-xs md:text-sm uppercase"
        >
            Nouveau.
        </motion.span>

        {/* Titre Principal GÉANT - Ajusté pour éviter la collision */}
        <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-bold tracking-tighter text-apple-dark max-w-4xl leading-[0.9] md:leading-none"
        >
            TechStore<span className="text-apple-blue">.</span> <br className="md:hidden" /> Le futur entre vos mains.
        </motion.h1>

        {/* Sous-titre élégant */}
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-8 text-lg md:text-2xl text-apple-dark/60 max-w-2xl font-medium px-4"
        >
            Découvrez une collection d'exception, conçue pour <br className="hidden md:block" /> repousser les limites du possible.
        </motion.p>

        {/* CTAs élégants */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-12 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 items-center"
        >
            <button className="bg-apple-blue text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-600 transition-all hover:scale-105 active:scale-95 flex items-center group shadow-lg shadow-blue-500/20">
                Acheter 
                <ChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            <button className="text-apple-blue font-bold text-lg flex items-center group hover:underline underline-offset-4">
                En savoir plus 
                <ChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" size={20} />
            </button>
        </motion.div>
    </div>

    {/* IMAGE DU PRODUIT GÉANTE - On l'espace un peu plus du texte */}
    <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
        className="mt-20 md:mt-28 w-full max-w-5xl px-4 md:px-0"
    >
        <img 
            src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=2000" 
            alt="Apple Laptop Display" 
            className="rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full object-cover"
        />
    </motion.div>
</section>

            {/* SECTION BENTO GRID - LE LOOK PRO */}
            <section className="bg-apple-gray py-24 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Carte 1 */}
                    <div className="h-[600px] bg-white rounded-apple overflow-hidden relative group cursor-pointer border border-transparent hover:border-apple-blue/20 transition-all duration-500">
                        <div className="p-12 text-center">
                            <h2 className="text-4xl font-bold text-apple-dark mb-4 italic">Série iPhone 15 Pro</h2>
                            <p className="text-xl text-apple-dark/60 font-medium italic">Le titane. Plus léger. Plus puissant.</p>
                        </div>
                        <img 
                            src="https://images.unsplash.com/photo-1695048133142-1a20484d256e?auto=format&fit=crop&q=80&w=1000" 
                            className="absolute bottom-0 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>

                    {/* Carte 2 */}
                    <div className="h-[600px] bg-apple-dark rounded-apple overflow-hidden relative group cursor-pointer transition-all duration-500">
                        <div className="p-12 text-center text-white">
                            <h2 className="text-4xl font-bold mb-4">MacBook Air M3</h2>
                            <p className="text-xl text-white/60 font-medium">Tout en finesse. Surtout en force.</p>
                        </div>
                        <img 
                            src="https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=1000" 
                            className="absolute bottom-0 w-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                        />
                    </div>

                </div>
            </section>
        </div>
    );
};

export default Home;