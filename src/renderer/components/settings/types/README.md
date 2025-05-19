# 📚 Settings Types 类型定义模块

## 📘 概述

Types 类型定义模块为 LLM 配置系统提供了完整的 TypeScript 类型支持，定义了从配置接口到 UI 组件属性的各种类型结构。这些类型定义确保了整个 LLM 设置系统的类型安全和代码可维护性。

## 🏗️ 目录结构

```
/types/
└── LLMSettingsTypes.ts    # LLM 设置系统类型定义
```

## 🚀 核心类型定义

- 🔌 `Provider` - 服务提供商基本信息接口
- 🌐 `ProxyConfig` & `GlobalProxyConfig` - 代理配置相关类型
- 🎛️ `LLMConfigCardProps` - 配置卡片组件属性接口
- 📋 `ProviderItem` - 处理后的提供商数据结构
- 🎨 `StyleConfig` - 样式配置接口
- 🔄 `LLMSettingsState` - LLM 设置页面状态管理类型

## 🔍 主要类型详解

### 配置类型
- `Provider` - 定义服务提供商基本特性
- `LLMConfig` - 从公共类型引入的完整 LLM 配置结构

### 代理配置
- `ProxyConfig` - 单个配置的代理设置
- `GlobalProxyConfig` - 全局代理设置，包含适用范围控制

### UI 组件类型
- `LLMConfigCardProps` - 配置卡片组件的属性类型
- `StyleConfig` - 主题样式配置属性

### 状态管理类型
- `ActiveSectionType` - 定义活动区域类型
- `LLMSettingsState` - 完整的设置页面状态类型

### 对话框参数类型
- `ApiKeyConfigModalParams` - API 密钥配置对话框参数
- `EditConfigDialogParams` - 配置编辑对话框参数
- `ProxyConfigDialogParams` - 代理配置对话框参数

## 💡 使用示例

```tsx
// 创建提供商对象
const provider: Provider = {
  id: 'openai-1',
  provider: LLMProvider.OPENAI,
  name: '默认 OpenAI 配置',
  isDefault: true
};

// 定义代理配置
const proxyConfig: ProxyConfig = {
  enabled: true,
  protocol: 'http',
  host: 'proxy.example.com',
  port: 8080
};

// 定义组件状态
const [state, setState] = useState<LLMSettingsState>({
  providers: [],
  activeProviderId: null,
  configs: [],
  searchQuery: '',
  globalProxy: { isGlobal: false, enabled: false, protocol: 'http', host: '', port: 0 },
  isGlobalProxyExpanded: false,
  isAdvancedSettingsOpen: false,
  apiKeyModalParams: null,
  editConfigModalParams: null,
  proxyConfigModalParams: null,
  isLoading: false,
  error: null
});
```

## 🔄 依赖关系

- 引用公共类型定义 (`LLMConfig`, `LLMProvider`)
- 为配置相关组件提供类型支持
- 为状态管理提供结构化类型 