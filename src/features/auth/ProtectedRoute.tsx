import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F4] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#163A2B] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-semibold text-[#163A2B] font-brand tracking-wider">
          Verificando sesión...
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
