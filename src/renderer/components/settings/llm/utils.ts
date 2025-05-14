import { LLMProvider } from '../../../../common/types/llm';
import { useColorModeValue } from '@chakra-ui/react';

/**
 * 获取LLM提供商的显示名称
 * @param provider LLM提供商枚举值
 * @returns 提供商显示名称
 */
export function getProviderName(provider: LLMProvider): string {
  switch (provider) {
    case LLMProvider.OPENAI:
      return 'OpenAI';
    case LLMProvider.ANTHROPIC:
      return 'Anthropic';
    case LLMProvider.BAIDU:
      return '百度文心一言';
    case LLMProvider.AZURE:
      return 'Azure OpenAI';
    case LLMProvider.GEMINI:
      return 'Google Gemini';
    case LLMProvider.OLLAMA:
      return 'Ollama';
    case LLMProvider.LOCAL:
      return '本地模型';
    case LLMProvider.DEEPSEEK:
      return 'DeepSeek';
    case LLMProvider.SILICON_FLOW:
      return '硅基流动';
    case LLMProvider.OPENROUTER:
      return 'OpenRouter';
    default:
      return '未知提供商';
  }
}

/**
 * 过滤配置列表
 * @param configs 配置列表
 * @param searchQuery 搜索关键词
 * @returns 过滤后的配置列表
 */
export const filterConfigs = (configs: any[], searchQuery: string) => {
  if (!searchQuery) return configs;
  
  return configs.filter(config => 
    config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    config.modelName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getProviderName(config.provider).toLowerCase().includes(searchQuery.toLowerCase())
  );
};

/**
 * 过滤服务商列表
 * @param providers 服务商列表
 * @param searchQuery 搜索关键词
 * @returns 过滤后的服务商列表
 */
export const filterProviders = (providers: any[], searchQuery: string) => {
  if (!searchQuery) return providers;
  
  return providers.filter(provider => 
    getProviderName(provider.provider).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (provider.name && provider.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );
};

/**
 * 获取样式配置hook
 * @returns 通用样式配置对象
 */
export const useStyleConfig = () => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.200');
  
  const scrollbarCSS = {
    "&::-webkit-scrollbar": {
      width: "4px",
      height: "4px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: useColorModeValue("rgba(0,0,0,0.12)", "rgba(255,255,255,0.12)"),
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: useColorModeValue("rgba(0,0,0,0.25)", "rgba(255,255,255,0.25)"),
    }
  };
  
  return {
    borderColor,
    bgColor,
    hoverBg,
    activeBg,
    activeColor,
    scrollbarCSS
  };
}; 