/**
 * model.ts
 * 封装与LLM模型相关的IPC操作
 */
import { LLMService } from '../../../../../renderer/services/ipc.service';
import { LLMModelConfig, LLMProvider } from '../../../../../common/types/llm';

/**
 * 获取可用的模型列表
 * 与provider.ts中重复是为了功能模块的划分更清晰
 * @param provider LLM提供商
 * @returns 提供商支持的模型列表
 */
export const getAvailableModels = async (provider: LLMProvider): Promise<LLMModelConfig[]> => {
  try {
    return await LLMService.getAvailableModels(provider);
  } catch (error) {
    console.error('获取模型列表失败:', error);
    throw error;
  }
};

/**
 * 获取模型列表的别名函数
 * 为了兼容现有代码，与getAvailableModels功能相同
 * @param provider LLM提供商
 * @returns 提供商支持的模型列表
 */
export const getModels = getAvailableModels;

/**
 * 获取特定的模型配置
 * @param provider LLM提供商
 * @param modelId 模型ID
 * @returns 模型配置信息
 */
export const getModelConfig = async (provider: LLMProvider, modelId: string): Promise<LLMModelConfig | null> => {
  try {
    // 获取所有模型
    const models = await getAvailableModels(provider);
    // 查找特定模型
    return models.find(model => model.id === modelId) || null;
  } catch (error) {
    console.error('获取模型配置失败:', error);
    throw error;
  }
};

/**
 * 根据模型ID获取其最大上下文窗口大小
 * @param provider LLM提供商
 * @param modelId 模型ID
 * @returns 模型最大token数量
 */
export const getModelMaxTokens = async (provider: LLMProvider, modelId: string): Promise<number> => {
  try {
    const model = await getModelConfig(provider, modelId);
    return model?.maxTokens || 4096; // 默认值
  } catch (error) {
    console.error('获取模型最大Token失败:', error);
    return 4096; // 出错时返回默认值
  }
};

/**
 * 获取模型的默认温度值
 * @param provider LLM提供商
 * @param modelId 模型ID
 * @returns 默认温度值
 */
export const getModelDefaultTemperature = async (provider: LLMProvider, modelId: string): Promise<number> => {
  try {
    const model = await getModelConfig(provider, modelId);
    return model?.defaultTemperature || 0.7; // 默认值
  } catch (error) {
    console.error('获取模型默认温度失败:', error);
    return 0.7; // 出错时返回默认值
  }
};
