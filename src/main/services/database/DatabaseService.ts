import { app } from 'electron';
import { DatabaseManager } from './DatabaseManager';
import { DatabaseConfig } from './DatabaseConfig';
import { ProfileDAO } from './dao/ProfileDAO';
import { QuoteDAO } from './dao/QuoteDAO';
import { ExperienceDAO } from './dao/ExperienceDAO';
import { AnalysisDAO } from './dao/AnalysisDAO';
import { HexagonModelDAO } from './dao/HexagonModelDAO';

/**
 * 数据库服务类
 * 负责初始化数据库，提供DAO实例，管理数据库连接和备份
 */
export class DatabaseService {
  private dbManager: DatabaseManager;
  private profileDAO: ProfileDAO;
  private quoteDAO: QuoteDAO;
  private experienceDAO: ExperienceDAO;
  private analysisDAO: AnalysisDAO;
  private hexagonModelDAO: HexagonModelDAO;
  private isInitialized: boolean = false;
  private static instance: DatabaseService | null = null;

  // 获取单例实例
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private constructor() {
    // 获取数据库管理器实例
    this.dbManager = DatabaseManager.getInstance();
    
    // 创建各DAO
    this.profileDAO = new ProfileDAO();
    this.quoteDAO = new QuoteDAO();
    this.experienceDAO = new ExperienceDAO();
    this.analysisDAO = new AnalysisDAO();
    this.hexagonModelDAO = new HexagonModelDAO();
    
    // 注册应用退出事件
    app.on('before-quit', async () => {
      console.log('应用将要退出，关闭数据库连接...');
      await this.close();
    });
  }

  // 初始化数据库服务
  public async initialize(config?: Partial<DatabaseConfig>): Promise<void> {
    if (this.isInitialized) {
      console.log('数据库服务已经初始化');
      return;
    }

    try {
      console.log('初始化数据库服务...');
      
      // 更新配置（如果提供）
      if (config) {
        this.dbManager.updateConfig(config);
      }
      
      // 初始化数据库
      await this.dbManager.initialize();
      
      this.isInitialized = true;
      console.log('数据库服务初始化成功');
    } catch (error) {
      console.error('初始化数据库服务时出错:', error);
      throw error;
    }
  }

  // 关闭数据库连接
  public async close(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }
    
    try {
      await this.dbManager.close();
      this.isInitialized = false;
      console.log('数据库服务已关闭');
    } catch (error) {
      console.error('关闭数据库服务时出错:', error);
      throw error;
    }
  }

  // 创建数据库备份
  public async createBackup(): Promise<string> {
    try {
      return await this.dbManager.createBackup();
    } catch (error) {
      console.error('创建数据库备份时出错:', error);
      throw error;
    }
  }

  // 恢复数据库备份
  public async restoreFromBackup(backupPath: string): Promise<void> {
    try {
      await this.dbManager.restoreFromBackup(backupPath);
    } catch (error) {
      console.error('恢复数据库备份时出错:', error);
      throw error;
    }
  }

  // 获取备份文件列表
  public async getBackupFiles(): Promise<Array<{ path: string, date: Date, size: number }>> {
    try {
      return await this.dbManager.getBackupFiles();
    } catch (error) {
      console.error('获取备份文件列表时出错:', error);
      throw error;
    }
  }

  // 获取DAO实例
  public getProfileDAO(): ProfileDAO {
    return this.profileDAO;
  }

  public getQuoteDAO(): QuoteDAO {
    return this.quoteDAO;
  }

  public getExperienceDAO(): ExperienceDAO {
    return this.experienceDAO;
  }

  public getAnalysisDAO(): AnalysisDAO {
    return this.analysisDAO;
  }

  public getHexagonModelDAO(): HexagonModelDAO {
    return this.hexagonModelDAO;
  }
} 