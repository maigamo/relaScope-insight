/**
 * 模型管理器
 * 负责处理LLM模型的加载、获取和自定义模型操作
 */
import { LLMProvider, LLMModelConfig } from '../../../../common/types/llm';
import { DEFAULT_MODELS } from '../utils/constants';

// 使用window上的全局API进行IPC通信
const ipc = (window as any).electron?.ipcRenderer || {
  invoke: (...args: any[]) => {
    console.error('IPC not available:', args);
    return Promise.reject(new Error('IPC not available'));
  }
};

/**
 * 模型管理器类
 * 单例模式实现
 */
class ModelManager {
  private static instance: ModelManager;
  private modelsCache: Map<string, LLMModelConfig[]> = new Map(); // providerId -> models[]
  private customModelsCache: Map<string, LLMModelConfig[]> = new Map(); // providerId -> customModels[]
  private loadingProviders: Set<string> = new Set(); // 正在加载模型的提供商ID

  private constructor() {
    // 初始化
  }

  /**
   * 获取ModelManager实例
   */
  public static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  /**
   * 初始化模型管理器
   */
  public async init(): Promise<void> {
    // 初始化时无需特殊操作，模型会按需加载
  }

  /**
   * 获取提供商可用的模型列表
   * @param providerId 提供商ID或类型
   * @param forceRefresh 是否强制刷新缓存
   */
  public async getAvailableModels(
    providerId: string | LLMProvider, 
    forceRefresh = false
  ): Promise<LLMModelConfig[]> {
    try {
      // 确保providerId是字符串
      const provider = typeof providerId === 'string' ? providerId : String(providerId);
      
      // 如果已在加载中且不是强制刷新，返回默认模型
      if (this.loadingProviders.has(provider) && !forceRefresh) {
        return this.getDefaultModels(provider as unknown as LLMProvider);
      }
      
      // 如果已有缓存且不是强制刷新，直接返回缓存
      if (!forceRefresh && this.modelsCache.has(provider)) {
        return this.modelsCache.get(provider) || [];
      }
      
      // 标记为正在加载
      this.loadingProviders.add(provider);
      
      try {
        // 调用IPC获取模型列表
        const models = await ipc.invoke('model:getAvailableModels', provider);
        
        // 如果获取成功且返回有效数据
        if (models && Array.isArray(models)) {
          // 更新缓存
          this.modelsCache.set(provider, models);
          // 返回模型列表
          return models;
        } else {
          console.warn(`从提供商 ${provider} 获取模型列表失败，使用默认模型列表`);
          return this.getDefaultModels(provider as unknown as LLMProvider);
        }
      } finally {
        // 无论成功或失败，都移除加载标记
        this.loadingProviders.delete(provider);
      }
    } catch (error) {
      console.error(`获取提供商 ${providerId} 的模型列表失败:`, error);
      return this.getDefaultModels(providerId as unknown as LLMProvider);
    }
  }

  /**
   * 获取默认模型列表
   * @param provider 提供商类型
   */
  public getDefaultModels(provider: LLMProvider): LLMModelConfig[] {
    // 如果是字符串类型的provider，尝试转换为枚举
    const providerEnum = typeof provider === 'string' 
      ? provider as unknown as LLMProvider 
      : provider;
    
    // 获取该提供商的默认模型名称列表
    const modelNames = DEFAULT_MODELS[providerEnum] || [];
    
    // 转换为LLMModelConfig对象数组
    return modelNames.map(name => ({
      id: name,
      name,
      provider: providerEnum,
      maxTokens: 4096,
      isDefault: true
    }));
  }

  /**
   * 获取自定义模型列表
   * @param providerId 提供商ID
   */
  public async getCustomModels(providerId: string): Promise<LLMModelConfig[]> {
    try {
      // 如果有缓存，直接返回
      if (this.customModelsCache.has(providerId)) {
        return this.customModelsCache.get(providerId) || [];
      }
      
      // 调用IPC获取自定义模型
      const customModels = await ipc.invoke('model:getCustomModels', providerId);
      
      // 如果获取成功且返回有效数据
      if (customModels && Array.isArray(customModels)) {
        // 更新缓存
        this.customModelsCache.set(providerId, customModels);
        return customModels;
      }
      
      return [];
    } catch (error) {
      console.error(`获取提供商 ${providerId} 的自定义模型失败:`, error);
      return [];
    }
  }

  /**
   * 添加自定义模型
   * @param providerId 提供商ID
   * @param model 模型配置
   */
  public async addCustomModel(providerId: string, model: Omit<LLMModelConfig, 'id'>): Promise<LLMModelConfig | null> {
    try {
      // 生成模型ID
      const modelId = `custom_${Date.now()}`;
      
      // 创建完整的模型配置
      const customModel: LLMModelConfig = {
        ...model,
        id: modelId,
        isCustom: true
      };
      
      // 调用IPC保存自定义模型
      const result = await ipc.invoke('model:saveCustomModel', providerId, customModel);
      
      if (result) {
        // 更新缓存
        const currentCustomModels = this.customModelsCache.get(providerId) || [];
        this.customModelsCache.set(providerId, [...currentCustomModels, customModel]);
        
        return customModel;
      }
      
      return null;
    } catch (error) {
      console.error(`添加自定义模型到提供商 ${providerId} 失败:`, error);
      return null;
    }
  }

  /**
   * 删除自定义模型
   * @param providerId 提供商ID
   * @param modelId 模型ID
   */
  public async deleteCustomModel(providerId: string, modelId: string): Promise<boolean> {
    try {
      // 调用IPC删除自定义模型
      const result = await ipc.invoke('model:deleteCustomModel', providerId, modelId);
      
      if (result) {
        // 更新缓存
        const currentCustomModels = this.customModelsCache.get(providerId) || [];
        this.customModelsCache.set(
          providerId, 
          currentCustomModels.filter(model => model.id !== modelId)
        );
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`从提供商 ${providerId} 删除自定义模型 ${modelId} 失败:`, error);
      return false;
    }
  }

  /**
   * 获取所有模型（包括默认模型和自定义模型）
   * @param providerId 提供商ID或类型
   */
  public async getAllModels(providerId: string | LLMProvider): Promise<LLMModelConfig[]> {
    try {
      // 获取默认模型
      const defaultModels = await this.getAvailableModels(providerId);
      
      // 如果是LLMProvider类型，需要找到对应的提供商ID
      let provider = typeof providerId === 'string' ? providerId : String(providerId);
      
      // 获取自定义模型
      const customModels = await this.getCustomModels(provider);
      
      // 合并并返回
      return [...defaultModels, ...customModels];
    } catch (error) {
      console.error(`获取提供商 ${providerId} 的所有模型失败:`, error);
      return this.getDefaultModels(providerId as unknown as LLMProvider);
    }
  }

  /**
   * 清除模型缓存
   * @param providerId 提供商ID（可选，不提供则清除所有缓存）
   */
  public clearCache(providerId?: string): void {
    if (providerId) {
      this.modelsCache.delete(providerId);
      this.customModelsCache.delete(providerId);
    } else {
      this.modelsCache.clear();
      this.customModelsCache.clear();
    }
  }
}

// 导出单例实例
export default ModelManager.getInstance(); 