import React, { useEffect } from 'react';
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
import { Link, useLocation } from 'react-router-dom';
import { updateAppTitle } from '../settings/utils/domUtils';

// 导航项数据接口
interface NavItem {
  id: string;
  icon: any;
  label: string;
  to?: string;
  onClick?: () => void;
}

interface SidebarItemProps {
  icon: any;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  to?: string;
  onNavClick?: (label: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  isActive = false,
  onClick,
  to,
  onNavClick
}) => {
  const activeBg = useColorModeValue('gray.100', 'gray.700');
  const iconColor = useColorModeValue('gray.600', 'gray.300');
  const activeIconColor = useColorModeValue('blue.500', 'blue.300');

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    if (onNavClick) {
      onNavClick(label);
    }
  };

  const content = (
    <Box
      position="relative"
      px={4}
      py={3}
      cursor="pointer"
      onClick={handleClick}
      bg={isActive ? activeBg : 'transparent'}
      _hover={{ bg: activeBg }}
      w="100%"
      display="flex"
      justifyContent="center"
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
  );

  return (
    <Tooltip label={label} placement="right" hasArrow>
      {to ? (
        <Box as={Link} to={to} w="100%" _hover={{ textDecoration: 'none' }} onClick={() => onNavClick && onNavClick(label)}>
          {content}
        </Box>
      ) : (
        content
      )}
    </Tooltip>
  );
};

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();
  const location = useLocation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // 获取当前活动路径
  const getActiveItem = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'dashboard';
    if (path.startsWith('/profiles')) return 'profiles';
    if (path.startsWith('/quotes')) return 'quotes';
    if (path.startsWith('/experiences')) return 'experiences';
    if (path.startsWith('/analysis')) return 'analysis';
    if (path.startsWith('/hexagon')) return 'hexagon';
    if (path.startsWith('/insights')) return 'insights';
    if (path.startsWith('/network')) return 'network';
    if (path.startsWith('/settings')) return 'settings';
    return 'dashboard';
  };

  const activeItem = getActiveItem();

  // 更新页面标题
  useEffect(() => {
    const navItem = [...mainItems, ...analysisItems, ...bottomItems].find(item => item.id === activeItem);
    if (navItem) {
      updateAppTitle(navItem.label);
    }
  }, [activeItem]);
  
  // 分组1: 主要功能
  const mainItems: NavItem[] = [
    { id: 'dashboard', icon: faHome, label: t('navigation.dashboard'), to: '/dashboard' },
    { id: 'profiles', icon: faUser, label: '用户画像', to: '/profiles' },
    { id: 'quotes', icon: faCommentDots, label: '语录', to: '/quotes' },
    { id: 'experiences', icon: faHistory, label: '人生经历', to: '/experiences' }
  ];

  // 分组2: 分析和可视化
  const analysisItems: NavItem[] = [
    { id: 'analysis', icon: faChartPie, label: '分析', to: '/analysis' },
    { id: 'hexagon', icon: faShapes, label: '六边形模型', to: '/hexagon' },
    { id: 'insights', icon: faBrain, label: '洞察', to: '/insights' },
    { id: 'network', icon: faProjectDiagram, label: t('navigation.network'), to: '/network' }
  ];

  // 底部项目: 设置和暗模式
  const bottomItems: NavItem[] = [
    { id: 'settings', icon: faCog, label: t('navigation.settings'), to: '/settings' },
    { 
      id: 'theme', 
      icon: colorMode === 'light' ? faMoon : faSun, 
      label: colorMode === 'light' ? t('theme.dark') : t('theme.light'),
      onClick: toggleColorMode 
    }
  ];

  // 处理导航项点击
  const handleNavItemClick = (label: string) => {
    updateAppTitle(label);
  };

  return (
    <Box
      as="nav"
      w="60px"
      bg={colorMode === 'dark' ? 'gray.800' : '#F0F0F0'}
      borderRightWidth="0"
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
            to={item.to}
            onNavClick={handleNavItemClick}
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
            to={item.to}
            onNavClick={handleNavItemClick}
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
            to={item.to}
            onClick={item.onClick}
            onNavClick={handleNavItemClick}
          />
        ))}
      </VStack>
    </Box>
  );
};

export default Sidebar;