import { contextBridge, ipcRenderer } from 'electron';
import { IPCResponse } from '../common/types/ipc';
import { CONFIG_CHANNELS, APP_CHANNELS, DB_CHANNELS } from '../common/constants/ipc';

// 数据库API通道名称
// 注意：这些通道名需要和主进程中的DatabaseIpcHandler中定义的一致
const DB_API_CHANNELS = {
  // 数据库操作
  DB_INITIALIZE: 'db:initialize',
  DB_CREATE_BACKUP: 'db:create-backup',
  DB_RESTORE_BACKUP: 'db:restore-backup',
  DB_GET_BACKUP_FILES: 'db:get-backup-files',
  
  // Profile操作
  PROFILE_CREATE: 'profile:create',
  PROFILE_UPDATE: 'profile:update',
  PROFILE_GET_ALL: 'profile:get-all',
  PROFILE_GET_BY_ID: 'profile:get-by-id',
  PROFILE_DELETE: 'profile:delete',
  PROFILE_GET_RECENT: 'profile:get-recent',
  
  // Quote操作
  QUOTE_CREATE: 'quote:create',
  QUOTE_UPDATE: 'quote:update',
  QUOTE_GET_BY_PROFILE: 'quote:get-by-profile',
  QUOTE_DELETE: 'quote:delete',
  QUOTE_GET_RECENT: 'quote:get-recent',
  
  // Experience操作
  EXPERIENCE_CREATE: 'experience:create',
  EXPERIENCE_UPDATE: 'experience:update',
  EXPERIENCE_GET_BY_PROFILE: 'experience:get-by-profile',
  EXPERIENCE_DELETE: 'experience:delete',
  EXPERIENCE_GET_RECENT: 'experience:get-recent',
  
  // Analysis操作
  ANALYSIS_CREATE: 'analysis:create',
  ANALYSIS_UPDATE: 'analysis:update',
  ANALYSIS_GET_BY_PROFILE: 'analysis:get-by-profile',
  ANALYSIS_GET_RECENT: 'analysis:get-recent',
  ANALYSIS_GET_STATS: 'analysis:get-stats',
  
  // HexagonModel操作
  HEXAGON_CREATE: 'hexagon:create',
  HEXAGON_UPDATE: 'hexagon:update',
  HEXAGON_GET_BY_PROFILE: 'hexagon:get-by-profile',
  HEXAGON_GET_LATEST: 'hexagon:get-latest',
  HEXAGON_GET_RECENT: 'hexagon:get-recent',
  HEXAGON_GET_AVERAGE: 'hexagon:get-average',
  HEXAGON_COMPARE: 'hexagon:compare'
};

// 暴露给渲染进程的API
const electronAPI = {
  // 配置服务
  configService: {
    // 获取配置
    getConfig: async <T>(args: { key: string; defaultValue?: T }): Promise<IPCResponse<T>> => {
      return ipcRenderer.invoke(CONFIG_CHANNELS.GET_CONFIG, args);
    },
    
    // 设置配置
    setConfig: async <T>(args: { key: string; value: T }): Promise<IPCResponse<void>> => {
      return ipcRenderer.invoke(CONFIG_CHANNELS.SET_CONFIG, args);
    },
    
    // 获取所有配置
    getAllConfigs: async (): Promise<IPCResponse<Record<string, any>>> => {
      return ipcRenderer.invoke(CONFIG_CHANNELS.GET_ALL_CONFIGS);
    }
  },
  
  // 应用控制
  appControl: {
    // 最小化窗口
    minimize: (): void => {
      ipcRenderer.send(APP_CHANNELS.MINIMIZE);
    },
    
    // 最大化/还原窗口
    maximize: (): void => {
      ipcRenderer.send(APP_CHANNELS.MAXIMIZE);
    },
    
    // 关闭窗口
    close: (): void => {
      ipcRenderer.send(APP_CHANNELS.CLOSE);
    }
  },
  
  // 数据库服务（旧版本保留，建议使用下面的dbApi）
  dbService: {
    // 初始化数据库
    initialize: async (): Promise<IPCResponse<void>> => {
      return ipcRenderer.invoke(DB_CHANNELS.INITIALIZE);
    },
    
    // 执行SQL查询（已废弃）
    executeQuery: async <T>(args: { sql: string; params?: any[] }): Promise<IPCResponse<T[]>> => {
      return ipcRenderer.invoke(DB_CHANNELS.EXECUTE_QUERY, args);
    }
  },
  
  // 新版数据库API
  dbApi: {
    // 数据库管理API
    db: {
      initialize: async (config?: any): Promise<void> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.DB_INITIALIZE, config);
      },
      createBackup: async (): Promise<string> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.DB_CREATE_BACKUP);
      },
      restoreFromBackup: async (backupPath: string): Promise<void> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.DB_RESTORE_BACKUP, backupPath);
      },
      getBackupFiles: async (): Promise<Array<{ path: string; date: Date; size: number }>> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.DB_GET_BACKUP_FILES);
      }
    },
    
    // 个人档案API
    profile: {
      create: async (profile: any): Promise<any> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.PROFILE_CREATE, profile);
      },
      update: async (profile: any): Promise<boolean> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.PROFILE_UPDATE, profile);
      },
      getAll: async (): Promise<any[]> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.PROFILE_GET_ALL);
      },
      getById: async (id: number): Promise<any | null> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.PROFILE_GET_BY_ID, id);
      },
      delete: async (id: number): Promise<boolean> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.PROFILE_DELETE, id);
      },
      getRecent: async (limit: number): Promise<any[]> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.PROFILE_GET_RECENT, limit);
      }
    },
    
    // 引用API
    quote: {
      create: async (quote: any): Promise<any> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.QUOTE_CREATE, quote);
      },
      update: async (quote: any): Promise<boolean> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.QUOTE_UPDATE, quote);
      },
      getByProfileId: async (profileId: number): Promise<any[]> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.QUOTE_GET_BY_PROFILE, profileId);
      },
      delete: async (id: number): Promise<boolean> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.QUOTE_DELETE, id);
      },
      getRecent: async (limit: number): Promise<any[]> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.QUOTE_GET_RECENT, limit);
      }
    },
    
    // 经历API
    experience: {
      create: async (experience: any): Promise<any> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.EXPERIENCE_CREATE, experience);
      },
      update: async (experience: any): Promise<boolean> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.EXPERIENCE_UPDATE, experience);
      },
      getByProfileId: async (profileId: number): Promise<any[]> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.EXPERIENCE_GET_BY_PROFILE, profileId);
      },
      delete: async (id: number): Promise<boolean> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.EXPERIENCE_DELETE, id);
      },
      getRecent: async (limit: number): Promise<any[]> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.EXPERIENCE_GET_RECENT, limit);
      }
    },
    
    // 分析API
    analysis: {
      create: async (analysis: any): Promise<any> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.ANALYSIS_CREATE, analysis);
      },
      update: async (analysis: any): Promise<boolean> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.ANALYSIS_UPDATE, analysis);
      },
      getByProfileId: async (profileId: number): Promise<any[]> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.ANALYSIS_GET_BY_PROFILE, profileId);
      },
      getRecent: async (limit: number): Promise<any[]> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.ANALYSIS_GET_RECENT, limit);
      },
      getStats: async (): Promise<{ type: string; count: number }[]> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.ANALYSIS_GET_STATS);
      }
    },
    
    // 六边形模型API
    hexagonModel: {
      create: async (model: any): Promise<any> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.HEXAGON_CREATE, model);
      },
      update: async (model: any): Promise<boolean> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.HEXAGON_UPDATE, model);
      },
      getByProfileId: async (profileId: number): Promise<any[]> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.HEXAGON_GET_BY_PROFILE, profileId);
      },
      getLatest: async (profileId: number): Promise<any | null> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.HEXAGON_GET_LATEST, profileId);
      },
      getRecent: async (limit: number): Promise<any[]> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.HEXAGON_GET_RECENT, limit);
      },
      getAverage: async (): Promise<{ [key: string]: number }> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.HEXAGON_GET_AVERAGE);
      },
      compare: async (id1: number, id2: number): Promise<{ 
        differences: { [key: string]: { value1: number; value2: number; difference: number } };
        timeGap: number;
      }> => {
        return ipcRenderer.invoke(DB_API_CHANNELS.HEXAGON_COMPARE, id1, id2);
      }
    }
  },
  
  // 版本信息
  getAppVersion: (): string => {
    return process.env.APP_VERSION || '0.1.0';
  }
};

// 安全地暴露API给渲染进程
contextBridge.exposeInMainWorld('electron', electronAPI);

// 初始化加载时通知
console.log('预加载脚本已加载'); 