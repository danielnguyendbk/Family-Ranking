/**
 * Centralized API calls matching backend exactly.
 * Base path: /api (proxied to backend at / in dev)
 */
import { api } from './api';

const P = '/api';

// ----- Auth -----
export const authApi = {
  register: (data) =>
    api.post(`${P}/auth/register`, data),

  login: (data) =>
    api.post(`${P}/auth/login`, data),
};

// ----- Users -----
export const usersApi = {
  getMe: () =>
    api.get(`${P}/users/me`),

  updateProfile: (data) =>
    api.put(`${P}/users/profile`, data),

  getAll: () =>
    api.get(`${P}/users`),

  create: (data) =>
    api.post(`${P}/users`, data),

  update: (id, data) =>
    api.put(`${P}/users/${id}`, data),

  delete: (id) =>
    api.delete(`${P}/users/${id}`),
};

// ----- Games -----
export const gamesApi = {
  getAll: () =>
    api.get(`${P}/games`),

  create: (data) =>
    api.post(`${P}/games`, data),

  update: (id, data) =>
    api.put(`${P}/games/${id}`, data),

  delete: (id) =>
    api.delete(`${P}/games/${id}`),
};

// ----- Teams -----
export const teamsApi = {
  getByGame: (gameId) =>
    api.get(`${P}/teams`, { params: { gameId } }),

  create: (data) =>
    api.post(`${P}/teams`, data),
};

// ----- Matches -----
export const matchesApi = {
  create: (data) =>
    api.post(`${P}/matches/create`, data),

  accept: (id) =>
    api.post(`${P}/matches/${id}/accept`),

  reject: (id) =>
    api.post(`${P}/matches/${id}/reject`),

  requestSettlement: (id) =>
    api.post(`${P}/matches/${id}/settle-request`),

  confirmSettlement: (id) =>
    api.post(`${P}/matches/${id}/settle-confirm`),

  getMyMatches: () =>
    api.get(`${P}/matches/my`),

  getRanking: (gameId) =>
    api.get(`${P}/matches/ranking`, { params: { gameId } }),
};
