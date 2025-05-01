/**
 * 应用基础配置
 */
export interface AppConfig {
  version: string;
  firstRun: boolean;
  language: 'en' | 'zh' | 'ja';
  theme: 'light' | 'dark' | 'system';
  autoUpdate: boolean;
  startWithSystem: boolean;
  port?: number; // 网络服务端口，默认10018
}

/**
 * UI配置
 */
export interface UIConfig {
  darkMode: boolean;
  primaryColor: string; // 默认 "#22c55e"
  listPageSize: number; // 每页显示条目数，默认20
  confirmDeletion: boolean; // 删除操作是否需要确认
  animationsEnabled: boolean; // 是否启用动画
  hexagonChartSize: number; // 六边形图表尺寸，默认350px
}

/**
 * 数据库配置
 */
export interface DBConfig {
  path: string; // 数据库文件路径，默认 "./data/db/relascope.db"
  encrypted: boolean; // 是否加密数据库
  backupEnabled: boolean; // 是否启用备份
  backupInterval: number; // 备份间隔（天），默认7
  backupCount: number; // 保留备份数量，默认5
}

/**
 * LLM服务配置
 */
export interface LLMConfig {
  provider: 'openai' | 'azure' | 'anthropic' | 'custom';
  model: string; // 默认模型
  apiEndpoint?: string; // API端点URL
  timeout: number; // 超时时间（毫秒），默认60000
  maxRetries: number; // 最大重试次数，默认3
  useProxy: boolean; // 是否使用代理
  proxyUrl?: string; // 代理URL
}

/**
 * 分析配置
 */
export interface AnalysisConfig {
  markdownRenderEnabled: boolean; // 是否启用Markdown渲染
  hexagonModelLevels: 3 | 5; // 六边形模型评分等级数，3或5
  hexagonModelColors: string[]; // 六边形模型颜色设置
  promptTemplates: Record<string, string>; // 提示模板
}

/**
 * 安全配置
 */
export interface SecurityConfig {
  encryptionEnabled: boolean; // 是否启用加密
  saltLength: number; // 盐长度
  ivLength: number; // 初始化向量长度
  iterationCount: number; // 密钥派生迭代次数
  passwordProtection: boolean; // 是否启用密码保护
  passwordHash?: string; // 密码哈希(如果启用)
}

/**
 * 导出配置
 */
export interface ExportConfig {
  defaultExportFormat: 'pdf' | 'markdown' | 'html' | 'json';
  includeMetadata: boolean; // 是否包含元数据
  includeSources: boolean; // 是否包含源数据
  defaultExportPath: string; // 默认导出路径
}

/**
 * 更新配置
 */
export interface UpdateConfig {
  checkForUpdatesOnStartup: boolean; // 启动时检查更新
  updateChannel: 'stable' | 'beta' | 'dev'; // 更新通道
  lastUpdateCheck: string; // 最后一次检查更新的时间
}

/**
 * 所有配置的集合
 */
export interface AllConfigs {
  app: AppConfig;
  ui: UIConfig;
  db: DBConfig;
  llm: LLMConfig;
  analysis: AnalysisConfig;
  security: SecurityConfig;
  export: ExportConfig;
  update: UpdateConfig;
} 