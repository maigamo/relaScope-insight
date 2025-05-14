/**
 * LLM相关类型定义
 */

/**
 * LLM提供商枚举
 */
export enum LLMProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  BAIDU = 'baidu',
  AZURE = 'azure',
  GEMINI = 'gemini',
  OLLAMA = 'ollama',
  LOCAL = 'local',
  DEEPSEEK = 'deepseek',
  SILICON_FLOW = 'silicon_flow',
  OPENROUTER = 'openrouter'
}

/**
 * 代理配置接口
 */
export interface ProxyConfig {
  /** 是否启用代理 */
  enabled: boolean;
  /** 代理服务器地址 */
  host: string;
  /** 代理服务器端口 */
  port: number;
  /** 代理类型 */
  protocol: 'http' | 'https' | 'socks4' | 'socks5';
  /** 需要身份验证的代理用户名 */
  username?: string;
  /** 需要身份验证的代理密码 */
  password?: string;
}

/**
 * LLM模型配置接口
 */
export interface LLMModelConfig {
  /** 模型ID */
  id: string;
  /** 模型名称 */
  name: string;
  /** 提供商 */
  provider?: LLMProvider;
  /** 是否默认 */
  isDefault?: boolean;
  /** 最大上下文长度或最大token数 */
  maxTokens: number;
  /** 是否为自定义模型 */
  isCustom?: boolean;
  /** 默认温度 */
  defaultTemperature?: number;
  /** 输入token成本 */
  costPerInputToken?: number;
  /** 输出token成本 */
  costPerOutputToken?: number;
  /** 输入token计费单位 */
  inputTokenUnit?: number;
  /** 输出token计费单位 */
  outputTokenUnit?: number;
  /** 额外配置选项 */
  options?: Record<string, any>;
}

/**
 * LLM配置接口
 */
export interface LLMConfig {
  /** 唯一ID */
  id: string;
  /** 配置名称 */
  name: string;
  /** 提供商 */
  provider: LLMProvider;
  /** 是否默认 */
  isDefault: boolean;
  /** 模型ID */
  modelId: string;
  /** 模型名称 */
  modelName: string;
  /** 温度 (创造性) */
  temperature: number;
  /** Top P (多样性) */
  topP: number;
  /** 频率惩罚 */
  frequencyPenalty: number;
  /** 存在惩罚 */
  presencePenalty: number;
  /** 最大输出标记数 */
  maxTokens: number;
  /** 系统消息 */
  systemMessage: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** API密钥（可选），如果设置则覆盖全局API密钥 */
  apiKey?: string;
  /** 代理配置 */
  proxy?: ProxyConfig;
  /** 额外配置选项 */
  options?: Record<string, any>;
}

/**
 * 提示词模板接口
 */
export interface PromptTemplate {
  /** 唯一ID */
  id: string;
  /** 模板名称 */
  name: string;
  /** 模板描述 */
  description: string;
  /** 模板内容 */
  content: string;
  /** 预定义变量 */
  variables: string[];
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 类别 */
  category?: string;
  /** 标签 */
  tags?: string[];
}

/**
 * LLM请求接口
 */
export interface LLMRequest {
  /** 提示文本 */
  prompt: string;
  /** 配置ID（可选） */
  configId?: string;
  /** 温度覆盖 */
  temperature?: number;
  /** MaxTokens覆盖 */
  maxTokens?: number;
  /** 代理配置覆盖 */
  proxy?: ProxyConfig;
}

/**
 * LLM响应接口
 */
export interface LLMResponse {
  /** 响应文本 */
  text: string;
  /** 使用的配置ID */
  configId: string;
  /** 模型ID */
  modelId: string;
  /** 提供商 */
  provider: LLMProvider;
  /** 输入标记数 */
  inputTokens: number;
  /** 输出标记数 */
  outputTokens: number;
  /** 总标记数 */
  totalTokens: number;
  /** 估算成本（美元） */
  estimatedCost: number;
  /** 请求时间（毫秒） */
  requestTime: number;
}

/**
 * API密钥测试结果接口
 */
export interface ApiKeyTestResult {
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
  /** 模型列表 */
  models?: LLMModelConfig[];
}

/**
 * 六边形人格分析请求接口
 */
export interface HexagonAnalysisRequest {
  /** 个人档案数据 */
  profile: any;
  /** 语录数据 */
  quotes: any[];
  /** 经历数据 */
  experiences: any[];
  /** 配置ID */
  configId?: string;
  /** 其他选项 */
  options?: Record<string, any>;
}

/**
 * 六边形人格分析结果接口
 */
export interface HexagonAnalysisResult {
  /** 分析结果文本 */
  analysis: string;
  /** 六大维度值 */
  dimensions: {
    intelligence: number;
    emotion: number;
    desire: number;
    society: number;
    action: number;
    regulation: number;
  };
  /** 标签列表 */
  tags: string[];
  /** 性格特点 */
  traits: string[];
  /** 优势 */
  strengths: string[];
  /** 短板 */
  weaknesses: string[];
  /** 建议 */
  suggestions: string[];
  /** 使用的配置ID */
  configId: string;
  /** 元数据 */
  metadata: Record<string, any>;
} 