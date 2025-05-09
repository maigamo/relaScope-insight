import React from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

/**
 * 雷达图工具提示组件属性
 */
interface HexagonTooltipProps {
  active?: boolean;
  payload?: any[];
}

/**
 * 六边形模型雷达图工具提示组件
 * 用于显示维度详细信息的悬停提示
 */
const HexagonTooltip: React.FC<HexagonTooltipProps> = ({ active, payload }) => {
  const { t } = useTranslation();
  const tooltipBackground = useColorModeValue('white', 'gray.800');
  
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box 
        bg={tooltipBackground} 
        p={2} 
        borderRadius="md" 
        boxShadow="md"
        border="1px solid"
        borderColor="gray.200"
      >
        <Text fontWeight="bold">{data.attribute}</Text>
        <Text>{t('hexagonModel.score')}: {data.value}/10</Text>
        <Text fontSize="sm" maxW="200px">{data.description}</Text>
      </Box>
    );
  }
  return null;
};

export default HexagonTooltip; 