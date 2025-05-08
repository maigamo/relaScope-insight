/**
 * 数据库实体类型定义
 * 这些类型在主进程和渲染进程之间共享
 */

// 数据库配置
export interface DatabaseConfig {
  dbPath: string;
  backupDir: string;
  maxBackupFiles: number;
  logEnabled: boolean;
}

// 档案实体
export interface Profile {
  id?: number;
  name: string;
  birthday?: string;
  gender?: string;
  occupation?: string;
  education?: string;
  email?: string;
  phone?: string;
  address?: string;
  socialMedia?: string;
  notes?: string;
  tags?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 引用实体
export interface Quote {
  id?: number;
  profileId: number;
  content: string;
  source?: string;
  date?: string;
  context?: string;
  tags?: string;
  importance?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 经历实体
export interface Experience {
  id?: number;
  profileId: number;
  title: string;
  type?: string; // 工作、教育、生活等类型
  organization?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  location?: string;
  impact?: number; // 影响程度评分 1-10
  tags?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // 兼容旧版本字段
  profile_id?: number;
  date?: string;
  created_at?: string;
  updated_at?: string;
}

// 分析实体
export interface Analysis {
  id?: number;
  profileId: number;
  title: string;
  type: string; // 六边形模型分析、通用分析等
  content: string;
  resultSummary?: string;
  tags?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 六边形模型实体
export interface HexagonModel {
  id?: number;
  profileId: number;
  title: string;
  security: number; // 安全感 0-10
  achievement: number; // 成就感 0-10
  pleasure: number; // 愉悦感 0-10
  autonomy: number; // 自主性 0-10
  connection: number; // 连接感 0-10
  meaning: number; // 意义感 0-10
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 数据库查询返回类型
export interface QueryResult {
  success: boolean;
  data?: any;
  error?: string;
} 