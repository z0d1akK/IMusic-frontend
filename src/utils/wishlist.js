import axios from '../api/axiosInstance';

export const getWishlist = () => axios.get('/wishlist');

export const addToWishlist = (productId) =>
    axios.post(`/wishlist/${productId}`);

export const removeFromWishlist = (productId) =>
    axios.delete(`/wishlist/${productId}`);