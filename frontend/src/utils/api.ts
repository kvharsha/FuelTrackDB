import axios from 'axios';

// Get the API base URL from the environment variable (defined in docker-compose.yml)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 1. Create a basic instance for non-authenticated endpoints (Login/Register)
export const publicApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Create an instance for authenticated endpoints (Stations, User Data)
export const protectedApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach the JWT/Token to every protected request
protectedApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Django REST Framework (DRF) often uses Token Authentication
            config.headers['Authorization'] = `Token ${token}`; 
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);