import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { v4 as uuid } from 'uuid';
import { LLMConfig, LLMProvider } from '../../../common/types/llm';
import logger from '../../utils/logger';

/**
 * LLM配置管理器
 * 负责LLM配置的加载、保存和管理
 */
export class LLMConfigManager {
  private static instance: LLMConfigManager;
  private configs: LLMConfig[] = [];
  private defaultConfig: LLMConfig;
  private configDir: string;
  private configFileName = 'llm-config.json';
  private isInitialized = false;
  
  private activeProvider: LLMProvider = LLMProvider.OPENAI;
  private activeModel: string = 'gpt-3.5-turbo';

  private constructor() {
    this.configDir = path.join(app.getPath('userData'), 'llm');
    // 创建默认配置
    this.defaultConfig = this.createDefaultConfig();
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

    // 确保配置目录存在
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }

    // 加载配置文件
    await this.loadConfigs();
    // 清理无效配置
    this.cleanInvalidConfigs();

    // 如果没有找到配置，则创建默认配置
    if (this.configs.length === 0) {
      const defaultConfig = this.createDefaultConfig();
      this.configs.push(defaultConfig);
      this.defaultConfig = defaultConfig;
      await this.saveAllConfigsToFile();
    } else {
      // 查找默认配置
      const foundDefault = this.configs.find(config => config.isDefault);
      if (foundDefault) {
        this.defaultConfig = foundDefault;
      } else {
        // 如果没有默认配置，将第一个设为默认
        this.defaultConfig = this.configs[0];
        this.defaultConfig.isDefault = true;
        await this.saveAllConfigsToFile();
      }
    }

    this.isInitialized = true;
  }

  /**
   * 创建默认配置
   */
  private createDefaultConfig(): LLMConfig {
    return {
      id: uuid(),
      name: '默认OpenAI配置',
      provider: LLMProvider.OPENAI,
      modelId: 'gpt-3.5-turbo',
      modelName: 'GPT-3.5 Turbo',
      temperature: 0.7,
      maxTokens: 1000,
      topP: 0.9,
      frequencyPenalty: 0,
      presencePenalty: 0,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      systemMessage: '你是一个有用的AI助手，提供清晰、有条理的回答。',
      options: {
        timeout: 60000
      }
    };
  }

  /**
   * 加载所有配置
   */
  private async loadConfigs(): Promise<void> {
    const configPath = path.join(this.configDir, this.configFileName);
    
    if (!fs.existsSync(configPath)) {
      this.configs = [];
      return;
    }

    try {
      const data = fs.readFileSync(configPath, 'utf8');
      this.configs = JSON.parse(data) as LLMConfig[];
    } catch (error) {
      logger.error(`加载LLM配置失败: ${error instanceof Error ? error.message : String(error)}`);
      this.configs = [];
    }
  }

  /**
   * 清理无效/空配置
   */
  private cleanInvalidConfigs() {
    this.configs = this.configs.filter(c => c && c.id && c.name);
  }

  /**
   * 保存所有配置到文件
   */
  private async saveAllConfigsToFile(): Promise<void> {
    // 保存前清理无效配置
    this.cleanInvalidConfigs();
    const configPath = path.join(this.configDir, this.configFileName);
    try {
      fs.writeFileSync(configPath, JSON.stringify(this.configs, null, 2), 'utf8');
    } catch (error) {
      logger.error(`保存LLM配置失败: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * 保存单个配置到文件
   */
  private async saveConfigToFile(config: LLMConfig): Promise<void> {
    if (!config.id) {
      throw new Error('配置ID不能为空，禁止保存无效配置');
    }
    // 更新配置列表
    const index = this.configs.findIndex(c => c.id === config.id);
    if (index >= 0) {
      this.configs[index] = config;
    } else {
      this.configs.push(config);
    }

    // 保存所有配置
    await this.saveAllConfigsToFile();
  }

  /**
   * 获取所有配置
   */
  public getAllConfigs(): LLMConfig[] {
    return [...this.configs];
  }

  /**
   * 获取特定配置
   */
  public getConfig(id: string): LLMConfig | undefined {
    return this.configs.find(config => config.id === id);
  }

  /**
   * 获取默认配置
   */
  public getDefaultConfig(): LLMConfig {
    return { ...this.defaultConfig };
  }

  /**
   * 保存配置
   */
  public async saveConfig(config: LLMConfig): Promise<void> {
    if (!config.id) {
      throw new Error('配置ID不能为空，禁止保存无效配置');
    }
    config.updatedAt = new Date().toISOString();
    
    // 如果是新配置，生成ID
    if (!config.id) {
      config.id = uuid();
      config.createdAt = config.updatedAt;
    }
    
    await this.saveConfigToFile(config);
    
    // 如果这是默认配置，更新默认配置引用
    if (config.isDefault) {
      this.defaultConfig = config;
    }
  }
  
  /**
   * 删除配置
   */
  public async deleteConfig(id: string): Promise<void> {
    // 检查是否是默认配置
    const config = this.getConfig(id);
    if (!config) {
      throw new Error(`配置不存在: ${id}`);
    }
    
    // 不允许删除默认配置
    if (config.isDefault) {
      throw new Error('不能删除默认配置');
    }
    
    // 从配置列表中移除
    this.configs = this.configs.filter(c => c.id !== id);
    
    // 保存配置
    await this.saveAllConfigsToFile();
  }
  
  /**
   * 设置活跃提供商
   */
  public async setActiveProvider(provider: LLMProvider): Promise<void> {
    this.activeProvider = provider;
    
    // 保存当前活跃提供商状态，但不更新默认配置
    // 在实际代码中可以保存到其他配置或临时状态中
    console.log(`设置活跃提供商: ${provider}`);
  }
  
  /**
   * 获取活跃提供商
   */
  public getActiveProvider(): LLMProvider {
    return this.activeProvider;
  }
  
  /**
   * 设置活跃模型
   */
  public async setActiveModel(model: string): Promise<void> {
    this.activeModel = model;
    
    // 保存当前活跃模型状态，但不更新默认配置
    // 在实际代码中可以保存到其他配置或临时状态中
    console.log(`设置活跃模型: ${model}`);
  }
  
  /**
   * 获取活跃模型
   */
  public getActiveModel(): string {
    return this.activeModel;
  }

  /**
   * 设置默认配置
   * @param id 要设置为默认的配置ID
   */
  public async setDefaultConfig(id: string): Promise<void> {
    if (!id) {
      throw new Error('设置默认配置时ID不能为空');
    }
    console.log(`ConfigManager: 设置默认配置 ${id}`);
    
    // 验证配置是否存在
    const config = this.getConfig(id);
    if (!config) {
      throw new Error(`设置默认配置失败: 配置不存在 ${id}`);
    }
    
    try {
      // 更新配置列表中所有配置的isDefault属性
      for (const c of this.configs) {
        // 如果不是要设为默认的配置，且当前是默认的，则取消默认状态
        if (c.id !== id && c.isDefault) {
          console.log(`ConfigManager: 将配置 ${c.id} 设为非默认`);
          c.isDefault = false;
          // 保存到本地存储
          await this.saveConfigToFile(c);
        }
        
        // 如果是要设为默认的配置，则设置为默认
        if (c.id === id) {
          console.log(`ConfigManager: 将配置 ${c.id} 设为默认`);
          c.isDefault = true;
          // 保存到本地存储
          await this.saveConfigToFile(c);
        }
      }
      
      // 更新默认配置缓存
      this.defaultConfig = this.getConfig(id)!;
      console.log(`ConfigManager: 默认配置已更新为 ${this.defaultConfig.id} (${this.defaultConfig.name})`);
      
      // 保存所有配置
      await this.saveAllConfigsToFile();
      console.log(`ConfigManager: 所有配置已保存`);
    } catch (error) {
      console.error(`ConfigManager: 设置默认配置过程中发生错误:`, error);
      throw error;
    }
  }
} 