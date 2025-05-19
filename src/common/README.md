# 🔄 通用模块

## 📘 概述

通用模块包含了在 relaScope-insight 应用的主进程和渲染进程之间共享的代码，包括类型定义、常量、工具函数和通用接口。这个模块确保了整个应用中数据结构和接口的一致性，降低了代码重复，并提高了类型安全性。

## 🏗️ 目录结构

```
/common/
├── types/           # 类型定义
│   ├── config.ts    # 配置相关类型
│   ├── database.ts  # 数据库相关类型
│   ├── global.d.ts  # 全局类型声明
│   ├── ipc.ts       # IPC 通信相关类型
│   ├── llm.ts       # LLM 服务相关类型
│   └── Profile.ts   # 用户档案相关类型
└── constants/       # 常量定义
```

## 🚀 核心功能

- 📝 提供跨进程共享的类型定义
- 🔢 定义应用全局常量
- 🧩 声明公共接口和协议
- 🛡️ 增强类型安全性
- 📋 确保数据结构一致性

## 🔍 主要组件

### 类型定义 (types/)
- **config.ts**: 应用配置的类型接口
- **database.ts**: 数据库实体和查询类型
- **global.d.ts**: 全局类型声明和增强
- **ipc.ts**: IPC 通信协议和消息类型
- **llm.ts**: LLM 服务相关数据结构和配置类型
- **Profile.ts**: 用户个人资料相关类型

### 常量定义 (constants/)
- IPC 通道名称
- 配置键名
- 事件类型
- 错误代码
- 默认值
- 枚举定义

## 💡 设计原则

- **单一数据源**: 为相同概念提供单一的类型定义
- **精确类型**: 使用精确的类型而不是宽泛的类型
- **版本兼容**: 注意类型变更的向后兼容性
- **最小依赖**: 尽量减少对外部库的依赖
- **文档友好**: 通过类型定义提供自文档化的代码

## 🛠️ 类型使用示例

```typescript
// 使用 LLM 配置类型
import { LLMConfig, LLMProvider } from '../common/types/llm';

const config: LLMConfig = {
  id: 'default-openai',
  name: '默认 OpenAI 配置',
  provider: LLMProvider.OPENAI,
  apiKey: '***',
  modelId: 'gpt-4',
  parameters: {
    temperature: 0.7,
    maxTokens: 2000
  }
};

// 使用 IPC 通信类型
import { IPCRequest, IPCResponse } from '../common/types/ipc';

const request: IPCRequest<string> = {
  channel: 'config:get',
  payload: 'app.theme'
};

// 使用常量
import { IPC_CHANNELS } from '../common/constants';

ipcRenderer.invoke(IPC_CHANNELS.CONFIG_GET, 'app.theme');
```

## 🔄 共享原则

- 只放置确实需要在进程间共享的类型
- 避免在此模块中包含实现逻辑
- 保持类型定义的简洁和清晰
- 确保类型定义与实际实现一致

## 🔌 依赖关系

- 被主进程和渲染进程同时引用
- 为 IPC 通信提供类型支持
- 为数据模型提供共享类型定义
- 不应依赖特定于主进程或渲染进程的模块 