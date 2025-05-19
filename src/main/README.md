# 🖥️ Main 主进程模块

## 📘 概述

Main 主进程模块是 relaScope-insight 应用的后端核心，负责处理 Electron 主进程相关的功能，包括窗口管理、IPC 通信处理、系统服务和原生功能集成。该模块作为应用的"大脑"，协调各种底层服务并向渲染进程提供 API。

## 🏗️ 目录结构

```
/main/
├── ipc/            # IPC 通信处理器
│   ├── handlers.ts       # 通用 IPC 处理器
│   ├── database.handlers.ts # 数据库相关 IPC 处理器
│   └── llm.handlers.ts   # LLM 相关 IPC 处理器
├── services/       # 主进程服务
│   ├── config/     # 配置管理服务
│   ├── database/   # 数据库服务
│   ├── llm/        # LLM 服务
│   └── security/   # 安全服务
├── types/          # 类型定义
├── utils/          # 工具函数
└── index.ts        # 主进程入口
```

## 🚀 核心功能

- 🪟 窗口管理与生命周期控制
- 🔄 IPC 通信管理与消息处理
- 💾 本地数据存储与访问
- 🔒 安全特性与权限控制
- 🤖 LLM 服务集成与管理
- ⚙️ 应用配置管理
- 🧩 原生功能集成

## 🔍 主要模块

### 应用核心
- `index.ts` - 主进程入口点，负责初始化应用，创建窗口并设置事件监听

### IPC 通信
- `ipc/handlers.ts` - 处理渲染进程发送的通用 IPC 消息
- `ipc/database.handlers.ts` - 处理数据库相关 IPC 请求
- `ipc/llm.handlers.ts` - 处理 LLM 相关 IPC 请求

### 服务模块
- `services/config/` - 管理应用配置的读取、更新与持久化
- `services/database/` - 提供数据库连接与操作接口
- `services/llm/` - 集成各种 LLM 服务，管理 API 调用
- `services/security/` - 提供安全相关功能，如加密、权限控制

## 💡 工作流程

1. 主进程启动时，`index.ts` 初始化应用环境
2. 创建主窗口并加载渲染进程
3. 注册 IPC 处理器，准备接收渲染进程请求
4. 初始化各项服务
5. 处理应用生命周期事件（如窗口关闭、应用退出等）
6. 接收并处理来自渲染进程的 IPC 消息
7. 通过 IPC 向渲染进程发送事件通知

## 🔄 通信机制

主进程通过 Electron 的 IPC 机制与渲染进程进行双向通信：
- `ipcMain.handle()` - 处理渲染进程的请求并返回结果
- `webContents.send()` - 主动向渲染进程发送消息
- `ipcMain.on()` - 监听渲染进程发送的事件

## 🔌 依赖关系

- 与 Electron API 深度集成
- 使用 Node.js 原生模块访问操作系统功能
- 通过预加载脚本与渲染进程建立安全通信桥梁
- 集成第三方服务，如各种 LLM API 