import { LLMService } from '../../../../../renderer/services/ipc.service';
import type { LLMConfig } from '../../../../../common/types/llm';

/**
 * 获取所有LLM配置 - 与原LLMService.getAllConfigs完全一致
 */
export const getAllConfigs = async (): Promise<LLMConfig[]> => {
  return await LLMService.getAllConfigs();
};

/**
 * 获取特定LLM配置 - 与原LLMService.getConfig完全一致
 */
export const getConfig = async (id: string): Promise<LLMConfig | null> => {
  return await LLMService.getConfig(id);
};

/**
 * 保存LLM配置 - 与原LLMService.saveConfig完全一致
 */
export const saveConfig = async (config: LLMConfig): Promise<LLMConfig | null> => {
  return await LLMService.saveConfig(config);
};

/**
 * 删除LLM配置 - 与原LLMService.deleteConfig完全一致
 */
export const deleteConfig = async (id: string): Promise<boolean> => {
  return await LLMService.deleteConfig(id);
};

/**
 * 设置默认配置 - 与原LLMService.setDefaultConfig完全一致
 */
export const setDefaultConfig = async (id: string): Promise<boolean> => {
  return await LLMService.setDefaultConfig(id);
}; 