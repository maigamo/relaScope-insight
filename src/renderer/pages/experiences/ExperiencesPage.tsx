import React, { useState, useRef } from 'react';
import { Box, Flex, Heading, useDisclosure, useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import ProfileSidebar from '../../components/profiles/ProfileSidebar';
import ExperiencesList, { ExperiencesListRef } from './components/ExperienceList';
import ExperienceForm from './components/ExperienceForm';
import ExperienceDetailModal from './components/ExperienceDetailModal';

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

// 经历页面组件
const ExperiencesPage: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [selectedExperienceId, setSelectedExperienceId] = useState<number | null>(null);
  const experiencesListRef = useRef<ExperiencesListRef>(null);
  
  // 表单和详情模态框控制
  const { 
    isOpen: isFormOpen, 
    onOpen: onFormOpen, 
    onClose: onFormClose 
  } = useDisclosure();
  
  const { 
    isOpen: isDetailOpen, 
    onOpen: onDetailOpen, 
    onClose: onDetailClose 
  } = useDisclosure();
  
  // 处理档案选择
  const handleProfileSelect = (profileId: number) => {
    setSelectedProfileId(profileId);
  };
  
  // 打开详情模态框
  const handleViewExperienceDetail = (experienceId: number) => {
    setSelectedExperienceId(experienceId);
    onDetailOpen();
  };
  
  // 打开编辑表单
  const handleEditExperience = (experienceId: number) => {
    setSelectedExperienceId(experienceId);
    onFormOpen();
  };
  
  // 打开新建表单
  const handleAddExperience = () => {
    if (!selectedProfileId) {
      // 如果没有选择档案，给出提示
      toast({
        title: '请先选择一个档案',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setSelectedExperienceId(null);
    onFormOpen();
  };
  
  // 表单提交完成回调
  const handleFormComplete = () => {
    // 关闭表单
    onFormClose();
    // 刷新经历列表
    if (experiencesListRef.current) {
      experiencesListRef.current.refreshExperiences();
    }
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
        {t('navigation.experiences')}
      </Heading>
      
      <Flex h="calc(100% - 70px)" as={motion.div} variants={item}>
        {/* 左侧档案选择器 */}
        <Box w="250px" h="100%" borderRightWidth="1px" pr={2}>
          <ProfileSidebar 
            selectedProfileId={selectedProfileId} 
            onSelect={handleProfileSelect} 
          />
        </Box>
        
        {/* 右侧经历列表 */}
        <Box flex="1" pl={4} overflowY="auto">
          <ExperiencesList 
            ref={experiencesListRef}
            profileId={selectedProfileId}
            onAddClick={handleAddExperience}
            onViewDetail={handleViewExperienceDetail}
          />
        </Box>
      </Flex>
      
      {/* 经历表单模态框 */}
      {isFormOpen && (
        <ExperienceForm
          isOpen={isFormOpen}
          onClose={onFormClose}
          experienceId={selectedExperienceId}
          profileId={selectedProfileId}
          onComplete={handleFormComplete}
        />
      )}
      
      {/* 经历详情模态框 */}
      {isDetailOpen && selectedExperienceId && (
        <ExperienceDetailModal
          isOpen={isDetailOpen}
          onClose={onDetailClose}
          experienceId={selectedExperienceId}
          onEdit={handleEditExperience}
        />
      )}
    </Box>
  );
};

export default ExperiencesPage; 