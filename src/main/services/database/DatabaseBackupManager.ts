import fs from 'fs';
import path from 'path';
import { DatabaseConfig } from './DatabaseConfig';

/**
 * 数据库备份管理器
 * 负责数据库备份、恢复和备份文件管理
 */
export class DatabaseBackupManager {
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.ensureBackupDirectory();
  }

  /**
   * 确保备份目录存在
   */
  private ensureBackupDirectory(): void {
    if (!fs.existsSync(this.config.backupDir)) {
      fs.mkdirSync(this.config.backupDir, { recursive: true });
    }
  }

  /**
   * 创建数据库备份
   * @param dbPath 数据库文件路径
   * @returns 备份文件路径
   */
  public async createBackup(dbPath: string): Promise<string> {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.config.backupDir, `relascope-backup-${timestamp}.db`);

    try {
      // 确保源数据库存在
      if (!fs.existsSync(dbPath)) {
        throw new Error('数据库文件不存在，无法创建备份');
      }

      // 复制数据库文件
      fs.copyFileSync(dbPath, backupPath);

      if (this.config.logEnabled) {
        console.log(`数据库已备份至: ${backupPath}`);
      }

      // 清理旧备份
      await this.cleanupBackups();

      return backupPath;
    } catch (error) {
      console.error('创建数据库备份失败:', error);
      throw error;
    }
  }

  /**
   * 从备份恢复数据库
   * @param backupPath 备份文件路径
   * @param dbPath 数据库文件路径
   */
  public async restoreFromBackup(backupPath: string, dbPath: string): Promise<void> {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`备份文件不存在: ${backupPath}`);
    }

    try {
      // 复制备份文件到数据库位置
      fs.copyFileSync(backupPath, dbPath);

      if (this.config.logEnabled) {
        console.log(`数据库已从备份恢复: ${backupPath}`);
      }
    } catch (error) {
      console.error('从备份恢复数据库失败:', error);
      throw error;
    }
  }

  /**
   * 获取备份文件列表
   * @returns 备份文件列表
   */
  public async getBackupFiles(): Promise<Array<{ path: string, date: Date, size: number }>> {
    try {
      if (!fs.existsSync(this.config.backupDir)) {
        return [];
      }

      const files = fs.readdirSync(this.config.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('relascope-backup-') && file.endsWith('.db'))
        .map(file => {
          const filePath = path.join(this.config.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            path: filePath,
            date: stats.mtime,
            size: stats.size
          };
        })
        .sort((a, b) => b.date.getTime() - a.date.getTime());

      return backupFiles;
    } catch (error) {
      console.error('获取备份文件列表失败:', error);
      throw error;
    }
  }

  /**
   * 删除备份文件
   * @param backupPath 备份文件路径
   */
  public async deleteBackup(backupPath: string): Promise<void> {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`备份文件不存在: ${backupPath}`);
    }

    try {
      fs.unlinkSync(backupPath);
      if (this.config.logEnabled) {
        console.log(`已删除备份文件: ${backupPath}`);
      }
    } catch (error) {
      console.error('删除备份文件失败:', error);
      throw error;
    }
  }

  /**
   * 清理旧备份
   */
  public async cleanupBackups(): Promise<void> {
    try {
      const backupFiles = await this.getBackupFiles();

      if (backupFiles.length > this.config.maxBackupFiles) {
        // 按日期排序，删除最旧的备份
        const filesToDelete = backupFiles.slice(this.config.maxBackupFiles);
        for (const file of filesToDelete) {
          await this.deleteBackup(file.path);
        }
      }
    } catch (error) {
      console.error('清理旧备份失败:', error);
    }
  }
} 