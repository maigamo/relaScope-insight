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
  faSearchPlus, 
  faSearchMinus,
  faHistory
} from '@fortawesome/free-solid-svg-icons';

/**
 * 六边形图表工具栏组件
 * 提供缩放、刷新、下载和查看历史等功能
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
  return (
    <HStack spacing={2}>
      <Tooltip label="放大">
        <IconButton
          aria-label="放大"
          icon={<FontAwesomeIcon icon={faSearchPlus} />}
          size="sm"
          onClick={onZoomIn}
        />
      </Tooltip>
      <Tooltip label="缩小">
        <IconButton
          aria-label="缩小"
          icon={<FontAwesomeIcon icon={faSearchMinus} />}
          size="sm"
          onClick={onZoomOut}
        />
      </Tooltip>
      <Tooltip label="刷新数据">
        <IconButton
          aria-label="刷新"
          icon={<FontAwesomeIcon icon={faSyncAlt} />}
          size="sm"
          onClick={onRefresh}
        />
      </Tooltip>
      <Tooltip label="下载图表">
        <IconButton
          aria-label="下载"
          icon={<FontAwesomeIcon icon={faDownload} />}
          size="sm"
          onClick={onDownload}
        />
      </Tooltip>
      {showHistory && (
        <Tooltip label="历史记录">
          <IconButton
            aria-label="历史记录"
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