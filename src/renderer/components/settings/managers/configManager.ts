/**
 * 配置管理器
 * 负责管理LLM配置的加载、保存、删除等操作
 */
import { LLMConfig, LLMProvider } from '../../../../common/types/llm';
import * as configIPC from '../utils/ipc/config';
import { v4 as uuidv4 } from 'uuid';

/**
 * 配置管理器类
 */
class ConfigManager {
  private static instance: ConfigManager;
  private configs: LLMConfig[] = [];
  private defaultConfigId: string | null = null;

  /**
   * 获取单例实例
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * 私有构造函数，确保单例模式
   */
  private constructor() {}

  /**
   * 加载所有配置
   */
  public async loadAllConfigs(): Promise<LLMConfig[]> {
    try {
      const configs = await configIPC.getAllConfigs();
      this.configs = configs || [];
      
      // 查找默认配置
      const defaultConfig = this.configs.find(config => config.isDefault);
      if (defaultConfig) {
        this.defaultConfigId = defaultConfig.id;
      } else if (this.configs.length > 0) {
        this.defaultConfigId = this.configs[0].id;
      } else {
        this.defaultConfigId = null;
      }
      
      return this.configs;
    } catch (error) {
      console.error('加载配置失败:', error);
      return [];
    }
  }

  /**
   * 获取所有配置
   */
  public getConfigs(): LLMConfig[] {
    return [...this.configs];
  }

  /**
   * 获取默认配置
   */
  public getDefaultConfig(): LLMConfig | null {
    if (!this.defaultConfigId) return null;
    return this.configs.find(config => config.id === this.defaultConfigId) || null;
  }

  /**
   * 通过ID获取配置
   */
  public getConfigById(configId: string): LLMConfig | null {
    return this.configs.find(config => config.id === configId) || null;
  }

  /**
   * 按提供商获取配置
   */
  public getConfigsByProvider(provider: LLMProvider): LLMConfig[] {
    return this.configs.filter(config => config.provider === provider);
  }

  /**
   * 创建新配置
   */
  public async createConfig(configData: Partial<LLMConfig>): Promise<LLMConfig | null> {
    try {
      // 创建新配置对象
      const newConfig: LLMConfig = {
        id: uuidv4(),
        name: configData.name || '新配置',
        provider: configData.provider || LLMProvider.OPENAI,
        isDefault: false,
        modelId: configData.modelId || '',
        modelName: configData.modelName || '默认模型',
        temperature: configData.temperature || 0.7,
        topP: configData.topP || 1,
        frequencyPenalty: configData.frequencyPenalty || 0,
        presencePenalty: configData.presencePenalty || 0,
        maxTokens: configData.maxTokens || 2048,
        systemMessage: configData.systemMessage || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...configData
      };
      
      // 保存配置
      const savedConfig = await configIPC.saveConfig(newConfig);
      
      if (savedConfig) {
        // 更新本地缓存
        this.configs.push(savedConfig);
        return savedConfig;
      }
      
      return null;
    } catch (error) {
      console.error('创建配置失败:', error);
      return null;
    }
  }

  /**
   * 更新配置
   */
  public async updateConfig(configId: string, configData: Partial<LLMConfig>): Promise<LLMConfig | null> {
    try {
      // 查找现有配置
      const existingIndex = this.configs.findIndex(config => config.id === configId);
      if (existingIndex === -1) {
        console.error('未找到要更新的配置:', configId);
        return null;
      }
      
      // 合并配置数据
      const updatedConfig: LLMConfig = {
        ...this.configs[existingIndex],
        ...configData,
        updatedAt: new Date().toISOString()
      };
      
      // 保存配置
      const savedConfig = await configIPC.saveConfig(updatedConfig);
      
      if (savedConfig) {
        // 更新本地缓存
        this.configs[existingIndex] = savedConfig;
        return savedConfig;
      }
      
      return null;
    } catch (error) {
      console.error('更新配置失败:', error);
      return null;
    }
  }

  /**
   * 删除配置
   */
  public async deleteConfig(configId: string): Promise<boolean> {
    try {
      const success = await configIPC.deleteConfig(configId);
      
      if (success) {
        // 更新本地缓存
        this.configs = this.configs.filter(config => config.id !== configId);
        
        // 如果删除的是默认配置，重新设置默认配置
        if (configId === this.defaultConfigId) {
          this.defaultConfigId = this.configs.length > 0 ? this.configs[0].id : null;
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('删除配置失败:', error);
      return false;
    }
  }

  /**
   * 设置默认配置
   */
  public async setDefaultConfig(configId: string): Promise<boolean> {
    try {
      const success = await configIPC.setDefaultConfig(configId);
      
      if (success) {
        // 更新默认配置ID
        this.defaultConfigId = configId;
        
        // 更新配置列表中的isDefault标记
        this.configs = this.configs.map(config => ({
          ...config,
          isDefault: config.id === configId
        }));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('设置默认配置失败:', error);
      return false;
    }
  }
}

// 导出单例实例
export default ConfigManager.getInstance(); 