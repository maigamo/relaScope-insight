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
import { motion } from 'framer-motion';

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
  const handleDownloadChart = () => {
    try {
      // 直接导出图表，不依赖事件冒泡
      const chartElement = document.querySelector('.hexagon-chart-container');
      if (!chartElement) {
        toast({
          title: t('hexagonModel.exportError'),
          description: t('hexagonModel.exportElementNotFound', '找不到图表元素'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // 使用html2canvas直接进行导出
      import('html2canvas').then(({ default: html2canvas }) => {
        html2canvas(chartElement as HTMLElement).then(canvas => {
          const dataUrl = canvas.toDataURL('image/png');
          
          // 创建下载链接
          const downloadLink = document.createElement('a');
          downloadLink.href = dataUrl;
          downloadLink.download = `hexagon-model-${new Date().toISOString().slice(0, 10)}.png`;
          
          // 触发下载
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          
          toast({
            title: t('hexagonModel.exportSuccess', '导出成功'),
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }).catch(error => {
          console.error('导出图表失败:', error);
          toast({
            title: t('hexagonModel.exportError', '导出失败'),
            description: error.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        });
      }).catch(error => {
        console.error('加载html2canvas失败:', error);
        toast({
          title: t('hexagonModel.exportError', '导出失败'),
          description: '无法加载导出库',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
    } catch (err: any) {
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
  
  // 转换日期格式
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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