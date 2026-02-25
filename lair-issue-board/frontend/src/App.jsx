import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useStore from './store/useStore';
import useWebSocket from './hooks/useWebSocket';
import Header from './components/Header';
import BoardPage from './pages/BoardPage';
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';

export default function App() {
  const { isAuthenticated, setUser } = useStore();

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem('lair_token');
    if (token) {
      fetch('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((user) => setUser(user))
        .catch(() => {
          localStorage.removeItem('lair_token');
          setUser(null);
        });
    }
  }, [setUser]);

  // WebSocket for real-time updates
  useWebSocket();

  return (
    <div className="min-h-screen bg-lair-bg">
      {isAuthenticated && <Header />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/"
          element={isAuthenticated ? <BoardPage /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
