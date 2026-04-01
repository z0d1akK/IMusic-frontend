import axios from './axiosInstance';
import { extractRolesFromToken } from '../utils/jwt';
import { loadUserComparisons } from '../utils/comparison';

export const login = async (credentials) => {
    const response = await axios.post('/auth/login', credentials);
    const { id: userId, token } = response.data;

    const roles = extractRolesFromToken(token);

    localStorage.removeItem('comparisonId');
    localStorage.removeItem('comparisonProducts');

    localStorage.setItem('userId', userId);
    localStorage.setItem('token', token);
    localStorage.setItem('roles', JSON.stringify(roles));

    if (roles.includes('CLIENT')) {
        await loadUserComparisons();
    }

    return { token, roles };
};

export const register = async (data) => {
    const response = await axios.post('/auth/register', data);
    const { id: userId, token } = response.data;

    const roles = extractRolesFromToken(token);

    localStorage.setItem('userId', userId);
    localStorage.setItem('token', token);
    localStorage.setItem('roles', JSON.stringify(roles));

    return { token, roles };
};

export const logout = () => {
    ['token', 'roles', 'userId', 'comparisonId', 'comparisonProducts'].forEach((key) => localStorage.removeItem(key));
};