# 🧠 LLM 核心模块

## 📘 概述

LLM 核心模块为整个 LLM 配置系统提供了基础功能支持，包括类型定义、实用工具函数和导出便捷接口。该模块设计为对 LLM 服务管理相关功能的内部抽象，确保配置管理的一致性和可维护性。

## 🏗️ 目录结构

```
/llm/
├── index.ts     # 导出入口
├── types.ts     # 类型定义
└── utils.ts     # 工具函数
```

## 🚀 核心功能

- 📋 提供商名称处理与显示
- 🔍 配置与提供商筛选功能
- 🎨 响应式主题样式配置
- 🔄 动画配置预设

## 🔍 主要 API

### 类型定义 (types.ts)
- `ProviderItem` - 服务商数据结构
- `itemAnim` - 标准动画配置

### 工具函数 (utils.ts)
- `getProviderName()` - 获取 LLM 提供商的显示名称
- `filterConfigs()` - 按搜索词过滤配置列表
- `filterProviders()` - 按搜索词过滤服务商列表
- `useStyleConfig()` - 获取主题相关样式配置

### 导出接口 (index.ts)
导出完整的 LLMSettings 组件作为默认导出，简化引用路径

## 💡 使用示例

```tsx
// 导入 LLM 设置组件
import LLMSettings from '../components/settings/llm';

// 使用工具函数
import { getProviderName, filterConfigs, useStyleConfig } from '../components/settings/llm/utils';
import { ProviderItem, itemAnim } from '../components/settings/llm/types';

// 获取提供商名称
const name = getProviderName(LLMProvider.OPENAI); // 返回 "OpenAI"

// 过滤配置
const filteredConfigs = filterConfigs(allConfigs, "gpt");

// 使用样式配置
const styles = useStyleConfig();
```

## 🔄 依赖关系

- 引用公共类型定义 (`LLMConfig`, `LLMProvider` 等)
- 依赖 Chakra UI 的 `useColorModeValue` 获取主题色值
- 为上层组件提供工具函数和类型支持
- 导出主 LLMSettings 组件作为默认接口 