import React from 'react';
import {
  Box,
  Flex,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  useColorModeValue,
  HStack,
  IconButton
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faPlus,
  faMinus,
  faExpandAlt,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

interface TopNavigationProps {
  activePageTitle?: string;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  activePageTitle = 'Dashboard'
}) => {
  const { t } = useTranslation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // 模拟窗口控制函数
  const minimizeWindow = () => console.log('最小化窗口');
  const maximizeWindow = () => console.log('最大化窗口');
  const closeWindow = () => console.log('关闭窗口');

  return (
    <Box 
      as="header" 
      bg={bg} 
      borderBottomWidth="1px" 
      borderColor={borderColor}
      px={3}
      zIndex="docked"
    >
      <Flex h="48px" alignItems="center" justifyContent="space-between">
        {/* 左侧页面标题 */}
        <Text fontWeight="semibold" fontSize="lg" ml={2}>
          {activePageTitle}
        </Text>

        {/* 中间搜索框 */}
        <Box flex="1" maxW="600px" mx={4}>
          <InputGroup size="sm">
            <InputLeftElement pointerEvents="none">
              <FontAwesomeIcon icon={faSearch} color="gray" />
            </InputLeftElement>
            <Input 
              placeholder={t('common.search')} 
              borderRadius="full" 
              bg={useColorModeValue('gray.50', 'gray.700')}
            />
          </InputGroup>
        </Box>
        
        {/* 右侧按钮组 */}
        <HStack spacing={2} alignItems="center">
          {/* 创建按钮 */}
          <Button
            leftIcon={<FontAwesomeIcon icon={faPlus} />}
            colorScheme="blue"
            size="sm"
            borderRadius="md"
          >
            {t('common.create')}
          </Button>

          {/* 窗口控制 */}
          <HStack spacing={0} borderLeft="1px" borderColor={borderColor} pl={2}>
            <IconButton
              aria-label="Minimize"
              icon={<FontAwesomeIcon icon={faMinus} />}
              variant="ghost"
              size="sm"
              onClick={minimizeWindow}
              borderRadius="none"
            />
            <IconButton
              aria-label="Maximize"
              icon={<FontAwesomeIcon icon={faExpandAlt} />}
              variant="ghost"
              size="sm"
              onClick={maximizeWindow}
              borderRadius="none"
            />
            <IconButton
              aria-label="Close"
              icon={<FontAwesomeIcon icon={faTimes} />}
              variant="ghost"
              size="sm"
              onClick={closeWindow}
              _hover={{ bg: 'red.500', color: 'white' }}
              borderRadius="none"
            />
          </HStack>
        </HStack>
      </Flex>
    </Box>
  );
}; 