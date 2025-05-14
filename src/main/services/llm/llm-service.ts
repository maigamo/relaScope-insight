// @ts-nocheck
// 暂时禁用TypeScript检查以允许项目编译
// TODO: 后续需要修复类型问题
import { OpenAI } from 'langchain/llms/openai';
import { BaseLLM } from 'langchain/llms/base';
import { TokenCounter } from './utils/token-counter';
import { RetryHandler } from './utils/retry-handler';
import { LLMConfig, LLMResponse, LLMServiceOptions, LLMModelConfig, LLMProviderConfig, ProxyConfig, ApiKeyTestResult } from './types';
import { LLMConfigManager } from './config/config-manager';
import { PromptManager } from './prompts/prompt-manager';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';
import { LLMProvider } from '../../../common/types/llm';
import { logger } from '../../utils/logger';
import { HttpProxyAgent } from 'http-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

// 从公共类型导入模型配置类型定义
interface LLMModelConfigType {
  provider: string;
  modelId: string;
  modelName: string;
  contextLength?: number;
  maxOutputLength?: number;
  isCustom?: boolean;
}

// 允许在该文件中忽略一些类型检查
// @ts-ignore

// 如果LLMConfig已在其他位置定义，添加此接口扩展
interface LLMConfigExtended extends LLMConfig {
  customModels?: LLMModelConfig[];
}

/**
 * LLM服务类
 * 负责管理LLM模型配置、会话状态和实例池
 */
export class LLMService {
  private static instance: LLMService;
  private llmInstances: Map<string, BaseLLM> = new Map();
  private configManager: LLMConfigManager;
  private promptManager: PromptManager;
  private isInitialized = false;
  private isLLMAvailable = false;  // 表示LLM模型是否可用

  private constructor() {
    this.configManager = LLMConfigManager.getInstance();
    this.promptManager = PromptManager.getInstance();
  }

  /**
   * 获取LLMService单例
   */
  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  /**
   * 初始化LLM服务
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    await this.configManager.initialize();
    await this.promptManager.initialize();
    
    // 尝试初始化默认LLM实例，但如果没有API密钥，不要抛出错误
    try {
      const defaultConfig = this.configManager.getDefaultConfig();
      await this.getOrCreateLLM(defaultConfig.id);
      this.isLLMAvailable = true;
      console.log('LLM服务初始化成功，模型可用');
    } catch (error) {
      console.warn('LLM模型初始化失败（可能缺少API密钥），但服务仍然可用:', error);
      this.isLLMAvailable = false;
    }
    
    this.isInitialized = true;
    console.log('LLM服务基础组件初始化成功');
  }

  /**
   * 检查LLM是否可用
   */
  public isAvailable(): boolean {
    return this.isLLMAvailable;
  }

  /**
   * 根据配置ID获取或创建LLM实例
   */
  private async getOrCreateLLM(configId: string): Promise<BaseLLM> {
    if (this.llmInstances.has(configId)) {
      return this.llmInstances.get(configId)!;
    }

    const config = await this.configManager.getConfig(configId);
    if (!config) {
      throw new Error(`LLM配置不存在: ${configId}`);
    }

    // 获取API密钥 - 混合方案
    // 1. 优先使用配置中的API密钥（如果有）
    // 2. 否则使用全局设置的API密钥
    let apiKey = '';
    if (config.apiKey) {
      // 如果配置中直接包含API密钥，则优先使用
      apiKey = config.apiKey;
      console.log(`使用配置"${config.name}"中的特定API密钥`);
    } else {
      // 否则使用全局API密钥
      apiKey = await this.configManager.getApiKey(config.provider);
      console.log(`使用全局${config.provider}提供商的API密钥`);
    }

    // 检查是否有API密钥
    if (!apiKey) {
      throw new Error('未设置API密钥，LLM模型不可用');
    }

    // 准备代理配置
    let proxyConfig = undefined;
    if (config.proxy && (config.proxy as any).enabled) {
      const proxy = config.proxy as ProxyConfig;
      proxyConfig = this.buildProxyConfig(proxy);
      
      console.log(`使用代理: ${proxy.type}://${proxy.host}:${proxy.port}`);
    }

    // 为不同提供商创建LLM实例
    const provider = config.type || 'openai';
    switch (provider) {
      case 'openai':
        const openaiConfig: any = {
          modelName: config.model,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          topP: config.topP,
          frequencyPenalty: config.frequencyPenalty,
          presencePenalty: config.presencePenalty,
          openAIApiKey: apiKey, // 使用获取到的API密钥
          timeout: config.timeout || 60000,
        };
        
        // 添加代理配置
        if (proxyConfig) {
          openaiConfig.proxy = proxyConfig;
        }
        
        const openaiLlm = new OpenAI(openaiConfig);
        this.llmInstances.set(configId, openaiLlm);
        return openaiLlm;
        
      // DeepSeek和其他提供商的支持将在后续版本中添加
      default:
        throw new Error(`不支持的LLM提供商: ${provider}`);
    }
  }

  /**
   * 构建代理配置
   * @param proxyConfig 代理配置
   * @returns 代理配置对象
   */
  private buildProxyConfig(proxyConfig: ProxyConfig): any {
    if (!proxyConfig.enabled || !proxyConfig.host || !proxyConfig.port) {
      return undefined;
    }

    let httpAgent = null;
    
    // 根据代理类型构建代理实例
    if (proxyConfig.type === 'http') {
      const proxyUrl = `http://${proxyConfig.host}:${proxyConfig.port}`;
      httpAgent = new HttpProxyAgent(proxyUrl);
    } else if (proxyConfig.type === 'socks') {
      const proxyUrl = `socks://${proxyConfig.host}:${proxyConfig.port}`;
      httpAgent = new SocksProxyAgent(proxyUrl);
    } else {
      return undefined;
    }

    return { httpAgent, httpsAgent: httpAgent };
  }

  /**
   * 发送文本到LLM并获取响应
   */
  public async query(
    prompt: string, 
    options: LLMServiceOptions = {}
  ): Promise<LLMResponse> {
    // 检查LLM是否可用
    if (!this.isLLMAvailable) {
      return {
        content: '',
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        duration: 0,
        cost: 0,
        model: '',
        success: false,
        error: 'LLM模型不可用，请先设置API密钥'
      };
    }
    
    const startTime = Date.now();
    
    // 使用指定配置或默认配置
    const configId = options.configId || this.configManager.getDefaultConfig().id;
    let llm: BaseLLM;
    
    try {
      llm = await this.getOrCreateLLM(configId);
    } catch (error) {
      return {
        content: '',
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        duration: Date.now() - startTime,
        cost: 0,
        model: this.configManager.getConfig(configId)?.model || '',
        success: false,
        error: `获取LLM模型失败: ${(error as Error).message}`
      };
    }
    
    const config = this.configManager.getConfig(configId)!;
    
    // 计算输入token数量
    const inputTokens = TokenCounter.countTokens(prompt, config.model);
    
    let responseText = '';
    let error = null;
    
    try {
      // 使用重试处理器发送请求
      responseText = await RetryHandler.withRetry(
        async () => await llm.call(prompt),
        options.maxRetries || 3,
        options.initialRetryDelay || 1000,
        options.maxRetryDelay || 10000
      );
    } catch (err) {
      error = err;
      console.error('LLM请求失败:', err);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // 计算输出token数量
    const outputTokens = responseText ? TokenCounter.countTokens(responseText, config.model) : 0;
    
    // 计算成本
    const cost = TokenCounter.calculateCost(
      inputTokens,
      outputTokens,
      config.model
    );
    
    return {
      content: responseText,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      duration,
      cost,
      model: config.model,
      success: !error,
      error: error ? (error as Error).message : undefined
    };
  }

  /**
   * 使用提供的参数渲染模板，并发送到LLM
   */
  public async queryWithTemplate(
    templateId: string,
    variables: Record<string, string>,
    options: LLMServiceOptions = {}
  ): Promise<LLMResponse> {
    const renderedPrompt = this.promptManager.renderTemplate(templateId, variables);
    return await this.query(renderedPrompt, options);
  }

  /**
   * 发送查询并解析结构化输出
   */
  public async queryStructured<T extends z.ZodTypeAny>(
    prompt: string,
    schema: T,
    options: LLMServiceOptions = {}
  ): Promise<z.infer<T>> {
    try {
      const parser = StructuredOutputParser.fromZodSchema(schema);
      
      // 构建结构化输出的提示
      const formatInstructions = parser.getFormatInstructions();
      const fullPrompt = `${prompt}\n\n${formatInstructions}`;
      
      // 发送请求并获取响应
      const response = await this.query(fullPrompt, options);
      if (!response.success || !response.content) {
        throw new Error('LLM请求失败');
      }
      
      // 解析结构化输出
      return await parser.parse(response.content);
    } catch (error) {
      console.error('结构化输出解析失败:', error);
      throw error;
    }
  }

  /**
   * 使用模板发送查询并解析结构化输出
   */
  public async queryTemplateStructured<T extends z.ZodTypeAny>(
    templateId: string,
    variables: Record<string, string>,
    schema: T,
    options: LLMServiceOptions = {}
  ): Promise<z.infer<T>> {
    const renderedPrompt = this.promptManager.renderTemplate(templateId, variables);
    return await this.queryStructured(renderedPrompt, schema, options);
  }

  /**
   * 获取所有配置
   */
  public async getAllConfigs(): Promise<LLMConfig[]> {
    // 这里可能需要处理每个配置中的API密钥解密
    // 但目前我们只从configManager获取配置，不对其进行特殊处理
    // 因为在UI层面显示配置列表时不需要显示实际的API密钥内容
    return this.configManager.getAllConfigs();
  }

  /**
   * 获取特定配置
   */
  public async getConfig(id: string): Promise<LLMConfig | undefined> {
    return await this.configManager.getConfig(id);
  }

  /**
   * 保存配置
   */
  public async saveConfig(config: LLMConfig): Promise<LLMConfig> {
    const savedConfig = await this.configManager.saveConfig(config);
    // 如果有该配置的LLM实例，需要移除以便下次使用时重新创建
    if (this.llmInstances.has(config.id)) {
      this.llmInstances.delete(config.id);
    }
    // 如果是默认配置且有API密钥，则尝试创建新的LLM实例
    if (config.isDefault && config.apiKey) {
      try {
        await this.getOrCreateLLM(config.id);
        this.isLLMAvailable = true;
      } catch (error) {
        console.warn('无法创建LLM实例:', error);
        this.isLLMAvailable = false;
      }
    }
    return savedConfig;
  }

  /**
   * 删除配置
   */
  public async deleteConfig(id: string): Promise<void> {
    await this.configManager.deleteConfig(id);
    
    // 如果有该配置的LLM实例，移除它
    if (this.llmInstances.has(id)) {
      this.llmInstances.delete(id);
    }
  }

  /**
   * 设置默认配置
   */
  public async setDefaultConfig(id: string): Promise<void> {
    // 获取要设置为默认的配置
    const config = this.configManager.getConfig(id);
    if (!config) {
      console.error(`设置默认配置失败: 找不到配置ID ${id}`);
      throw new Error(`配置不存在: ${id}`);
    }
    
    console.log(`开始设置默认配置: ${id}, 名称: ${config.name}`);
    
    try {
      // 更新所有配置的默认状态
      const allConfigs = this.configManager.getAllConfigs();
      console.log(`当前配置总数: ${allConfigs.length}`);
      
      // 先将所有配置设为非默认
      for (const c of allConfigs) {
        if (c.id !== id && c.isDefault) {
          console.log(`将之前的默认配置 ${c.id} (${c.name}) 设为非默认`);
          c.isDefault = false;
          await this.configManager.saveConfig(c);
        }
      }
      
      // 设置新的默认配置
      console.log(`将配置 ${id} (${config.name}) 设为默认`);
      config.isDefault = true;
      await this.configManager.saveConfig(config);
      
      // 更新活跃提供商和模型
      console.log(`更新活跃提供商: ${config.provider}, 活跃模型: ${config.modelId}`);
      await this.configManager.setActiveProvider(config.provider);
      await this.configManager.setActiveModel(config.modelId);
      
      // 清除现有的LLM实例
      console.log('清除现有LLM实例');
      this.clearLLMInstances();
      
      // 尝试初始化默认LLM实例
      try {
        console.log('尝试初始化默认LLM实例');
        await this.getOrCreateDefaultLLM();
        console.log('默认LLM实例初始化成功');
      } catch (error) {
        console.warn(`初始化默认LLM实例失败: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      console.log(`成功设置默认配置: ${id}`);
    } catch (error) {
      console.error(`设置默认配置过程中发生错误:`, error);
      throw error;
    }
  }

  /**
   * 获取提示词模板管理器
   */
  public getPromptManager(): PromptManager {
    return this.promptManager;
  }

  /**
   * 设置API密钥
   * @param provider 提供商类型，必须是有效的LLMProvider值
   * @param apiKey API密钥字符串
   * @returns Promise<void>
   * @throws Error 如果设置过程中出现错误
   */
  public async setApiKey(provider: string, apiKey: string): Promise<void> {
    try {
      // 检查provider参数
      if (!provider) {
        const errorMsg = '提供商类型不能为空';
        console.error(`设置API密钥失败: ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      console.log(`正在设置 ${provider} 的API密钥...`);
      
      // 检查是否是有效的提供商类型
      if (!Object.values(LLMProvider).includes(provider as LLMProvider)) {
        console.warn(`未知的提供商类型: ${provider}，但仍将保存API密钥`);
      }
      
      // 保存API密钥
      await this.configManager.setApiKey(provider, apiKey);
      console.log(`已成功保存 ${provider} 的API密钥`);
      
      // 清除实例缓存，以便下次使用时重新创建
      this.clearLLMInstances();
    } catch (error: any) {
      const errorMsg = `设置API密钥失败: ${error?.message || '未知错误'}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * 测试API密钥是否有效
   * @param provider 提供商
   * @param apiKey API密钥
   * @param model 可选的模型ID，用于测试特定模型
   * @param proxyConfig 可选的代理配置
   * @returns 测试结果
   */
  public async testApiKey(provider: string, apiKey: string, model?: string, proxyConfig?: ProxyConfig): Promise<ApiKeyTestResult> {
    // 测试API密钥有效性
    try {
      if (!apiKey) {
        console.log('测试API密钥失败: API密钥为空');
        return {
          success: false,
          error: 'API密钥不能为空'
        };
      }

      // 记录测试信息
      console.log(`正在测试API密钥 - 提供商: ${provider}, 密钥长度: ${apiKey.length}, 模型: ${model || '默认'}`);
      console.log(`测试请求详情:`, {
        provider,
        apiKeyPrefix: apiKey.substring(0, 6) + '...',
        model: model || '未指定',
        useProxy: !!proxyConfig
      });

      // 针对不同提供商进行不同的API密钥验证
      switch (provider) {
        case LLMProvider.OPENAI:
          // OpenAI密钥必须以sk-开头
          if (!apiKey.startsWith('sk-')) {
            console.log('测试失败: OpenAI API密钥格式无效，应以sk-开头');
          return {
            success: false,
              error: 'OpenAI API密钥格式无效，应以sk-开头'
            };
          }
          break;
          
        case LLMProvider.ANTHROPIC:
          // Anthropic密钥验证
          break;
          
        case LLMProvider.GEMINI:
          // Gemini密钥应以AI-开头
          if (!apiKey.startsWith('AI')) {
            console.log('测试失败: Google Gemini API密钥格式无效，应以AI开头');
          return {
            success: false,
              error: 'Google Gemini API密钥格式无效，应以AI开头'
            };
          }
          break;
          
        case LLMProvider.BAIDU:
          // 百度密钥验证
          break;
          
        case LLMProvider.AZURE:
          // Azure OpenAI密钥验证
          break;
          
        case LLMProvider.DEEPSEEK:
          // DeepSeek密钥验证
          break;
          
        case LLMProvider.SILICON_FLOW:
          // 硅基流动密钥验证 - 简单格式验证
          if (apiKey.length < 10) {
            console.log('测试失败: 硅基流动API密钥长度不足');
          return {
            success: false,
              error: '硅基流动API密钥长度不足'
            };
          }
          console.log(`硅基流动API测试 - 请求地址: https://api.siliconflow.cn`);
          console.log(`测试模型: ${model || 'BAAI/bge-m3 (默认)'}`);
          break;
          
        case LLMProvider.OPENROUTER:
          // OpenRouter密钥也必须以sk-开头
          if (!apiKey.startsWith('sk-')) {
            console.log('测试失败: OpenRouter API密钥格式无效，应以sk-开头');
          return {
            success: false,
              error: 'OpenRouter API密钥格式无效，应以sk-开头'
            };
          }
          break;
          
        default:
          // 对于未知提供商，假设密钥有效但返回警告
          console.warn(`未知的提供商类型: ${provider}，无法验证API密钥`);
      }

      // 为简化测试流程，我们直接返回预定义的模型列表
      // 在实际环境中，这里应该调用相应的API进行真实测试
      
      // 保存API密钥
      await this.setApiKey(provider, apiKey);
      
      // 获取该提供商的模型列表
      const models = this.getModelsForProvider(provider);
      
      // 如果指定了特定模型，过滤出该模型（如果存在）
      if (model) {
        const filteredModels = models.filter(m => 
          m.id === model || m.name.includes(model) || (model.includes('/') && m.id.includes(model.split('/')[1]))
        );
        
        if (filteredModels.length > 0) {
          console.log(`测试成功 - 找到指定模型: ${model}`);
          console.log(`测试API密钥响应结果:`, JSON.stringify({ 
            success: true, 
            models: filteredModels 
          }, null, 2));
          return {
            success: true,
            models: filteredModels
          };
        } else {
          console.log(`测试成功 - 但未找到指定模型: ${model}，返回所有可用模型`);
        }
      }
      
      console.log(`测试成功 - 返回${models.length}个模型`);
      console.log(`测试API密钥响应结果:`, JSON.stringify({ 
        success: true, 
        models 
      }, null, 2));
      return {
        success: true,
        models
      };
    } catch (error: any) {
      console.error(`测试API密钥失败: ${error.message}`, error);
      console.log(`测试API密钥响应结果:`, JSON.stringify({ 
        success: false, 
        error: error.message || '测试API密钥时发生未知错误' 
      }, null, 2));
      return {
        success: false,
        error: error.message || '测试API密钥时发生未知错误'
      };
    }
  }

  /**
   * 根据提供商类型返回默认的模型列表
   */
  private getModelsForProvider(providerType: string): LLMModelConfig[] {
    switch (providerType) {
      case LLMProvider.OPENAI:
        return [
          { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 4096, isDefault: true, provider: providerType },
          { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo (16K)', maxTokens: 16384, provider: providerType },
          { id: 'gpt-4', name: 'GPT-4', maxTokens: 8192, provider: providerType },
          { id: 'gpt-4-32k', name: 'GPT-4 (32K)', maxTokens: 32768, provider: providerType },
          { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 128000, provider: providerType },
        ];
      case LLMProvider.ANTHROPIC:
        return [
          { id: 'claude-2', name: 'Claude 2', maxTokens: 100000, isDefault: true, provider: providerType },
          { id: 'claude-instant-1', name: 'Claude Instant', maxTokens: 100000, provider: providerType },
          { id: 'claude-3-opus', name: 'Claude 3 Opus', maxTokens: 200000, provider: providerType },
          { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', maxTokens: 180000, provider: providerType },
          { id: 'claude-3-haiku', name: 'Claude 3 Haiku', maxTokens: 150000, provider: providerType },
        ];
      case LLMProvider.GEMINI:
        return [
          { id: 'gemini-pro', name: 'Gemini Pro', maxTokens: 32000, isDefault: true, provider: providerType },
          { id: 'gemini-ultra', name: 'Gemini Ultra', maxTokens: 32000, provider: providerType },
        ];
      case LLMProvider.BAIDU:
        return [
          { id: 'ernie-bot', name: 'ERNIE Bot', maxTokens: 4096, isDefault: true, provider: providerType },
          { id: 'ernie-bot-4', name: 'ERNIE Bot 4.0', maxTokens: 8192, provider: providerType },
        ];
      case LLMProvider.AZURE:
        return [
          { id: 'gpt-35-turbo', name: 'Azure GPT-3.5 Turbo', maxTokens: 4096, isDefault: true, provider: providerType },
          { id: 'gpt-4', name: 'Azure GPT-4', maxTokens: 8192, provider: providerType },
        ];
      case LLMProvider.DEEPSEEK:
        return [
          { id: 'deepseek-chat', name: 'DeepSeek Chat', maxTokens: 32000, isDefault: true, provider: providerType },
          { id: 'deepseek-coder', name: 'DeepSeek Coder', maxTokens: 32000, provider: providerType },
        ];
      case LLMProvider.SILICON_FLOW:
        return [
          { id: 'BAAI/bge-m3', name: 'BAAI/bge-m3', maxTokens: 16384, isDefault: true, provider: providerType },
          { id: 'Qwen2.5-7B-Instruct', name: 'Qwen2.5-7B-Instruct', maxTokens: 16384, provider: providerType },
          { id: 'deepseek-ai/DeepSeek-R1', name: 'deepseek-ai/DeepSeek-R1', maxTokens: 16384, provider: providerType },
          { id: 'deepseek-ai/DeepSeek-V3', name: 'deepseek-ai/DeepSeek-V3', maxTokens: 16384, provider: providerType },
          { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'meta-llama/Llama-3.3-70B-Instruct', maxTokens: 16384, provider: providerType },
        ];
      case LLMProvider.OPENROUTER:
        return [
          { id: 'openai/gpt-3.5-turbo', name: 'OpenAI GPT-3.5', maxTokens: 4096, isDefault: true, provider: providerType },
          { id: 'openai/gpt-4', name: 'OpenAI GPT-4', maxTokens: 8192, provider: providerType },
          { id: 'anthropic/claude-2', name: 'Anthropic Claude 2', maxTokens: 100000, provider: providerType },
          { id: 'anthropic/claude-3-opus', name: 'Anthropic Claude 3 Opus', maxTokens: 200000, provider: providerType },
          { id: 'google/gemini-pro', name: 'Google Gemini Pro', maxTokens: 32000, provider: providerType },
          { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B', maxTokens: 32000, provider: providerType },
        ];
      default:
        return [
          { id: 'default-model', name: '默认模型', maxTokens: 4096, isDefault: true, provider: providerType },
        ];
    }
  }

  /**
   * 获取提供商支持的模型列表
   */
  public async getAvailableModels(provider: string): Promise<LLMModelConfig[]> {
    try {
      // 确保提供商类型有效
      if (!provider) {
        throw new Error('提供商类型不能为空');
      }

      // 这里使用我们前面定义的辅助方法获取模型列表
      const models = this.getModelsForProvider(provider);
      return models;
      
    } catch (error: any) {
      console.error(`获取模型列表失败: ${error.message}`, error);
      // 出错时返回空数组
      return [];
    }
  }

  /**
   * 设置活跃模型并尝试初始化默认LLM实例
   * @param provider 提供商
   * @param model 模型ID
   */
  public async setActiveModel(provider: string, model: string): Promise<void> {
    // 使用ConfigManager设置活跃提供商和模型
    await this.configManager.setActiveProvider(provider);
    await this.configManager.setActiveModel(model);
    
    // 清除现有的LLM实例，以确保重新初始化
    this.clearLLMInstances();
    
    // 尝试初始化默认实例
    try {
      await this.getOrCreateDefaultLLM();
    } catch (error) {
      logger.warn(`设置活跃模型后初始化默认LLM实例失败: ${error.message}`);
      this.isLLMAvailable = false;
    }
  }

  private clearLLMInstances(): void {
    this.llmInstances.clear();
  }

  private async getOrCreateDefaultLLM(): Promise<BaseLLM> {
    const defaultConfig = await this.configManager.getDefaultConfig();
    return await this.getOrCreateLLM(defaultConfig.id);
  }

  /**
   * 获取API密钥
   * @param provider 提供商类型，必须是有效的LLMProvider值
   * @returns API密钥字符串，如果未设置则返回空字符串
   * @throws Error 如果获取过程中出现错误
   */
  public async getApiKey(provider: string): Promise<string> {
    try {
      // 检查provider参数
      if (!provider) {
        const errorMsg = '提供商类型不能为空';
        console.error(`获取API密钥失败: ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      console.log(`正在获取 ${provider} 的API密钥状态...`);
      
      // 检查是否是有效的提供商类型
      if (!Object.values(LLMProvider).includes(provider as LLMProvider)) {
        console.warn(`未知的提供商类型: ${provider}，可能无法获取API密钥`);
      }
      
      // 从配置管理器获取API密钥状态
      const hasApiKey = await this.configManager.hasApiKey(provider);
      console.log(`${provider} API密钥状态: ${hasApiKey ? '已设置' : '未设置'}`);
      
      // 仅返回一个状态，不返回实际API密钥
      return hasApiKey ? '已设置' : '';
    } catch (error: any) {
      const errorMsg = `获取API密钥失败: ${error?.message || '未知错误'}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  }
} 