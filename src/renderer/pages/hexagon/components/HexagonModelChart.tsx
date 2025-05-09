import React, { useEffect, useState } from 'react';
import { Box, Flex, Heading, Text, useColorModeValue, useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { HexagonService } from '../../../services/ipc/hexagon.service';
import HexagonChart from './HexagonChart';
import HexagonDimensionList, { ChartDataItem } from './HexagonDimensionList';
import HexagonChartToolbar from './HexagonChartToolbar';
import EmptyHexagonState from './EmptyHexagonState';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import HexagonTooltip from './HexagonTooltip';
import { HexagonModel } from '../../../../common/types/database';
import i18n from '../../../i18n';

// 六边形模型数据类型，使用通用类型而不是重新定义
interface HexagonModelData extends Omit<HexagonModel, 'id'> {
  id: number;  // 确保id是必需的，而不是可选的
}

interface HexagonModelChartProps {
  profileId: number | null;
  onViewDetail: (modelId: number) => void;
  onRefresh: () => void;
}

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
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelData, setModelData] = useState<HexagonModelData | null>(null);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [scale, setScale] = useState(1);
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // 监听语言变化
  useEffect(() => {
    const handleLanguageChange = () => {
      // 通过修改forceUpdate状态来触发重新渲染
      setForceUpdate(prev => prev + 1);
      
      // 重新生成图表数据以更新语言
      if (modelData) {
        updateChartDataWithTranslation(modelData);
      }
    };
    
    // 添加语言变化监听
    i18n.on('languageChanged', handleLanguageChange);
    
    // 组件卸载时移除监听
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [modelData]);
  
  // 将模型数据转换为图表数据
  const updateChartDataWithTranslation = (data: HexagonModelData) => {
    const chartData: ChartDataItem[] = [
      { 
        attribute: t('hexagonModel.security'), 
        value: data.security, 
        fullMark: 10, 
        description: t('hexagonModel.securityDesc') 
      },
      { 
        attribute: t('hexagonModel.achievement'), 
        value: data.achievement, 
        fullMark: 10, 
        description: t('hexagonModel.achievementDesc') 
      },
      { 
        attribute: t('hexagonModel.freedom'), 
        value: data.freedom, 
        fullMark: 10, 
        description: t('hexagonModel.freedomDesc') 
      },
      { 
        attribute: t('hexagonModel.belonging'), 
        value: data.belonging, 
        fullMark: 10, 
        description: t('hexagonModel.belongingDesc') 
      },
      { 
        attribute: t('hexagonModel.novelty'), 
        value: data.novelty, 
        fullMark: 10, 
        description: t('hexagonModel.noveltyDesc') 
      },
      { 
        attribute: t('hexagonModel.control'), 
        value: data.control, 
        fullMark: 10, 
        description: t('hexagonModel.controlDesc') 
      }
    ];
    
    setChartData(chartData);
  };
  
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
        
        // 使用服务层API替代直接IPC调用
        const models = await HexagonService.getHexagonModelsByProfileId(profileId);
        
        let data = null;
        if (models && models.length > 0) {
          const model = models[0];
          // 确保id存在
          if (model && model.id) {
            data = model as HexagonModelData;
          }
        }
        
        if (data) {
          setModelData(data);
          // 使用新的函数来更新图表数据
          updateChartDataWithTranslation(data);
        } else {
          // 如果没有数据，设置默认模型
          setModelData(null);
          
          const defaultChartData: ChartDataItem[] = [
            { 
              attribute: t('hexagonModel.security'), 
              value: 5, 
              fullMark: 10, 
              description: t('hexagonModel.securityDesc') 
            },
            { 
              attribute: t('hexagonModel.achievement'), 
              value: 5, 
              fullMark: 10, 
              description: t('hexagonModel.achievementDesc') 
            },
            { 
              attribute: t('hexagonModel.freedom'), 
              value: 5, 
              fullMark: 10, 
              description: t('hexagonModel.freedomDesc') 
            },
            { 
              attribute: t('hexagonModel.belonging'), 
              value: 5, 
              fullMark: 10, 
              description: t('hexagonModel.belongingDesc') 
            },
            { 
              attribute: t('hexagonModel.novelty'), 
              value: 5, 
              fullMark: 10, 
              description: t('hexagonModel.noveltyDesc') 
            },
            { 
              attribute: t('hexagonModel.control'), 
              value: 5, 
              fullMark: 10, 
              description: t('hexagonModel.controlDesc') 
            }
          ];
          
          setChartData(defaultChartData);
        }
      } catch (err: any) {
        console.error(t('hexagonModel.loadError'), err);
        setError(err?.message || t('hexagonModel.loadError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchModelData();
  }, [profileId, t]);
  
  // 处理图表下载
  const handleDownloadChart = () => {
    // 实现下载功能，可使用html2canvas或dom-to-image
    console.log(t('hexagonModel.download'));
  };
  
  // 处理缩放
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2));
  };
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.6));
  };
  
  // 处理刷新
  const handleRefresh = async () => {
    if (profileId) {
      try {
        setLoading(true);
        setError(null);
        
        // 实际刷新操作，例如重新获取数据
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 刷新成功
        toast({
          title: t('hexagonModel.refreshSuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        onRefresh();
      } catch (err: any) {
        setError(err?.message || t('hexagonModel.loadError'));
        
        // 刷新失败
        toast({
          title: t('hexagonModel.refreshError', { error: err?.message || t('error.general') }),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }
  };
  
  // 转换日期格式
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
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
    <Box p={4} key={`hexagon-model-chart-${forceUpdate}`}>
      <Flex justify="space-between" align="center" mb={4}>
        <Box>
          <Heading size="md">{modelData?.title || t('hexagonModel.title')}</Heading>
          {modelData && (
            <Text fontSize="sm" color="gray.500">
              {t('hexagonModel.updatedAt')}: {formatDate(modelData.updatedAt)}
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