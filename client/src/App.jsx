import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import TaskList from './TaskList';
import RequireAuth from './RequireAuth';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  function handleLogin(newToken) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setToken(null);
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

      <Route
        path="/tasks"
        element={
          <RequireAuth token={token}>
            <TaskList token={token} onLogout={handleLogout} />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to={token ? '/tasks' : '/login'} replace />} />
    </Routes>
  );
}