import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  useColorMode,
  Flex,
  Icon,
  Text,
  useColorModeValue,
  VStack
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPalette,
  faGlobe,
  faBell,
  faShield,
  faDatabase,
  faRobot
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import LLMSettings from '../../components/settings/llm';
import { updateAppTitle, restoreAppTitle } from '../../components/settings/utils/domUtils';

// 动画配置
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// 导航项类型
interface NavItem {
  id: string;
  icon: any;
  label: string;
  component: React.ReactNode;
}

// 占位组件
const UnderDevelopment: React.FC<{title: string}> = ({title}) => (
  <Box p={4} borderRadius="md" bg="gray.50" _dark={{ bg: "gray.700" }}>
    <Text fontSize="md">{title} - 功能正在开发中</Text>
  </Box>
);

// 设置页面组件
const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeNavItem, setActiveNavItem] = useState<string>('llm');

  // 设置页面标题
  useEffect(() => {
    updateAppTitle('设置');
    return () => restoreAppTitle();
  }, []);

  // 导航项数据
  const navItems: NavItem[] = [
    {
      id: 'appearance',
      icon: faPalette,
      label: t('settings.appearance'),
      component: <UnderDevelopment title={t('settings.appearance')} />
    },
    {
      id: 'language',
      icon: faGlobe,
      label: t('settings.language'),
      component: <UnderDevelopment title={t('settings.language')} />
    },
    {
      id: 'notifications',
      icon: faBell,
      label: t('settings.notifications'),
      component: <UnderDevelopment title={t('settings.notifications')} />
    },
    {
      id: 'database',
      icon: faDatabase,
      label: t('settings.database'),
      component: <UnderDevelopment title={t('settings.database')} />
    },
    {
      id: 'llm',
      icon: faRobot,
      label: '模型服务',
      component: <LLMSettings />
    },
    {
      id: 'privacy',
      icon: faShield,
      label: t('settings.privacy'),
      component: <UnderDevelopment title={t('settings.privacy')} />
    }
  ];

  // 切换导航项
  const handleNavItemClick = (itemId: string) => {
    setActiveNavItem(itemId);
    // 根据点击的导航项更新页面标题
    const selectedItem = navItems.find(item => item.id === itemId);
    if (selectedItem) {
      updateAppTitle(selectedItem.label);
    }
  };

  // 样式变量
  const sidebarBg = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeItemBg = useColorModeValue('blue.50', 'blue.900');
  const activeItemColor = useColorModeValue('blue.600', 'blue.200');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box
      as={motion.div}
      variants={container}
      initial="hidden"
      animate="show"
      h="calc(100vh - 80px)" // 减去顶部导航栏的高度
      overflow="hidden"
    >
      {/* 隐藏设置标题 */}
      <Heading as="h1" size="lg" mb={6} display="none">
        {t('navigation.settings')}
      </Heading>

      <Flex h="100%">
        {/* 左侧导航栏 */}
        <Box
          as="nav"
          w="220px"
          bg={sidebarBg}
          borderRight="1px"
          borderColor={borderColor}
          h="100%"
          overflowY="auto"
          py={4}
        >
          <VStack spacing={1} align="stretch">
            {navItems.map((item) => (
              <Box
                key={item.id}
                py={3}
                px={4}
                cursor="pointer"
                borderLeft="3px solid"
                borderLeftColor={activeNavItem === item.id ? activeItemColor : 'transparent'}
                bg={activeNavItem === item.id ? activeItemBg : 'transparent'}
                color={activeNavItem === item.id ? activeItemColor : 'inherit'}
                _hover={{ bg: activeNavItem !== item.id ? hoverBg : undefined }}
                transition="all 0.2s"
                onClick={() => handleNavItemClick(item.id)}
                display="flex"
                alignItems="center"
              >
                <Icon as={FontAwesomeIcon} icon={item.icon} mr={3} />
                <Text fontWeight={activeNavItem === item.id ? "medium" : "normal"}>
                  {item.label}
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* 右侧内容区 */}
        <Box flex="1" p={6} overflowY="auto" position="relative">
          {navItems.map((item) => (
            <Box
              key={item.id}
              display={activeNavItem === item.id ? 'block' : 'none'}
              w="100%"
              h="100%"
              as={motion.div}
              variants={itemAnim}
            >
              {item.component}
            </Box>
          ))}
        </Box>
      </Flex>
    </Box>
  );
};

export default SettingsPage; 