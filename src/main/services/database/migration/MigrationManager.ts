import * as fs from 'fs';
import * as path from 'path';
import { Database } from 'sqlite';
import { DatabaseManager } from '../DatabaseManager';

/**
 * 迁移配置接口
 */
export interface MigrationConfig {
  // 迁移脚本目录
  migrationsDir: string;
  // 是否启用日志
  logEnabled: boolean;
}

/**
 * 迁移记录接口
 */
export interface MigrationRecord {
  id: number;
  name: string;
  appliedAt: string;
}

/**
 * 数据库迁移管理器
 * 负责执行数据库结构迁移和版本管理
 */
export class MigrationManager {
  private static instance: MigrationManager | null = null;
  private db: Database | null = null;
  private config: MigrationConfig;

  private constructor() {
    this.config = {
      migrationsDir: path.join(__dirname, 'scripts'),
      logEnabled: true
    };
  }

  // 获取单例实例
  public static getInstance(): MigrationManager {
    if (!MigrationManager.instance) {
      MigrationManager.instance = new MigrationManager();
    }
    return MigrationManager.instance;
  }

  // 更新配置
  public updateConfig(config: Partial<MigrationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 获取配置
  public getConfig(): MigrationConfig {
    return { ...this.config };
  }

  // 初始化迁移管理器
  public async initialize(): Promise<void> {
    try {
      // 获取数据库连接
      const dbManager = DatabaseManager.getInstance();
      this.db = dbManager.getDatabase();

      // 创建迁移表
      await this.createMigrationsTable();

      if (this.config.logEnabled) {
        console.log('数据库迁移管理器已初始化');
      }
    } catch (error) {
      console.error('初始化数据库迁移管理器失败:', error);
      throw error;
    }
  }

  // 创建迁移记录表
  private async createMigrationsTable(): Promise<void> {
    if (!this.db) {
      throw new Error('数据库未初始化');
    }

    const sql = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        appliedAt TEXT NOT NULL
      )
    `;

    await this.db.exec(sql);
  }

  // 获取已应用的迁移列表
  public async getAppliedMigrations(): Promise<MigrationRecord[]> {
    if (!this.db) {
      throw new Error('数据库未初始化');
    }

    const sql = `SELECT * FROM migrations ORDER BY id ASC`;
    return await this.db.all<MigrationRecord[]>(sql);
  }

  // 获取未应用的迁移列表
  public async getPendingMigrations(): Promise<string[]> {
    try {
      // 确保迁移目录存在
      if (!fs.existsSync(this.config.migrationsDir)) {
        fs.mkdirSync(this.config.migrationsDir, { recursive: true });
      }

      // 读取目录中的所有迁移脚本
      const files = fs.readdirSync(this.config.migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      // 获取已应用的迁移
      const appliedMigrations = await this.getAppliedMigrations();
      const appliedNames = appliedMigrations.map(m => m.name);

      // 过滤出未应用的迁移
      return files.filter(file => !appliedNames.includes(file));
    } catch (error) {
      console.error('获取未应用迁移失败:', error);
      throw error;
    }
  }

  // 应用迁移
  public async applyMigration(migrationName: string): Promise<boolean> {
    if (!this.db) {
      throw new Error('数据库未初始化');
    }

    try {
      const migrationPath = path.join(this.config.migrationsDir, migrationName);
      
      if (!fs.existsSync(migrationPath)) {
        throw new Error(`迁移文件不存在: ${migrationPath}`);
      }

      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      // 开始事务
      await this.db.exec('BEGIN TRANSACTION');
      
      // 执行迁移脚本
      await this.db.exec(sql);
      
      // 记录迁移
      const now = new Date().toISOString();
      await this.db.run(
        'INSERT INTO migrations (name, appliedAt) VALUES (?, ?)',
        migrationName,
        now
      );
      
      // 提交事务
      await this.db.exec('COMMIT');
      
      if (this.config.logEnabled) {
        console.log(`已应用迁移: ${migrationName}`);
      }
      
      return true;
    } catch (error) {
      // 回滚事务
      if (this.db) {
        await this.db.exec('ROLLBACK');
      }
      
      console.error(`应用迁移失败: ${migrationName}`, error);
      throw error;
    }
  }

  // 应用所有未应用的迁移
  public async migrateUp(): Promise<string[]> {
    const pendingMigrations = await this.getPendingMigrations();
    const appliedMigrations: string[] = [];
    
    for (const migration of pendingMigrations) {
      try {
        await this.applyMigration(migration);
        appliedMigrations.push(migration);
      } catch (error) {
        console.error(`迁移失败，中止后续迁移: ${migration}`, error);
        break;
      }
    }
    
    return appliedMigrations;
  }
  
  // 创建迁移脚本
  public async createMigration(name: string, sql: string): Promise<string> {
    try {
      // 确保迁移目录存在
      if (!fs.existsSync(this.config.migrationsDir)) {
        fs.mkdirSync(this.config.migrationsDir, { recursive: true });
      }
      
      // 创建迁移文件名，格式：timestamp_name.sql
      const timestamp = new Date().toISOString().replace(/[-:\.T]/g, '').slice(0, 14);
      const fileName = `${timestamp}_${name}.sql`;
      const filePath = path.join(this.config.migrationsDir, fileName);
      
      // 写入迁移脚本
      fs.writeFileSync(filePath, sql, 'utf8');
      
      if (this.config.logEnabled) {
        console.log(`已创建迁移脚本: ${fileName}`);
      }
      
      return fileName;
    } catch (error) {
      console.error('创建迁移脚本失败:', error);
      throw error;
    }
  }
} 