# 🧩 Settings Components 组件模块

## 📘 概述

Settings Components 模块包含了 LLM 配置系统中的核心可复用 UI 组件，这些组件负责以用户友好的方式呈现和操作 LLM 配置数据。该模块专注于提供高度可复用的界面元素，确保整个配置系统保持一致的用户体验和视觉风格。

## 🏗️ 目录结构

```
/components/
├── LLMConfigCard.tsx     # LLM 配置卡片组件
├── LLMConfigDetail.tsx   # LLM 配置详情组件
├── LLMGlobalSettings.tsx # LLM 全局设置组件
└── LLMProviderNav.tsx    # LLM 提供商导航组件
```

## 🚀 核心组件

- 🗂️ `LLMProviderNav` - 提供商分类导航组件，用于在不同 LLM 服务提供商间切换
- 📇 `LLMConfigCard` - 配置卡片组件，以紧凑方式展示单个 LLM 配置
- 📝 `LLMConfigDetail` - 配置详情组件，显示和编辑配置的详细信息
- ⚙️ `LLMGlobalSettings` - 全局设置组件，管理适用于所有配置的全局选项

## 🔍 组件详解

### LLMProviderNav
- 显示所有可用的 LLM 服务提供商
- 提供搜索过滤功能
- 支持新增和删除提供商
- 显示每个提供商下配置数量
- 响应式设计，适应不同尺寸

### LLMConfigCard
- 以卡片形式展示单个 LLM 配置的关键信息
- 显示配置名称、模型信息和修改日期
- 提供快速操作按钮：编辑、删除、设为默认、配置代理
- 支持高亮显示当前默认配置

### LLMConfigDetail
- 显示所选配置的详细信息
- 提供表单界面进行配置编辑
- 包含模型选择、参数调整和系统消息设置
- 支持保存和取消操作

### LLMGlobalSettings
- 管理全局 API 密钥
- 配置全局代理设置
- 调整全局默认参数
- 控制应用于所有配置的设置项

## 💡 使用示例

```tsx
// 使用提供商导航组件
<LLMProviderNav
  providers={providers}
  activeProviderId={activeProviderId}
  setActiveProviderId={handleSetActiveProvider}
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  enhancedStyleConfig={styleConfig}
  filteredConfigs={groupedConfigs}
  addProvider={handleAddProvider}
  deleteProvider={handleDeleteProvider}
/>

// 使用配置卡片组件
<LLMConfigCard
  config={config}
  onEdit={handleEditConfig}
  onDelete={handleDeleteConfig}
  onSetDefault={handleSetDefault}
  onSetProxy={handleSetProxy}
/>

// 使用全局设置组件
<LLMGlobalSettings
  globalProxy={globalProxy}
  onProxyChange={handleProxyChange}
  onToggleGlobalProxy={toggleGlobalProxy}
/>
```

## 🔄 依赖关系

- 使用 Chakra UI 构建响应式界面
- 引用公共类型定义和工具函数
- 与上层状态管理逻辑连接
- 支持深色/浅色主题适配 