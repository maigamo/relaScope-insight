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
        console.error(`获取个人信息列表失败: ${error.message}`);
        return { 
          success: false, 
          error: `获取个人信息列表失败: ${error.message}` 
        } as IPCResponse;
      }
    });

    // 根据ID获取个人信息
    ipcMain.handle(DB_CHANNELS.PROFILE.GET_BY_ID, async (_, id: number) => {
      try {
        const profile = await this.dbService.getProfileDAO().findById(id);
        return { success: true, data: profile } as IPCResponse;
      } catch (error: any) {
        console.error(`获取ID为${id}的个人信息失败: ${error.message}`);
        return { 
          success: false, 
          error: `获取个人信息详情失败: ${error.message}` 
        } as IPCResponse;
      }
    });

    // 创建个人信息
    ipcMain.handle(DB_CHANNELS.PROFILE.CREATE, async (_, profile: any) => {
      try {
        const newProfile = await this.dbService.getProfileDAO().create(profile);
        return { success: true, data: newProfile } as IPCResponse;
      } catch (error: any) {
        console.error(`创建个人信息失败: ${error.message}`);
        return { 
          success: false, 
          error: `创建个人信息失败: ${error.message}` 
        } as IPCResponse;
      }
    });

    // 更新个人信息
    ipcMain.handle(DB_CHANNELS.PROFILE.UPDATE, async (_, params: { id: number, profile: any }) => {
      try {
        const { id, profile } = params;
        const success = await this.dbService.getProfileDAO().update(id, profile);
        return { success: true, data: success } as IPCResponse;
      } catch (error: any) {
        console.error(`更新个人信息失败: ${error.message}`);
        return { 
          success: false, 
          error: `更新个人信息失败: ${error.message}` 
        } as IPCResponse;
      }
    });

    // 删除个人信息
    ipcMain.handle(DB_CHANNELS.PROFILE.DELETE, async (_, id: number) => {
      try {
        const success = await this.dbService.getProfileDAO().delete(id);
        return { success: true, data: success } as IPCResponse;
      } catch (error: any) {
        console.error(`删除个人信息失败: ${error.message}`);
        return { 
          success: false, 
          error: `删除个人信息失败: ${error.message}` 
        } as IPCResponse;
      }
    });

    // 搜索个人信息
    ipcMain.handle('db:profile:search', async (_, keyword: string) => {
      try {
        const profiles = await this.dbService.getProfileDAO().search(keyword);
        return { success: true, data: profiles } as IPCResponse;
      } catch (error: any) {
        console.error(`搜索个人信息失败: ${error.message}`);
        return { 
          success: false, 
          error: `搜索个人信息失败: ${error.message}` 
        } as IPCResponse;
      }
    });

    // 获取最近创建的个人信息
    ipcMain.handle('db:profile:getRecent', async (_, limit: number = 5) => {
      try {
        const profiles = await this.dbService.getProfileDAO().getRecent(limit);
        return { success: true, data: profiles } as IPCResponse;
      } catch (error: any) {
        console.error(`获取最近个人信息失败: ${error.message}`);
        return { 
          success: false, 
          error: `获取最近个人信息失败: ${error.message}` 
        } as IPCResponse;
      }
    });
  }

  /**
   * 注册引用相关处理函数
   */
  private registerQuoteHandlers(): void {
    // 获取全部引用
    ipcMain.handle(DB_CHANNELS.QUOTE.GET_ALL, async () => {
      try {
        const quotes = await this.dbService.getQuoteDAO().findAll();
        return { success: true, data: quotes } as IPCResponse;
      } catch (error: any) {
        console.error(`获取引用列表失败: ${error.message}`);
        return { success: false, error: `获取引用列表失败: ${error.message}` } as IPCResponse;
      }
    });

    // 根据ID获取引用
    ipcMain.handle(DB_CHANNELS.QUOTE.GET_BY_ID, async (_, id: number) => {
      try {
        const quote = await this.dbService.getQuoteDAO().findById(id);
        return { success: true, data: quote } as IPCResponse;
      } catch (error: any) {
        console.error(`获取ID为${id}的引用失败: ${error.message}`);
        return { success: false, error: `获取引用详情失败: ${error.message}` } as IPCResponse;
      }
    });

    // 创建引用
    ipcMain.handle(DB_CHANNELS.QUOTE.CREATE, async (_, quote: any) => {
      try {
        const newQuote = await this.dbService.getQuoteDAO().create(quote);
        return { success: true, data: newQuote } as IPCResponse;
      } catch (error: any) {
        console.error(`创建引用失败: ${error.message}`);
        return { success: false, error: `创建引用失败: ${error.message}` } as IPCResponse;
      }
    });

    // 更新引用
    ipcMain.handle(DB_CHANNELS.QUOTE.UPDATE, async (_, params: { id: number, quote: any }) => {
      try {
        const { id, quote } = params;
        const success = await this.dbService.getQuoteDAO().update(id, quote);
        return { success: true, data: success } as IPCResponse;
      } catch (error: any) {
        console.error(`更新引用失败: ${error.message}`);
        return { success: false, error: `更新引用失败: ${error.message}` } as IPCResponse;
      }
    });

    // 删除引用
    ipcMain.handle(DB_CHANNELS.QUOTE.DELETE, async (_, id: number) => {
      try {
        const success = await this.dbService.getQuoteDAO().delete(id);
        return { success: true, data: success } as IPCResponse;
      } catch (error: any) {
        console.error(`删除引用失败: ${error.message}`);
        return { success: false, error: `删除引用失败: ${error.message}` } as IPCResponse;
      }
    });

    // 按profileId获取引用
    ipcMain.handle(DB_CHANNELS.QUOTE.GET_BY_PROFILE, async (_, profileId: number) => {
      try {
        const quotes = await this.dbService.getQuoteDAO().findByProfileId(profileId);
        return { success: true, data: quotes } as IPCResponse;
      } catch (error: any) {
        console.error(`获取个人档案ID为${profileId}的引用失败: ${error.message}`);
        return { success: false, error: `获取个人档案引用失败: ${error.message}` } as IPCResponse;
      }
    });

    // 搜索引用
    ipcMain.handle(DB_CHANNELS.QUOTE.SEARCH, async (_, keyword: string) => {
      try {
        const quotes = await this.dbService.getQuoteDAO().search(keyword);
        return { success: true, data: quotes } as IPCResponse;
      } catch (error: any) {
        console.error(`搜索引用失败: ${error.message}`);
        return { success: false, error: `搜索引用失败: ${error.message}` } as IPCResponse;
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