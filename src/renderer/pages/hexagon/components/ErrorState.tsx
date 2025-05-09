import React from 'react';
import { Button, Center, Text, VStack } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  
  return (
    <Center h="100%">
      <VStack spacing={4}>
        <Text color="red.500" fontSize="xl">{t('hexagonModel.loadingFailed')}</Text>
        <Text>{error}</Text>
        <Button 
          leftIcon={<FontAwesomeIcon icon={faSyncAlt} />}
          colorScheme="green"
          onClick={onRetry}
        >
          {t('common.retry')}
        </Button>
      </VStack>
    </Center>
  );
};

export default ErrorState; 