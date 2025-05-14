# LLM 服务配置组件

## 📘 概述

LLM服务配置组件是一个用于管理大语言模型服务的全功能界面，支持多种AI服务提供商的配置、模型选择、参数调整和提示词模板管理。

## 🏗️ 组件结构

```
/settings/
├── LLMSettings.tsx         # 主入口组件
├── LLMProxyConfig.tsx      # 代理设置组件
├── LLMApiKeyConfig.tsx     # API密钥配置组件
├── LLMModelConfig.tsx      # 模型配置组件
├── LLMTemplateConfig.tsx   # 提示词模板配置组件
└── llm/                   # 工具函数和类型定义
    ├── index.ts           # 导出入口
    ├── types.ts           # 类型定义
    └── utils.ts           # 工具函数
```

## 🚀 功能特性

- 📋 按服务商分组管理LLM配置
- 🔑 针对每个服务商配置API密钥
- 🛠️ 细粒度调整模型参数（温度、top-p、频率惩罚等）
- 📝 系统消息设置
- 🌐 代理配置支持
- 📱 完全响应式界面
- 🎨 深色/浅色模式支持
- 📄 提示词模板管理

## 🔧 使用方法

在任何React组件中导入并使用：

```jsx
import LLMSettings from '../components/settings/llm';

function SettingsPage() {
  return (
    <div>
      <h1>设置</h1>
      <LLMSettings />
    </div>
  );
}
```

## 📋 流程说明

1. 左侧导航显示可用的服务商分组（如OpenAI、Anthropic等）
2. 选择服务商后，可以查看该服务商下的所有配置或创建新配置
3. 选择具体配置后，右侧会显示详细信息和编辑选项
4. 可以使用顶部的"添加服务商"按钮添加新的服务商类型
5. 配置创建/编辑流程：
   - 填写配置名称
   - 选择模型（所选服务商下的可用模型）
   - 调整参数设置
   - 设置系统消息
   - 保存配置

## 🌟 最佳实践

- 建议为每个服务商至少创建一个配置
- 设置全局API密钥，避免在每个配置中重复设置
- 对于常用配置，设置为默认配置以便快速访问
- 利用不同的温度设置创建多个配置，以适应不同场景需求

---

# LLM Service Configuration Component

## 📘 Overview

The LLM Service Configuration component is a full-featured interface for managing large language model services, supporting configuration of multiple AI service providers, model selection, parameter adjustment, and prompt template management.

## 🏗️ Component Structure

```
/settings/
├── LLMSettings.tsx         # Main entry component
├── LLMProxyConfig.tsx      # Proxy settings component
├── LLMApiKeyConfig.tsx     # API key configuration component
├── LLMModelConfig.tsx      # Model configuration component
├── LLMTemplateConfig.tsx   # Prompt template configuration component
└── llm/                    # Utility functions and type definitions
    ├── index.ts            # Export entry
    ├── types.ts            # Type definitions
    └── utils.ts            # Utility functions
```

## 🚀 Features

- 📋 Manage LLM configurations grouped by service provider
- 🔑 Configure API keys for each service provider
- 🛠️ Fine-tune model parameters (temperature, top-p, frequency penalty, etc.)
- 📝 System message settings
- 🌐 Proxy configuration support
- 📱 Fully responsive interface
- 🎨 Dark/light mode support
- 📄 Prompt template management

## 🔧 Usage

Import and use in any React component:

```jsx
import LLMSettings from '../components/settings/llm';

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <LLMSettings />
    </div>
  );
}
```

## 📋 Workflow

1. The left navigation displays available service provider groups (such as OpenAI, Anthropic, etc.)
2. After selecting a service provider, you can view all configurations under that provider or create a new one
3. When a specific configuration is selected, detailed information and editing options are displayed on the right
4. You can use the "Add Service Provider" button at the top to add a new service provider type
5. Configuration creation/editing process:
   - Enter configuration name
   - Select a model (available models under the selected provider)
   - Adjust parameter settings
   - Set system message
   - Save configuration

## 🌟 Best Practices

- It is recommended to create at least one configuration for each service provider
- Set global API keys to avoid repeated settings in each configuration
- Set frequently used configurations as default for quick access
- Use different temperature settings to create multiple configurations for different scenarios

---

# LLM サービス設定コンポーネント

## 📘 概要

LLM サービス設定コンポーネントは、大規模言語モデルサービスを管理するための完全な機能を持つインターフェースで、複数の AI サービスプロバイダーの設定、モデル選択、パラメータ調整、プロンプトテンプレート管理をサポートしています。

## 🏗️ コンポーネント構成

```
/settings/
├── LLMSettings.tsx         # メインエントリーコンポーネント
├── LLMProxyConfig.tsx      # プロキシ設定コンポーネント
├── LLMApiKeyConfig.tsx     # APIキー設定コンポーネント
├── LLMModelConfig.tsx      # モデル設定コンポーネント
├── LLMTemplateConfig.tsx   # プロンプトテンプレート設定コンポーネント
└── llm/                    # ユーティリティ関数と型定義
    ├── index.ts            # エクスポートエントリー
    ├── types.ts            # 型定義
    └── utils.ts            # ユーティリティ関数
```

## 🚀 機能

- 📋 サービスプロバイダー別にLLM設定を管理
- 🔑 各サービスプロバイダーのAPIキーを設定
- 🛠️ モデルパラメータの微調整（温度、top-p、頻度ペナルティなど）
- 📝 システムメッセージ設定
- 🌐 プロキシ設定サポート
- 📱 完全レスポンシブインターフェース
- 🎨 ダーク/ライトモードサポート
- 📄 プロンプトテンプレート管理

## 🔧 使用方法

任意のReactコンポーネントでインポートして使用：

```jsx
import LLMSettings from '../components/settings/llm';

function SettingsPage() {
  return (
    <div>
      <h1>設定</h1>
      <LLMSettings />
    </div>
  );
}
```

## 📋 ワークフロー

1. 左側のナビゲーションに利用可能なサービスプロバイダーグループ（OpenAI、Anthropicなど）が表示されます
2. サービスプロバイダーを選択した後、そのプロバイダーの下にあるすべての設定を表示したり、新しい設定を作成したりできます
3. 特定の設定を選択すると、詳細情報と編集オプションが右側に表示されます
4. 上部の「サービスプロバイダーを追加」ボタンを使用して、新しいサービスプロバイダータイプを追加できます
5. 設定の作成/編集プロセス：
   - 設定名を入力する
   - モデルを選択する（選択したプロバイダーで利用可能なモデル）
   - パラメータ設定を調整する
   - システムメッセージを設定する
   - 設定を保存する

## 🌟 ベストプラクティス

- 各サービスプロバイダーに少なくとも1つの設定を作成することをお勧めします
- グローバルAPIキーを設定して、各設定での繰り返し設定を避けます
- よく使用する設定をデフォルトとして設定し、迅速にアクセスできるようにします
- さまざまな温度設定を使用して、異なるシナリオに適した複数の設定を作成します 