import axios from './axiosInstance';
import { extractRolesFromToken } from '../utils/jwt';

export const login = async (credentials) => {
    const response = await axios.post('/auth/login', credentials);
    const { id: userId, token } = response.data;

    const roles = extractRolesFromToken(token);

    localStorage.setItem('userId', userId);
    localStorage.setItem('token', token);
    localStorage.setItem('roles', JSON.stringify(roles));

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
    ['token', 'roles', 'userId'].forEach((key) => localStorage.removeItem(key));
};
