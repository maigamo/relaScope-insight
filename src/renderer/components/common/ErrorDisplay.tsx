import React from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Box,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faWifi, faSyncAlt } from '@fortawesome/free-solid-svg-icons';

export interface ErrorDisplayProps {
  /** 错误标题 */
  title?: string;
  /** 错误消息详情 */
  message: string;
  /** 错误类型 */
  type?: 'error' | 'warning' | 'info' | 'connection' | 'data';
  /** 重试函数 */
  onRetry?: () => void;
  /** 关闭函数 */
  onClose?: () => void;
  /** 自定义按钮文本 */
  retryText?: string;
  /** 是否显示关闭按钮 */
  showClose?: boolean;
}

/**
 * 通用错误显示组件
 * 用于展示各种类型的错误，包括IPC通信错误、数据加载错误等
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title,
  message,
  type = 'error',
  onRetry,
  onClose,
  retryText,
  showClose = false,
}) => {
  const { t } = useTranslation();

  // 根据错误类型确定Alert的状态和图标
  const getAlertProps = () => {
    switch (type) {
      case 'connection':
        return {
          status: 'error' as const,
          icon: faWifi,
          defaultTitle: t('common.connectionError'),
        };
      case 'data':
        return {
          status: 'warning' as const,
          icon: faExclamationTriangle,
          defaultTitle: t('common.dataError'),
        };
      case 'warning':
        return {
          status: 'warning' as const,
          icon: faExclamationTriangle,
          defaultTitle: t('common.warning'),
        };
      case 'info':
        return {
          status: 'info' as const,
          icon: faExclamationTriangle,
          defaultTitle: t('common.info'),
        };
      case 'error':
      default:
        return {
          status: 'error' as const,
          icon: faExclamationTriangle,
          defaultTitle: t('common.error'),
        };
    }
  };

  const { status, icon, defaultTitle } = getAlertProps();
  const finalTitle = title || defaultTitle;

  return (
    <Alert
      status={status}
      variant="left-accent"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      borderRadius="md"
      p={6}
      mb={4}
    >
      <Flex w="100%" justifyContent="center" mb={2}>
        <Icon as={FontAwesomeIcon} icon={icon} boxSize="1.5em" />
      </Flex>
      <AlertTitle mt={4} mb={2} fontSize="lg">
        {finalTitle}
      </AlertTitle>
      <AlertDescription maxWidth="sm" mb={4}>
        {message}
      </AlertDescription>
      <Box>
        {onRetry && (
          <Button
            colorScheme={status === 'error' ? 'red' : status === 'warning' ? 'orange' : 'blue'}
            onClick={onRetry}
            leftIcon={<FontAwesomeIcon icon={faSyncAlt} />}
            mr={showClose ? 2 : 0}
          >
            {retryText || t('common.retry')}
          </Button>
        )}
        {showClose && onClose && (
          <Button variant="ghost" onClick={onClose} ml={2}>
            {t('common.close')}
          </Button>
        )}
      </Box>
    </Alert>
  );
};

export default ErrorDisplay; 