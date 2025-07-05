import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import GeminiPage from './pages/GeminiPage';
import LoadingSpinner from './components/LoadingSpinner';

// Admin components
import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ApiKeysManagement from './pages/admin/ApiKeysManagement';
import ApiKeysManagementAdvanced from './pages/admin/ApiKeysManagementAdvanced';
import UsersManagement from './pages/admin/UsersManagement';
import UsersManagementAdvanced from './pages/admin/UsersManagementAdvanced';
import RequestsHistory from './pages/admin/RequestsHistory';
import SystemSettings from './pages/admin/SystemSettings';
import RealTimeMonitoring from './pages/admin/RealTimeMonitoring';

// PROMPT PARA COPILOT: App principal com React Router, AuthProvider e rotas protegidas

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return isLoggedIn ? <>{children}</> : <Navigate to="/" replace />;
};

const AppRoutes: React.FC = () => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando aplicação...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isLoggedIn ? <Navigate to="/gemini" replace /> : <LoginPage />
        } 
      />
      <Route 
        path="/gemini" 
        element={
          <ProtectedRoute>
            <GeminiPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="api-keys" element={<ApiKeysManagement />} />
        <Route path="api-keys-advanced" element={<ApiKeysManagementAdvanced />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="users-advanced" element={<UsersManagementAdvanced />} />
        <Route path="requests" element={<RequestsHistory />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="monitoring" element={<RealTimeMonitoring />} />
      </Route>
      
      <Route 
        path="*" 
        element={<Navigate to="/" replace />} 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
