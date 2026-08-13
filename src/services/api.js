import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://3313-2804-3fc4-61e-5500-fd3c-5afd-3c6c-e121.ngrok-free.app', 
    headers: {
        'ngrok-skip-browser-warning': 'true', // Tem que ter isso!
        'Content-Type': 'application/json'
    }
});

// Interceptor: Roda antes de qualquer requisição ser enviada
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});