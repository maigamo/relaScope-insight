import { contextBridge, ipcRenderer } from 'electron';
import { IPCResponse } from '../common/types/ipc';
import { CONFIG_CHANNELS, APP_CHANNELS, DB_CHANNELS } from '../common/constants/ipc';

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
  
  // 数据库服务
  dbService: {
    // 初始化数据库
    initialize: async (): Promise<IPCResponse<void>> => {
      return ipcRenderer.invoke(DB_CHANNELS.INITIALIZE);
    },
    
    // 执行SQL查询
    executeQuery: async <T>(args: { sql: string; params?: any[] }): Promise<IPCResponse<T[]>> => {
      return ipcRenderer.invoke(DB_CHANNELS.EXECUTE_QUERY, args);
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