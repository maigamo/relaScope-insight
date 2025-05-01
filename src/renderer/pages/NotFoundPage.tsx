import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  useColorMode,
  Icon
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

// 动画配置
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// 404页面组件
const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const navigate = useNavigate();

  return (
    <Flex
      as={motion.div}
      variants={container}
      initial="hidden"
      animate="show"
      direction="column"
      align="center"
      justify="center"
      minH="70vh"
      textAlign="center"
      p={8}
    >
      <Box
        as={motion.div}
        variants={item}
        fontSize="8xl"
        fontWeight="bold"
        color={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
        lineHeight="1"
        mb={4}
      >
        404
      </Box>
      
      <motion.div variants={item}>
        <Icon 
          as={FontAwesomeIcon} 
          icon={faSearch} 
          fontSize="5xl" 
          color="brand.500" 
          mb={8}
        />
      </motion.div>
      
      <Heading 
        as={motion.h1}
        variants={item}
        mb={4} 
        size="xl"
      >
        {t('error.notFound')}
      </Heading>
      
      <Text 
        as={motion.p}
        variants={item}
        fontSize="lg" 
        color={colorMode === 'dark' ? 'gray.400' : 'gray.600'} 
        maxW="md" 
        mb={8}
      >
        页面不存在或已移动到新位置
      </Text>
      
      <motion.div variants={item} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          leftIcon={<FontAwesomeIcon icon={faHome} />}
          colorScheme="green"
          onClick={() => navigate('/dashboard')}
        >
          返回首页
        </Button>
      </motion.div>
    </Flex>
  );
};

export default NotFoundPage; 