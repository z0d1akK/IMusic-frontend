import { jwtDecode } from 'jwt-decode';

export const extractRolesFromToken = (token) => {
    try {
        const decoded = jwtDecode(token);
        const roles = Array.isArray(decoded?.roles) ? decoded.roles : [];
        return roles.filter((role) => typeof role === 'string');
    } catch (error) {
        console.error('Ошибка декодирования JWT', error);
        return [];
    }
};

export const getUserFromToken = (token) => {
    try {
        return jwtDecode(token);
    } catch {
        return null;
    }
};
