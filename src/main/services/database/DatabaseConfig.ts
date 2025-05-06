import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';

/**
 * 数据库配置接口
 */
export interface DatabaseConfig {
  /**
   * 数据库文件路径
   */
  dbPath: string;
  
  /**
   * 备份目录
   */
  backupDir: string;
  
  /**
   * 最大备份文件数量
   */
  maxBackupFiles: number;
  
  /**
   * 是否启用日志
   */
  logEnabled: boolean;
}

/**
 * 默认数据库配置
 */
export const DEFAULT_DATABASE_CONFIG: DatabaseConfig = {
  dbPath: path.join(app.getPath('userData'), 'data', 'relascope.db'),
  backupDir: path.join(app.getPath('userData'), 'backups'),
  maxBackupFiles: 10,
  logEnabled: true
};

// 确保数据库目录存在
export function ensureDatabaseDirectories(config: DatabaseConfig = DEFAULT_DATABASE_CONFIG): void {
  const dbDir = path.dirname(config.dbPath);
  const backupDir = config.backupDir;
  
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
} 