import { ipcMain, BrowserWindow } from 'electron';
import { IPCResponse } from '../../common/types/ipc';
import { 
  CONFIG_CHANNELS, 
  APP_CHANNELS,
  DB_CHANNELS
} from '../../common/constants/ipc';
import { configService } from '../services/config';

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
  ipcMain.handle(DB_CHANNELS.INITIALIZE, async () => {
    try {
      // TODO: 实际的数据库初始化逻辑将在数据库服务中实现
      console.log('初始化数据库');
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
      // TODO: 实际的数据库查询逻辑将在数据库服务中实现
      console.log(`执行SQL: ${sql}, 参数: ${JSON.stringify(params)}`);
      return { success: true, data: [] } as IPCResponse;
    } catch (error: any) {
      console.error(`执行SQL失败: ${error.message}`);
      return { 
        success: false, 
        error: `执行SQL失败: ${error.message}` 
      } as IPCResponse;
    }
  });
} 