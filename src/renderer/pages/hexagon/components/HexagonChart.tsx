import React, { useRef, useState } from 'react';
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
import html2canvas from 'html2canvas';

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
  onExportSuccess?: (dataUrl: string) => void;
  onExportError?: (error: Error) => void;
}

/**
 * 六边形雷达图表组件
 * 使用recharts绘制六边形模型的雷达图
 */
const HexagonChart: React.FC<HexagonChartProps> = ({ 
  chartData, 
  scale,
  tooltipComponent: CustomTooltip,
  onExportSuccess,
  onExportError
}) => {
  // 主题色彩
  const radarFill = useColorModeValue('rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.4)');
  const radarStroke = useColorModeValue('#22c55e', '#4ade80');
  const gridColor = useColorModeValue('#d1d5db', '#4b5563');
  
  // 图表引用
  const chartRef = useRef<HTMLDivElement>(null);
  
  // 旋转状态
  const [rotation, setRotation] = useState(0);
  
  // 导出图表为图片
  const exportChart = async () => {
    if (!chartRef.current) return;
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: null,
        scale: 2, // 提高导出图片的质量
        logging: false,
        allowTaint: true,
        useCORS: true
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      
      // 创建下载链接
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `hexagon-model-${new Date().toISOString().slice(0, 10)}.png`;
      
      // 触发下载
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // 通知成功
      if (onExportSuccess) {
        onExportSuccess(dataUrl);
      }
    } catch (error) {
      console.error('导出图表失败:', error);
      if (onExportError) {
        onExportError(error as Error);
      }
    }
  };
  
  // 旋转图表
  const rotateChart = () => {
    setRotation((prev) => (prev + 60) % 360);
  };
  
  return (
    <Box 
      ref={chartRef}
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
      transform={`scale(${scale}) rotate(${rotation}deg)`}
      transformOrigin="center center"
      position="relative"
      _hover={{ 
        boxShadow: "md",
        cursor: "pointer",
        transition: "all 0.3s ease"
      }}
      onClick={rotateChart}
      onDoubleClick={exportChart} // 双击导出
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
            tick={false}
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