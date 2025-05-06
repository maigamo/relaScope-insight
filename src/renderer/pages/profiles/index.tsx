import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import ProfilesContainer from './ProfilesContainer';
import { Box } from '@chakra-ui/react';

// 错误回退组件
const ErrorFallback = ({ error, resetErrorBoundary }: { 
  error: Error; 
  resetErrorBoundary: () => void 
}) => (
  <ErrorDisplay
    type="error"
    message={error.message}
    onRetry={resetErrorBoundary}
  />
);

// 个人信息页面入口组件
const ProfilesPage: React.FC = () => {
  return (
    <Box p={5}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => window.location.reload()}
      >
        <ProfilesContainer />
      </ErrorBoundary>
    </Box>
  );
};

export default ProfilesPage; 