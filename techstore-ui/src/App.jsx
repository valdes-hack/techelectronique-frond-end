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
import { useLocation } from 'react-router-dom';

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-apple-white dark:bg-apple-dark text-apple-dark dark:text-white flex flex-col transition-colors duration-500">
      <Navbar />
      <CartDrawer /> 
      <main className={`flex-grow ${isAdminRoute ? '' : 'pt-24 md:pt-32'}`}>
          <AppRouter />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;