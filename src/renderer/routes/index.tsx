import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/common/MainLayout';

// 懒加载页面组件
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const ProfilesPage = React.lazy(() => import('../pages/profiles/ProfilesPage'));
const QuotesPage = React.lazy(() => import('../pages/quotes/QuotesPage'));
const ExperiencesPage = React.lazy(() => import('../pages/experiences/ExperiencesPage'));
const AnalysisPage = React.lazy(() => import('../pages/analysis/AnalysisPage'));
const SettingsPage = React.lazy(() => import('../pages/settings/SettingsPage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));

// 创建路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: '/dashboard',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <Dashboard />
          </React.Suspense>
        ),
      },
      {
        path: '/profiles',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <ProfilesPage />
          </React.Suspense>
        ),
      },
      {
        path: '/quotes',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <QuotesPage />
          </React.Suspense>
        ),
      },
      {
        path: '/experiences',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <ExperiencesPage />
          </React.Suspense>
        ),
      },
      {
        path: '/analysis',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <AnalysisPage />
          </React.Suspense>
        ),
      },
      {
        path: '/settings',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <SettingsPage />
          </React.Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <NotFoundPage />
          </React.Suspense>
        ),
      },
    ],
  },
]);

export default router; 