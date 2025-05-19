# 📚 relaScope-insight 模块文档索引

本文档提供了 relaScope-insight 项目各模块 README.md 的索引，帮助开发者快速定位特定功能模块的文档。

## 🏗️ 主要模块索引

### 🖥️ 主进程相关模块

| 模块 | 路径 | 描述 |
|------|------|------|
| 主进程核心 | [src/main/README.md](../src/main/README.md) | 主进程模块核心功能，包括窗口管理、IPC 通信和原生功能集成 |
| IPC 通信 | [src/main/ipc/README.md](../src/main/ipc/README.md) | 处理 Electron 应用中渲染进程和主进程之间的通信 |
| 主进程服务 | [src/main/services/README.md](../src/main/services/README.md) | 主进程各类服务的总体概览 |
| LLM 服务 | [src/main/services/llm/README.md](../src/main/services/llm/README.md) | 集成和管理大语言模型服务的核心组件 |
| 配置服务 | [src/main/services/config/README.md](../src/main/services/config/README.md) | 管理应用全局配置的读取、更新与持久化 |
| 数据库服务 | [src/main/services/database/README.md](../src/main/services/database/README.md) | 数据持久化核心，负责数据库连接与操作 |
| 安全服务 | [src/main/services/security/README.md](../src/main/services/security/README.md) | 提供数据加密、敏感信息保护和安全存储功能 |

### 🌐 渲染进程相关模块

| 模块 | 路径 | 描述 |
|------|------|------|
| 渲染层总览 | [src/renderer/README.md](../src/renderer/README.md) | 渲染进程的总体架构和功能概览 |
| 设置组件 - 工具 | [src/renderer/components/settings/utils/README.md](../src/renderer/components/settings/utils/README.md) | 设置界面相关的工具函数 |
| 设置组件 - 类型 | [src/renderer/components/settings/types/README.md](../src/renderer/components/settings/types/README.md) | 设置界面使用的类型定义 |
| 设置组件 - LLM | [src/renderer/components/settings/llm/README.md](../src/renderer/components/settings/llm/README.md) | LLM 设置相关的功能模块 |
| 设置组件 - UI | [src/renderer/components/settings/components/README.md](../src/renderer/components/settings/components/README.md) | 设置界面中使用的可复用组件 |

### 🔄 共享模块

| 模块 | 路径 | 描述 |
|------|------|------|
| 预加载脚本 | [src/preload/README.md](../src/preload/README.md) | 连接渲染进程和主进程的安全桥梁 |
| 通用模块 | [src/common/README.md](../src/common/README.md) | 在主进程和渲染进程之间共享的类型和常量 |

## 🔍 按功能查找模块文档

### LLM 相关功能

如果您需要了解 LLM 相关功能，请参考以下文档：
- [LLM 服务实现](../src/main/services/llm/README.md) - 后端 LLM 服务集成与管理
- [LLM 设置组件](../src/renderer/components/settings/llm/README.md) - 前端 LLM 配置界面
- [LLM IPC 通信](../src/main/ipc/README.md) - LLM 相关的进程间通信

### 数据库相关功能

如果您需要了解数据库相关功能，请参考以下文档：
- [数据库服务](../src/main/services/database/README.md) - 数据库服务实现
- [数据库类型定义](../src/common/README.md) - 共享的数据库类型

### 配置与设置功能

如果您需要了解配置与设置功能，请参考以下文档：
- [配置服务](../src/main/services/config/README.md) - 配置管理与持久化
- [设置组件](../src/renderer/components/settings/components/README.md) - 设置界面组件

### 安全相关功能

如果您需要了解安全相关功能，请参考以下文档：
- [安全服务](../src/main/services/security/README.md) - 加密和安全存储
- [预加载脚本安全](../src/preload/README.md) - 安全的进程间通信

## 📝 如何更新此索引

当添加新的模块或对现有模块进行重大更改时，请同时更新此索引文档。遵循以下步骤：

1. 为新模块创建 README.md 文档
2. 在适当的部分添加新模块的索引条目
3. 如果适用，更新"按功能查找模块文档"部分 