import axios, { AxiosInstance, AxiosError } from 'axios';
import { getEnv } from '../utils/env';

// API Configuration
const API_URL = getEnv('VITE_API_URL') || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// API Service
export const apiService = {
    // Authentication
    auth: {
        register: (email: string, password: string, name: string) =>
            apiClient.post('/auth/register', { email, password, name }),

        login: (email: string, password: string) =>
            apiClient.post('/auth/login', { email, password }),

        verifyToken: (token: string) =>
            apiClient.post('/auth/verify-token', { token }),

        refreshToken: (token: string) =>
            apiClient.post('/auth/refresh', { token }),
    },

    // Tasks
    tasks: {
        getAll: () => apiClient.get('/tasks'),
        create: (task: any) => apiClient.post('/tasks', task),
        update: (id: string, updates: any) => apiClient.patch(`/tasks/${id}`, updates),
        delete: (id: string) => apiClient.delete(`/tasks/${id}`),
    },

    // Habits
    habits: {
        getAll: () => apiClient.get('/habits'),
        create: (habit: any) => apiClient.post('/habits', habit),
        complete: (id: string, date?: string) =>
            apiClient.post(`/habits/${id}/complete`, { date }),
        delete: (id: string) => apiClient.delete(`/habits/${id}`),
    },

    // Finance
    finance: {
        getAll: () => apiClient.get('/finance'),
        create: (item: any) => apiClient.post('/finance', item),
        update: (id: string, updates: any) => apiClient.patch(`/finance/${id}`, updates),
        delete: (id: string) => apiClient.delete(`/finance/${id}`),
    },

    // AI Assistant (SECURE - API key on backend)
    assistant: {
        chat: (message: string, history: any[] = []) =>
            apiClient.post('/assistant/chat', { message, history }),

        brainDump: (text: string) =>
            apiClient.post('/assistant/brain-dump', { text }),

        generateReport: () =>
            apiClient.post('/assistant/generate-report'),
    },

    // Subscription
    subscription: {
        createCheckoutSession: (priceId: string, successUrl: string, cancelUrl: string) =>
            apiClient.post('/subscription/create-checkout-session', {
                priceId,
                successUrl,
                cancelUrl
            }),

        getStatus: () => apiClient.get('/subscription/status'),

        cancel: () => apiClient.post('/subscription/cancel'),

        reactivate: () => apiClient.post('/subscription/reactivate'),

        createPortalSession: (returnUrl: string) =>
            apiClient.post('/subscription/create-portal-session', { returnUrl }),
    },

    // User Management
    user: {
        getProfile: () => apiClient.get('/user/profile'),

        updateProfile: (updates: any) => apiClient.patch('/user/profile', updates),

        exportData: () => apiClient.post('/user/export-data'),

        deleteAccount: () => apiClient.delete('/user/account'),
    },
};

// Helper to set auth token
export const setAuthToken = (token: string) => {
    localStorage.setItem('authToken', token);
};

// Helper to clear auth token
export const clearAuthToken = () => {
    localStorage.removeItem('authToken');
};

export default apiService;
