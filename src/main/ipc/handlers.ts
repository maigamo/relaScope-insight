import { ipcMain, BrowserWindow } from 'electron';
import { IPCResponse } from '../../common/types/ipc';
import { 
  CONFIG_CHANNELS, 
  APP_CHANNELS,
  DB_CHANNELS
} from '../../common/constants/ipc';
import { configService } from '../services/config';
import { DatabaseService } from '../services/database/DatabaseService';
import { DatabaseIpcHandler } from '../services/database/DatabaseIpcHandler';
import { setupDatabaseHandlers as setupDbHandlers } from './database.handlers';
import { setupLLMHandlers } from './llm.handlers';

/**
 * 配置IPC通信处理器
 */
export function setupIPCHandlers() {
  // 配置相关处理器
  ipcMain.handle(CONFIG_CHANNELS.GET_CONFIG, 
    async (_, { key, defaultValue }) => {
    try {
      // 从key中解析出配置类型和具体的键
      // 格式为: type.key, 例如: app.language
      const [type, actualKey] = key.split('.');
      if (!type || !actualKey) {
        throw new Error(`无效的配置键: ${key}, 格式应为: type.key`);
      }
      
      const value = configService.get(type, actualKey, defaultValue);
      return { success: true, data: value } as IPCResponse;
    } catch (error: any) {
      console.error(`获取配置失败: ${error.message}`);
      return { 
        success: false, 
        error: `获取配置失败: ${error.message}` 
      } as IPCResponse;
    }
  });
  
  ipcMain.handle(CONFIG_CHANNELS.SET_CONFIG, 
    async (_, { key, value }) => {
    try {
      // 从key中解析出配置类型和具体的键
      const [type, actualKey] = key.split('.');
      if (!type || !actualKey) {
        throw new Error(`无效的配置键: ${key}, 格式应为: type.key`);
      }
      
      const success = configService.set(type, actualKey, value);
      return { success } as IPCResponse;
    } catch (error: any) {
      console.error(`设置配置失败: ${error.message}`);
      return { 
        success: false, 
        error: `设置配置失败: ${error.message}` 
      } as IPCResponse;
    }
  });

  ipcMain.handle(CONFIG_CHANNELS.GET_ALL_CONFIGS, async () => {
    try {
      const configs = configService.getAllConfigs();
      return { success: true, data: configs } as IPCResponse;
    } catch (error: any) {
      console.error(`获取所有配置失败: ${error.message}`);
      return { 
        success: false, 
        error: `获取所有配置失败: ${error.message}` 
      } as IPCResponse;
    }
  });

  // 应用控制相关处理器
  ipcMain.on(APP_CHANNELS.MINIMIZE, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.minimize();
    }
  });

  ipcMain.on(APP_CHANNELS.MAXIMIZE, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
    }
  });

  ipcMain.on(APP_CHANNELS.CLOSE, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.close();
    }
  });

  // 数据库相关处理器
  // 使用全新的DatabaseIpcHandler替代旧的处理方式
  setupDbHandlers();
  setupLLMHandlers();
}

/**
 * 配置数据库相关处理器
 */
function setupDatabaseHandlers() {
  // 保留旧的处理器以兼容旧代码
  ipcMain.handle(DB_CHANNELS.INITIALIZE, async () => {
    try {
      // 初始化数据库服务
      const dbService = DatabaseService.getInstance();
      await dbService.initialize();
      return { success: true } as IPCResponse;
    } catch (error: any) {
      console.error(`初始化数据库失败: ${error.message}`);
      return { 
        success: false, 
        error: `初始化数据库失败: ${error.message}` 
      } as IPCResponse;
    }
  });

  ipcMain.handle(DB_CHANNELS.EXECUTE_QUERY, 
    async (_, { sql, params }) => {
    try {
      console.log(`执行SQL已被弃用，请使用新的数据库API: ${sql}`);
      return { 
        success: false, 
        error: '此方法已被弃用，请使用新的数据库API' 
      } as IPCResponse;
    } catch (error: any) {
      console.error(`执行SQL失败: ${error.message}`);
      return { 
        success: false, 
        error: `执行SQL失败: ${error.message}` 
      } as IPCResponse;
    }
  });
  
  // 注册新的数据库IPC处理器，使用专用的处理类
  const databaseIpcHandler = DatabaseIpcHandler.getInstance();
  databaseIpcHandler.registerHandlers();
} 