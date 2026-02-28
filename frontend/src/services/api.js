import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'family_ranking_token';

export const api = axios.create({
  baseURL: API_BASE || '',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// Always attach stored token to requests so auth works after refresh/navigation
api.interceptors.request.use((config) => {
  const token = config.headers.Authorization?.replace(/^Bearer\s+/i, '')
    || (typeof localStorage !== 'undefined' && localStorage.getItem(TOKEN_KEY));
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export function getAuthToken() {
  const auth = api.defaults.headers.common['Authorization'];
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}
