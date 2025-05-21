import { LLMProvider } from '../../../../common/types/llm';

/**
 * 获取提供商的友好显示名称
 * @param provider LLM提供商枚举值
 * @returns 提供商的友好显示名称
 */
export const getProviderName = (provider: LLMProvider | string): string => {
  if (typeof provider !== 'string') {
    provider = String(provider);
  }
  
  // 确保provider是字符串并标准化处理
  const providerStr = provider.toLowerCase();
  
  switch (providerStr) {
    case LLMProvider.OPENAI:
      return 'OpenAI';
    case LLMProvider.ANTHROPIC:
      return 'Anthropic';
    case LLMProvider.GEMINI:
      return 'Google Gemini';
    case LLMProvider.BAIDU:
      return '百度文心';
    case LLMProvider.AZURE:
      return 'Azure OpenAI';
    case LLMProvider.DEEPSEEK:
      return 'DeepSeek';
    case LLMProvider.SILICON_FLOW:
      return '硅基流动';
    case LLMProvider.OPENROUTER:
      return 'OpenRouter';
    case LLMProvider.OLLAMA:
      return 'Ollama';
    case LLMProvider.LOCAL:
      return '本地模型';
    default:
      return provider;
  }
};

/**
 * 格式化API密钥显示
 * 将API密钥的大部分字符替换为*，只显示前4位和后4位
 * @param apiKey API密钥
 * @returns 格式化后的API密钥显示
 */
export const formatApiKey = (apiKey: string): string => {
  if (!apiKey || apiKey.length <= 8) return apiKey;
  
  const prefix = apiKey.substring(0, 4);
  const suffix = apiKey.substring(apiKey.length - 4);
  const masked = '*'.repeat(Math.min(apiKey.length - 8, 20));
  
  return `${prefix}${masked}${suffix}`;
};

/**
 * 格式化日期时间
 * @param dateString ISO日期字符串
 * @returns 格式化后的日期时间字符串
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * 格式化模型名称
 * @param modelName 原始模型名称
 * @returns 格式化后的模型名称
 */
export const formatModelName = (modelName: string): string => {
  // 删除版本号中的多余信息
  return modelName
    .replace(/^model-/, '')
    .replace(/-\d{4}-\d{2}-\d{2}$/, '')
    .replace(/-preview$/, ' (预览版)');
};

/**
 * 格式化数字（包括温度、TopP等）
 * @param value 数值
 * @param decimals 小数位数
 * @returns 格式化后的数字字符串
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

/**
 * 格式化时间展示
 * @param timeString ISO时间字符串
 * @returns 格式化后的时间字符串
 */
export const formatTime = (timeString: string): string => {
  try {
    const date = new Date(timeString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return timeString;
  }
};

/**
 * 截断较长的文本并添加省略号
 * @param text 原始文本
 * @param maxLength 最大长度
 * @returns 处理后的文本
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * 格式化设置标签
 * 为设置标签添加统一格式
 * @param label 标签文本
 * @returns 格式化后的标签
 */
export const formatSettingLabel = (label: string): string => {
  return label;
}; 