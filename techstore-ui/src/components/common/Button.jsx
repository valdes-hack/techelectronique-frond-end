import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', loading = false }) => {
    
    // Définition des styles selon la variante
    const variants = {
        primary: 'bg-apple-blue text-white hover:bg-blue-600',
        secondary: 'bg-apple-dark text-white hover:bg-black',
        outline: 'border-2 border-apple-dark text-apple-dark hover:bg-apple-dark hover:text-white',
        ghost: 'text-apple-blue hover:bg-blue-50'
    };

    return (
        <motion.button
            whileTap={{ scale: 0.96 }} // Effet de clic "physique"
            type={type}
            onClick={onClick}
            disabled={loading}
            className={`px-8 py-3 rounded-full font-bold transition-all duration-300 flex items-center justify-center disabled:opacity-50 ${variants[variant]} ${className}`}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : children}
        </motion.button>
    );
};

export default Button;