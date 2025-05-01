import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

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
  
  return (
    <Box
      as={motion.div}
      variants={container}
      initial="hidden"
      animate="show"
    >
      <Heading as="h1" size="lg" mb={6}>
        {t('navigation.experiences')}
      </Heading>
      
      <Box as={motion.div} variants={item}>
        <Text>经历功能将在阶段五实现</Text>
      </Box>
    </Box>
  );
};

export default ExperiencesPage; 