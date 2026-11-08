import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Gardien pour les pages Clients (Profil, Commandes...)
export const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null; // On attend que le système nerveux se réveille
    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Gardien pour les pages Admin (Gestion stock, Utilisateurs...)
export const AdminRoute = ({ children }) => {
    const { isAdmin, loading } = useAuth();
    if (loading) return null;
    return isAdmin() ? children : <Navigate to="/" />;
};
export const PermissionRoute = ({ children, requiredPermission }) => {
    const { user, isAuthenticated, hasPermission, loading } = useAuth();

    if (loading) return null;

    if (!isAuthenticated) return <Navigate to="/login" />;

    // Si on demande une permission spécifique
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return <Navigate to="/profile" />; // Redirection si pas le droit
    }

    return children;
};