import React, { useContext, useEffect, useState } from 'react';
import {
  Flex,
  Box,
  IconButton,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Text,
  HStack,
  Button
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faGlobe,
  faBell,
  faLanguage,
  faWindowMinimize,
  faWindowMaximize,
  faWindowRestore,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { AppContext } from '../../contexts/AppContext';
import { useLocation } from 'react-router-dom';

// 声明全局electronAPI类型
declare global {
  interface Window {
    electronAPI: {
      send: (channel: string, data?: any) => void;
      invoke: <T = any>(channel: string, data?: any) => Promise<{
        success: boolean;
        data?: T;
        error?: string;
      }>;
      receive: (channel: string, func: (...args: any[]) => void) => void;
    };
    IPC_CONSTANTS: any;
    currentAppTitle?: string;
  }
}

// 顶部导航组件接口
interface TopNavProps {
  onMenuClick: () => void;
}

// 顶部导航组件
const TopNav: React.FC<TopNavProps> = ({ onMenuClick }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { t, i18n } = useTranslation();
  const { state, setLanguage } = useContext(AppContext);
  const { language } = state;
  const [pageTitle, setPageTitle] = useState<string>(t('app.title'));
  const location = useLocation();

  // 监听页面标题变化
  useEffect(() => {
    const handleTitleChange = () => {
      if (window.currentAppTitle) {
        setPageTitle(window.currentAppTitle);
      } else {
        setPageTitle(t('app.title'));
      }
    };

    // 首次加载时检查标题
    handleTitleChange();

    // 设置定时监听以捕获标题变化
    const titleObserver = setInterval(handleTitleChange, 300);

    // 页面路径变化时重置标题
    const resetTitle = () => {
      window.currentAppTitle = undefined;
      setPageTitle(t('app.title'));
    };

    return () => {
      clearInterval(titleObserver);
    };
  }, [t, location.pathname]);

  // 窗口控制函数
  const minimizeWindow = () => {
    window.electronAPI.send('window-control', 'minimize');
  };

  const maximizeWindow = () => {
    window.electronAPI.send('window-control', 'maximize');
  };

  const closeWindow = () => {
    window.electronAPI.send('window-control', 'close');
  };

  // 语言切换处理
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  // 获取当前语言名称
  const getCurrentLanguageName = () => {
    switch (language) {
      case 'en': return 'English';
      case 'zh': return '中文';
      case 'ja': return '日本語';
      default: return '中文';
    }
  };

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      py={2}
      px={4}
      borderBottomWidth="0"
      borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
      bg={colorMode === 'dark' ? 'gray.800' : '#F0F0F0'}
      boxShadow="none"
      h="60px"
      className="app-header"
      sx={{ WebkitAppRegion: 'drag' }} // 使顶部导航栏可拖动窗口
    >
      {/* 移动端菜单按钮 */}
      <IconButton
        aria-label="Menu"
        display={{ base: 'flex', md: 'none' }}
        icon={<FontAwesomeIcon icon={faBars} />}
        onClick={onMenuClick}
        variant="ghost"
        fontSize="xl"
        sx={{ WebkitAppRegion: 'no-drag' }} // 按钮区域不可拖动
      />

      {/* 页面标题 */}
      <Box flex={1} ml={{ base: 4, md: 0 }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          key={pageTitle}
        >
          <Text fontWeight="bold" fontSize="lg" id="app-title-text">
            {pageTitle}
          </Text>
        </motion.div>
      </Box>

      {/* 右侧功能按钮 */}
      <HStack spacing={3} sx={{ WebkitAppRegion: 'no-drag' }}> {/* 按钮区域不可拖动 */}
        {/* 语言选择菜单 */}
        <Menu closeOnSelect>
          <MenuButton
            as={Button}
            variant="ghost"
            _hover={{ bg: colorMode === 'dark' ? 'gray.700' : 'gray.100' }}
            size="sm"
            px={2}
          >
            <FontAwesomeIcon icon={faLanguage} />
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => handleLanguageChange('zh')}>
              {language === 'zh' && <FontAwesomeIcon icon={faGlobe} style={{ marginRight: '8px' }} />}
              中文
            </MenuItem>
            <MenuItem onClick={() => handleLanguageChange('en')}>
              {language === 'en' && <FontAwesomeIcon icon={faGlobe} style={{ marginRight: '8px' }} />}
              English
            </MenuItem>
            <MenuItem onClick={() => handleLanguageChange('ja')}>
              {language === 'ja' && <FontAwesomeIcon icon={faGlobe} style={{ marginRight: '8px' }} />}
              日本語
            </MenuItem>
          </MenuList>
        </Menu>

        {/* 通知菜单 */}
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="通知"
            icon={
              <>
                <FontAwesomeIcon icon={faBell} />
                <Badge
                  colorScheme="red"
                  position="absolute"
                  top="-2px"
                  right="-2px"
                  fontSize="xs"
                  borderRadius="full"
                  w="16px"
                  h="16px"
                >
                  2
                </Badge>
              </>
            }
            variant="ghost"
            fontSize="lg"
            position="relative"
          />
          <MenuList>
            <MenuItem>通知1: 系统更新已完成</MenuItem>
            <MenuItem>通知2: 您有新的分析结果</MenuItem>
          </MenuList>
        </Menu>
        
        {/* 窗口控制按钮 */}
        <HStack spacing={1} ml={2}>
          <IconButton
            aria-label="最小化"
            icon={<FontAwesomeIcon icon={faWindowMinimize} fontSize="14px" />}
            size="md"
            variant="ghost"
            borderRadius="md"
            onClick={minimizeWindow}
            _hover={{ bg: colorMode === 'dark' ? 'gray.600' : 'gray.200' }}
            w="40px"
            h="40px"
          />
          <IconButton
            aria-label="最大化"
            icon={<FontAwesomeIcon icon={faWindowMaximize} fontSize="14px" />}
            size="md"
            variant="ghost"
            borderRadius="md"
            onClick={maximizeWindow}
            _hover={{ bg: colorMode === 'dark' ? 'gray.600' : 'gray.200' }}
            w="40px"
            h="40px"
          />
          <IconButton
            aria-label="关闭"
            icon={<FontAwesomeIcon icon={faTimes} fontSize="16px" />}
            size="md"
            variant="ghost"
            borderRadius="md"
            onClick={closeWindow}
            _hover={{ bg: 'red.500', color: 'white' }}
            w="40px"
            h="40px"
          />
        </HStack>
      </HStack>
    </Flex>
  );
};

export default TopNav; 