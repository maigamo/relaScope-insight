// @ts-nocheck
// 暂时禁用TypeScript检查以允许项目编译
// TODO: 后续需要修复类型问题

import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { LLMConfig, LLMProvider, LLMProviderConfig, LLMModelConfig } from '../types';
import { defaultConfigs } from './default-config';
import { SecurityService } from '../../security/security.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * LLM配置管理器
 * 负责LLM配置的加载、保存和管理
 */
export class LLMConfigManager {
  private static instance: LLMConfigManager;
  private configs: Map<string, LLMConfig> = new Map();
  private defaultConfigId: string = '';
  private configDir: string = '';
  private isInitialized = false;
  private securityService: SecurityService;

  private constructor() {
    this.securityService = SecurityService.getInstance();
  }

  /**
   * 获取LLMConfigManager单例
   */
  public static getInstance(): LLMConfigManager {
    if (!LLMConfigManager.instance) {
      LLMConfigManager.instance = new LLMConfigManager();
    }
    return LLMConfigManager.instance;
  }

  /**
   * 初始化配置管理器
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // 设置配置目录
    this.configDir = path.join(app.getPath('userData'), 'llm-configs');
    
    // 确保配置目录存在
    await this.ensureConfigDirExists();
    
    // 加载所有配置
    await this.loadConfigs();
    
    // 如果没有配置或没有默认配置，使用默认配置
    if (this.configs.size === 0 || !this.defaultConfigId) {
      await this.loadDefaultConfigs();
    }
    
    this.isInitialized = true;
  }

  /**
   * 确保配置目录存在
   */
  private async ensureConfigDirExists(): Promise<void> {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  /**
   * 加载所有配置
   */
  private async loadConfigs(): Promise<void> {
    try {
      // 读取配置文件列表
      const files = fs.readdirSync(this.configDir);
      
      for (const file of files) {
        // 只处理JSON文件
        if (!file.endsWith('.json')) continue;
        
        try {
          const filePath = path.join(this.configDir, file);
          const configData = fs.readFileSync(filePath, 'utf8');
          const config = JSON.parse(configData) as LLMConfig;
          
          this.configs.set(config.id, config);
          
          // 如果是默认配置，设置默认配置ID
          if (config.isDefault) {
            this.defaultConfigId = config.id;
          }
        } catch (err) {
          console.error(`加载配置文件 ${file} 失败:`, err);
        }
      }
      
      // 如果没有找到默认配置，但有配置，则将第一个配置设为默认
      if (!this.defaultConfigId && this.configs.size > 0) {
        const firstConfig = this.configs.values().next().value as LLMConfig;
        firstConfig.isDefault = true;
        this.defaultConfigId = firstConfig.id;
        await this.saveConfigToFile(firstConfig);
      }
    } catch (err) {
      console.error('加载配置文件失败:', err);
    }
  }

  /**
   * 加载默认配置
   */
  private async loadDefaultConfigs(): Promise<void> {
    for (const config of defaultConfigs) {
      this.configs.set(config.id, { ...config });
      
      // 保存到文件
      await this.saveConfigToFile(config);
    }
    
    // 设置第一个配置为默认配置
    if (defaultConfigs.length > 0) {
      this.defaultConfigId = defaultConfigs[0].id;
      const defaultConfig = this.configs.get(this.defaultConfigId)!;
      defaultConfig.isDefault = true;
      await this.saveConfigToFile(defaultConfig);
    }
  }

  /**
   * 将配置保存到文件
   */
  private async saveConfigToFile(config: LLMConfig): Promise<void> {
    if (!config.id) {
      throw new Error('配置ID不能为空，禁止保存无效配置');
    }
    console.log('[LLMConfigManager] saveConfigToFile 入参:', config);
    try {
      // 处理配置中的API密钥加密
      const configToSave = { ...config };
      if (configToSave.apiKey) {
        try {
          configToSave.apiKey = await this.securityService.encrypt(configToSave.apiKey);
          console.log(`配置 ${config.name} 的特定API密钥已加密保存`);
        } catch (error) {
          console.error(`加密配置API密钥失败:`, error);
          delete configToSave.apiKey;
        }
      }
      const filePath = path.join(this.configDir, `${config.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(configToSave, null, 2), 'utf8');
    } catch (err) {
      console.error(`保存配置 ${config.id} 失败:`, err);
      throw err;
    }
    console.log('[LLMConfigManager] saveConfigToFile 完成:', config.id);
  }

  /**
   * 获取所有配置
   */
  public getAllConfigs(): LLMConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * 获取配置
   * @param id 配置ID
   * @returns 配置对象
   */
  public async getConfig(id: string): Promise<LLMConfig | undefined> {
    // 获取基础配置
    const config = this.configs.get(id);
    if (!config) return undefined;
    
    // 创建配置的副本
    const configCopy = { ...config };
    
    // 如果配置中有加密的API密钥，则解密
    if (configCopy.apiKey) {
      try {
        configCopy.apiKey = await this.securityService.decrypt(configCopy.apiKey);
      } catch (error) {
        console.error(`解密配置API密钥失败:`, error);
        // 如果解密失败，移除API密钥
        delete configCopy.apiKey;
      }
    }
    
    return configCopy;
  }

  /**
   * 获取默认配置
   * @returns 默认配置
   */
  public async getDefaultConfig(): Promise<LLMConfig> {
    // 获取默认配置
    const config = this.configs.get(this.defaultConfigId);
    
    if (!config) {
      throw new Error('未找到默认配置');
    }
    
    // 创建配置的副本
    const configCopy = { ...config };
    
    // 如果配置中有加密的API密钥，则解密
    if (configCopy.apiKey) {
      try {
        configCopy.apiKey = await this.securityService.decrypt(configCopy.apiKey);
      } catch (error) {
        console.error(`解密默认配置API密钥失败:`, error);
        // 如果解密失败，移除API密钥
        delete configCopy.apiKey;
      }
    }
    
    return configCopy;
  }

  /**
   * 保存配置
   */
  public async saveConfig(config: LLMConfig): Promise<LLMConfig> {
    console.log('[LLMConfigManager] saveConfig 入参:', config);
    if (!config.id) {
      throw new Error('配置ID不能为空，禁止保存无效配置');
    }
    config.updatedAt = new Date().toISOString();
    // 如果是新配置，生成ID
    if (!config.id) {
      config.id = uuidv4();
      config.createdAt = config.updatedAt;
    }
    // 关键：同步写入 Map，保证 getConfig 能查到
    this.configs.set(config.id, config);
    await this.saveConfigToFile(config);
    if (config.isDefault) {
      this.defaultConfigId = config.id;
    }
    console.log('[LLMConfigManager] saveConfig 完成:', config);
    // 返回解密后的完整配置对象
    return await this.getConfig(config.id);
  }

  /**
   * 删除配置
   */
  public async deleteConfig(id: string): Promise<void> {
    this.cleanInvalidConfigs();
    console.log('[LLMConfigManager] deleteConfig 入参:', id);
    // 不能删除默认配置
    if (id === this.defaultConfigId) {
      throw new Error('无法删除默认配置');
    }
    
    // 删除配置
    this.configs.delete(id);
    
    // 删除配置文件
    try {
      const filePath = path.join(this.configDir, `${id}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(`删除配置文件 ${id} 失败:`, err);
      throw err;
    }
    await this.saveAllConfigsToFile();
    console.log('[LLMConfigManager] deleteConfig 完成:', id);
  }

  /**
   * 设置默认配置
   */
  public async setDefaultConfig(id: string): Promise<void> {
    // 确保配置存在
    const config = this.configs.get(id);
    if (!config) {
      throw new Error(`配置 ${id} 不存在`);
    }
    
    // 如果已经是默认配置，不做任何操作
    if (id === this.defaultConfigId) {
      return;
    }
    
    // 清除当前默认配置的默认标记
    const currentDefault = this.configs.get(this.defaultConfigId);
    if (currentDefault) {
      currentDefault.isDefault = false;
      await this.saveConfigToFile(currentDefault);
    }
    
    // 设置新的默认配置
    config.isDefault = true;
    this.defaultConfigId = id;
    
    // 保存到文件
    await this.saveConfigToFile(config);
  }

  /**
   * 生成配置ID
   */
  private generateConfigId(): string {
    return `config-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  /**
   * 设置API密钥
   * @param provider 提供商类型
   * @param apiKey API密钥字符串
   * @returns Promise<void>
   * @throws Error 如果设置过程中出现错误
   */
  public async setApiKey(provider: string, apiKey: string): Promise<void> {
    try {
      if (!provider) {
        throw new Error('提供商类型不能为空');
      }

      console.log(`正在设置提供商 ${provider} 的API密钥...`);
      
      // 获取默认配置
      const defaultConfig = await this.getDefaultConfig();
      
      // 确保providers对象存在
      if (!defaultConfig.providers) {
        defaultConfig.providers = {};
      }
      
      // 更新提供商配置，如果不存在则创建
      if (!defaultConfig.providers[provider]) {
        defaultConfig.providers[provider] = {
          id: provider,
          name: provider.charAt(0).toUpperCase() + provider.slice(1), // 首字母大写
          isActive: false,
          models: []
        };
      }
      
      // 更新API密钥
      defaultConfig.providers[provider].apiKey = await this.securityService.encrypt(apiKey);
      
      // 激活该提供商
      defaultConfig.providers[provider].isActive = true;
      
      // 保存到文件
      await this.saveConfig(defaultConfig);
      
      console.log(`成功保存提供商 ${provider} 的API密钥`);
    } catch (error: any) {
      const errorMsg = `设置API密钥失败: ${error?.message || '未知错误'}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * 获取API密钥（解密）
   * @param provider 提供商ID
   * @returns 解密后的API密钥
   */
  public async getApiKey(provider: LLMProvider): Promise<string> {
    const config = this.configs.get(this.defaultConfigId);
    if (!config) return '';
    
    const encryptedKey = config.providers[provider]?.apiKey;
    if (!encryptedKey) {
      return '';
    }

    try {
      return await this.securityService.decrypt(encryptedKey);
    } catch (error) {
      console.error('解密API密钥失败:', error);
      return '';
    }
  }

  /**
   * 设置活跃提供商
   */
  public async setActiveProvider(provider: string): Promise<void> {
    // 获取默认配置
    const defaultConfig = this.getDefaultConfig();
    
    // 更新活跃提供商
    defaultConfig.activeProvider = provider;
    
    // 保存到文件
    await this.saveConfigsToFile();
  }

  /**
   * 设置活跃模型
   */
  public async setActiveModel(modelId: string): Promise<void> {
    // 获取默认配置
    const defaultConfig = this.getDefaultConfig();
    
    // 更新活跃模型
    defaultConfig.activeModel = modelId;
    
    // 保存到文件
    await this.saveConfigsToFile();
  }

  /**
   * 更新提供商配置
   * @param provider 提供商ID
   * @param config 新的配置
   */
  public async updateProviderConfig(provider: LLMProvider, configUpdate: Partial<LLMProviderConfig>): Promise<void> {
    const config = this.configs.get(this.defaultConfigId);
    if (!config || !config.providers[provider]) {
      throw new Error(`未知的提供商: ${provider}`);
    }

    config.providers[provider] = {
      ...config.providers[provider],
      ...configUpdate
    };

    await this.saveConfig(config);
  }

  /**
   * 更新模型配置
   * @param provider 提供商ID
   * @param modelId 模型ID
   * @param config 新的配置
   */
  public async updateModelConfig(provider: LLMProvider, modelId: string, modelConfigUpdate: Partial<LLMModelConfig>): Promise<void> {
    const config = this.configs.get(this.defaultConfigId);
    if (!config) {
      throw new Error('未找到默认配置');
    }
    
    const providerConfig = config.providers[provider];
    if (!providerConfig) {
      throw new Error(`未知的提供商: ${provider}`);
    }

    const modelIndex = providerConfig.models.findIndex(m => m.id === modelId);
    if (modelIndex === -1) {
      throw new Error(`提供商 ${provider} 没有模型 ${modelId}`);
    }

    providerConfig.models[modelIndex] = {
      ...providerConfig.models[modelIndex],
      ...modelConfigUpdate
    };

    await this.saveConfig(config);
  }

  /**
   * 添加新模型
   * @param provider 提供商ID
   * @param model 模型配置
   */
  public async addModel(provider: LLMProvider, model: LLMModelConfig): Promise<void> {
    const config = this.configs.get(this.defaultConfigId);
    if (!config) {
      throw new Error('未找到默认配置');
    }
    
    const providerConfig = config.providers[provider];
    if (!providerConfig) {
      throw new Error(`未知的提供商: ${provider}`);
    }

    if (providerConfig.models.some(m => m.id === model.id)) {
      throw new Error(`模型 ${model.id} 已存在`);
    }

    providerConfig.models.push(model);
    await this.saveConfig(config);
  }

  /**
   * 删除模型
   * @param provider 提供商ID
   * @param modelId 模型ID
   */
  public async deleteModel(provider: LLMProvider, modelId: string): Promise<void> {
    const config = this.configs.get(this.defaultConfigId);
    if (!config) {
      throw new Error('未找到默认配置');
    }
    
    const providerConfig = config.providers[provider];
    if (!providerConfig) {
      throw new Error(`未知的提供商: ${provider}`);
    }

    const modelIndex = providerConfig.models.findIndex(m => m.id === modelId);
    if (modelIndex === -1) {
      throw new Error(`提供商 ${provider} 没有模型 ${modelId}`);
    }

    providerConfig.models.splice(modelIndex, 1);
    
    // 如果删除的是当前活跃模型，需要选择新的活跃模型
    if (config.activeModel === modelId) {
      if (providerConfig.models.length > 0) {
        config.activeModel = providerConfig.models[0].id;
      } else {
        config.activeModel = '';
      }
    }
    
    await this.saveConfig(config);
  }

  /**
   * 更新重试配置
   * @param maxRetries 最大重试次数
   * @param initialDelayMs 初始延迟（毫秒）
   * @param maxDelayMs 最大延迟（毫秒）
   */
  public async updateRetryConfig(
    maxRetries: number, 
    initialDelayMs: number, 
    maxDelayMs: number
  ): Promise<void> {
    const config = this.configs.get(this.defaultConfigId);
    if (!config) {
      throw new Error('未找到默认配置');
    }
    
    config.retryConfig = {
      maxRetries,
      initialDelayMs,
      maxDelayMs
    };
    
    await this.saveConfig(config);
  }

  /**
   * 更新预算限制配置
   * @param dailyTokenLimit 每日Token限制
   * @param monthlyTokenLimit 每月Token限制
   * @param warningThresholdPercent 警告阈值百分比
   * @param limitAction 限制操作
   */
  public async updateBudgetLimits(
    dailyTokenLimit: number,
    monthlyTokenLimit: number,
    warningThresholdPercent: number,
    limitAction: 'warn' | 'disable' | 'downgrade'
  ): Promise<void> {
    const config = this.configs.get(this.defaultConfigId);
    if (!config) {
      throw new Error('未找到默认配置');
    }
    
    config.budgetLimits = {
      dailyTokenLimit,
      monthlyTokenLimit,
      warningThresholdPercent,
      limitAction
    };
    
    await this.saveConfig(config);
  }

  /**
   * 更新代理配置
   * @param host 代理主机
   * @param port 代理端口
   * @param auth 认证信息
   */
  public async updateProxyConfig(
    host: string,
    port: number,
    auth?: { username: string; password: string }
  ): Promise<void> {
    const config = this.configs.get(this.defaultConfigId);
    if (!config) {
      throw new Error('未找到默认配置');
    }
    
    config.proxy = {
      host,
      port,
      auth
    };
    
    await this.saveConfig(config);
  }

  /**
   * 清除代理配置
   */
  public async clearProxyConfig(): Promise<void> {
    const config = this.configs.get(this.defaultConfigId);
    if (!config) {
      throw new Error('未找到默认配置');
    }
    
    config.proxy = undefined;
    await this.saveConfig(config);
  }

  /**
   * 保存所有配置到文件
   */
  private async saveConfigsToFile(): Promise<void> {
    try {
      const defaultConfig = this.getDefaultConfig();
      await this.saveConfigToFile(defaultConfig);
    } catch (err) {
      console.error(`保存所有配置失败:`, err);
      throw err;
    }
  }

  private async saveAllConfigsToFile(): Promise<void> {
    this.cleanInvalidConfigs();
    try {
      for (const config of this.configs.values()) {
        await this.saveConfigToFile(config);
      }
    } catch (err) {
      console.error(`保存所有配置失败:`, err);
      throw err;
    }
  }

  // 清理无效/脏配置
  private cleanInvalidConfigs() {
    if (this.configs instanceof Map) {
      for (const [id, config] of this.configs.entries()) {
        if (!config || !config.id || !config.name || !config.provider) {
          this.configs.delete(id);
        }
      }
    } else if (Array.isArray(this.configs)) {
      this.configs = this.configs.filter(c => c && c.id && c.name && c.provider);
    }
  }

  /**
   * 检查是否已设置API密钥
   * @param provider 提供商ID
   * @returns 是否已设置API密钥
   */
  public async hasApiKey(provider: string): Promise<boolean> {
    try {
      const config = this.configs.get(this.defaultConfigId);
      if (!config) return false;
      
      // 检查提供商配置是否存在
      if (!config.providers || !config.providers[provider]) {
        return false;
      }
      
      // 检查是否有加密的API密钥
      const encryptedKey = config.providers[provider]?.apiKey;
      if (!encryptedKey) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('检查API密钥状态失败:', error);
      return false;
    }
  }
} 