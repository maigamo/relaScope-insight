import React from 'react';
import {
  HStack,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDownload, 
  faSyncAlt, 
  faHistory
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

/**
 * 六边形图表工具栏组件
 * 提供刷新、下载和查看历史等功能
 */
interface HexagonChartToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRefresh: () => void;
  onDownload: () => void;
  onViewHistory: () => void;
  showHistory: boolean;
}

const HexagonChartToolbar: React.FC<HexagonChartToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onRefresh,
  onDownload,
  onViewHistory,
  showHistory
}) => {
  const { t } = useTranslation();
  
  return (
    <HStack spacing={2}>
      <Tooltip label={t('hexagonModel.refresh')}>
        <IconButton
          aria-label={t('hexagonModel.refresh')}
          icon={<FontAwesomeIcon icon={faSyncAlt} />}
          size="sm"
          onClick={onRefresh}
        />
      </Tooltip>
      <Tooltip label={t('hexagonModel.download')}>
        <IconButton
          aria-label={t('hexagonModel.download')}
          icon={<FontAwesomeIcon icon={faDownload} />}
          size="sm"
          onClick={onDownload}
        />
      </Tooltip>
      {showHistory && (
        <Tooltip label={t('hexagonModel.history')}>
          <IconButton
            aria-label={t('hexagonModel.history')}
            icon={<FontAwesomeIcon icon={faHistory} />}
            size="sm"
            onClick={onViewHistory}
          />
        </Tooltip>
      )}
    </HStack>
  );
};

export default HexagonChartToolbar; 