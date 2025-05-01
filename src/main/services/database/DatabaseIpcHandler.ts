import { ipcMain } from 'electron';
import { IPCResponse } from '../../../common/types/ipc';
import { DB_CHANNELS } from '../../../common/constants/ipc';
import { DatabaseService } from './DatabaseService';

/**
 * 数据库IPC处理器类
 * 负责注册所有数据库相关的IPC处理函数
 */
export class DatabaseIpcHandler {
  private static instance: DatabaseIpcHandler | null = null;
  private dbService: DatabaseService;

  private constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  /**
   * 获取DatabaseIpcHandler单例
   */
  public static getInstance(): DatabaseIpcHandler {
    if (!DatabaseIpcHandler.instance) {
      DatabaseIpcHandler.instance = new DatabaseIpcHandler();
    }
    return DatabaseIpcHandler.instance;
  }

  /**
   * 注册所有数据库相关的IPC处理函数
   */
  public registerHandlers(): void {
    console.log('注册数据库IPC处理器...');
    
    // 注册配置文件处理函数
    this.registerProfileHandlers();
    
    // 注册引用处理函数
    this.registerQuoteHandlers();
    
    // 注册经验处理函数
    this.registerExperienceHandlers();
    
    // 注册分析处理函数
    this.registerAnalysisHandlers();
    
    // 注册六边形模型处理函数
    this.registerHexagonModelHandlers();
    
    console.log('数据库IPC处理器注册完成');
  }

  /**
   * 注册配置文件相关处理函数
   */
  private registerProfileHandlers(): void {
    // 获取配置文件列表
    ipcMain.handle(DB_CHANNELS.PROFILE.GET_ALL, async () => {
      try {
        const profiles = await this.dbService.getProfileDAO().findAll();
        return { success: true, data: profiles } as IPCResponse;
      } catch (error: any) {
        console.error(`获取配置文件列表失败: ${error.message}`);
        return { 
          success: false, 
          error: `获取配置文件列表失败: ${error.message}` 
        } as IPCResponse;
      }
    });
  }

  /**
   * 注册引用相关处理函数
   */
  private registerQuoteHandlers(): void {
    // 示例：获取引用列表
    ipcMain.handle(DB_CHANNELS.QUOTE.GET_ALL, async () => {
      try {
        const quotes = await this.dbService.getQuoteDAO().findAll();
        return { success: true, data: quotes } as IPCResponse;
      } catch (error: any) {
        console.error(`获取引用列表失败: ${error.message}`);
        return { 
          success: false, 
          error: `获取引用列表失败: ${error.message}` 
        } as IPCResponse;
      }
    });
  }

  /**
   * 注册经验相关处理函数
   */
  private registerExperienceHandlers(): void {
    // 此处添加经验相关处理函数
  }

  /**
   * 注册分析相关处理函数
   */
  private registerAnalysisHandlers(): void {
    // 此处添加分析相关处理函数
  }

  /**
   * 注册六边形模型相关处理函数
   */
  private registerHexagonModelHandlers(): void {
    // 此处添加六边形模型相关处理函数
  }
} 