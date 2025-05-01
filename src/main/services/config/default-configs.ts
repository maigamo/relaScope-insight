import { 
  AppConfig, 
  UIConfig, 
  DBConfig, 
  LLMConfig, 
  AnalysisConfig, 
  SecurityConfig, 
  ExportConfig, 
  UpdateConfig 
} from '../../../common/types/config';

/**
 * 应用默认配置
 */
export const defaultAppConfig: AppConfig = {
  version: '0.1.0',
  firstRun: true,
  language: 'zh',
  theme: 'system',
  autoUpdate: true,
  startWithSystem: false,
  port: 10018
};

/**
 * UI默认配置
 */
export const defaultUIConfig: UIConfig = {
  darkMode: false,
  primaryColor: '#22c55e',
  listPageSize: 20,
  confirmDeletion: true,
  animationsEnabled: true,
  hexagonChartSize: 350
};

/**
 * 数据库默认配置
 */
export const defaultDBConfig: DBConfig = {
  path: './data/db/relascope.db',
  encrypted: false,
  backupEnabled: true,
  backupInterval: 7,
  backupCount: 5
};

/**
 * LLM服务默认配置
 */
export const defaultLLMConfig: LLMConfig = {
  provider: 'openai',
  model: 'gpt-4',
  timeout: 60000, // 60秒
  maxRetries: 3,
  useProxy: false
};

/**
 * 分析默认配置
 */
export const defaultAnalysisConfig: AnalysisConfig = {
  markdownRenderEnabled: true,
  hexagonModelLevels: 3,
  hexagonModelColors: ['#22c55e', '#3b82f6', '#f97316', '#eab308', '#ec4899', '#8b5cf6'],
  promptTemplates: {}
};

/**
 * 安全默认配置
 */
export const defaultSecurityConfig: SecurityConfig = {
  encryptionEnabled: false,
  saltLength: 16,
  ivLength: 16,
  iterationCount: 100000,
  passwordProtection: false
};

/**
 * 导出默认配置
 */
export const defaultExportConfig: ExportConfig = {
  defaultExportFormat: 'pdf',
  includeMetadata: true,
  includeSources: true,
  defaultExportPath: './exports'
};

/**
 * 更新默认配置
 */
export const defaultUpdateConfig: UpdateConfig = {
  checkForUpdatesOnStartup: true,
  updateChannel: 'stable',
  lastUpdateCheck: new Date().toISOString()
};

/**
 * 所有默认配置的集合
 */
export const defaultConfigs = {
  app: defaultAppConfig,
  ui: defaultUIConfig,
  db: defaultDBConfig,
  llm: defaultLLMConfig,
  analysis: defaultAnalysisConfig,
  security: defaultSecurityConfig,
  export: defaultExportConfig,
  update: defaultUpdateConfig
}; 