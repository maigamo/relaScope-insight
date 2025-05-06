import { app } from 'electron';
import { DatabaseManager } from './DatabaseManager';
import { DatabaseConfig } from './DatabaseConfig';
import { ProfileDAO } from './dao/ProfileDAO';
import { ProfileDAOImpl } from './dao/ProfileDAOImpl';
import { QuoteDAO } from './dao/QuoteDAO';
import { QuoteDAOImpl } from './dao/QuoteDAOImpl';
import { ExperienceDAO } from './dao/ExperienceDAO';
import { HexagonModelDAO } from './dao/HexagonModelDAO';
import { AnalysisDAO } from './dao/AnalysisDAO';
import { EnterpriseDAOImpl } from './dao/EnterpriseDAOImpl';
import { UserDAOImpl } from './dao/UserDAOImpl';
import { ProjectDAOImpl } from './dao/ProjectDAOImpl';
import { ProjectMemberDAOImpl } from './dao/ProjectMemberDAOImpl';

/**
 * 数据库服务类
 * 负责初始化数据库，提供DAO实例，管理数据库连接和备份
 */
export class DatabaseService {
  private dbManager: DatabaseManager;
  private profileDAO: ProfileDAO | null = null;
  private quoteDAO: QuoteDAO | null = null;
  private experienceDAO: ExperienceDAO | null = null;
  private analysisDAO: AnalysisDAO | null = null;
  private hexagonModelDAO: HexagonModelDAO | null = null;
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
      
      // 初始化完成后创建DAO实例
      this.profileDAO = ProfileDAOImpl.getInstance();
      this.quoteDAO = QuoteDAOImpl.getInstance();
      this.experienceDAO = new ExperienceDAO();
      this.analysisDAO = new AnalysisDAO();
      this.hexagonModelDAO = new HexagonModelDAO();
      
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

  // 备份数据库
  public async backup(): Promise<string> {
    try {
      if (!this.dbManager) {
        throw new Error('数据库服务未初始化');
      }

      return this.dbManager.backup();
    } catch (error) {
      console.error('备份数据库失败:', error);
      throw error;
    }
  }

  // 从备份恢复数据库
  public async restore(backupPath: string): Promise<void> {
    try {
      if (!this.dbManager) {
        throw new Error('数据库服务未初始化');
      }

      await this.dbManager.restore(backupPath);
    } catch (error) {
      console.error('从备份恢复数据库失败:', error);
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
    if (!this.isInitialized || !this.profileDAO) {
      throw new Error('数据库服务未初始化，请先调用initialize()');
    }
    return this.profileDAO;
  }

  public getQuoteDAO(): QuoteDAO {
    if (!this.isInitialized || !this.quoteDAO) {
      throw new Error('数据库服务未初始化，请先调用initialize()');
    }
    return this.quoteDAO;
  }

  public getExperienceDAO(): ExperienceDAO {
    if (!this.isInitialized || !this.experienceDAO) {
      throw new Error('数据库服务未初始化，请先调用initialize()');
    }
    return this.experienceDAO;
  }

  public getAnalysisDAO(): AnalysisDAO {
    if (!this.isInitialized || !this.analysisDAO) {
      throw new Error('数据库服务未初始化，请先调用initialize()');
    }
    return this.analysisDAO;
  }

  public getHexagonModelDAO(): HexagonModelDAO {
    if (!this.isInitialized || !this.hexagonModelDAO) {
      throw new Error('数据库服务未初始化，请先调用initialize()');
    }
    return this.hexagonModelDAO;
  }
} 