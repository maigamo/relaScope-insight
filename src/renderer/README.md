# 🖥️ Renderer 渲染层模块

## 📘 概述

Renderer 渲染层是 relaScope-insight 应用的前端核心，负责用户界面的渲染、交互逻辑和数据展示。该模块基于 React 和 Electron 的渲染进程构建，采用现代化的前端架构，提供流畅、响应式的用户体验。

## 🏗️ 目录结构

```
/renderer/
├── animations/       # 动画效果定义
├── components/       # 可复用UI组件
│   ├── common/       # 通用组件
│   ├── profiles/     # 用户档案相关组件
│   └── settings/     # 设置相关组件
├── contexts/         # React Context定义
├── i18n/             # 国际化配置
├── pages/            # 页面组件
├── routes/           # 路由配置
├── services/         # 服务层
├── styles/           # 全局样式定义
├── types/            # 类型定义
├── App.tsx           # 应用根组件
├── index.tsx         # 渲染进程入口
└── theme.ts          # 主题配置
```

## 🚀 核心功能

- 📱 响应式用户界面渲染
- 🌐 多语言国际化支持
- 🎨 可切换的深色/浅色主题
- 🧩 模块化组件系统
- 🔄 状态管理与数据流控制
- 🛣️ 客户端路由与页面导航
- 🔌 与 Electron 主进程通信

## 🔍 主要模块

### 应用核心
- `App.tsx` - 应用根组件，集成主题、路由和全局配置
- `index.tsx` - 渲染进程入口点，负责挂载 React 应用
- `theme.ts` - 全局主题定义，包括颜色、字体和其他样式变量

### 组件系统
- `components/` - 可重用 UI 组件库，按功能分类
  - `common/` - 通用组件如按钮、表单、卡片等
  - `settings/` - 设置相关组件，包括 LLM 配置界面
  - `profiles/` - 用户档案与身份管理组件

### 路由与页面
- `routes/` - 路由配置和导航逻辑
- `pages/` - 页面级组件，对应不同路由

### 服务与工具
- `services/` - 服务层，处理数据获取、持久化和业务逻辑
- `contexts/` - React Context 定义，用于跨组件状态共享
- `i18n/` - 国际化配置，支持多语言切换

## 💡 技术栈

- **React** - 用户界面库
- **React Router** - 客户端路由
- **Chakra UI** - UI 组件库
- **Electron** - 桌面应用框架
- **TypeScript** - 静态类型检查

## 🔄 工作流程

1. 应用启动时，`index.tsx` 作为入口点渲染 `App` 组件
2. `App` 组件初始化全局配置，包括主题和语言设置
3. 路由系统根据 URL 渲染相应的页面组件
4. 服务层处理与主进程的通信和数据操作
5. 组件系统以模块化方式构建整个用户界面

## 🔌 与主进程通信

Renderer 通过 Electron 的 IPC 机制与主进程通信，实现如下功能：
- 配置加载与保存
- 文件系统操作
- 系统服务调用
- 应用状态同步 