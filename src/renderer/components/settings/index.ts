/**
 * LLM设置组件主索引文件
 * 导出所有组件和工具函数
 */

// 导出新的组件结构
export * from './core/context';
export * from './core/state';
export * from './core/hooks';

// 导出面板组件
export { default as LLMSettingsPanel } from './panels/LLMSettingsPanel';

// 导出主入口组件
export { default as LLMSettingsProvider } from './LLMSettingsProvider';

// 导出具体UI组件
export { default as ConfigSelector } from './components/ConfigSelector';
export { default as ProviderSelector } from './components/ProviderSelector';
export { default as ModelSelector } from './components/ModelSelector';
export { default as ApiKeyManager } from './components/ApiKeyManager';
export { default as ProxySettings } from './components/ProxySettings';
export { default as TemplateManager } from './components/TemplateManager';

// 导出工具函数
export * from './utils/formatters';

// 向后兼容导出 - 确保现有的导入语句继续有效
export { default as LLMSettings } from './LLMSettings';

// 需要导入后再导出，因为这些是默认导出的组件
import ApiKeyManager from './components/ApiKeyManager';
import ProxySettings from './components/ProxySettings';
import TemplateManager from './components/TemplateManager';
import ModelSelector from './components/ModelSelector';

// 向后兼容 - 提供原有组件名称的导出
export { ApiKeyManager as LLMApiKeyConfig };
export { ProxySettings as LLMProxyConfig };
export { TemplateManager as LLMTemplateConfig };
export { ModelSelector as LLMModelConfig }; 