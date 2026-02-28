import { useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TOKEN_KEY = 'family_ranking_token';

export function useAxiosInterceptor({ onUnauthorized, onError } = {}) {
  const { logout } = useAuth();

  useEffect(() => {
    const onFulfilled = (response) => response;

    const onRejected = (error) => {
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        api.defaults.headers.common['Authorization'] = null;
        logout();
        onUnauthorized?.();
      }

      const message = data?.message ?? (typeof data === 'string' ? data : error.message);
      onError?.({ status, message, data });
      return Promise.reject(error);
    };

    const reqId = api.interceptors.response.use(onFulfilled, onRejected);
    return () => api.interceptors.response.eject(reqId);
  }, [logout, onUnauthorized, onError]);
}
