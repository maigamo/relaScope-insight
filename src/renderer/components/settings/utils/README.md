# 🛠️ Settings Utils 工具函数模块

## 📘 概述

Utils 工具函数模块提供了一系列用于支持 LLM 配置界面的辅助功能，包括模型数据获取、样式配置和格式化工具。这些工具函数专为简化 LLM 设置相关组件的开发而设计。

## 🏗️ 目录结构

```
/utils/
└── LLMSettingsUtils.ts    # LLM 设置相关工具函数
```

## 🚀 核心功能

- 📋 提供商名称映射与展示
- 🔧 默认模型配置生成
- 📅 日期格式化处理
- 🎨 主题样式配置

## 🔍 主要 API

### 提供商名称处理
`getProviderName()` - 将 LLM 提供商枚举值转换为显示名称

### 模型配置
`getDefaultModels()` - 根据提供商类型获取默认模型配置列表

### 日期处理
`formatDate()` - 将 ISO 日期字符串转换为友好的本地化日期格式

### 样式管理
`useStyleConfig()` - 根据当前色彩模式(暗/亮)返回一致的样式配置对象

## 💡 使用示例

```tsx
// 获取提供商显示名称
const displayName = getProviderName(LLMProvider.OPENAI); // 返回 "OpenAI"

// 获取默认模型列表
const models = getDefaultModels(LLMProvider.ANTHROPIC);

// 格式化日期
const formattedDate = formatDate('2023-05-15T08:30:00Z');

// 获取当前主题的样式配置
const styleConfig = useStyleConfig();
```

## 🔄 依赖关系

- 依赖 Chakra UI 提供的 useColorMode 钩子获取当前主题模式
- 使用公共类型定义 (`LLMProvider`, `LLMModelConfig`)
- 内部定义 `StyleConfig` 和 `EnhancedModelConfig` 类型扩展 