import React, { useEffect, useState } from 'react';
import { Box, Flex, Heading, Text, useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { HexagonService } from '../../../services/ipc/hexagon.service';
import HexagonChart from './HexagonChart';
import HexagonDimensionList, { ChartDataItem } from './HexagonDimensionList';
import HexagonChartToolbar from './HexagonChartToolbar';
import EmptyHexagonState from './EmptyHexagonState';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import HexagonTooltip from './HexagonTooltip';
import i18n from '../../../i18n';
import { motion } from 'framer-motion';
import { 
  HexagonModelData, 
  convertModelToChartData, 
  createDefaultChartData, 
  formatDate 
} from './HexagonChartDataHelper';
import { downloadImage, exportChartToPng } from './HexagonChartExport';

// 动画变量
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

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
        setChartData(convertModelToChartData(modelData, t));
      }
    };
    
    // 添加语言变化监听
    i18n.on('languageChanged', handleLanguageChange);
    
    // 组件卸载时移除监听
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [modelData, t]);
  
  // 获取模型数据
  const fetchModelData = async (profileId: number) => {
    if (!profileId) return;
      
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
        // 使用工具类函数转换数据
        setChartData(convertModelToChartData(data, t));
      } else {
        // 如果没有数据，设置默认模型
        setModelData(null);
        // 使用工具类函数创建默认数据
        setChartData(createDefaultChartData(t));
      }
    } catch (err: any) {
      console.error(t('hexagonModel.loadError'), err);
      setError(err?.message || t('hexagonModel.loadError'));
    } finally {
      setLoading(false);
    }
  };
  
  // 获取模型数据
  useEffect(() => {
    if (profileId) {
      fetchModelData(profileId);
    } else {
      setModelData(null);
      setChartData([]);
    }
  }, [profileId, t]);
  
  // 处理图表下载
  const handleDownloadChart = async () => {
    try {
      // 使用工具类导出图表
      const dataUrl = await exportChartToPng('.hexagon-chart-container');
      
      // 下载文件
      downloadImage(dataUrl, `hexagon-model-${new Date().toISOString().slice(0, 10)}.png`);
      
      // 显示成功提示
      toast({
        title: t('hexagonModel.exportSuccess', '导出成功'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      // 处理错误
      console.error('导出过程中发生错误:', err);
      toast({
        title: t('hexagonModel.exportError', '导出失败'),
        description: err?.message || '未知错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
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
        await fetchModelData(profileId);
        
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

  // 加载状态
  if (loading) {
    return <LoadingState message={t('hexagonModel.loading')} />;
  }
  
  // 错误状态
  if (error) {
    return (
      <ErrorState 
        error={error} 
        onRetry={() => profileId && fetchModelData(profileId)} 
      />
    );
  }
  
  // 未选择档案
  if (!profileId) {
    return <EmptyHexagonState />;
  }

  // 渲染图表
  return (
    <Box
      as={motion.div}
      variants={item}
      initial="hidden"
      animate="show"
      h="100%"
      key={`hexagon-model-${forceUpdate}`}
    >
      <Box p={4}>
        <Flex justify="space-between" align="center" mb={4}>
          <Box>
            <Heading as="h2" size="md" mb={1}>
              {modelData ? modelData.title : t('hexagonModel.personalityModel', '人格模型分析')}
            </Heading>
            {modelData && modelData.updatedAt && (
              <Text fontSize="sm" color="gray.500">
                {t('hexagonModel.updatedAt')}: {formatDate(modelData.updatedAt)}
              </Text>
            )}
          </Box>
          
          <HexagonChartToolbar 
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onDownload={handleDownloadChart}
            onRefresh={handleRefresh}
            onViewHistory={() => modelData && onViewDetail(modelData.id)}
            showHistory={!!modelData}
          />
        </Flex>
        
        <Box className="hexagon-chart-container">
          <HexagonChart 
            chartData={chartData} 
            scale={scale}
            tooltipComponent={(props) => (
              <HexagonTooltip 
                {...props} 
              />
            )}
            onExportSuccess={(dataUrl) => {
              toast({
                title: t('hexagonModel.exportSuccess'),
                status: 'success',
                duration: 3000,
                isClosable: true,
              });
            }}
            onExportError={(error) => {
              toast({
                title: t('hexagonModel.exportError'),
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
            }}
          />
        </Box>
        
        <HexagonDimensionList 
          chartData={chartData}
          onHover={setHoveredDimension}
          hoveredDimension={hoveredDimension}
        />
      </Box>
    </Box>
  );
};

export default HexagonModelChart; 