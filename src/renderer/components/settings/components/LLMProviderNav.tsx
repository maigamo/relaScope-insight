import React from 'react';
import { 
  Box, Flex, Text, VStack, Button, Input as ChakraInput 
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { DeleteOutlined } from '@ant-design/icons';
import { getProviderName } from '../utils/LLMSettingsUtils';
import { Provider, ProviderItem, StyleConfig } from '../types/LLMSettingsTypes';

interface LLMProviderNavProps {
  providers: Provider[];
  activeProviderId: string | null;
  setActiveProviderId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  enhancedStyleConfig: StyleConfig;
  filteredConfigs: Record<string, ProviderItem[]>;
  addProvider: () => void;
  deleteProvider: (providerId: string) => void;
}

/**
 * 提供商导航组件
 */
const LLMProviderNav: React.FC<LLMProviderNavProps> = ({
  providers,
  activeProviderId,
  setActiveProviderId,
  searchQuery,
  setSearchQuery,
  enhancedStyleConfig,
  filteredConfigs,
  addProvider,
  deleteProvider
}) => {
  // 定义滚动条样式
  const scrollbarStyle = {
    '&::-webkit-scrollbar': {
      width: '4px',
      height: '4px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.25)',
    },
  };
  
  return (
    <Box
      width="280px"
      height="100%"
      borderRight={`1px solid ${enhancedStyleConfig.borderColor}`}
      bg={enhancedStyleConfig.bgColor}
      overflowY="auto"
      css={scrollbarStyle}
      display="flex"
      flexDirection="column"
      padding="0" // 移除padding
    >
      {/* 搜索框 */}
      <Box padding="15px">
        <Flex alignItems="center" position="relative">
          <ChakraInput
            placeholder="搜索提供商..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            paddingLeft="30px"
            bg={enhancedStyleConfig.bgColor}
            border={`1px solid ${enhancedStyleConfig.borderColor}`}
            _focus={{ borderColor: 'blue.400' }}
          />
          <FontAwesomeIcon
            icon={faSearch}
            style={{
              position: 'absolute',
              left: '10px',
              color: 'gray',
              fontSize: '14px',
            }}
          />
        </Flex>
      </Box>

      {/* 提供商列表 */}
      <Box flex="1" overflowY="auto" sx={scrollbarStyle} padding="0" maxHeight="calc(100vh - 200px)">
        <VStack align="stretch" spacing={0} width="100%" padding="0">
          {Object.entries(filteredConfigs).length > 0 ? (
            Object.entries(filteredConfigs).map(([providerId, items]) => {
              // 查找提供商对象
              const providerObj = providers.find(p => p.id === providerId);
              if (!providerObj) return null;
              
              return (
                <Box key={providerId} width="100%" mb="1px">
                  <Flex
                    padding="8px 12px"
                    bg={activeProviderId === providerId ? enhancedStyleConfig.activeBg : enhancedStyleConfig.bgColor}
                    fontWeight="bold"
                    borderRadius={enhancedStyleConfig.navRadius}
                    justifyContent="space-between"
                    alignItems="center"
                    onClick={() => {
                      setActiveProviderId(providerId);
                    }}
                    cursor="pointer"
                    color={activeProviderId === providerId ? enhancedStyleConfig.activeColor : 'inherit'}
                    _hover={{ 
                      bg: activeProviderId !== providerId ? enhancedStyleConfig.hoverBg : undefined,
                      borderRadius: enhancedStyleConfig.navRadius
                    }}
                    width="100%"
                  >
                    <Text fontSize="sm">{providerObj.name || getProviderName(providerObj.provider)}</Text>
                    <Flex>
                      <Button
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        leftIcon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProvider(providerId);
                        }}
                      >
                        删除
                      </Button>
                    </Flex>
                  </Flex>
                </Box>
              );
            })
          ) : (
            <Box padding="15px" textAlign="center">
              <Text color="gray.500">没有找到匹配的提供商</Text>
            </Box>
          )}
        </VStack>
      </Box>

      {/* 添加服务商按钮 */}
      <Box borderTop={`1px solid ${enhancedStyleConfig.borderColor}`} padding="15px">
        <Button
          leftIcon={<FontAwesomeIcon icon={faPlus} />}
          colorScheme="blue"
          variant="outline"
          onClick={() => addProvider()}
          width="100%"
        >
          添加服务商
        </Button>
      </Box>
    </Box>
  );
};

export default LLMProviderNav; 