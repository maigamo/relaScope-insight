import React from 'react';
import { 
  Box, Flex, Text, Button, VStack, HStack 
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faKey } from '@fortawesome/free-solid-svg-icons';
import { getProviderName } from '../utils/LLMSettingsUtils';
import LLMConfigCard from './LLMConfigCard';
import { LLMConfig, LLMProvider } from '../../../../common/types/llm';
import { Provider, StyleConfig } from '../types/LLMSettingsTypes';

interface LLMConfigDetailProps {
  providers: Provider[];
  activeProviderId: string | null;
  configs: LLMConfig[];
  enhancedStyleConfig: StyleConfig;
  createConfig: () => void;
  editConfig: (config: LLMConfig) => void;
  confirmDeleteConfig: (config: LLMConfig) => void;
  setAsDefault: (config: LLMConfig) => void;
  openProxySettings: (config: LLMConfig) => void;
  openApiKeySettings: (providerType: string, providerName: string) => void;
}

/**
 * 配置详情组件
 */
const LLMConfigDetail: React.FC<LLMConfigDetailProps> = ({
  providers,
  activeProviderId,
  configs,
  enhancedStyleConfig,
  createConfig,
  editConfig,
  confirmDeleteConfig,
  setAsDefault,
  openProxySettings,
  openApiKeySettings
}) => {
  // 如果没有选中服务商
  if (!activeProviderId) {
    return (
      <Flex
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        padding="20px"
      >
        <Text fontSize="lg" mb="4">请先选择左侧的服务商类型</Text>
        <Text fontSize="md" mb="6" color="gray.500" maxWidth="600px" textAlign="center">
          选择服务商后，您可以创建该服务商下的LLM配置，管理模型参数和API密钥。
        </Text>
      </Flex>
    );
  }

  // 获取当前选中提供商下的所有配置
  const providerObj = providers.find(p => p.id === activeProviderId);
  if (!providerObj) return null;
  
  const providerType = providerObj.provider;
  const currentProviderConfigs = configs.filter(c => c.provider === providerType);
  const providerName = getProviderName(providerType);
  
  return (
    <Box padding="20px">
      {/* 提供商信息和操作按钮 */}
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Text fontSize="xl" fontWeight="bold">{providerName} 配置</Text>
          <Text fontSize="sm" color="gray.500" mt={1}>
            管理 {providerName} 的模型配置、参数和API密钥
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button
            leftIcon={<FontAwesomeIcon icon={faKey} />}
            colorScheme="teal"
            variant="outline"
            size="sm"
            onClick={() => openApiKeySettings(providerType, providerName)}
          >
            设置API密钥
          </Button>
          <Button
            leftIcon={<FontAwesomeIcon icon={faPlus} />}
            colorScheme="blue"
            size="sm"
            onClick={() => createConfig()}
          >
            创建配置
          </Button>
        </HStack>
      </Flex>
      
      {/* 配置列表 */}
      {currentProviderConfigs.length > 0 ? (
        <VStack spacing={4} align="stretch">
          {currentProviderConfigs.map(config => (
            <LLMConfigCard
              key={config.id}
              config={config}
              onEdit={editConfig}
              onDelete={confirmDeleteConfig}
              onSetDefault={setAsDefault}
              onSetProxy={openProxySettings}
            />
          ))}
        </VStack>
      ) : (
        <Flex
          direction="column"
          align="center"
          justify="center"
          height="300px"
          borderWidth="1px"
          borderStyle="dashed"
          borderColor={enhancedStyleConfig.borderColor}
          borderRadius="lg"
          padding="20px"
        >
          <Text mb={4} color="gray.500">
            当前提供商下没有配置
          </Text>
          <Button
            leftIcon={<FontAwesomeIcon icon={faPlus} />}
            colorScheme="blue"
            onClick={() => createConfig()}
          >
            创建第一个配置
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default LLMConfigDetail; 