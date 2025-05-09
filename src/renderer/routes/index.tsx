import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/common/MainLayout';
import SuspenseFallback from '../components/common/SuspenseFallback';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Alert, AlertIcon, AlertTitle, AlertDescription, Button, Box } from '@chakra-ui/react';

// ErrorBoundary组件的Fallback
const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => (
  <Box p={5}>
    <Alert
      status="error"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="200px"
      borderRadius="md"
    >
      <AlertIcon boxSize="40px" mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg">
        页面加载出错
      </AlertTitle>
      <AlertDescription maxWidth="sm">
        {error.message}
      </AlertDescription>
      <Button onClick={resetErrorBoundary} mt={4} colorScheme="red">
        重试
      </Button>
    </Alert>
  </Box>
);

// 页面加载器HOC
const withErrorBoundary = (Component: React.ComponentType, fallback?: React.ReactNode) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <React.Suspense fallback={fallback || <SuspenseFallback />}>
        <Component />
      </React.Suspense>
    </ErrorBoundary>
  );
};

// 懒加载页面组件
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const ProfilesPage = React.lazy(() => import('../pages/profiles'));
const QuotesPage = React.lazy(() => import('../pages/quotes/QuotesPage'));
const ExperiencesPage = React.lazy(() => import('../pages/experiences/ExperiencesPage'));
const HexagonPage = React.lazy(() => import('../pages/hexagon'));
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
        element: withErrorBoundary(Dashboard, <SuspenseFallback message="加载仪表盘..." />),
      },
      {
        path: '/profiles',
        element: withErrorBoundary(ProfilesPage, <SuspenseFallback message="加载个人档案..." />),
      },
      {
        path: '/quotes',
        element: withErrorBoundary(QuotesPage, <SuspenseFallback message="加载语录..." />),
      },
      {
        path: '/experiences',
        element: withErrorBoundary(ExperiencesPage, <SuspenseFallback message="加载经历..." />),
      },
      {
        path: '/hexagon',
        element: withErrorBoundary(HexagonPage, <SuspenseFallback message="加载六边形模型..." />),
      },
      {
        path: '/analysis',
        element: withErrorBoundary(AnalysisPage, <SuspenseFallback message="加载分析..." />),
      },
      {
        path: '/settings',
        element: withErrorBoundary(SettingsPage, <SuspenseFallback message="加载设置..." />),
      },
      {
        path: '*',
        element: withErrorBoundary(NotFoundPage, <SuspenseFallback message="页面未找到..." />),
      },
    ],
  },
]);

export default router; 