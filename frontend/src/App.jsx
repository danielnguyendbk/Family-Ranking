import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { useAxiosInterceptor } from './hooks/useAxiosInterceptor';
import { ProtectedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { GameRankingPage } from './pages/GameRankingPage';
import { MatchHistoryPage } from './pages/MatchHistoryPage';
import { CreateMatchPage } from './pages/CreateMatchPage';
import { PendingMatchesPage } from './pages/PendingMatchesPage';
import { BetSettlementPage } from './pages/BetSettlementPage';
import { ProfilePage } from './pages/ProfilePage';
import { UsersPage } from './pages/UsersPage';
import { TeamsPage } from './pages/TeamsPage';

function AppRoutes() {
  useAxiosInterceptor({
    onError: () => {},
  });

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pending"
        element={
          <ProtectedRoute>
            <PendingMatchesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bet-settlement"
        element={
          <ProtectedRoute>
            <BetSettlementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/:gameId"
        element={
          <ProtectedRoute>
            <GameRankingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/:gameId/teams"
        element={
          <ProtectedRoute>
            <TeamsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/:gameId/matches"
        element={
          <ProtectedRoute>
            <MatchHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/:gameId/match/create"
        element={
          <ProtectedRoute>
            <CreateMatchPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
