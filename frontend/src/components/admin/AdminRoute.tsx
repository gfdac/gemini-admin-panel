import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

// PROMPT PARA COPILOT: Componente para proteger rotas administrativas - só admins podem acessar

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isLoggedIn, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // Verifica se o usuário é admin
  if (user?.role !== 'admin') {
    return <Navigate to="/gemini" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
