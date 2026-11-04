import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { HomePage } from '@/features/dashboard/HomePage';
import { DataUploadPage } from '@/features/business/DataUploadPage';
import { MapPage } from '@/features/map/MapPage';
import { AssistantPage } from '@/features/assistant/AssistantPage';
import { StatsPage } from '@/features/stats/StatsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: '/inicio',
        element: <HomePage />,
      },
      {
        path: '/carga-datos',
        element: <DataUploadPage />,
      },
      {
        path: '/mapa',
        element: <MapPage />,
      },
      {
        path: '/asistente',
        element: <AssistantPage />,
      },
      {
        path: '/estadisticas',
        element: <StatsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/inicio" replace />,
  },
]);

