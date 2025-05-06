import React from 'react';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import { motion } from 'framer-motion';

interface ProfilesErrorStateProps {
  errorType: 'connection' | 'data' | 'error';
  message: string;
  onRetry: () => void;
  title?: string;
  retryText?: string;
}

const ProfilesErrorState: React.FC<ProfilesErrorStateProps> = ({
  errorType,
  message,
  onRetry,
  title,
  retryText
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ErrorDisplay
        type={errorType}
        message={message}
        title={title}
        onRetry={onRetry}
        retryText={retryText}
      />
    </motion.div>
  );
};

export default ProfilesErrorState; 