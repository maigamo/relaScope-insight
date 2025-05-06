import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { DatabaseConfig } from './DatabaseConfig';
import { DatabaseBackupManager } from './DatabaseBackupManager';

/**
 * 数据库管理器
 * 负责初始化数据库连接和执行数据库操作
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: Database | null = null;
  private isInitialized: boolean = false;
  private readonly userDataPath: string;
  private readonly dbFilePath: string;
  private readonly scriptsPath: string;
  private config: DatabaseConfig;
  private backupManager: DatabaseBackupManager;

  private constructor() {
    this.userDataPath = app.getPath('userData');
    this.dbFilePath = path.join(this.userDataPath, 'database.sqlite');
    this.scriptsPath = path.join(__dirname, 'scripts');
    this.config = {
      dbPath: this.dbFilePath,
      backupDir: path.join(this.userDataPath, 'backups'),
      maxBackupFiles: 10,
      logEnabled: true
    };
    this.backupManager = new DatabaseBackupManager(this.config);
  }

  /**
   * 获取数据库管理器单例
   */
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * 初始化数据库
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized && this.db) {
      return;
    }

    try {
      // 确保目录存在
      this.ensureDirectoryExists(this.userDataPath);

      // 打开数据库连接
      this.db = await open({
        filename: this.dbFilePath,
        driver: sqlite3.Database
      });

      // 启用外键约束
      await this.db.exec('PRAGMA foreign_keys = ON');

      // 创建表
      await this.initializeTables();

      this.isInitialized = true;
      console.log('数据库初始化成功');
    } catch (error) {
      console.error('数据库初始化失败:', error);
      throw error;
    }
  }

  /**
   * 关闭数据库连接
   */
  public async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.isInitialized = false;
      console.log('数据库连接已关闭');
    }
  }

  /**
   * 获取数据库实例
   */
  public getDatabase(): Database | null {
    if (!this.isInitialized) {
      console.warn('数据库尚未初始化，请先调用initialize方法');
    }
    return this.db;
  }

  /**
   * 确保目录存在
   * @param dirPath 目录路径
   */
  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * 初始化数据库表
   * 读取SQL脚本并执行
   */
  private async initializeTables(): Promise<void> {
    if (!this.db) {
      throw new Error('数据库未打开');
    }

    try {
      const sqlScript = path.join(this.scriptsPath, 'init-tables.sql');
      const sql = fs.readFileSync(sqlScript, 'utf-8');
      
      // 将SQL语句按照分号分割执行
      const statements = sql.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await this.db.exec(statement);
        }
      }
      
      console.log('数据库表初始化成功');
    } catch (error) {
      console.error('初始化数据库表失败:', error);
      throw error;
    }
  }

  /**
   * 获取数据库文件路径
   */
  public getDbFilePath(): string {
    return this.dbFilePath;
  }

  /**
   * 执行数据库备份
   * @param backupPath 备份路径
   */
  public async backup(backupPath?: string): Promise<string> {
    try {
      // 如果数据库打开，先关闭事务
      if (this.db) {
        await this.db.exec('COMMIT');
      }

      return await this.backupManager.createBackup(this.dbFilePath);
    } catch (error) {
      console.error('数据库备份失败:', error);
      throw error;
    }
  }

  /**
   * 恢复数据库备份
   * @param backupPath 备份文件路径
   */
  public async restore(backupPath: string): Promise<void> {
    try {
      // 先关闭当前数据库连接
      if (this.db) {
        await this.close();
      }

      // 恢复备份
      await this.backupManager.restoreFromBackup(backupPath, this.dbFilePath);

      // 重新初始化数据库
      await this.initialize();
      console.log('数据库恢复成功');
    } catch (error) {
      console.error('数据库恢复失败:', error);
      throw error;
    }
  }

  /**
   * 获取备份文件列表
   */
  public async getBackupFiles(): Promise<Array<{ path: string, date: Date, size: number }>> {
    return this.backupManager.getBackupFiles();
  }

  /**
   * 删除备份文件
   * @param backupPath 备份文件路径
   */
  public async deleteBackup(backupPath: string): Promise<void> {
    return this.backupManager.deleteBackup(backupPath);
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<DatabaseConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取配置
   */
  public getConfig(): DatabaseConfig {
    return { ...this.config };
  }

  /**
   * 执行SQL查询
   */
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

  /**
   * 执行查询并返回所有结果
   */
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

  /**
   * 执行查询并返回第一个结果
   */
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
} 