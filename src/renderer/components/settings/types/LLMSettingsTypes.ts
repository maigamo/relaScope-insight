import { LLMConfig, LLMProvider } from '../../../../common/types/llm';

/**
 * 服务提供商接口
 */
export interface Provider {
  id: string;
  provider: LLMProvider;
  name?: string;
  isDefault?: boolean;
}

/**
 * 全局代理配置类型
 */
export interface GlobalProxyConfig {
  isGlobal: boolean;
  enabled: boolean;
  protocol: string;
  host: string;
  port: number;
  auth?: {
    username?: string;
    password?: string;
  };
  timeout?: number;
  retries?: number;
}

/**
 * 代理配置接口
 */
export interface ProxyConfig {
  id?: string;
  configId?: string;
  enabled: boolean;
  protocol: string;
  host: string;
  port: number;
  auth?: {
    username?: string;
    password?: string;
  };
  timeout?: number;
  retries?: number;
}

/**
 * LLM配置卡片属性接口
 */
export interface LLMConfigCardProps {
  config: LLMConfig;
  onEdit: (config: LLMConfig) => void;
  onDelete: (config: LLMConfig) => void;
  onSetDefault: (config: LLMConfig) => void;
  onSetProxy: (config: LLMConfig) => void;
}

/**
 * 筛选后的提供商项目接口
 */
export interface ProviderItem {
  type: string;
  name: string;
  configs?: LLMConfig[];
}

/**
 * 样式配置接口
 */
export interface StyleConfig {
  backgroundColor: string;
  cardBgColor: string;
  shadowColor: string;
  textColor: string;
  borderColor: string;
  hoverBgColor: string;
  activeProviderBgColor: string;
  navRadius: string;
}

/**
 * 活动区域类型
 */
export type ActiveSectionType = 'config' | 'template' | 'global';

/**
 * 动画配置
 */
export const itemAnim = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

/**
 * API密钥配置对话框参数类型
 */
export interface ApiKeyConfigModalParams {
  provider: LLMProvider;
  onSave: () => void;
}

/**
 * 创建/编辑LLM配置对话框参数类型
 */
export interface EditConfigDialogParams {
  isEdit: boolean;
  config?: LLMConfig;
  provider?: LLMProvider;
  onSave: () => void;
}

/**
 * 代理配置对话框参数类型
 */
export interface ProxyConfigDialogParams {
  configId: string;
  proxy?: ProxyConfig;
  onSave: () => void;
}

/**
 * LLM设置页面状态类型
 */
export interface LLMSettingsState {
  providers: LLMProvider[];
  activeProviderId: LLMProvider | null;
  configs: LLMConfig[];
  searchQuery: string;
  globalProxy: GlobalProxyConfig;
  isGlobalProxyExpanded: boolean;
  isAdvancedSettingsOpen: boolean;
  apiKeyModalParams: ApiKeyConfigModalParams | null;
  editConfigModalParams: EditConfigDialogParams | null;
  proxyConfigModalParams: ProxyConfigDialogParams | null;
  isLoading: boolean;
  error: string | null;
} 