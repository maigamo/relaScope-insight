import { LLMConfig, LLMProvider, LLMModelConfig } from '../types';

/**
 * 默认OpenAI模型配置
 */
export const defaultOpenAIModels: LLMModelConfig[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: LLMProvider.OPENAI,
    contextSize: 128000,
    defaultTemperature: 0.7,
    maxTokens: 4096,
    costPerInputToken: 0.01,
    costPerOutputToken: 0.03,
    inputTokenUnit: 1000,
    outputTokenUnit: 1000,
    isAvailable: true,
    description: '最强大的通用多模态模型',
    capabilities: ['文本分析', '代码生成', '创意写作', '逻辑推理', '图像分析']
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: LLMProvider.OPENAI,
    contextSize: 128000,
    defaultTemperature: 0.7,
    maxTokens: 4096,
    costPerInputToken: 0.0015,
    costPerOutputToken: 0.0060,
    inputTokenUnit: 1000,
    outputTokenUnit: 1000,
    isAvailable: true,
    description: '更经济高效的多模态模型',
    capabilities: ['文本分析', '代码生成', '创意写作']
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: LLMProvider.OPENAI,
    contextSize: 16384,
    defaultTemperature: 0.7,
    maxTokens: 4096,
    costPerInputToken: 0.0005,
    costPerOutputToken: 0.0015,
    inputTokenUnit: 1000,
    outputTokenUnit: 1000,
    isAvailable: true,
    description: '价格实惠的通用模型',
    capabilities: ['文本分析', '代码生成', '简单问答']
  }
];

/**
 * 默认Anthropic模型配置
 */
export const defaultAnthropicModels: LLMModelConfig[] = [
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: LLMProvider.ANTHROPIC,
    contextSize: 200000,
    defaultTemperature: 0.7,
    maxTokens: 4096,
    costPerInputToken: 0.003,
    costPerOutputToken: 0.015,
    inputTokenUnit: 1000,
    outputTokenUnit: 1000,
    isAvailable: true,
    description: 'Anthropic最先进的高性能模型',
    capabilities: ['文本分析', '创意写作', '逻辑推理', '多语言支持']
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: LLMProvider.ANTHROPIC,
    contextSize: 200000,
    defaultTemperature: 0.7,
    maxTokens: 4096,
    costPerInputToken: 0.00025,
    costPerOutputToken: 0.00125,
    inputTokenUnit: 1000,
    outputTokenUnit: 1000,
    isAvailable: true,
    description: '性能均衡的即时响应模型',
    capabilities: ['文本分析', '简单问答', '内容生成']
  }
];

/**
 * 默认Google模型配置
 */
export const defaultGoogleModels: LLMModelConfig[] = [
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: LLMProvider.GOOGLE,
    contextSize: 1000000,
    defaultTemperature: 0.7,
    maxTokens: 8192,
    costPerInputToken: 0.00125,
    costPerOutputToken: 0.00375,
    inputTokenUnit: 1000,
    outputTokenUnit: 1000,
    isAvailable: true,
    description: 'Google高性能多模态大型语言模型',
    capabilities: ['多模态', '上下文理解', '代码生成', '创意写作']
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: LLMProvider.GOOGLE,
    contextSize: 1000000,
    defaultTemperature: 0.7,
    maxTokens: 8192,
    costPerInputToken: 0.00025,
    costPerOutputToken: 0.0005,
    inputTokenUnit: 1000,
    outputTokenUnit: 1000,
    isAvailable: true,
    description: '快速响应的高性价比模型',
    capabilities: ['文本处理', '创意写作', '简单问答']
  }
];

/**
 * 默认的LLM配置参数
 */
export const defaultLLMParams = {
  activeProvider: LLMProvider.OPENAI,
  activeModel: 'gpt-3.5-turbo',
  providers: {
    [LLMProvider.OPENAI]: {
      id: LLMProvider.OPENAI,
      name: 'OpenAI',
      models: defaultOpenAIModels,
      isActive: true,
      defaultOptions: {
        temperature: 0.7,
        maxTokens: 2048
      }
    },
    [LLMProvider.ANTHROPIC]: {
      id: LLMProvider.ANTHROPIC,
      name: 'Anthropic',
      models: defaultAnthropicModels,
      isActive: false,
      defaultOptions: {
        temperature: 0.7,
        maxTokens: 2048
      }
    },
    [LLMProvider.GOOGLE]: {
      id: LLMProvider.GOOGLE,
      name: 'Google',
      models: defaultGoogleModels,
      isActive: false,
      defaultOptions: {
        temperature: 0.7,
        maxTokens: 2048
      }
    },
    [LLMProvider.MISTRAL]: {
      id: LLMProvider.MISTRAL,
      name: 'Mistral AI',
      models: [],
      isActive: false
    },
    [LLMProvider.MOONSHOT]: {
      id: LLMProvider.MOONSHOT,
      name: '月之暗面',
      models: [],
      isActive: false
    },
    [LLMProvider.DEEPSEEK]: {
      id: LLMProvider.DEEPSEEK,
      name: 'DeepSeek',
      models: [],
      isActive: false
    },
    [LLMProvider.OLLAMA]: {
      id: LLMProvider.OLLAMA,
      name: 'Ollama',
      models: [],
      isActive: false,
      baseUrl: 'http://localhost:11434',
      isCustomEndpoint: true
    },
    [LLMProvider.OPENROUTER]: {
      id: LLMProvider.OPENROUTER,
      name: 'OpenRouter',
      models: [],
      isActive: false
    }
  },
  defaultRequestOptions: {
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    timeout: 60000 // 60秒
  },
  retryConfig: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000
  },
  budgetLimits: {
    dailyTokenLimit: 200000,
    monthlyTokenLimit: 2000000,
    warningThresholdPercent: 80,
    limitAction: 'warn' as 'warn' | 'disable' | 'downgrade'
  }
};

/**
 * 默认LLM配置
 */
export const defaultLLMConfig: LLMConfig = {
  id: 'default-config',
  name: '默认配置',
  type: 'openai',
  model: 'gpt-3.5-turbo',
  apiKey: '',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  timeout: 60000,
  isDefault: true,
  ...defaultLLMParams
};

/**
 * 默认的LLM配置集合
 */
export const defaultConfigs: LLMConfig[] = [
  {
    id: 'openai-default',
    name: 'OpenAI 默认配置',
    type: 'openai',
    model: 'gpt-3.5-turbo',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
    timeout: 60000,
    isDefault: true,
    activeProvider: LLMProvider.OPENAI,
    activeModel: 'gpt-3.5-turbo',
    providers: defaultLLMParams.providers,
    defaultRequestOptions: defaultLLMParams.defaultRequestOptions,
    retryConfig: defaultLLMParams.retryConfig,
    budgetLimits: defaultLLMParams.budgetLimits
  },
  {
    id: 'openai-gpt4',
    name: 'OpenAI GPT-4',
    type: 'openai',
    model: 'gpt-4',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
    timeout: 120000,
    isDefault: false,
    activeProvider: LLMProvider.OPENAI,
    activeModel: 'gpt-4',
    providers: defaultLLMParams.providers,
    defaultRequestOptions: defaultLLMParams.defaultRequestOptions,
    retryConfig: defaultLLMParams.retryConfig,
    budgetLimits: defaultLLMParams.budgetLimits
  },
  {
    id: 'anthropic-claude',
    name: 'Anthropic Claude',
    type: 'anthropic',
    model: 'claude-2',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
    timeout: 90000,
    isDefault: false,
    activeProvider: LLMProvider.ANTHROPIC,
    activeModel: 'claude-3-haiku-20240307',
    providers: defaultLLMParams.providers,
    defaultRequestOptions: defaultLLMParams.defaultRequestOptions,
    retryConfig: defaultLLMParams.retryConfig,
    budgetLimits: defaultLLMParams.budgetLimits
  }
]; 