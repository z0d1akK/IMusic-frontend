import React from 'react';
import { Navigate } from 'react-router-dom';
import { extractRolesFromToken } from './jwt';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const roles = extractRolesFromToken(token);

    if (!Array.isArray(roles) || roles.length === 0) {
        return <Navigate to="/unauthorized" replace />;
    }

    if (Array.isArray(allowedRoles)) {
        const hasAccess = roles.some((role) => allowedRoles.includes(role));
        if (!hasAccess) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
