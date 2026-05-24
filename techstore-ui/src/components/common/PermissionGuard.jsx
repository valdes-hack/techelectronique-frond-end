import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Ce composant protège n'importe quel élément HTML ou Composant React
 * selon les permissions de l'utilisateur.
 * 
 * @param {string} permission - La permission requise (ex: "CAN_ADD_PRODUCT")
 * @param {boolean} adminOnly - Si vrai, seul un ROLE_ADMIN peut passer
 */
const PermissionGuard = ({ children, permission, adminOnly = false }) => {
    const { hasPermission, isAdmin, isAuthenticated } = useAuth();

    // 1. Si on n'est même pas connecté, on ne montre rien
    if (!isAuthenticated) return null;

    // 2. Si c'est réservé strictement aux Admins (Super-pouvoirs)
    if (adminOnly && !isAdmin()) {
        return null;
    }

    // 3. Si une permission spécifique est demandée
    if (permission && !hasPermission(permission)) {
        return null;
    }

    // Si tout est bon, on affiche l'élément (les enfants) !
    return <>{children}</>;
};

export default PermissionGuard;