# 💾 数据库服务模块

## 📘 概述

数据库服务模块是 relaScope-insight 应用的数据持久化核心，负责管理应用的数据库连接、数据存储、检索和维护。该模块提供统一的数据访问接口，实现数据模型的 CRUD 操作，并确保数据的一致性和完整性。

## 🏗️ 目录结构

```
/database/
├── dao/                 # 数据访问对象
├── entity/              # 数据实体定义
├── migration/           # 数据库迁移脚本
├── models/              # 数据模型
├── scripts/             # 数据库相关脚本
├── DatabaseBackupManager.ts # 数据库备份管理
├── DatabaseConfig.ts    # 数据库配置
├── DatabaseIpcHandler.ts # 数据库 IPC 处理
├── DatabaseManager.ts   # 数据库管理器
├── DatabaseService.ts   # 数据库服务实现
└── index.ts             # 模块导出
```

## 🚀 核心功能

- 🔄 数据库连接管理
- 📋 数据模型与实体映射
- 💾 CRUD 操作实现
- 🔍 查询构建与优化
- 📊 数据索引与统计
- 🔄 数据迁移与版本控制
- 📦 数据备份与恢复

## 🔍 主要组件

### 数据库服务 (DatabaseService.ts)
- 提供统一的数据操作接口
- 封装复杂查询逻辑
- 处理事务管理
- 实现数据验证与过滤

### 数据库管理器 (DatabaseManager.ts)
- 管理数据库连接池
- 处理数据库初始化
- 执行数据库优化
- 监控数据库性能

### 数据库备份管理器 (DatabaseBackupManager.ts)
- 实现自动备份策略
- 提供手动备份功能
- 管理备份历史
- 支持数据库恢复

### 数据库 IPC 处理器 (DatabaseIpcHandler.ts)
- 处理来自渲染进程的数据库请求
- 将数据库操作结果返回给渲染进程
- 实现数据库操作的权限控制
- 处理长时间运行的查询

### 数据实体与模型
- `entity/`: 定义数据库表结构和关系
- `models/`: 提供业务逻辑层的数据模型
- `dao/`: 实现数据访问对象模式

## 💡 数据库设计

- 使用 SQLite 作为嵌入式数据库引擎
- 实现关系型数据模型
- 支持索引优化常用查询
- 使用事务确保数据完整性
- 实现数据版本管理与迁移

## 🛠️ 主要 API

- `query(sql, params)` - 执行 SQL 查询
- `findOne(entity, criteria)` - 查找单个记录
- `findAll(entity, criteria)` - 查找多个记录
- `save(entity, data)` - 保存或更新记录
- `delete(entity, id)` - 删除记录
- `transaction(callback)` - 在事务中执行操作
- `backup(path)` - 创建数据库备份

## 🔄 数据迁移

- `migration/`: 包含数据库版本迁移脚本
- 支持自动检测和应用待处理的迁移
- 维护数据库版本历史记录
- 处理数据模式变更时的数据转换

## 🔌 依赖关系

- 依赖配置服务获取数据库配置
- 可能依赖安全服务进行数据加密
- 通过 IPC 处理器向渲染进程提供数据服务
- 与应用的其他模块紧密集成，提供数据支持 