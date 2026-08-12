import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://nondualistically-ostensive-luella.ngrok-free.dev', 
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