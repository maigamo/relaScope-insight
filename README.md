# 🚀 RelaScopeInsight

<div align="center">
  <img src="public/assets/logo.png" alt="RelaScopeInsight Logo" width="200"/>
  <br/>
  <p>
    <strong>深入了解您的个人关系网络，获取有价值的洞察</strong>
  </p>
</div>

<div align="center">

[![Electron](https://img.shields.io/badge/Electron-blue?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Chakra UI](https://img.shields.io/badge/Chakra_UI-319795?logo=chakra-ui&logoColor=white)](https://chakra-ui.com/)
[![i18next](https://img.shields.io/badge/i18next-26A69A?logo=i18next&logoColor=white)](https://www.i18next.com/)

</div>

---

<!-- English Content -->
## 📋 English

### 📖 Introduction

**RelaScopeInsight** is a powerful desktop application built with Electron, React, and TypeScript that helps you manage, visualize, and gain insights from your personal relationships network using advanced analytics and Large Language Models.

### ✨ Features

- 🏗️ **Modular Architecture**: Clean separation of concerns with main and renderer processes
- 🎨 **Modern UI**: Built with Chakra UI for a beautiful, responsive interface
- 🌍 **Multi-language Support**: Available in English, Chinese, and Japanese
- 🌓 **Theme System**: Light and dark mode support
- 📊 **Data Visualization**: Interactive charts and relationship mapping
- 🤖 **LLM Integration**: Leverage AI for deeper relationship insights

### 🚀 Getting Started

#### Prerequisites

- Node.js (v14+)
- npm or yarn
- Git

#### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/relascope-insight.git

# Navigate to the project directory
cd relascope-insight

# Install dependencies
npm install
```

#### Running the Application

```bash
# Start the development server
npm run dev

# In a separate terminal, start the Electron app
npm run electron:dev

# Or use the combined command
npm run app:dev
```

### 🔧 Development

This project follows a structured development approach with clearly defined phases outlined in the `docs/DEVELOPMENT_PHASES.md` file.

### 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌟 项目概述 / Project Overview / プロジェクト概要

RelaScope Insight是一款桌面应用程序，帮助用户记录、分析和可视化他们的人际关系和互动。通过跟踪谈话、经历和情感反应，用户可以获得对其社交动态的更深入了解。

RelaScope Insight is a desktop application that helps users record, analyze, and visualize their interpersonal relationships and interactions. By tracking conversations, experiences, and emotional responses, users can gain deeper insights into their social dynamics.

RelaScope Insightは、ユーザーが対人関係やインタラクションを記録、分析、視覚化するのを支援するデスクトップアプリケーションです。会話、経験、感情的な反応を追跡することで、ユーザーは自分のソーシャルダイナミクスについてより深い洞察を得ることができます。

## 🚀 功能 / Features / 機能

- 📝 个人档案管理 / Profile Management / プロファイル管理
- 💬 对话和引用跟踪 / Conversation and Quote Tracking / 会話と引用の追跡
- 📊 六角模型分析 / Hexagon Model Analysis / 六角形モデル分析
- 🔄 历史记录和模式识别 / History and Pattern Recognition / 履歴とパターン認識
- 🌙 暗色/亮色主题 / Dark/Light Themes / ダーク/ライトテーマ
- 🌐 多语言支持 / Multilingual Support / 多言語サポート

## 📸 屏幕截图 / Screenshots / スクリーンショット

![Screenshot1](assets/screenshot1.png)
![Screenshot2](assets/screenshot2.png)

## 🛠️ 技术栈 / Tech Stack / 技術スタック

- Electron
- React
- TypeScript
- SQLite
- Chakra UI

## 🔧 安装 / Installation / インストール

```bash
# 克隆仓库
# Clone repository
# リポジトリをクローン
git clone https://github.com/yourusername/relascope-insight.git

# 进入目录
# Enter directory
# ディレクトリに入る
cd relascope-insight

# 安装依赖
# Install dependencies
# 依存関係をインストール
npm install

# 启动开发环境
# Start development environment
# 開発環境を起動
npm run dev

# 构建应用
# Build application
# アプリケーションをビルド
npm run build
```

## 📊 项目进度 / Project Progress / プロジェクトの進捗

### ✅ 阶段一：项目初始化与基础架构搭建 / Stage One: Project Initialization and Basic Architecture / ステージ1：プロジェクトの初期化と基本アーキテクチャの構築
- 完成项目脚手架搭建，使用Electron+React+TypeScript技术栈
- Completed project scaffolding using Electron+React+TypeScript stack
- Electron+React+TypeScript技術スタックを使用したプロジェクトスケルトンの構築

- 实现了主进程和渲染进程的基本通信机制
- Implemented basic communication between main and renderer processes
- メインプロセスとレンダラープロセス間の基本的な通信メカニズムを実装

- 建立了基础的应用框架和文件结构
- Established fundamental application framework and file structure
- 基本的なアプリケーションフレームワークとファイル構造を確立

### ✅ 阶段二：用户界面框架与组件库开发 / Stage Two: UI Framework and Component Library Development / ステージ2：ユーザーインターフェースフレームワークとコンポーネントライブラリの開発
- 实现了现代化的界面布局，包括响应式侧边栏、内容区和顶部导航
- Implemented modern interface layout with responsive sidebar, content area and top navigation
- レスポンシブサイドバー、コンテンツエリア、トップナビゲーションを備えた現代的なインターフェースレイアウトを実装

- 开发了主题系统，支持亮色/暗色模式切换
- Developed theme system with light/dark mode support
- ライト/ダークモードをサポートするテーマシステムを開発

- 实现了国际化多语言支持
- Implemented internationalization with multilingual support
- 多言語サポートによる国際化を実装

- 建立了全局状态管理系统
- Established global state management system
- グローバルステート管理システムを確立

### ✅ 阶段三：数据库设计与存储系统实现 / Stage Three: Database Design and Storage System Implementation / ステージ3：データベース設計とストレージシステムの実装
- 设计了SQLite数据库模型，包括个人档案、引用、经历等核心实体
- Designed SQLite database models including core entities like profiles, quotes, and experiences
- プロファイル、引用、経験などの主要エンティティを含むSQLiteデータベースモデルを設計

- 实现了完整的数据访问层，采用DAO设计模式
- Implemented complete data access layer using DAO design pattern
- DAOデザインパターンを使用した完全なデータアクセス層を実装

- 开发了数据库管理工具，支持备份和恢复功能
- Developed database management tools with backup and restore features
- バックアップと復元機能を備えたデータベース管理ツールを開発

- 建立了主进程和渲染进程之间的安全通信机制
- Established secure communication mechanism between main and renderer processes
- メインプロセスとレンダラープロセス間の安全な通信メカニズムを確立

### ✅ 阶段四：个人档案模块开发 / Stage Four: Profile Module Development / ステージ4：プロファイルモジュールの開発
- 🧑‍💼 设计并实现了个人档案管理界面，支持档案列表和详情查看
- 🧑‍💼 Designed and implemented profile management interface with list and detail views
- 🧑‍💼 プロファイル管理インターフェースを設計・実装し、リストと詳細ビューをサポート

- 📝 完成了档案的创建、编辑和删除功能
- 📝 Completed profile creation, editing and deletion functions
- 📝 プロファイルの作成、編集、削除機能を完成

- 🔍 实现了档案搜索和过滤功能
- 🔍 Implemented profile search and filtering capabilities
- 🔍 プロファイルの検索とフィルタリング機能を実装

- ⚡ 优化了IPC通信机制，提高了应用的稳定性和可靠性
- ⚡ Optimized IPC communication mechanism, improving application stability and reliability
- ⚡ IPCコミュニケーション機構を最適化し、アプリケーションの安定性と信頼性を向上

### ✅ 阶段五：语录与经历管理功能实现 / Stage Five: Quote and Experience Management / ステージ5：引用と経験の管理機能の実装
- 💬 开发了语录记录界面，支持增删改查操作
- 💬 Developed quote recording interface with CRUD operations
- 💬 引用記録インターフェースを開発し、CRUD操作をサポート

- 📅 实现了经历记录和时间轴展示功能
- 📅 Implemented experience recording and timeline display features
- 📅 経験記録とタイムライン表示機能を実装

- 🏷️ 添加了标签系统支持语录和经历分类
- 🏷️ Added tag system to support categorization of quotes and experiences
- 🏷️ 引用と経験の分類をサポートするタグシステムを追加

- 🔄 完成了数据与个人档案的关联管理
- 🔄 Completed data association management with personal profiles
- 🔄 パーソナルプロファイルとのデータ関連付け管理を完了

- ✨ 优化了UI交互效果和动画体验
- ✨ Optimized UI interaction effects and animation experience
- ✨ UIインタラクション効果とアニメーション体験を最適化

### ✅ 阶段六：可视化组件与六边形模型实现 / Stage Six: Visualization Components and Hexagon Model / ステージ6：可視化コンポーネントと六角形モデルの実装
- 📊 使用recharts实现了六边形人性模型雷达图
- 📊 Implemented hexagon personality model radar chart using recharts
- 📊 rechartsを使用して六角形パーソナリティモデルのレーダーチャートを実装

- 🔄 开发了图表交互功能，包括缩放、旋转和导出
- 🔄 Developed chart interaction features including zoom, rotation and export
- 🔄 ズーム、回転、エクスポートなどのチャートインタラクション機能を開発

- 📱 实现了响应式设计，支持不同屏幕尺寸
- 📱 Implemented responsive design supporting different screen sizes
- 📱 異なる画面サイズをサポートするレスポンシブデザインを実装

- 🔍 开发了模型详情展示功能和维度解释系统
- 🔍 Developed model detail display and dimension explanation system
- 🔍 モデル詳細表示と次元説明システムを開発

- 🧩 优化了代码结构，将大组件拆分重构
- 🧩 Optimized code structure by refactoring large components
- 🧩 大きなコンポーネントをリファクタリングしてコード構造を最適化

## 📄 许可 / License / ライセンス

本项目基于MIT许可证 - 有关详细信息，请参阅LICENSE文件。

This project is licensed under the MIT License - see the LICENSE file for details.

このプロジェクトはMITライセンスの下でライセンスされています - 詳細についてはLICENSEファイルを参照してください。

## 🌐 多语言支持 / Multilingual Support / 多言語サポート

- 🇺🇸 English
- 🇨🇳 中文 (Chinese)
- 🇯🇵 日本語 (Japanese)

## 👥 贡献 / Contributing / 貢献

欢迎贡献！请阅读[贡献指南](CONTRIBUTING.md)了解如何参与项目。

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) to get started.

貢献は歓迎します！参加方法については[貢献ガイドライン](CONTRIBUTING.md)をお読みください。

## 🙏 致谢 / Acknowledgements / 謝辞

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Chakra UI](https://chakra-ui.com/)
- [SQLite](https://www.sqlite.org/)

## 🌐 多言語サポート / Multilingual Support / 多言語サポート

- 🇺🇸 English
- 🇨🇳 中文 (Chinese)
- 🇯🇵 日本語 (Japanese)

## 👥 貢献 / Contributing / 貢献

歓迎貢献！[貢献ガイドライン](CONTRIBUTING.md)をお読みください。

## 🙏 謝辞 / Acknowledgements / 謝辞

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [Chakra UI](https://chakra-ui.com/)
- [SQLite](https://www.sqlite.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [i18next](https://www.i18next.com/)
- [React Icons](https://react-icons.github.io/react-icons/)

# relaScope-insight 🚀

**relaScope-insight** 是一个用于企业管理和项目协作的现代化应用程序。

## ✨ 功能特性

- 🏢 **企业管理** - 轻松管理企业资源和信息
- 👥 **用户管理** - 灵活的用户角色和权限系统
- 📊 **项目管理** - 跟踪和管理多个项目进度
- 👨‍💻 **团队协作** - 提高团队沟通和工作效率
- 📱 **跨平台支持** - 适用于Windows、Mac和Linux

## 🛠️ 技术栈

- **Electron** - 跨平台桌面应用程序框架
- **React** - 用户界面开发
- **TypeScript** - 强类型JavaScript超集
- **SQLite** - 本地数据存储
- **Tailwind CSS** - 实用优先的CSS框架

## 🚀 快速开始

### 先决条件

- Node.js 14.x 或更高版本
- npm 或 yarn

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/relaScope-insight.git

# 进入项目目录
cd relaScope-insight

# 安装依赖
npm install
# 或
yarn install
```

### 开发

```bash
# 启动开发服务器
npm run dev
# 或
yarn dev
```

### 构建

```bash
# 为当前平台构建
npm run build
# 或
yarn build

# 为所有平台构建
npm run build:all
# 或
yarn build:all
```

## 📝 数据库设计

本项目使用SQLite进行本地数据存储，主要数据表包括：

- `enterprises` - 企业信息
- `users` - 用户信息
- `projects` - 项目信息
- `project_members` - 项目成员关系
- `files` - 文件信息
- `tags` - 标签信息
- `activity_logs` - 活动日志

## 🌟 贡献指南

欢迎贡献！请查看我们的[贡献指南](CONTRIBUTING.md)了解更多信息。

## 📄 许可证

本项目基于MIT许可证 - 详情请查看[LICENSE](LICENSE)文件。

---

# relaScope-insight 🚀

**relaScope-insight** は企業管理とプロジェクト協働のためのモダンアプリケーションです。

## ✨ 特徴

- 🏢 **企業管理** - 企業リソースと情報を簡単に管理
- 👥 **ユーザー管理** - 柔軟なユーザーロールと権限システム
- 📊 **プロジェクト管理** - 複数のプロジェクト進捗を追跡
- 👨‍💻 **チーム協働** - チームコミュニケーションと効率を向上
- 📱 **クロスプラットフォーム対応** - Windows、Mac、Linuxに対応

## 🛠️ 技術スタック

- **Electron** - クロスプラットフォームデスクトップアプリケーションフレームワーク
- **React** - ユーザーインターフェース開発
- **TypeScript** - 強く型付けされたJavaScriptのスーパーセット
- **SQLite** - ローカルデータストレージ
- **Tailwind CSS** - ユーティリティファーストのCSSフレームワーク

## 🚀 クイックスタート

### 前提条件

- Node.js 14.x以上
- npmまたはyarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/relaScope-insight.git

# プロジェクトディレクトリに移動
cd relaScope-insight

# 依存関係をインストール
npm install
# または
yarn install
```

### 開発

```bash
# 開発サーバーを起動
npm run dev
# または
yarn dev
```

### ビルド

```bash
# 現在のプラットフォーム用にビルド
npm run build
# または
yarn build

# すべてのプラットフォーム用にビルド
npm run build:all
# または
yarn build:all
```

## 📝 データベース設計

このプロジェクトでは、SQLiteを使用してローカルデータを保存します。主なデータテーブル：

- `enterprises` - 企業情報
- `users` - ユーザー情報
- `projects` - プロジェクト情報
- `project_members` - プロジェクトメンバー関係
- `files` - ファイル情報
- `tags` - タグ情報
- `activity_logs` - アクティビティログ

## 🌟 貢献ガイド

貢献大歓迎！詳細は[貢献ガイド](CONTRIBUTING.md)をご覧ください。

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています - 詳細は[LICENSE](LICENSE)ファイルをご覧ください。

## 🔄 最近更新 / Recent Updates / 最近の更新

### 🛠️ 技术改进 / Technical Improvements / 技術的改善

- ⚡ **增强的IPC通信机制** / **Enhanced IPC Communication** / **強化されたIPC通信**
  - 重构了预加载脚本，提高了跨进程通信的可靠性
  - Refactored preload scripts for more reliable cross-process communication
  - クロスプロセス通信の信頼性向上のためプリロードスクリプトをリファクタリング

- 🔍 **改进的错误诊断** / **Improved Error Diagnostics** / **改善されたエラー診断**
  - 添加了详细的日志记录和错误边界组件
  - Added detailed logging and error boundary components
  - 詳細なログ記録とエラー境界コンポーネントを追加

- 🔒 **更安全的数据处理** / **More Secure Data Handling** / **より安全なデータ処理**
  - 优化了数据访问层，增强了类型安全
  - Optimized data access layer with enhanced type safety
  - タイプセーフティを強化したデータアクセス層の最適化

- 📱 **响应式UI改进** / **Responsive UI Improvements** / **レスポンシブUIの改善**
  - 优化了表单和列表视图的移动设备支持
  - Optimized form and list views for mobile device support
  - モバイルデバイスサポートのためのフォームとリストビューの最適化

## Electron应用图标规格指南

### 图标尺寸要求

对于Electron应用程序，需要准备多种尺寸的图标以适应不同平台和用途：

| 平台 | 图标格式 | 尺寸要求 | 用途 |
|------|---------|---------|------|
| Windows | ICO | 16x16, 32x32, 48x48, 256x256 | 应用图标, 任务栏 |
| macOS | ICNS | 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024 | Dock, 应用图标 |
| Linux | PNG | 16x16, 32x32, 48x48, 64x64, 128x128, 256x256 | 应用图标, 桌面入口 |

### 图标文件放置位置

应用图标应放置在以下位置：

```
src/renderer/assets/icons/
```

推荐的文件结构：

```
icons/
  ├── icon.png        # 主图标 (1024x1024)
  ├── icon.ico        # Windows图标
  ├── icon.icns       # macOS图标
  └── png/
       ├── 16x16.png
       ├── 32x32.png
       ├── 48x48.png
       ├── 64x64.png
       ├── 128x128.png
       ├── 256x256.png
       └── 512x512.png
```

### 创建图标的工具

1. **Electron Icon Generator**：使用以下命令创建所有平台所需的图标
   ```
   npm install -g electron-icon-maker
   electron-icon-maker --input=icon.png --output=./icons
   ```

2. **在线转换工具**
   - [iConvert](https://iconverticons.com/online/)
   - [Icon Converter](https://www.icoconverter.com/)
   - [Img2Go](https://www.img2go.com/)

3. **图形软件**
   - Adobe Photoshop
   - GIMP
   - Sketch

### 图标设计建议

- 使用简洁、辨识度高的设计
- 确保在小尺寸下仍然清晰可辨
- 使用适当的颜色对比度
- 在不同背景下测试可见度
- 保持图标风格与应用程序界面一致

### 在Electron中使用图标

在`src/main/index.ts`中设置应用图标：

```typescript
mainWindow = new BrowserWindow({
  // ...其他配置
  icon: path.join(__dirname, '../renderer/assets/icons/icon.png'),
});
```

### 打包时设置图标

在`electron-builder`配置中指定图标：

```json
{
  "build": {
    "appId": "com.yourcompany.yourapp",
    "productName": "YourApp",
    "mac": {
      "icon": "build/icons/icon.icns"
    },
    "win": {
      "icon": "build/icons/icon.ico"
    },
    "linux": {
      "icon": "build/icons"
    }
  }
}
```