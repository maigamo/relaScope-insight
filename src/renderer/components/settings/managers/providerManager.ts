/**
 * 提供商管理器
 * 负责管理LLM提供商相关操作
 */
import { LLMProvider } from '../../../../common/types/llm';
import { PROVIDER_DISPLAY_NAMES, DEFAULT_MODELS } from '../utils/constants';

// 使用window上的全局API进行IPC通信
const ipc = (window as any).electron?.ipcRenderer || {
  invoke: (...args: any[]) => {
    console.error('IPC not available:', args);
    return Promise.reject(new Error('IPC not available'));
  }
};

// 提供商接口
export interface Provider {
  id: string;
  provider: LLMProvider;
  name?: string;
  isDefault: boolean;
  customModels?: string[];
}

/**
 * 提供商管理器类
 * 单例模式实现
 */
class ProviderManager {
  private static instance: ProviderManager;
  private providers: Provider[] = [];
  private defaultProvider: string | null = null;

  private constructor() {
    // 初始化默认提供商
    this.providers = [];
    this.defaultProvider = null;
  }

  /**
   * 获取ProviderManager实例
   */
  public static getInstance(): ProviderManager {
    if (!ProviderManager.instance) {
      ProviderManager.instance = new ProviderManager();
    }
    return ProviderManager.instance;
  }

  /**
   * 初始化提供商管理器
   * 加载所有提供商和默认提供商设置
   */
  public async init(): Promise<void> {
    try {
      // 加载提供商列表
      await this.loadProviders();
      
      // 加载默认提供商
      await this.loadDefaultProvider();
    } catch (error) {
      console.error('初始化提供商管理器失败:', error);
      throw error;
    }
  }

  /**
   * 加载所有提供商
   */
  private async loadProviders(): Promise<void> {
    try {
      // 从后端加载提供商列表
      const providers = await ipc.invoke('provider:getAll');
      
      if (providers && Array.isArray(providers)) {
        this.providers = providers;
      } else {
        // 如果后端没有数据，初始化默认提供商列表
        this.initializeDefaultProviders();
      }
    } catch (error) {
      console.error('加载提供商列表失败:', error);
      // 如果加载失败，初始化默认提供商列表
      this.initializeDefaultProviders();
    }
  }

  /**
   * 初始化默认提供商列表
   */
  private initializeDefaultProviders(): void {
    // 创建默认提供商列表
    this.providers = Object.values(LLMProvider).map((provider, index) => ({
      id: `provider-${index + 1}`,
      provider: provider as LLMProvider,
      isDefault: provider === LLMProvider.OPENAI, // 默认选择OpenAI
      customModels: []
    }));
    
    // 设置默认提供商
    const defaultProvider = this.providers.find(p => p.isDefault);
    this.defaultProvider = defaultProvider ? defaultProvider.id : null;
  }

  /**
   * 加载默认提供商设置
   */
  private async loadDefaultProvider(): Promise<void> {
    try {
      // 从后端加载默认提供商ID
      const defaultProviderId = await ipc.invoke('provider:getDefault');
      
      if (defaultProviderId) {
        // 更新默认提供商
        this.setDefaultProvider(defaultProviderId, false);
      } else if (this.providers.length > 0) {
        // 如果没有设置默认提供商但有提供商列表，设置第一个为默认
        this.setDefaultProvider(this.providers[0].id, false);
      }
    } catch (error) {
      console.error('加载默认提供商设置失败:', error);
    }
  }

  /**
   * 获取所有提供商
   */
  public getProviders(): Provider[] {
    return [...this.providers];
  }

  /**
   * 获取指定ID的提供商
   * @param providerId 提供商ID
   */
  public getProvider(providerId: string): Provider | null {
    return this.providers.find(p => p.id === providerId) || null;
  }

  /**
   * 获取指定类型的提供商
   * @param providerType 提供商类型
   */
  public getProviderByType(providerType: LLMProvider): Provider | null {
    return this.providers.find(p => p.provider === providerType) || null;
  }

  /**
   * 获取默认提供商
   */
  public getDefaultProvider(): Provider | null {
    if (!this.defaultProvider) return null;
    return this.getProvider(this.defaultProvider);
  }

  /**
   * 设置默认提供商
   * @param providerId 提供商ID
   * @param save 是否保存到后端
   */
  public async setDefaultProvider(providerId: string, save: boolean = true): Promise<boolean> {
    try {
      // 查找提供商
      const provider = this.getProvider(providerId);
      if (!provider) {
        throw new Error(`未找到ID为 ${providerId} 的提供商`);
      }
      
      // 更新提供商列表中的默认标记
      this.providers = this.providers.map(p => ({
        ...p,
        isDefault: p.id === providerId
      }));
      
      // 更新默认提供商ID
      this.defaultProvider = providerId;
      
      // 保存到后端
      if (save) {
        await ipc.invoke('provider:setDefault', providerId);
      }
      
      return true;
    } catch (error) {
      console.error('设置默认提供商失败:', error);
      throw error;
    }
  }

  /**
   * 添加自定义提供商
   * @param provider 提供商信息
   */
  public async addProvider(provider: Omit<Provider, 'id' | 'isDefault'>): Promise<Provider> {
    try {
      // 生成新的提供商ID
      const newId = `provider-${Date.now()}`;
      
      // 创建新提供商对象
      const newProvider: Provider = {
        ...provider,
        id: newId,
        isDefault: false,
        customModels: provider.customModels || []
      };
      
      // 保存到后端
      await ipc.invoke('provider:add', newProvider);
      
      // 添加到本地列表
      this.providers.push(newProvider);
      
      return newProvider;
    } catch (error) {
      console.error('添加提供商失败:', error);
      throw error;
    }
  }

  /**
   * 更新提供商
   * @param providerId 提供商ID
   * @param updates 要更新的字段
   */
  public async updateProvider(
    providerId: string, 
    updates: Partial<Omit<Provider, 'id' | 'isDefault'>>
  ): Promise<Provider> {
    try {
      // 查找提供商
      const provider = this.getProvider(providerId);
      if (!provider) {
        throw new Error(`未找到ID为 ${providerId} 的提供商`);
      }
      
      // 创建更新后的提供商对象
      const updatedProvider: Provider = {
        ...provider,
        ...updates
      };
      
      // 保存到后端
      await ipc.invoke('provider:update', providerId, updatedProvider);
      
      // 更新本地列表
      this.providers = this.providers.map(p => 
        p.id === providerId ? updatedProvider : p
      );
      
      return updatedProvider;
    } catch (error) {
      console.error(`更新提供商 ${providerId} 失败:`, error);
      throw error;
    }
  }

  /**
   * 删除提供商
   * @param providerId 提供商ID
   */
  public async deleteProvider(providerId: string): Promise<boolean> {
    try {
      // 检查是否为默认提供商
      const provider = this.getProvider(providerId);
      if (!provider) {
        throw new Error(`未找到ID为 ${providerId} 的提供商`);
      }
      
      if (provider.isDefault) {
        throw new Error('不能删除默认提供商');
      }
      
      // 从后端删除
      await ipc.invoke('provider:delete', providerId);
      
      // 从本地列表删除
      this.providers = this.providers.filter(p => p.id !== providerId);
      
      return true;
    } catch (error) {
      console.error(`删除提供商 ${providerId} 失败:`, error);
      throw error;
    }
  }

  /**
   * 获取提供商显示名称
   * @param provider 提供商类型
   */
  public getProviderDisplayName(provider: LLMProvider): string {
    return PROVIDER_DISPLAY_NAMES[provider] || provider;
  }

  /**
   * 获取提供商默认模型
   * @param provider 提供商类型
   */
  public getDefaultModels(provider: LLMProvider): string[] {
    return DEFAULT_MODELS[provider] || [];
  }

  /**
   * 获取提供商的所有模型（默认模型 + 自定义模型）
   * @param providerId 提供商ID
   */
  public getAllModels(providerId: string): string[] {
    const provider = this.getProvider(providerId);
    if (!provider) return [];
    
    const defaultModels = this.getDefaultModels(provider.provider);
    const customModels = provider.customModels || [];
    
    // 合并默认模型和自定义模型，并去重
    return [...new Set([...defaultModels, ...customModels])];
  }

  /**
   * 添加自定义模型到提供商
   * @param providerId 提供商ID
   * @param modelName 模型名称
   */
  public async addCustomModel(providerId: string, modelName: string): Promise<boolean> {
    try {
      const provider = this.getProvider(providerId);
      if (!provider) {
        throw new Error(`未找到ID为 ${providerId} 的提供商`);
      }
      
      // 检查是否已存在
      const allModels = this.getAllModels(providerId);
      if (allModels.includes(modelName)) {
        throw new Error(`模型 "${modelName}" 已存在`);
      }
      
      // 添加自定义模型
      const customModels = [...(provider.customModels || []), modelName];
      
      // 更新提供商
      await this.updateProvider(providerId, { customModels });
      
      return true;
    } catch (error) {
      console.error(`向提供商 ${providerId} 添加自定义模型失败:`, error);
      throw error;
    }
  }

  /**
   * 删除提供商的自定义模型
   * @param providerId 提供商ID
   * @param modelName 模型名称
   */
  public async removeCustomModel(providerId: string, modelName: string): Promise<boolean> {
    try {
      const provider = this.getProvider(providerId);
      if (!provider) {
        throw new Error(`未找到ID为 ${providerId} 的提供商`);
      }
      
      // 检查是否为默认模型
      const defaultModels = this.getDefaultModels(provider.provider);
      if (defaultModels.includes(modelName)) {
        throw new Error(`不能删除默认模型 "${modelName}"`);
      }
      
      // 检查是否存在于自定义模型中
      const customModels = provider.customModels || [];
      if (!customModels.includes(modelName)) {
        throw new Error(`模型 "${modelName}" 不存在于自定义模型中`);
      }
      
      // 移除自定义模型
      const updatedCustomModels = customModels.filter(m => m !== modelName);
      
      // 更新提供商
      await this.updateProvider(providerId, { customModels: updatedCustomModels });
      
      return true;
    } catch (error) {
      console.error(`从提供商 ${providerId} 删除自定义模型失败:`, error);
      throw error;
    }
  }
}

// 导出单例实例
export const providerManager = ProviderManager.getInstance();

export default providerManager; 