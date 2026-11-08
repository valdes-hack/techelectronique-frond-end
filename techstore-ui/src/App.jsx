import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import AppRouter from './routes/AppRouter';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import TopProgressBar from './components/common/TopProgressBar';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import { StockConfigProvider } from './context/StockConfigContext';
import { useLocation } from 'react-router-dom';

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-apple-white dark:bg-[#0b0e14] text-apple-dark dark:text-white flex flex-col transition-colors duration-500">
      <TopProgressBar />
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <CartDrawer />} 
      <main className={`flex-grow ${isAdminRoute ? '' : 'pt-24 md:pt-32'}`}>
          <AppRouter />
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <StockConfigProvider>
          <BrowserRouter>
            <AuthProvider>
              <CartProvider>
                <ToastProvider>
                  <AppContent />
                </ToastProvider>
              </CartProvider>
            </AuthProvider>
          </BrowserRouter>
        </StockConfigProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;