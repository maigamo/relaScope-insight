import React from 'react';
import { Center, Spinner, Text, VStack } from '@chakra-ui/react';

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
const LoadingState: React.FC<LoadingStateProps> = ({ message = '加载模型数据中...' }) => {
  return (
    <Center h="100%">
      <VStack spacing={4}>
        <Spinner size="xl" thickness="4px" color="green.500" />
        <Text>{message}</Text>
      </VStack>
    </Center>
  );
};

export default LoadingState; 