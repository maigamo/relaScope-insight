import * as sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';
import { DatabaseConfig } from './DatabaseConfig';

/**
 * 数据库管理器
 * 负责初始化数据库连接、执行数据库操作和备份
 */
export class DatabaseManager {
  private db: Database | null = null;
  private config: DatabaseConfig;
  private static instance: DatabaseManager | null = null;

  // 获取单例实例
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private constructor() {
    // 默认配置
    this.config = {
      dbPath: path.join(app.getPath('userData'), 'data', 'relascope.db'),
      backupDir: path.join(app.getPath('userData'), 'backups'),
      maxBackupFiles: 10,
      logEnabled: true
    };
  }

  // 更新配置
  public updateConfig(config: Partial<DatabaseConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 获取配置
  public getConfig(): DatabaseConfig {
    return { ...this.config };
  }

  // 初始化数据库
  public async initialize(): Promise<void> {
    if (this.db) {
      console.log('数据库已初始化');
      return;
    }

    try {
      // 确保目录存在
      const dbDir = path.dirname(this.config.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      if (!fs.existsSync(this.config.backupDir)) {
        fs.mkdirSync(this.config.backupDir, { recursive: true });
      }

      // 打开数据库连接
      this.db = await open({
        filename: this.config.dbPath,
        driver: sqlite3.Database
      });

      if (this.config.logEnabled) {
        console.log(`数据库已连接: ${this.config.dbPath}`);
      }

      // 启用外键约束
      await this.db.exec('PRAGMA foreign_keys = ON');

      // 初始化表结构
      await this.initTables();

      if (this.config.logEnabled) {
        console.log('数据库表结构已初始化');
      }
    } catch (error) {
      console.error('初始化数据库失败:', error);
      throw error;
    }
  }

  // 关闭数据库连接
  public async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      if (this.config.logEnabled) {
        console.log('数据库连接已关闭');
      }
    }
  }

  // 获取数据库实例
  public getDatabase(): Database {
    if (!this.db) {
      throw new Error('数据库未初始化，请先调用initialize()');
    }
    return this.db;
  }

  // 创建数据库备份
  public async createBackup(): Promise<string> {
    if (!this.db) {
      throw new Error('数据库未初始化，无法创建备份');
    }

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.config.backupDir, `relascope-backup-${timestamp}.db`);

    try {
      // 确保源数据库存在
      if (!fs.existsSync(this.config.dbPath)) {
        throw new Error('数据库文件不存在，无法创建备份');
      }

      // 复制数据库文件
      fs.copyFileSync(this.config.dbPath, backupPath);

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

  // 从备份恢复数据库
  public async restoreFromBackup(backupPath: string): Promise<void> {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`备份文件不存在: ${backupPath}`);
    }

    try {
      // 关闭现有连接
      if (this.db) {
        await this.db.close();
        this.db = null;
      }

      // 复制备份文件到数据库位置
      fs.copyFileSync(backupPath, this.config.dbPath);

      if (this.config.logEnabled) {
        console.log(`数据库已从备份恢复: ${backupPath}`);
      }

      // 重新初始化数据库连接
      await this.initialize();
    } catch (error) {
      console.error('从备份恢复数据库失败:', error);
      throw error;
    }
  }

  // 获取备份文件列表
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

  // 执行SQL查询
  public async execute(sql: string, params: any[] = []): Promise<any> {
    if (!this.db) {
      throw new Error('数据库未初始化，请先调用initialize()');
    }

    try {
      return await this.db.run(sql, ...params);
    } catch (error) {
      console.error(`执行SQL失败: ${sql}`, error);
      throw error;
    }
  }

  // 执行查询并返回所有结果
  public async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      throw new Error('数据库未初始化，请先调用initialize()');
    }

    try {
      return await this.db.all(sql, ...params);
    } catch (error) {
      console.error(`查询失败: ${sql}`, error);
      throw error;
    }
  }

  // 执行查询并返回第一个结果
  public async queryOne<T>(sql: string, params: any[] = []): Promise<T | null> {
    if (!this.db) {
      throw new Error('数据库未初始化，请先调用initialize()');
    }

    try {
      return await this.db.get(sql, ...params) || null;
    } catch (error) {
      console.error(`查询失败: ${sql}`, error);
      throw error;
    }
  }

  // 初始化数据库表结构
  private async initTables(): Promise<void> {
    // 个人档案表
    await this.db!.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        birthday TEXT,
        gender TEXT,
        occupation TEXT,
        education TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        socialMedia TEXT,
        notes TEXT,
        tags TEXT,
        avatar TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // 引用表
    await this.db!.exec(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profileId INTEGER NOT NULL,
        content TEXT NOT NULL,
        source TEXT,
        date TEXT,
        context TEXT,
        tags TEXT,
        importance INTEGER,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (profileId) REFERENCES profiles (id) ON DELETE CASCADE
      )
    `);

    // 经历表
    await this.db!.exec(`
      CREATE TABLE IF NOT EXISTS experiences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profileId INTEGER NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        organization TEXT,
        startDate TEXT,
        endDate TEXT,
        description TEXT,
        location TEXT,
        impact INTEGER,
        tags TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (profileId) REFERENCES profiles (id) ON DELETE CASCADE
      )
    `);

    // 分析表
    await this.db!.exec(`
      CREATE TABLE IF NOT EXISTS analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profileId INTEGER NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        resultSummary TEXT,
        tags TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (profileId) REFERENCES profiles (id) ON DELETE CASCADE
      )
    `);

    // 六边形模型表
    await this.db!.exec(`
      CREATE TABLE IF NOT EXISTS hexagon_models (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profileId INTEGER NOT NULL,
        title TEXT NOT NULL,
        security REAL NOT NULL,
        achievement REAL NOT NULL,
        pleasure REAL NOT NULL,
        autonomy REAL NOT NULL,
        connection REAL NOT NULL,
        meaning REAL NOT NULL,
        notes TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (profileId) REFERENCES profiles (id) ON DELETE CASCADE
      )
    `);
  }

  // 清理旧备份
  private async cleanupBackups(): Promise<void> {
    try {
      const backupFiles = await this.getBackupFiles();

      if (backupFiles.length > this.config.maxBackupFiles) {
        // 按日期排序，删除最旧的备份
        const filesToDelete = backupFiles.slice(this.config.maxBackupFiles);
        for (const file of filesToDelete) {
          fs.unlinkSync(file.path);
          if (this.config.logEnabled) {
            console.log(`已删除旧备份: ${file.path}`);
          }
        }
      }
    } catch (error) {
      console.error('清理旧备份失败:', error);
    }
  }
} 