import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Flex,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { AppContext } from '../../contexts/AppContext';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

// 动画变体
const variants = {
  hidden: { opacity: 0, x: 0, y: 20 },
  enter: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: 0, y: -20 },
};

// 主布局组件
const MainLayout: React.FC = () => {
  const { colorMode } = useColorMode();
  const { state } = useContext(AppContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex
      direction="row"
      h="100vh"
      overflow="hidden"
      position="relative"
      bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}
    >
      {/* 侧边栏 - 根据设计规范固定宽度为60px */}
      <Sidebar />
      
      {/* 主内容区域 - 左边距设置为0 */}
      <Box
        flex={1}
        h="100vh"
        display="flex"
        flexDirection="column"
        overflow="hidden"
        ml={0}
        transition="margin-left 0.3s ease"
      >
        {/* 顶部导航 */}
        <TopNav onMenuClick={onOpen} />
        
        {/* 页面内容 */}
        <Box
          flex={1}
          p={4}
          overflow="auto"
          as={motion.div}
          initial="hidden"
          animate="enter"
          exit="exit"
          variants={variants}
          transition={{ duration: 0.3, type: 'easeInOut' } as any}
        >
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};

export default MainLayout; 