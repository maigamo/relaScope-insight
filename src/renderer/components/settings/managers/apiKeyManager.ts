/**
 * API密钥管理器
 * 负责处理API密钥的加载、存储和验证
 */
import { LLMProvider } from '../../../../common/types/llm';

// 使用window上的全局API进行IPC通信
const ipc = (window as any).electron?.ipcRenderer || {
  invoke: (...args: any[]) => {
    console.error('IPC not available:', args);
    return Promise.reject(new Error('IPC not available'));
  }
};

// API密钥接口
export interface ApiKey {
  id: string;
  provider: LLMProvider;
  key: string;
  name?: string;
  isActive: boolean;
  lastVerified?: number;
  isValid?: boolean;
}

/**
 * API密钥管理器类
 * 单例模式实现
 */
class ApiKeyManager {
  private static instance: ApiKeyManager;
  private apiKeysCache: Map<string, ApiKey[]> = new Map(); // providerId -> ApiKey[]
  private isInitialized: boolean = false;

  private constructor() {
    // 初始化
  }

  /**
   * 获取ApiKeyManager实例
   */
  public static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }

  /**
   * 初始化API密钥管理器
   */
  public async init(): Promise<void> {
    if (this.isInitialized) return;
    
    // 加载所有提供商的API密钥
    try {
      this.isInitialized = true;
    } catch (error) {
      console.error('初始化API密钥管理器失败:', error);
      this.isInitialized = false;
    }
  }

  /**
   * 获取指定提供商的所有API密钥
   * @param providerId 提供商ID
   * @param forceRefresh 是否强制刷新缓存
   */
  public async getApiKeys(providerId: string, forceRefresh = false): Promise<ApiKey[]> {
    try {
      // 如果有缓存且不需要强制刷新，直接返回
      if (!forceRefresh && this.apiKeysCache.has(providerId)) {
        return this.apiKeysCache.get(providerId) || [];
      }
      
      // 调用IPC获取API密钥
      const apiKeys = await ipc.invoke('apiKey:getKeys', providerId);
      
      // 如果获取成功且返回有效数据
      if (apiKeys && Array.isArray(apiKeys)) {
        // 更新缓存
        this.apiKeysCache.set(providerId, apiKeys);
        return apiKeys;
      }
      
      return [];
    } catch (error) {
      console.error(`获取提供商 ${providerId} 的API密钥失败:`, error);
      return [];
    }
  }

  /**
   * 获取指定提供商的当前活跃API密钥
   * @param providerId 提供商ID
   */
  public async getActiveApiKey(providerId: string): Promise<ApiKey | null> {
    try {
      const apiKeys = await this.getApiKeys(providerId);
      return apiKeys.find(key => key.isActive) || null;
    } catch (error) {
      console.error(`获取提供商 ${providerId} 的活跃API密钥失败:`, error);
      return null;
    }
  }

  /**
   * 添加API密钥
   * @param providerId 提供商ID
   * @param key API密钥内容
   * @param name 密钥名称（可选）
   * @param setActive 是否设置为活跃密钥
   */
  public async addApiKey(
    providerId: string, 
    key: string, 
    name?: string, 
    setActive = false
  ): Promise<ApiKey | null> {
    try {
      // 创建新的API密钥对象
      const newApiKey: Omit<ApiKey, 'id'> = {
        provider: providerId as unknown as LLMProvider,
        key,
        name: name || `密钥 ${Date.now()}`,
        isActive: setActive
      };
      
      // 调用IPC保存API密钥
      const savedKey = await ipc.invoke('apiKey:saveKey', providerId, newApiKey);
      
      if (savedKey) {
        // 更新缓存
        const currentKeys = this.apiKeysCache.get(providerId) || [];
        
        // 如果设置为活跃密钥，需要更新其他密钥的状态
        if (setActive) {
          currentKeys.forEach(k => k.isActive = false);
        }
        
        // 添加新密钥到缓存
        this.apiKeysCache.set(providerId, [...currentKeys, savedKey]);
        
        return savedKey;
      }
      
      return null;
    } catch (error) {
      console.error(`为提供商 ${providerId} 添加API密钥失败:`, error);
      return null;
    }
  }

  /**
   * 更新API密钥
   * @param providerId 提供商ID
   * @param keyId 密钥ID
   * @param updates 更新内容
   */
  public async updateApiKey(
    providerId: string, 
    keyId: string, 
    updates: Partial<Omit<ApiKey, 'id' | 'provider'>>
  ): Promise<ApiKey | null> {
    try {
      // 获取当前密钥
      const currentKeys = await this.getApiKeys(providerId);
      const keyToUpdate = currentKeys.find(k => k.id === keyId);
      
      if (!keyToUpdate) {
        console.warn(`找不到要更新的API密钥: ${keyId}`);
        return null;
      }
      
      // 创建更新后的密钥对象
      const updatedKey = { ...keyToUpdate, ...updates };
      
      // 调用IPC更新API密钥
      const result = await ipc.invoke('apiKey:updateKey', providerId, keyId, updates);
      
      if (result) {
        // 更新缓存
        const updatedKeys = currentKeys.map(k => k.id === keyId ? updatedKey : k);
        
        // 如果设置了新的活跃密钥，需要更新其他密钥的状态
        if (updates.isActive) {
          updatedKeys.forEach(k => {
            if (k.id !== keyId) {
              k.isActive = false;
            }
          });
        }
        
        this.apiKeysCache.set(providerId, updatedKeys);
        
        return updatedKey;
      }
      
      return null;
    } catch (error) {
      console.error(`更新提供商 ${providerId} 的API密钥 ${keyId} 失败:`, error);
      return null;
    }
  }

  /**
   * 删除API密钥
   * @param providerId 提供商ID
   * @param keyId 密钥ID
   */
  public async deleteApiKey(providerId: string, keyId: string): Promise<boolean> {
    try {
      // 调用IPC删除API密钥
      const result = await ipc.invoke('apiKey:deleteKey', providerId, keyId);
      
      if (result) {
        // 更新缓存
        const currentKeys = this.apiKeysCache.get(providerId) || [];
        this.apiKeysCache.set(
          providerId, 
          currentKeys.filter(k => k.id !== keyId)
        );
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`删除提供商 ${providerId} 的API密钥 ${keyId} 失败:`, error);
      return false;
    }
  }

  /**
   * 验证API密钥
   * @param providerId 提供商ID
   * @param keyId 密钥ID
   */
  public async verifyApiKey(providerId: string, keyId: string): Promise<boolean> {
    try {
      // 调用IPC验证API密钥
      const isValid = await ipc.invoke('apiKey:verifyKey', providerId, keyId);
      
      // 更新缓存中的密钥状态
      const currentKeys = this.apiKeysCache.get(providerId) || [];
      const keyIndex = currentKeys.findIndex(k => k.id === keyId);
      
      if (keyIndex !== -1) {
        currentKeys[keyIndex] = {
          ...currentKeys[keyIndex],
          isValid,
          lastVerified: Date.now()
        };
        
        this.apiKeysCache.set(providerId, currentKeys);
      }
      
      return !!isValid;
    } catch (error) {
      console.error(`验证提供商 ${providerId} 的API密钥 ${keyId} 失败:`, error);
      return false;
    }
  }

  /**
   * 设置活跃API密钥
   * @param providerId 提供商ID
   * @param keyId 密钥ID
   */
  public async setActiveApiKey(providerId: string, keyId: string): Promise<boolean> {
    try {
      return !!(await this.updateApiKey(providerId, keyId, { isActive: true }));
    } catch (error) {
      console.error(`设置提供商 ${providerId} 的活跃API密钥 ${keyId} 失败:`, error);
      return false;
    }
  }

  /**
   * 清除API密钥缓存
   * @param providerId 提供商ID（可选，不提供则清除所有缓存）
   */
  public clearCache(providerId?: string): void {
    if (providerId) {
      this.apiKeysCache.delete(providerId);
    } else {
      this.apiKeysCache.clear();
    }
  }
}

// 导出单例实例
export const apiKeyManager = ApiKeyManager.getInstance();

export default apiKeyManager; 