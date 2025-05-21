/**
 * provider.ts
 * 封装模型提供商相关的操作
 * 注意: 由于IPC通信可能未完全实现，此文件提供模拟数据用于开发
 */
import { LLMModelConfig, LLMProvider } from '../../../../../common/types/llm';
import { message } from 'antd';

// 提供商名称映射
const PROVIDER_NAME_MAP: Record<string, string> = {
  'openai': 'OpenAI',
  'anthropic': 'Anthropic',
  'gemini': 'Google Gemini',
  'azure': 'Azure OpenAI',
  'deepseek': 'DeepSeek',
  'zhipu': '智谱AI',
  'openrouter': 'OpenRouter',
  'ollama': 'Ollama',
  'default': '自定义服务商'
};

// 接口定义
export interface ProviderData {
  id: string;
  name: string;
  enabled: boolean;
  apiUrl?: string;
  models?: LLMModelConfig[];
  [key: string]: any;
}

export interface ProviderUpdateData {
  enabled?: boolean;
  apiUrl?: string;
  name?: string;
  models?: LLMModelConfig[];
  [key: string]: any;
}

/**
 * 获取提供商名称
 */
export const getProviderName = (provider: string | LLMProvider): string => {
  if (typeof provider === 'string') {
    return PROVIDER_NAME_MAP[provider] || PROVIDER_NAME_MAP.default;
  }
  
  // 枚举类型转换为字符串键
  const providerKey = LLMProvider[provider] as string;
  if (providerKey) {
    return PROVIDER_NAME_MAP[providerKey.toLowerCase()] || String(provider);
  }
  
  return String(provider);
};

/**
 * 获取模拟的模型数据
 */
const getMockModels = (providerId: string): LLMModelConfig[] => {
  // 将字符串ID转换为枚举
  let provider: LLMProvider;
  try {
    provider = providerId as LLMProvider;
  } catch (e) {
    return [];
  }
  
  switch (provider) {
    case LLMProvider.OPENAI:
      return [
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 4096, defaultTemperature: 0.7 },
        { id: 'gpt-4', name: 'GPT-4', maxTokens: 8192, defaultTemperature: 0.7 },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 128000, defaultTemperature: 0.7 },
      ];
    case LLMProvider.ANTHROPIC:
      return [
        { id: 'claude-2', name: 'Claude 2', maxTokens: 100000, defaultTemperature: 0.7 },
        { id: 'claude-instant-1', name: 'Claude Instant', maxTokens: 100000, defaultTemperature: 0.7 },
      ];
    case LLMProvider.GEMINI:
      return [
        { id: 'gemini-pro', name: 'Gemini Pro', maxTokens: 32768, defaultTemperature: 0.7 },
      ];
    default:
      return [];
  }
};

/**
 * 获取提供商列表
 */
export const getProviders = async (): Promise<ProviderData[]> => {
  try {
    // 生成虚拟数据
    const providers = Object.values(LLMProvider)
      .filter(p => typeof p === 'string')
      .map(provider => ({
        id: provider,
        name: getProviderName(provider),
        enabled: true,
      }));
    
    return providers;
  } catch (error) {
    console.error('获取提供商列表失败:', error);
    return [];
  }
};

/**
 * 获取单个提供商
 */
export const getProvider = async (providerId: string): Promise<ProviderData | null> => {
  if (!providerId) {
    return null;
  }

  try {
    // 生成虚拟数据
    return {
      id: providerId,
      name: getProviderName(providerId),
      enabled: true,
      apiUrl: '',
      models: getMockModels(providerId),
    };
  } catch (error) {
    console.error(`获取提供商 ${providerId} 失败:`, error);
    message.error(`获取提供商失败: ${providerId}`);
    return null;
  }
};

/**
 * 创建新提供商
 */
export const createProvider = async (provider: ProviderData): Promise<boolean> => {
  if (!provider || !provider.id) {
    message.error('提供商信息不完整');
    return false;
  }

  try {
    // 模拟创建
    console.log('创建提供商:', provider);
    message.success('创建提供商成功（模拟）');
    return true;
  } catch (error) {
    console.error('创建提供商失败:', error);
    message.error('创建提供商失败');
    return false;
  }
};

/**
 * 更新提供商信息
 */
export const updateProvider = async (
  providerId: string, 
  updates: ProviderUpdateData
): Promise<boolean> => {
  if (!providerId) {
    message.error('提供商ID不能为空');
    return false;
  }

  try {
    // 模拟更新
    console.log(`更新提供商 ${providerId}:`, updates);
    return true;
  } catch (error) {
    console.error(`更新提供商 ${providerId} 失败:`, error);
    message.error(`更新提供商失败: ${providerId}`);
    return false;
  }
};

/**
 * 删除提供商
 */
export const deleteProvider = async (providerId: string): Promise<boolean> => {
  if (!providerId) {
    message.error('提供商ID不能为空');
    return false;
  }

  try {
    // 模拟删除
    console.log(`删除提供商 ${providerId}`);
    message.success('删除提供商成功（模拟）');
    return true;
  } catch (error) {
    console.error(`删除提供商 ${providerId} 失败:`, error);
    message.error(`删除提供商失败: ${providerId}`);
    return false;
  }
};

/**
 * 添加模型到提供商
 */
export const addModel = async (providerId: string, model: LLMModelConfig): Promise<boolean> => {
  if (!providerId || !model) {
    message.error('提供商ID或模型信息不能为空');
    return false;
  }

  try {
    // 模拟添加
    console.log(`向提供商 ${providerId} 添加模型:`, model);
    message.success('添加模型成功（模拟）');
    return true;
  } catch (error) {
    console.error(`向提供商 ${providerId} 添加模型失败:`, error);
    message.error('添加模型失败');
    return false;
  }
};

/**
 * 更新模型
 */
export const updateModel = async (
  providerId: string, 
  modelId: string, 
  updateData: Partial<LLMModelConfig>
): Promise<boolean> => {
  if (!providerId || !modelId) {
    message.error('提供商ID或模型ID不能为空');
    return false;
  }

  try {
    // 模拟更新
    console.log(`更新模型 ${modelId}:`, updateData);
    message.success('更新模型成功（模拟）');
    return true;
  } catch (error) {
    console.error(`更新模型 ${modelId} 失败:`, error);
    message.error('更新模型失败');
    return false;
  }
};

/**
 * 删除模型
 */
export const deleteModel = async (providerId: string, modelId: string): Promise<boolean> => {
  if (!providerId || !modelId) {
    message.error('提供商ID或模型ID不能为空');
    return false;
  }

  try {
    // 模拟删除
    console.log(`删除模型 ${modelId}`);
    message.success('删除模型成功（模拟）');
    return true;
  } catch (error) {
    console.error(`删除模型 ${modelId} 失败:`, error);
    message.error('删除模型失败');
    return false;
  }
};

/**
 * 获取API密钥（模拟）
 */
export const getApiKey = async (providerId: string): Promise<string> => {
  return ''; // 模拟空密钥
};

/**
 * 设置API密钥（模拟）
 */
export const setApiKey = async (providerId: string, apiKey: string): Promise<boolean> => {
  console.log(`设置 ${providerId} 的API密钥: ${apiKey.substring(0, 4)}...`);
  return true; // 模拟成功
};

/**
 * 测试API密钥（模拟）
 */
export const testApiKey = async (providerId: string, apiKey: string): Promise<{success: boolean, error?: string}> => {
  return { success: true }; // 模拟成功
};
