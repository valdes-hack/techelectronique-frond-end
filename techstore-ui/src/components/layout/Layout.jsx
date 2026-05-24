import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
    return (
        // La classe 'dark:bg-apple-dark' assure que le fond change pour tout le site ✨
        <div className="min-h-screen bg-white dark:bg-apple-dark transition-colors duration-500 flex flex-col">
            
            {/* Navigation fixe */}
            <Navbar />

            {/* Tiroir du panier accessible partout */}
            <CartDrawer />

            {/* Contenu de la page avec animation de transition Apple */}
            <motion.main 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex-1"
            >
                {children}
            </motion.main>

            {/* Pied de page */}
            <Footer />
        </div>
    );
};

export default Layout;