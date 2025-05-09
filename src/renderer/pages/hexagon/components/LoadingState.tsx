import React from 'react';
import { Center, Spinner, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

/**
 * 加载状态组件属性
 */
interface LoadingStateProps {
  message?: string;
}

/**
 * 加载状态组件
 * 显示加载中的状态和提示信息
 */
const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  const { t } = useTranslation();
  const defaultMessage = t('hexagonModel.loading');

  return (
    <Center h="100%">
      <VStack spacing={4}>
        <Spinner size="xl" thickness="4px" color="green.500" />
        <Text>{message || defaultMessage}</Text>
      </VStack>
    </Center>
  );
};

export default LoadingState; 