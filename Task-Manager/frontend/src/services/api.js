import axios from 'axios';

// Normalize API Base URL:
// - Uses import.meta.env.VITE_API_URL if provided
// - Falls back to production backend (https://my-portfolio-4seo.vercel.app/api) when built for production
// - Falls back to '/api' for local development (proxied by Vite)
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    if (trimmed.startsWith('http') && !trimmed.endsWith('/api')) {
      return `${trimmed}/api`;
    }
    return trimmed;
  }

  if (import.meta.env.PROD) {
    return 'https://my-portfolio-4seo.vercel.app/api';
  }

  return '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('todo_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle global authentication failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute =
        error.config.url.includes('/auth/login') ||
        error.config.url.includes('/auth/register') ||
        error.config.url.includes('/auth/google');

      if (!isAuthRoute) {
        localStorage.removeItem('todo_auth_token');
        localStorage.removeItem('todo_auth_user');

        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
