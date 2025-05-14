/**
 * LLM服务类型定义
 */

export enum LLMProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  MISTRAL = 'mistral',
  MOONSHOT = 'moonshot',
  DEEPSEEK = 'deepseek',
  OLLAMA = 'ollama',
  OPENROUTER = 'openrouter'
}

/**
 * LLM配置类型
 */
export type LLMType = 'openai' | 'azure-openai' | 'anthropic';

/**
 * LLM模型配置
 */
export interface LLMModelConfig {
  id: string;
  name: string;
  provider?: LLMProvider;
  contextSize?: number;
  maxTokens: number;
  defaultTemperature?: number;
  costPerInputToken?: number;
  costPerOutputToken?: number;
  inputTokenUnit?: number; // 每多少个token收费一次
  outputTokenUnit?: number; // 每多少个token收费一次
  isAvailable?: boolean;
  description?: string;
  capabilities?: string[];
}

/**
 * LLM请求配置
 */
export interface LLMRequestOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  timeout?: number;
  stream?: boolean;
}

/**
 * LLM服务提供商配置
 */
export interface LLMProviderConfig {
  id: LLMProvider;
  name: string;
  apiKey?: string;
  baseUrl?: string;
  models: LLMModelConfig[];
  isActive: boolean;
  isCustomEndpoint?: boolean;
  defaultOptions?: LLMRequestOptions;
}

/**
 * LLM响应消息类型
 */
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

/**
 * LLM处理结果
 */
export interface LLMResult {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: LLMProvider;
  model: string;
  finishReason?: string;
}

/**
 * LLM错误类型
 */
export interface LLMError {
  message: string;
  code: string;
  provider: LLMProvider;
  isRetryable: boolean;
  request?: any;
  response?: any;
}

/**
 * 提示词模板接口
 */
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * LLM配置
 */
export interface LLMConfig {
  id: string;
  name: string;
  type: LLMType;
  model: string;
  apiKey: string;
  apiEndpoint?: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  timeout: number;
  isDefault?: boolean;
  activeProvider: LLMProvider;
  activeModel: string;
  providers: Record<LLMProvider, LLMProviderConfig>;
  defaultRequestOptions: LLMRequestOptions;
  retryConfig: {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
  };
  budgetLimits: {
    dailyTokenLimit: number;
    monthlyTokenLimit: number;
    warningThresholdPercent: number;
    limitAction: 'warn' | 'disable' | 'downgrade';
  };
  proxy?: {
    host: string;
    port: number;
    auth?: {
      username: string;
      password: string;
    };
  };
  // 其他配置项
}

/**
 * 统一LLM服务接口
 */
export interface ILLMService {
  /**
   * 发送请求到LLM并获取响应
   * @param messages 对话消息列表
   * @param options 请求选项
   * @returns LLM响应结果
   */
  sendRequest(
    messages: LLMMessage[], 
    options?: LLMRequestOptions
  ): Promise<LLMResult>;
  
  /**
   * 发送流式请求到LLM
   * @param messages 对话消息列表
   * @param callback 处理流式响应的回调函数
   * @param options 请求选项
   * @returns 完整的LLM响应结果
   */
  sendStreamingRequest(
    messages: LLMMessage[],
    callback: (chunk: string) => void,
    options?: LLMRequestOptions
  ): Promise<LLMResult>;
  
  /**
   * 计算文本的token数量
   * @param text 要计算的文本
   * @param model 模型名称（不同模型的分词算法可能不同）
   * @returns token数量
   */
  countTokens(text: string, model?: string): Promise<number>;
  
  /**
   * 获取当前活跃的LLM服务提供商
   * @returns 当前服务提供商ID
   */
  getActiveProvider(): LLMProvider;
  
  /**
   * 获取当前活跃的模型
   * @returns 当前模型ID
   */
  getActiveModel(): string;
  
  /**
   * 切换服务提供商
   * @param provider 提供商ID
   */
  setActiveProvider(provider: LLMProvider): Promise<void>;
  
  /**
   * 切换模型
   * @param modelId 模型ID
   */
  setActiveModel(modelId: string): Promise<void>;
  
  /**
   * 验证API密钥
   * @param provider 提供商ID
   * @param apiKey API密钥
   * @returns 是否有效
   */
  validateApiKey(provider: LLMProvider, apiKey: string): Promise<boolean>;
  
  /**
   * 设置API密钥
   * @param provider 提供商ID
   * @param apiKey API密钥
   */
  setApiKey(provider: LLMProvider, apiKey: string): Promise<void>;
  
  /**
   * 测试与LLM服务的连接
   * @param provider 提供商ID
   * @param apiKey 可选的API密钥
   * @returns 测试结果
   */
  testConnection(provider: LLMProvider, apiKey?: string): Promise<{
    success: boolean;
    message: string;
    latency?: number;
  }>;
}

/**
 * LLM服务选项
 */
export interface LLMServiceOptions {
  configId?: string;
  maxRetries?: number;
  initialRetryDelay?: number;
  maxRetryDelay?: number;
}

/**
 * LLM响应
 */
export interface LLMResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  duration: number;
  cost: number;
  model: string;
  success: boolean;
  error?: string;
}

/**
 * 模板变量替换结果
 */
export interface TemplateRenderResult {
  renderedTemplate: string;
  missingVariables: string[];
}

/**
 * 代理配置接口
 */
export interface ProxyConfig {
  enabled: boolean;
  type: 'http' | 'socks';
  host: string;
  port: number;
  auth?: {
    username: string;
    password: string;
  };
}

/**
 * API密钥测试结果
 */
export interface ApiKeyTestResult {
  success: boolean;
  message: string;
  models?: LLMModelConfig[];
} 