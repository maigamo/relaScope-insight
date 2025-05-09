import { ipcMain } from 'electron';
import { IPCResponse } from '../../../common/types/ipc';
import { DatabaseService } from './DatabaseService';

// 使用最新的DB_CHANNELS定义，从renderer中导入以确保一致性
import { DB_CHANNELS } from '../../../renderer/services/ipc/channels';

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
    // 获取全部经历
    ipcMain.handle(DB_CHANNELS.EXPERIENCE.GET_ALL, async () => {
      try {
        const experiences = await this.dbService.getExperienceDAO().findAll();
        return { success: true, data: experiences } as IPCResponse;
      } catch (error: any) {
        console.error(`获取经历列表失败: ${error.message}`);
        return { success: false, error: `获取经历列表失败: ${error.message}` } as IPCResponse;
      }
    });

    // 根据ID获取经历
    ipcMain.handle(DB_CHANNELS.EXPERIENCE.GET_BY_ID, async (_, id: number) => {
      try {
        const experience = await this.dbService.getExperienceDAO().findById(id);
        return { success: true, data: experience } as IPCResponse;
      } catch (error: any) {
        console.error(`获取ID为${id}的经历失败: ${error.message}`);
        return { success: false, error: `获取经历详情失败: ${error.message}` } as IPCResponse;
      }
    });

    // 创建经历
    ipcMain.handle(DB_CHANNELS.EXPERIENCE.CREATE, async (_, experience: any) => {
      try {
        const newExperience = await this.dbService.getExperienceDAO().create(experience);
        return { success: true, data: newExperience } as IPCResponse;
      } catch (error: any) {
        console.error(`创建经历失败: ${error.message}`);
        return { success: false, error: `创建经历失败: ${error.message}` } as IPCResponse;
      }
    });

    // 更新经历
    ipcMain.handle(DB_CHANNELS.EXPERIENCE.UPDATE, async (_, params: { id: number, experience: any }) => {
      try {
        const { id, experience } = params;
        const success = await this.dbService.getExperienceDAO().update(id, experience);
        return { success: true, data: success } as IPCResponse;
      } catch (error: any) {
        console.error(`更新经历失败: ${error.message}`);
        return { success: false, error: `更新经历失败: ${error.message}` } as IPCResponse;
      }
    });

    // 删除经历
    ipcMain.handle(DB_CHANNELS.EXPERIENCE.DELETE, async (_, id: number) => {
      try {
        const success = await this.dbService.getExperienceDAO().delete(id);
        return { success: true, data: success } as IPCResponse;
      } catch (error: any) {
        console.error(`删除经历失败: ${error.message}`);
        return { success: false, error: `删除经历失败: ${error.message}` } as IPCResponse;
      }
    });

    // 按profileId获取经历
    ipcMain.handle(DB_CHANNELS.EXPERIENCE.GET_BY_PROFILE, async (_, profileId: number) => {
      try {
        const experiences = await this.dbService.getExperienceDAO().findByProfileId(profileId);
        return { success: true, data: experiences } as IPCResponse;
      } catch (error: any) {
        console.error(`获取个人档案ID为${profileId}的经历失败: ${error.message}`);
        return { success: false, error: `获取个人档案经历失败: ${error.message}` } as IPCResponse;
      }
    });

    // 获取经历时间轴
    ipcMain.handle(DB_CHANNELS.EXPERIENCE.GET_TIMELINE, async (_, profileId: number) => {
      try {
        const timeline = await this.dbService.getExperienceDAO().getTimelineByProfileId(profileId);
        return { success: true, data: timeline } as IPCResponse;
      } catch (error: any) {
        console.error(`获取个人档案ID为${profileId}的经历时间轴失败: ${error.message}`);
        return { success: false, error: `获取经历时间轴失败: ${error.message}` } as IPCResponse;
      }
    });

    // 按标签搜索经历
    ipcMain.handle(DB_CHANNELS.EXPERIENCE.FIND_BY_TAG, async (_, params: { tag: string, profileId?: number }) => {
      try {
        const { tag, profileId } = params;
        const experiences = await this.dbService.getExperienceDAO().findByTag(tag, profileId);
        return { success: true, data: experiences } as IPCResponse;
      } catch (error: any) {
        console.error(`按标签搜索经历失败: ${error.message}`);
        return { success: false, error: `按标签搜索经历失败: ${error.message}` } as IPCResponse;
      }
    });

    // 获取最近创建的经历
    ipcMain.handle(DB_CHANNELS.EXPERIENCE.GET_RECENT, async (_, limit: number = 5) => {
      try {
        const experiences = await this.dbService.getExperienceDAO().getRecent(limit);
        return { success: true, data: experiences } as IPCResponse;
      } catch (error: any) {
        console.error(`获取最近经历失败: ${error.message}`);
        return { success: false, error: `获取最近经历失败: ${error.message}` } as IPCResponse;
      }
    });
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
    // 获取所有六边形模型
    ipcMain.handle('db:hexagon:get-all', async () => {
      try {
        const models = await this.dbService.getHexagonModelDAO().findAll();
        return { success: true, data: models } as IPCResponse;
      } catch (error: any) {
        console.error(`获取六边形模型列表失败: ${error.message}`);
        return { success: false, error: `获取六边形模型列表失败: ${error.message}` } as IPCResponse;
      }
    });

    // 根据ID获取六边形模型
    ipcMain.handle('db:hexagon:get-by-id', async (_, { id }: { id: number }) => {
      try {
        const model = await this.dbService.getHexagonModelDAO().findById(id);
        return { success: true, data: model } as IPCResponse;
      } catch (error: any) {
        console.error(`获取ID为${id}的六边形模型失败: ${error.message}`);
        return { success: false, error: `获取六边形模型详情失败: ${error.message}` } as IPCResponse;
      }
    });

    // 根据档案ID获取六边形模型
    ipcMain.handle('db:hexagon:get-by-profile', async (_, { profileId }: { profileId: number }) => {
      try {
        const models = await this.dbService.getHexagonModelDAO().findByProfileId(profileId);
        return { success: true, data: models } as IPCResponse;
      } catch (error: any) {
        console.error(`获取档案ID为${profileId}的六边形模型失败: ${error.message}`);
        return { success: false, error: `获取档案的六边形模型失败: ${error.message}` } as IPCResponse;
      }
    });

    // 创建六边形模型
    ipcMain.handle('db:hexagon:create', async (_, model: any) => {
      try {
        const newModel = await this.dbService.getHexagonModelDAO().create(model);
        return { success: true, data: newModel } as IPCResponse;
      } catch (error: any) {
        console.error(`创建六边形模型失败: ${error.message}`);
        return { success: false, error: `创建六边形模型失败: ${error.message}` } as IPCResponse;
      }
    });

    // 更新六边形模型
    ipcMain.handle('db:hexagon:update', async (_, model: any) => {
      try {
        const success = await this.dbService.getHexagonModelDAO().update(model.id, model);
        return { success: true, data: success } as IPCResponse;
      } catch (error: any) {
        console.error(`更新六边形模型失败: ${error.message}`);
        return { success: false, error: `更新六边形模型失败: ${error.message}` } as IPCResponse;
      }
    });

    // 删除六边形模型
    ipcMain.handle('db:hexagon:delete', async (_, { id }: { id: number }) => {
      try {
        const success = await this.dbService.getHexagonModelDAO().delete(id);
        return { success: true, data: success } as IPCResponse;
      } catch (error: any) {
        console.error(`删除六边形模型失败: ${error.message}`);
        return { success: false, error: `删除六边形模型失败: ${error.message}` } as IPCResponse;
      }
    });
  }

  // 以下是为了保持API兼容性，直接调用注册的处理函数
  public getAllHexagonModels() {
    return this.dbService.getHexagonModelDAO().findAll();
  }

  public getHexagonModelById(id: number) {
    return this.dbService.getHexagonModelDAO().findById(id);
  }

  public getHexagonModelsByProfileId(profileId: number) {
    return this.dbService.getHexagonModelDAO().findByProfileId(profileId);
  }

  public createHexagonModel(model: any) {
    return this.dbService.getHexagonModelDAO().create(model);
  }

  public updateHexagonModel(model: any) {
    return this.dbService.getHexagonModelDAO().update(model.id, model);
  }

  public deleteHexagonModel(id: number) {
    return this.dbService.getHexagonModelDAO().delete(id);
  }
} 