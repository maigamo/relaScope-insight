import React, { useEffect, useState } from 'react';
import { Box, Flex, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ipcService } from '../../../services/ipc';
import HexagonChart from './HexagonChart';
import HexagonDimensionList, { ChartDataItem } from './HexagonDimensionList';
import HexagonChartToolbar from './HexagonChartToolbar';
import EmptyHexagonState from './EmptyHexagonState';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import HexagonTooltip from './HexagonTooltip';

// 六边形模型数据类型
interface HexagonModelData {
  id: number;
  profileId: number;
  title: string;
  security: number;
  achievement: number;
  freedom: number;
  belonging: number;
  novelty: number;
  control: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface HexagonModelChartProps {
  profileId: number | null;
  onViewDetail: (modelId: number) => void;
  onRefresh: () => void;
}

// 维度说明
const dimensionDescriptions = {
  security: "对稳定、确定性和安全保障的追求程度",
  achievement: "对成功、认可和成就的追求程度",
  freedom: "对自主、独立和自由的追求程度",
  belonging: "对关系、团体和归属的追求程度",
  novelty: "对新奇、刺激和变化的追求程度",
  control: "对掌控、影响和主导的追求程度"
};

// 中文映射
const dimensionLabels = {
  security: "安全感",
  achievement: "成就感",
  freedom: "自由感",
  belonging: "归属感",
  novelty: "新奇感", 
  control: "掌控感"
};

/**
 * 六边形模型图表组件
 * 根据选中的档案显示六边形模型分析结果
 */
const HexagonModelChart: React.FC<HexagonModelChartProps> = ({ 
  profileId, 
  onViewDetail, 
  onRefresh 
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelData, setModelData] = useState<HexagonModelData | null>(null);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [scale, setScale] = useState(1);
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null);
  
  // 获取模型数据
  useEffect(() => {
    const fetchModelData = async () => {
      if (!profileId) {
        setModelData(null);
        setChartData([]);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // 向后端请求数据
        const response = await ipcService.invoke('db:hexagon:getByProfile', { profileId });
        
        let data = null;
        if (response && response.success && response.data) {
          data = response.data;
        } else if (Array.isArray(response) && response.length > 0) {
          data = response[0];
        }
        
        if (data) {
          setModelData(data);
          
          // 转换为图表数据格式
          const chartData: ChartDataItem[] = [
            { attribute: dimensionLabels.security, value: data.security, fullMark: 10, description: dimensionDescriptions.security },
            { attribute: dimensionLabels.achievement, value: data.achievement, fullMark: 10, description: dimensionDescriptions.achievement },
            { attribute: dimensionLabels.freedom, value: data.freedom, fullMark: 10, description: dimensionDescriptions.freedom },
            { attribute: dimensionLabels.belonging, value: data.belonging, fullMark: 10, description: dimensionDescriptions.belonging },
            { attribute: dimensionLabels.novelty, value: data.novelty, fullMark: 10, description: dimensionDescriptions.novelty },
            { attribute: dimensionLabels.control, value: data.control, fullMark: 10, description: dimensionDescriptions.control }
          ];
          
          setChartData(chartData);
        } else {
          // 如果没有数据，设置默认模型
          setModelData(null);
          
          const defaultChartData: ChartDataItem[] = [
            { attribute: dimensionLabels.security, value: 5, fullMark: 10, description: dimensionDescriptions.security },
            { attribute: dimensionLabels.achievement, value: 5, fullMark: 10, description: dimensionDescriptions.achievement },
            { attribute: dimensionLabels.freedom, value: 5, fullMark: 10, description: dimensionDescriptions.freedom },
            { attribute: dimensionLabels.belonging, value: 5, fullMark: 10, description: dimensionDescriptions.belonging },
            { attribute: dimensionLabels.novelty, value: 5, fullMark: 10, description: dimensionDescriptions.novelty },
            { attribute: dimensionLabels.control, value: 5, fullMark: 10, description: dimensionDescriptions.control }
          ];
          
          setChartData(defaultChartData);
        }
      } catch (err: any) {
        console.error('获取六边形模型数据失败:', err);
        setError(err?.message || '加载模型失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchModelData();
  }, [profileId]);
  
  // 处理图表下载
  const handleDownloadChart = () => {
    // 实现下载功能，可使用html2canvas或dom-to-image
    console.log('下载图表');
  };
  
  // 处理缩放
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2));
  };
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.6));
  };
  
  // 处理刷新
  const handleRefresh = () => {
    if (profileId) {
      setLoading(true);
      // 实现模型刷新逻辑
      setTimeout(() => {
        setLoading(false);
        onRefresh();
      }, 1000);
    }
  };
  
  // 转换日期格式
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 无档案选择状态
  if (!profileId) {
    return <EmptyHexagonState />;
  }
  
  // 加载状态
  if (loading) {
    return <LoadingState />;
  }
  
  // 错误状态
  if (error) {
    return <ErrorState error={error} onRetry={handleRefresh} />;
  }
  
  // 渲染图表
  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Box>
          <Heading size="md">{modelData?.title || '六边形人性模型'}</Heading>
          {modelData && (
            <Text fontSize="sm" color="gray.500">
              更新于: {formatDate(modelData.updatedAt)}
            </Text>
          )}
        </Box>
        
        {/* 工具栏 */}
        <HexagonChartToolbar 
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRefresh={handleRefresh}
          onDownload={handleDownloadChart}
          onViewHistory={() => modelData && onViewDetail(modelData.id)}
          showHistory={!!modelData}
        />
      </Flex>
      
      {/* 图表区域 */}
      <HexagonChart 
        chartData={chartData} 
        scale={scale}
        tooltipComponent={HexagonTooltip}
      />
      
      {/* 维度说明 */}
      <HexagonDimensionList 
        chartData={chartData}
        hoveredDimension={hoveredDimension}
        onHover={setHoveredDimension}
      />
    </Box>
  );
};

export default HexagonModelChart; 