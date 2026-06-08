import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppRouter from './routes/AppRouter';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          {/* 1. Le cerveau Sécurité (Gère l'utilisateur) */}
          <AuthProvider>
            {/* 2. Le cerveau Panier (Gère les articles du sac) */}
            <CartProvider>
            
            <div className="min-h-screen bg-apple-white dark:bg-apple-dark text-apple-dark dark:text-white flex flex-col transition-colors duration-500">
              {/* Barre de navigation */}
              <Navbar />
              
              {/* Le tiroir du panier (Invisible par défaut, s'ouvre au clic) */}
              <CartDrawer /> 

              {/* Contenu dynamique des pages */}
              <main className="flex-grow pt-24 md:pt-32">
                  <AppRouter />
              </main>

              {/* Pied de page global */}
              <Footer />
            </div>

            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;