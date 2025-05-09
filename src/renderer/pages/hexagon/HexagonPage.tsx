import React, { useState, useRef } from 'react';
import { Box, Flex, Heading, useDisclosure, useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import ProfileSidebar from './components/ProfileSidebar';
import HexagonModelChart from './components/HexagonModelChart';
import HexagonModelDetail from './components/HexagonModelDetail';

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

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// 六边形模型页面组件
const HexagonPage: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  
  // 处理档案选择
  const handleProfileSelect = (profileId: number) => {
    setSelectedProfileId(profileId);
  };
  
  // 处理模型详情查看
  const handleViewModelDetail = (modelId: number) => {
    setSelectedModelId(modelId);
    onDetailOpen();
  };
  
  // 刷新模型数据
  const handleRefreshModel = () => {
    // 实现模型刷新逻辑
    toast({
      title: t('hexagon.modelRefreshed'),
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  return (
    <Box
      as={motion.div}
      variants={container}
      initial="hidden"
      animate="show"
      h="100%"
    >
      <Heading as="h1" size="lg" mb={6}>
        {t('navigation.hexagonModel')}
      </Heading>
      
      <Flex h="calc(100% - 70px)" as={motion.div} variants={item}>
        {/* 左侧档案选择器 */}
        <Box w="220px" h="100%" borderRightWidth="1px" pr={2}>
          <ProfileSidebar 
            selectedProfileId={selectedProfileId} 
            onSelect={handleProfileSelect} 
          />
        </Box>
        
        {/* 右侧六边形模型内容区 */}
        <Box flex="1" pl={4} overflowY="auto">
          <HexagonModelChart 
            profileId={selectedProfileId}
            onViewDetail={handleViewModelDetail}
            onRefresh={handleRefreshModel}
          />
        </Box>
      </Flex>
      
      {/* 模型详情模态框 */}
      {isDetailOpen && selectedModelId && (
        <HexagonModelDetail
          isOpen={isDetailOpen}
          onClose={onDetailClose}
          modelId={selectedModelId}
        />
      )}
    </Box>
  );
};

export default HexagonPage; 