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

### 🚧 阶段四：个人档案模块开发 (进行中) / Stage Four: Profile Module Development (In Progress) / ステージ4：プロファイルモジュールの開発（進行中）
- 设计个人档案管理界面
- Designing profile management interface
- プロファイル管理インターフェースを設計中

- 实现档案的创建、编辑和删除功能
- Implementing profile creation, editing and deletion functions
- プロファイルの作成、編集、削除機能を実装中

- 开发档案搜索和筛选系统
- Developing profile search and filtering system
- プロファイル検索とフィルタリングシステムを開発中

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