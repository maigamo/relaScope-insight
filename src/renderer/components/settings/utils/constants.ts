/**
 * 常量定义
 * 包含各种默认值和常量
 */
import { LLMProvider, ProxyConfig } from '../../../../common/types/llm';

/**
 * 默认温度值（创造性参数）
 */
export const DEFAULT_TEMPERATURE = 0.7;

/**
 * 默认Top P值（多样性参数）
 */
export const DEFAULT_TOP_P = 1.0;

/**
 * 默认频率惩罚值
 */
export const DEFAULT_FREQUENCY_PENALTY = 0.0;

/**
 * 默认存在惩罚值
 */
export const DEFAULT_PRESENCE_PENALTY = 0.0;

/**
 * 默认最大Token数
 */
export const DEFAULT_MAX_TOKENS = 2048;

/**
 * 默认系统消息
 */
export const DEFAULT_SYSTEM_MESSAGE = '你是一个有用的AI助手，能够回答各种问题并提供准确的信息。';

/**
 * 默认代理配置
 */
export const DEFAULT_PROXY_CONFIG: ProxyConfig = {
  enabled: false,
  host: 'localhost',
  port: 7890,
  protocol: 'http'
};

/**
 * 提供商显示名称映射
 */
export const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  [LLMProvider.OPENAI]: 'OpenAI',
  [LLMProvider.ANTHROPIC]: 'Anthropic',
  [LLMProvider.GEMINI]: 'Google Gemini',
  [LLMProvider.BAIDU]: '百度文心',
  [LLMProvider.AZURE]: 'Azure OpenAI',
  [LLMProvider.DEEPSEEK]: 'DeepSeek',
  [LLMProvider.SILICON_FLOW]: '硅基流动',
  [LLMProvider.OPENROUTER]: 'OpenRouter',
  [LLMProvider.OLLAMA]: 'Ollama',
  [LLMProvider.LOCAL]: '本地模型'
};

/**
 * 提供商API文档链接
 */
export const PROVIDER_API_DOCS: Record<string, string> = {
  [LLMProvider.OPENAI]: 'https://platform.openai.com/docs/',
  [LLMProvider.ANTHROPIC]: 'https://docs.anthropic.com/claude/reference/',
  [LLMProvider.GEMINI]: 'https://ai.google.dev/docs/',
  [LLMProvider.BAIDU]: 'https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html',
  [LLMProvider.AZURE]: 'https://learn.microsoft.com/zh-cn/azure/ai-services/openai/'
};

/**
 * 提供商默认模型
 */
export const PROVIDER_DEFAULT_MODELS: Record<string, string> = {
  [LLMProvider.OPENAI]: 'gpt-3.5-turbo',
  [LLMProvider.ANTHROPIC]: 'claude-2',
  [LLMProvider.GEMINI]: 'gemini-pro',
  [LLMProvider.BAIDU]: 'ERNIE-Bot-4',
  [LLMProvider.AZURE]: 'gpt-35-turbo'
};

/**
 * 默认模板内容
 */
export const DEFAULT_TEMPLATE_CONTENT = `您是一位专业的{{角色}}。请根据以下要求提供帮助：

{{任务描述}}

请务必考虑以下因素：
1. {{因素1}}
2. {{因素2}}
3. {{因素3}}

回答格式要求：{{格式要求}}`;

/**
 * 设置选项卡类型
 */
export enum SettingsTabKey {
  CONFIG = 'config',
  TEMPLATE = 'template',
  GLOBAL = 'global'
}

/**
 * API密钥测试状态
 */
export enum ApiKeyTestStatus {
  IDLE = 'idle',
  TESTING = 'testing',
  SUCCESS = 'success',
  FAILED = 'failed'
}

/**
 * 温度值范围
 */
export const TEMPERATURE_RANGE = {
  min: 0,
  max: 2,
  step: 0.01
};

/**
 * Top P值范围
 */
export const TOP_P_RANGE = {
  min: 0,
  max: 1,
  step: 0.01
};

/**
 * 频率惩罚范围
 */
export const FREQUENCY_PENALTY_RANGE = {
  min: -2,
  max: 2,
  step: 0.01
};

/**
 * 存在惩罚范围
 */
export const PRESENCE_PENALTY_RANGE = {
  min: -2,
  max: 2,
  step: 0.01
};

/**
 * 最大标记数范围
 */
export const MAX_TOKENS_RANGE = {
  min: 1,
  max: 16000,
  step: 1
};

/**
 * 代理协议选项
 */
export const PROXY_PROTOCOL_OPTIONS = [
  { value: 'http', label: 'HTTP' },
  { value: 'https', label: 'HTTPS' },
  { value: 'socks4', label: 'SOCKS4' },
  { value: 'socks5', label: 'SOCKS5' }
];

/**
 * 配置表单布局
 */
export const FORM_LAYOUT = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 }
};

/**
 * 配置表单按钮布局
 */
export const FORM_TAIL_LAYOUT = {
  wrapperCol: { offset: 6, span: 18 }
};

/**
 * 模态框默认宽度
 */
export const MODAL_DEFAULT_WIDTH = 640;

/**
 * 模态框最大宽度
 */
export const MODAL_MAX_WIDTH = 800;

/**
 * 默认模型列表（按提供商分类）
 */
export const DEFAULT_MODELS: Record<LLMProvider, string[]> = {
  [LLMProvider.OPENAI]: [
    'gpt-4-turbo',
    'gpt-4-0125-preview',
    'gpt-4-1106-preview',
    'gpt-4',
    'gpt-4-32k',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k'
  ],
  [LLMProvider.ANTHROPIC]: [
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
    'claude-2.1',
    'claude-2.0',
    'claude-instant-1.2'
  ],
  [LLMProvider.AZURE]: [
    'gpt-4',
    'gpt-4-32k',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k'
  ],
  [LLMProvider.GEMINI]: [
    'gemini-pro',
    'gemini-pro-vision',
    'gemini-ultra'
  ],
  [LLMProvider.BAIDU]: [
    'ERNIE-Bot-4',
    'ERNIE-Bot-8k',
    'ERNIE-Bot',
    'ERNIE-Bot-turbo'
  ],
  [LLMProvider.OLLAMA]: [
    'llama2',
    'llama2:13b',
    'llama2:70b',
    'mistral',
    'mixtral',
    'codegemma',
    'gemma'
  ],
  [LLMProvider.LOCAL]: [
    'ggml-gpt4all-j',
    'gpt4all-j',
    'ggml-vicuna-7b-1.1'
  ]
};

/**
 * 模板内容
 */
export const TEMPLATE_CONTENT = {
  placeholder: '在这里编写提示模板，可以使用变量，例如：{{variable}}',
  value: '你是一个专业的{{field}}专家。请回答以下问题：{{question}}'
};

/**
 * 设置标签页键名
 */
export enum SettingsTabKey {
  API_KEY = 'apiKey',
  PROVIDER = 'provider',
  MODEL = 'model',
  TEMPLATE = 'template',
  PROXY = 'proxy',
  SYSTEM = 'system'
}

/**
 * API密钥测试状态
 */
export enum ApiKeyTestStatus {
  UNTESTED = 'untested',
  TESTING = 'testing',
  SUCCESS = 'success',
  FAILURE = 'failure'
} 