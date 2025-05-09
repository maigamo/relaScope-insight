import React, { useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  Badge,
  Heading,
  useColorModeValue
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

// 图表数据类型
export interface ChartDataItem {
  attribute: string;
  value: number;
  fullMark: number;
  description: string;
}

interface HexagonDimensionListProps {
  chartData: ChartDataItem[];
  hoveredDimension: string | null;
  onHover: (dimension: string | null) => void;
}

/**
 * 六边形模型维度列表组件
 * 显示各个维度的得分和说明
 */
const HexagonDimensionList: React.FC<HexagonDimensionListProps> = ({ 
  chartData, 
  hoveredDimension, 
  onHover 
}) => {
  const { t } = useTranslation();
  
  // 预先计算所有的颜色值，避免在渲染时调用useColorModeValue
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('green.50', 'green.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  
  // 根据得分返回不同的颜色
  const getScoreColorScheme = (score: number) => {
    if (score >= 7) return 'green';
    if (score >= 4) return 'blue';
    return 'orange';
  };

  return (
    <>
      <Heading size="sm" mb={3}>{t('hexagonModel.dimensions')}</Heading>
      <Box 
        borderRadius="md"
        boxShadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
      >
        {chartData.map((item) => (
          <Box 
            key={item.attribute}
            p={3}
            _notLast={{ borderBottomWidth: '1px' }}
            borderBottomColor={borderColor}
            bg={hoveredDimension === item.attribute ? hoverBgColor : ''}
            transition="background 0.2s"
            onMouseEnter={() => onHover(item.attribute)}
            onMouseLeave={() => onHover(null)}
          >
            <Flex justify="space-between" align="center">
              <Flex align="center">
                <Box 
                  w="3px" 
                  h="16px" 
                  bg="green.500" 
                  mr={2} 
                  borderRadius="full"
                />
                <Text fontWeight="bold">{item.attribute}</Text>
              </Flex>
              <Badge 
                colorScheme={getScoreColorScheme(item.value)}
                fontSize="sm"
              >
                {item.value}/10
              </Badge>
            </Flex>
            <Text mt={1} fontSize="sm" color={textColor}>
              {item.description}
            </Text>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default HexagonDimensionList; 