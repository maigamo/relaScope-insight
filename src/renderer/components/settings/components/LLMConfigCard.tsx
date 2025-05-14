import React from 'react';
import { 
  Box, Flex, Text, IconButton, Badge, Tooltip, 
  useDisclosure, Menu, MenuButton, MenuList, MenuItem 
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEllipsisVertical, faCheck, faCog, faGlobe, 
  faCheckCircle, faTrash, faCopy, faKey 
} from '@fortawesome/free-solid-svg-icons';
import { LLMConfigCardProps } from '../types/LLMSettingsTypes';
import { formatDate, getProviderName } from '../utils/LLMSettingsUtils';
import { useColorMode } from '@chakra-ui/react';

/**
 * LLM配置卡片组件
 */
const LLMConfigCard: React.FC<LLMConfigCardProps> = ({ 
  config, 
  onEdit, 
  onDelete, 
  onSetDefault, 
  onSetProxy 
}) => {
  // 使用颜色模式
  const { colorMode } = useColorMode();
  
  // 卡片菜单显示控制
  const { isOpen, onOpen, onClose } = useDisclosure();

  // 基于颜色模式的样式
  const borderColor = colorMode === 'dark' ? 'gray.600' : 'gray.200';
  const bgColor = colorMode === 'dark' ? 'gray.800' : 'white';
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      overflow="hidden"
      mb={4}
      bg={bgColor}
      position="relative"
      transition="all 0.2s"
      _hover={{
        boxShadow: "sm",
        borderColor: "blue.200"
      }}
    >
      {/* 卡片头部 */}
      <Flex 
        justify="space-between" 
        align="center" 
        p={4} 
        borderBottomWidth="1px"
        borderColor={borderColor}
      >
        <Flex align="center">
          <Text fontWeight="bold" fontSize="md">{config.name}</Text>
          {config.isDefault && (
            <Badge ml={2} colorScheme="green">默认</Badge>
          )}
        </Flex>
        
        {/* 操作菜单 */}
        <Menu isOpen={isOpen} onClose={onClose}>
          <MenuButton
            as={IconButton}
            aria-label="操作"
            icon={<FontAwesomeIcon icon={faEllipsisVertical} />}
            variant="ghost"
            size="sm"
            onClick={onOpen}
          />
          <MenuList>
            <MenuItem icon={<FontAwesomeIcon icon={faCheck} />} onClick={() => onSetDefault(config)}>
              设为默认
            </MenuItem>
            <MenuItem icon={<FontAwesomeIcon icon={faCog} />} onClick={() => onEdit(config)}>
              编辑配置
            </MenuItem>
            <MenuItem icon={<FontAwesomeIcon icon={faGlobe} />} onClick={() => onSetProxy(config)}>
              代理设置
            </MenuItem>
            <MenuItem icon={<FontAwesomeIcon icon={faTrash} />} onClick={() => onDelete(config)}>
              删除配置
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      
      {/* 卡片内容 */}
      <Box p={4}>
        <Flex direction="column" gap={2}>
          <Flex justify="space-between">
            <Text color="gray.500">提供商:</Text>
            <Text>{getProviderName(config.provider)}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="gray.500">模型:</Text>
            <Text>{config.modelName || config.modelId}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="gray.500">创建时间:</Text>
            <Text>{formatDate(config.createdAt)}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="gray.500">更新时间:</Text>
            <Text>{formatDate(config.updatedAt)}</Text>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export default LLMConfigCard; 