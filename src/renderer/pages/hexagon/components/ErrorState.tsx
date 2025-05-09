import React from 'react';
import { Button, Center, Text, VStack } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

/**
 * 错误状态组件属性
 */
interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

/**
 * 错误状态组件
 * 显示加载失败的状态和错误信息，提供重试按钮
 */
const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <Center h="100%">
      <VStack spacing={4}>
        <Text color="red.500" fontSize="xl">加载失败</Text>
        <Text>{error}</Text>
        <Button 
          leftIcon={<FontAwesomeIcon icon={faSyncAlt} />}
          colorScheme="green"
          onClick={onRetry}
        >
          重试
        </Button>
      </VStack>
    </Center>
  );
};

export default ErrorState; 