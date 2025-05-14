import { TFunction } from 'i18next';
import { HexagonModel } from '../../../../common/types/database';
import { ChartDataItem } from './HexagonDimensionList';

// 六边形模型数据类型，确保id是必需的
export interface HexagonModelData extends Omit<HexagonModel, 'id'> {
  id: number;
}

/**
 * 将模型数据转换为图表数据
 * @param data 六边形模型数据
 * @param t 国际化函数
 * @returns 图表数据项数组
 */
export const convertModelToChartData = (data: HexagonModelData, t: TFunction): ChartDataItem[] => {
  return [
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
};

/**
 * 创建默认图表数据
 * @param t 国际化函数
 * @returns 默认图表数据
 */
export const createDefaultChartData = (t: TFunction): ChartDataItem[] => {
  return [
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
};

/**
 * 格式化日期为本地字符串
 * @param dateString 日期字符串
 * @returns 格式化后的日期
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}; 