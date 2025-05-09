import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Center, 
  Heading, 
  Icon, 
  Text, 
  SimpleGrid, 
  Button, 
  Flex, 
  useColorModeValue, 
  VStack,
  List,
  ListItem,
  ListIcon,
  Divider
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShield, 
  faTrophy, 
  faWind, 
  faUsers, 
  faStar, 
  faSliders,
  faChevronRight,
  faHandPointLeft
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import i18n from '../../../i18n';

/**
 * 六边形模型空状态组件
 * 当未选择任何档案时显示的引导界面
 */
const EmptyHexagonState: React.FC = () => {
  const { t } = useTranslation();
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // 颜色设置
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const accentColor = useColorModeValue('green.500', 'green.300');
  const cardBgColor = useColorModeValue('gray.50', 'gray.700');
  const highlightColor = useColorModeValue('blue.50', 'blue.900');
  
  // 监听语言变化
  useEffect(() => {
    const handleLanguageChange = () => {
      // 通过修改forceUpdate状态来触发重新渲染
      setForceUpdate(prev => prev + 1);
    };
    
    // 添加语言变化监听
    i18n.on('languageChanged', handleLanguageChange);
    
    // 组件卸载时移除监听
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);
  
  // 维度介绍数据
  const dimensionInfo = useMemo(() => [
    { 
      name: t('hexagonModel.security'), 
      icon: faShield, 
      description: t('hexagonModel.securityDesc'),
      color: 'green.500'
    },
    { 
      name: t('hexagonModel.achievement'), 
      icon: faTrophy, 
      description: t('hexagonModel.achievementDesc'),
      color: 'yellow.500'
    },
    { 
      name: t('hexagonModel.freedom'), 
      icon: faWind, 
      description: t('hexagonModel.freedomDesc'),
      color: 'blue.500'
    },
    { 
      name: t('hexagonModel.belonging'), 
      icon: faUsers, 
      description: t('hexagonModel.belongingDesc'),
      color: 'purple.500'
    },
    { 
      name: t('hexagonModel.novelty'), 
      icon: faStar, 
      description: t('hexagonModel.noveltyDesc'),
      color: 'orange.500'
    },
    { 
      name: t('hexagonModel.control'), 
      icon: faSliders, 
      description: t('hexagonModel.controlDesc'),
      color: 'red.500'
    }
  ], [t]);

  // 维度内容组件
  const dimensionsContent = useMemo(() => (
    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2} mt={2} mb={2}>
      {dimensionInfo.map((dim) => (
        <Box 
          key={dim.name}
          p={2} 
          borderRadius="md" 
          borderWidth="1px"
          borderColor={borderColor}
          bg={cardBgColor}
          as={motion.div}
          whileHover={{ scale: 1.05 }}
        >
          <Flex align="center" mb={1}>
            <Box
              borderRadius="full"
              w="22px"
              h="22px"
              bg={dim.color}
              display="flex"
              alignItems="center"
              justifyContent="center"
              mr={2}
            >
              <Icon as={FontAwesomeIcon} icon={dim.icon} color="white" fontSize="10px" />
            </Box>
            <Text fontWeight="bold" fontSize="sm">{dim.name}</Text>
          </Flex>
          <Text fontSize="xs" color={textColor}>
            {dim.description}
          </Text>
        </Box>
      ))}
    </SimpleGrid>
  ), [dimensionInfo, borderColor, cardBgColor, textColor]);

  return (
    <Center 
      height="100%" 
      flexDir="column" 
      textAlign="center"
      key={`empty-state-${forceUpdate}`}
      p={3}
    >
      <Box 
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 } as any}
        width="100%" 
        maxW="800px" 
        p={4} 
        borderRadius="lg"
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="md"
      >
        {/* 顶部介绍 */}
        <Flex align="center" mb={3} justifyContent="center">
          <VStack align="center" spacing={0.5}>
            <Heading size="md">
              {t('hexagonModel.dimensions')}
            </Heading>
            <Text color={textColor} fontSize="sm">
              {t('hexagonModel.selectProfile')}
            </Text>
          </VStack>
        </Flex>
        
        {/* 内容展示区 - 只显示维度介绍 */}
        <Center>
          {dimensionsContent}
        </Center>
        
        <Divider my={3} />
        
        {/* 使用指南部分 */}
        <Box mt={2}>
          <Heading size="sm" mb={2} textAlign="center">
            {t('hexagonModel.howToUse')}
          </Heading>
          
          <Box 
            borderRadius="md" 
            p={3} 
            bg={highlightColor} 
            mb={3}
            as={motion.div}
            whileHover={{ scale: 1.02 }}
            maxW="600px"
            mx="auto"
          >
            <Flex align="center" mb={1}>
              <Icon 
                as={FontAwesomeIcon} 
                icon={faHandPointLeft} 
                color="blue.500" 
                boxSize={4}
                mr={2}
              />
              <Text fontWeight="bold" fontSize="sm">{t('hexagonModel.selectProfileFirst')}</Text>
            </Flex>
            <Text fontSize="xs" color={textColor}>{t('hexagonModel.profileSelectionGuide')}</Text>
          </Box>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} maxW="700px" mx="auto">
            {/* 左侧列表 */}
            <List spacing={2} textAlign="left" ml={{ base: 4, md: 10 }}>
              <ListItem fontSize="sm">
                <ListIcon as={FontAwesomeIcon} icon={faChevronRight} color={accentColor} />
                {t('hexagonModel.step1')}
              </ListItem>
              <ListItem fontSize="sm">
                <ListIcon as={FontAwesomeIcon} icon={faChevronRight} color={accentColor} />
                {t('hexagonModel.step2')}
              </ListItem>
            </List>
            
            {/* 右侧列表 */}
            <List spacing={2} textAlign="left" ml={{ base: 4, md: 10 }}>
              <ListItem fontSize="sm">
                <ListIcon as={FontAwesomeIcon} icon={faChevronRight} color={accentColor} />
                {t('hexagonModel.step3')}
              </ListItem>
              <ListItem fontSize="sm">
                <ListIcon as={FontAwesomeIcon} icon={faChevronRight} color={accentColor} />
                {t('hexagonModel.step4')}
              </ListItem>
            </List>
          </SimpleGrid>
          
          <Center mt={3}>
            <Button 
              colorScheme="green" 
              size="sm"
              as={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('hexagonModel.learnMore')}
            </Button>
          </Center>
        </Box>
      </Box>
    </Center>
  );
};

export default EmptyHexagonState; 