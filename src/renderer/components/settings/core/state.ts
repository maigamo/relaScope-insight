/**
 * LLM设置状态管理
 * 定义状态类型和初始值
 */
import { 
  LLMConfig, 
  LLMProvider, 
  ProxyConfig, 
  PromptTemplate,
  LLMModelConfig
} from '../../../../common/types/llm';

/**
 * 提供商类型定义
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
export interface GlobalProxyConfig extends ProxyConfig {
  isGlobal: boolean;
}

/**
 * 定义模态框状态类型 - 与原LLMSettings.tsx保持一致
 */
export interface ModalStates {
  isModalVisible: boolean;
  isProxyVisible: boolean;
  isApiKeyVisible: boolean;
  isCreateConfig: boolean;
  isEditTemplateVisible: boolean;
  isCustomModelModalVisible: boolean;
}

/**
 * 定义展开状态类型 - 与原LLMSettings.tsx保持一致
 */
export interface ExpandStates {
  isAdvancedSettingsOpen: boolean;
  isGlobalProxyExpanded: boolean;
  isAdvancedParamsOpen: boolean;
}

/**
 * LLM设置状态接口 - 包含原LLMSettings.tsx中的所有状态变量
 */
export interface LLMState {
  // 数据状态
  configs: LLMConfig[];
  providers: Provider[];
  templates: PromptTemplate[];
  availableModels: LLMModelConfig[];
  currentProxy: ProxyConfig | null;
  globalProxy: GlobalProxyConfig;
  
  // 选择状态
  selectedConfig: LLMConfig | null;
  activeConfig: string | null;
  activeProviderId: string | null;
  activeSection: 'global' | 'models' | 'providers' | 'templates' | 'apiKeys' | 'proxy';
  currentTemplate: PromptTemplate | null;
  
  // 输入状态
  searchQuery: string;
  apiKey: string;
  modelId: string;
  
  // 加载状态
  loadingModels: boolean;
  
  // 模态框状态
  modalStates: ModalStates;
  
  // 展开状态
  expandStates: ExpandStates;
  
  // 状态更新方法 - 保持与原组件中的方法签名一致
  setSelectedConfig: (config: LLMConfig | null) => void;
  setActiveConfig: (configId: string | null) => void;
  setActiveProviderId: (providerId: string | null) => void;
  setActiveSection: (section: 'global' | 'models' | 'providers' | 'templates' | 'apiKeys' | 'proxy') => void;
  setSearchQuery: (query: string) => void;
  setApiKey: (key: string) => void;
  setLoadingModels: (loading: boolean) => void;
  setAvailableModels: (models: LLMModelConfig[]) => void;
  toggleModal: (modalName: keyof ModalStates, value?: boolean) => void;
  toggleExpand: (expandName: keyof ExpandStates, value?: boolean) => void;
  updateConfigs: (configs: LLMConfig[]) => void;
  updateTemplates: (templates: PromptTemplate[]) => void;
  updateProviders: (providers: Provider[]) => void;
  updateGlobalProxy: (proxy: GlobalProxyConfig) => void;
  
  // 业务逻辑方法
  handleSaveConfig?: (config: LLMConfig) => Promise<void>;
  handleDeleteConfig?: (configId: string) => Promise<void>;
  handleSetDefaultConfig?: (configId: string) => Promise<void>;
  handleSetDefaultProvider?: (providerId: string) => Promise<void>;
}

/**
 * 初始状态值
 */
export const initialState: LLMState = {
  // 数据列表
  configs: [],
  providers: [],
  templates: [],
  availableModels: [],
  
  // 代理相关
  currentProxy: null,
  globalProxy: {
    enabled: false,
    host: '',
    port: 1080,
    protocol: 'http',
    isGlobal: true
  },
  
  // 选中状态
  selectedConfig: null,
  activeConfig: null,
  activeProviderId: null,
  currentTemplate: null,
  
  // 字段值
  apiKey: '',
  modelId: '',
  searchQuery: '',
  
  // 界面状态
  activeSection: 'global',
  loadingModels: false,
  
  // 模态框状态
  modalStates: {
    isModalVisible: false,
    isProxyVisible: false,
    isApiKeyVisible: false,
    isCreateConfig: false,
    isEditTemplateVisible: false,
    isCustomModelModalVisible: false
  },
  
  // 展开状态
  expandStates: {
    isAdvancedSettingsOpen: false,
    isGlobalProxyExpanded: false,
    isAdvancedParamsOpen: false
  },
  
  // 空方法实现，在Context Provider中会被实际实现替换
  setSelectedConfig: () => {},
  setActiveConfig: () => {},
  setActiveProviderId: () => {},
  setActiveSection: () => {},
  setSearchQuery: () => {},
  setApiKey: () => {},
  setLoadingModels: () => {},
  setAvailableModels: () => {},
  toggleModal: () => {},
  toggleExpand: () => {},
  updateConfigs: () => {},
  updateTemplates: () => {},
  updateProviders: () => {},
  updateGlobalProxy: () => {}
}; 