import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from 'recharts';
import { motion } from 'framer-motion';
import { ChartDataItem } from './HexagonDimensionList';

/**
 * 自定义工具提示组件
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

interface HexagonChartProps {
  chartData: ChartDataItem[];
  scale: number;
  tooltipComponent: React.FC<CustomTooltipProps>;
}

/**
 * 六边形雷达图表组件
 * 使用recharts绘制六边形模型的雷达图
 */
const HexagonChart: React.FC<HexagonChartProps> = ({ 
  chartData, 
  scale,
  tooltipComponent: CustomTooltip
}) => {
  // 主题色彩
  const radarFill = useColorModeValue('rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.4)');
  const radarStroke = useColorModeValue('#22c55e', '#4ade80');
  const gridColor = useColorModeValue('#d1d5db', '#4b5563');
  
  return (
    <Box 
      borderRadius="lg" 
      bg={useColorModeValue('white', 'gray.800')} 
      p={6} 
      boxShadow="sm"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 } as any}
      mb={6}
      transform={`scale(${scale})`}
      transformOrigin="center center"
      position="relative"
    >
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke={gridColor} />
          <PolarAngleAxis 
            dataKey="attribute" 
            tick={{ 
              fill: useColorModeValue('#000', '#fff'),
              fontSize: 14,
              fontWeight: 'normal'
            }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 10]} 
            tickCount={6}
            tick={{
              fill: useColorModeValue('#666', '#aaa')
            }}
          />
          <Radar
            name="六边形人性模型"
            dataKey="value"
            stroke={radarStroke}
            fill={radarFill}
            fillOpacity={0.6}
            activeDot={{ r: 5, fill: '#22c55e', stroke: 'white', strokeWidth: 2 }}
          />
          <RechartsTooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default HexagonChart; 