import React from 'react';
import {
  Box,
  Flex,
  Text,
  Badge,
  Heading,
  useColorModeValue
} from '@chakra-ui/react';

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
  // 根据得分返回不同的颜色
  const getScoreColorScheme = (score: number) => {
    if (score >= 7) return 'green';
    if (score >= 4) return 'blue';
    return 'orange';
  };

  return (
    <>
      <Heading size="sm" mb={3}>维度解析</Heading>
      <Box 
        borderRadius="md"
        boxShadow="sm"
        borderWidth="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        {chartData.map((item) => (
          <Box 
            key={item.attribute}
            p={3}
            _notLast={{ borderBottomWidth: '1px' }}
            borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
            bg={hoveredDimension === item.attribute ? 
              useColorModeValue('green.50', 'green.900') : ''}
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
            <Text mt={1} fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
              {item.description}
            </Text>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default HexagonDimensionList; 