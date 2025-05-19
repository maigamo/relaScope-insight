# 🔄 预加载脚本模块

## 📘 概述

预加载脚本模块是连接 Electron 渲染进程和主进程的安全桥梁，提供了一组经过严格控制的 API，允许渲染进程以安全的方式访问主进程功能和系统资源。该模块遵循 Electron 的上下文隔离原则，确保渲染进程中的脚本不能直接访问 Node.js 环境。

## 🏗️ 目录结构

```
/preload/
└── index.ts  # 预加载脚本入口
```

## 🚀 核心功能

- 🌉 提供渲染进程和主进程之间的通信桥梁
- 🛡️ 实施上下文隔离和安全策略
- 📨 封装 IPC 通信接口
- 🔌 暴露有限的系统 API
- 🧰 提供实用工具函数

## 🔍 主要特性

### IPC 通信封装
- 简化渲染进程到主进程的通信
- 提供 Promise 化的请求-响应模式
- 支持事件监听和取消
- 处理通信错误和超时

### 暴露的 API 类别
- **配置操作**: 读取和更新应用配置
- **LLM 服务**: 与 LLM 相关的功能
- **数据库操作**: 数据存储和检索
- **系统功能**: 对系统功能的有限访问
- **窗口控制**: 窗口管理和状态

### 安全特性
- 严格控制渲染进程可访问的 API
- 参数验证和类型检查
- 防止原型污染和注入攻击
- 实现最小权限原则

## 💡 设计原则

- **安全第一**: 严格限制可访问的功能
- **可维护性**: 结构清晰，易于扩展
- **一致性**: 所有 API 采用统一风格
- **透明性**: 允许渲染进程了解操作状态

## 🔄 通信流程

1. 渲染进程通过暴露的 API 发起请求
2. 预加载脚本将请求通过 IPC 发送到主进程
3. 主进程处理请求并通过 IPC 返回结果
4. 预加载脚本将结果转换为 Promise 结果返回给渲染进程

## 🛠️ API 示例

```typescript
// 配置相关 API
window.electron.config.get(key);
window.electron.config.set(key, value);

// LLM 服务 API
window.electron.llm.sendMessage(config, messages);
window.electron.llm.getProviders();

// 数据库 API
window.electron.db.query(collection, criteria);
window.electron.db.save(collection, document);

// 系统功能
window.electron.system.openExternal(url);
window.electron.system.showOpenDialog(options);

// 窗口控制
window.electron.window.minimize();
window.electron.window.toggleFullscreen();
```

## 🔌 依赖关系

- 负责将主进程功能安全地暴露给渲染进程
- 与 IPC 通信模块紧密配合
- 在 Electron 安全模型中扮演关键角色
- 可能使用某些 Node.js 核心模块 