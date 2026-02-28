import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getAuthToken, setAuthToken } from '../services/api';
import { usersApi } from '../services/apiService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'family_ranking_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY) || getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setAuthToken(token);
    try {
      const { data } = await usersApi.getMe();
      setUser(data);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) setAuthToken(token);
    loadUser();
  }, [loadUser]);

  const login = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
    return loadUser();
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser: loadUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
