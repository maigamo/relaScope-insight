import React from 'react';
import {
  Box,
  VStack,
  Divider,
  Tooltip,
  useColorModeValue,
  useColorMode
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faUser,
  faChartPie,
  faChartLine,
  faCog,
  faMoon,
  faSun,
  faCommentDots,
  faHistory,
  faBrain,
  faSearch,
  faProjectDiagram,
  faShapes
} from '@fortawesome/free-solid-svg-icons';

interface SidebarItemProps {
  icon: any;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  isActive = false,
  onClick
}) => {
  const activeBg = useColorModeValue('gray.100', 'gray.700');
  const iconColor = useColorModeValue('gray.600', 'gray.300');
  const activeIconColor = useColorModeValue('blue.500', 'blue.300');

  return (
    <Tooltip label={label} placement="right" hasArrow>
      <Box
        position="relative"
        px={4}
        py={3}
        cursor="pointer"
        onClick={onClick}
        bg={isActive ? activeBg : 'transparent'}
        _hover={{ bg: activeBg }}
        w="100%"
      >
        {isActive && (
          <Box
            position="absolute"
            left={0}
            top={0}
            bottom={0}
            w="3px"
            bg="green.500"
            borderTopRightRadius="sm"
            borderBottomRightRadius="sm"
          />
        )}
        <FontAwesomeIcon 
          icon={icon} 
          color={isActive ? activeIconColor : iconColor} 
          fontSize="18px" 
        />
      </Box>
    </Tooltip>
  );
};

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();
  const [activeItem, setActiveItem] = React.useState('dashboard');
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // 分组1: 主要功能
  const mainItems = [
    { id: 'dashboard', icon: faHome, label: t('nav.dashboard') },
    { id: 'profiles', icon: faUser, label: t('nav.profiles') },
    { id: 'quotes', icon: faCommentDots, label: t('nav.quotes') },
    { id: 'experiences', icon: faHistory, label: t('nav.experiences') }
  ];

  // 分组2: 分析和可视化
  const analysisItems = [
    { id: 'analysis', icon: faChartPie, label: t('nav.analysis') },
    { id: 'hexagon', icon: faShapes, label: t('nav.hexagon') },
    { id: 'insights', icon: faBrain, label: t('nav.insights') },
    { id: 'network', icon: faProjectDiagram, label: t('nav.network') }
  ];

  // 底部项目: 设置和暗模式
  const bottomItems = [
    { id: 'settings', icon: faCog, label: t('nav.settings') },
    { 
      id: 'theme', 
      icon: colorMode === 'light' ? faMoon : faSun, 
      label: colorMode === 'light' ? t('theme.dark') : t('theme.light'),
      onClick: toggleColorMode 
    }
  ];

  // 处理底部项目点击
  const handleBottomItemClick = (id: string, customOnClick?: () => void) => {
    if (customOnClick) {
      customOnClick();
    } else {
      setActiveItem(id);
    }
  };

  return (
    <Box
      as="nav"
      w="60px"
      bg={bg}
      borderRightWidth="1px"
      borderColor={borderColor}
      h="100%"
      display="flex"
      flexDirection="column"
    >
      {/* 主要导航 */}
      <VStack spacing={0} align="center" flex="1" pt={4}>
        {/* 分组1: 主要功能 */}
        {mainItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeItem === item.id}
            onClick={() => setActiveItem(item.id)}
          />
        ))}

        <Divider my={2} />

        {/* 分组2: 分析和可视化 */}
        {analysisItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeItem === item.id}
            onClick={() => setActiveItem(item.id)}
          />
        ))}
      </VStack>

      {/* 底部工具 */}
      <VStack spacing={0} align="center" pb={4}>
        <Divider mb={2} />
        {bottomItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeItem === item.id && !item.onClick}
            onClick={() => handleBottomItemClick(item.id, item.onClick)}
          />
        ))}
      </VStack>
    </Box>
  );
};