// src/services/api.js
import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', withCredentials: true });

export const fetchProducts = () => api.get('/products');

export const createOrder = (orderData) => {
    return api.post('/orders', orderData);
};
