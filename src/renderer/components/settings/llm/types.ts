import { LLMConfig, LLMProvider, PromptTemplate, LLMModelConfig, ProxyConfig } from '../../../../common/types/llm';
import { FormInstance } from 'antd/lib/form';

// 服务商项类型
export interface ProviderItem {
  id: string;
  provider: LLMProvider;
  name?: string;
  isDefault?: boolean;
  isCustom?: boolean;
}

// 动画配置
export const itemAnim = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 }
}; 