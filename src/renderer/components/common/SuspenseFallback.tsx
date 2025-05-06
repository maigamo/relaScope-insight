import React from 'react';
import { Flex, Spinner, Text, Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface SuspenseFallbackProps {
  message?: string;
}

/**
 * 组件懒加载时的加载状态组件
 */
const SuspenseFallback: React.FC<SuspenseFallbackProps> = ({ message }) => {
  const { t } = useTranslation();
  
  return (
    <Flex 
      height="100%" 
      width="100%" 
      alignItems="center" 
      justifyContent="center"
      p={8}
      flexDirection="column"
    >
      <Box mb={4}>
        <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
      </Box>
      <Text fontWeight="medium">
        {message || t('common.loading')}
      </Text>
    </Flex>
  );
};

export default SuspenseFallback; 