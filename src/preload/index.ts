import { contextBridge, ipcRenderer } from 'electron';
import path from 'path';
import fs from 'fs';
import { CONFIG_CHANNELS, APP_CHANNELS, DB_CHANNELS } from '../common/constants/ipc';

console.log('预加载脚本开始执行');

// 类型定义
interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 数据库API通道名称
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

// 通用IPC调用函数
async function invokeIPC<T>(channel: string, ...args: any[]): Promise<IPCResponse<T>> {
  try {
    console.log(`调用IPC: ${channel}`, args);
    const response = await ipcRenderer.invoke(channel, ...args);
    console.log(`IPC响应: ${channel}`, response);
    return response;
  } catch (error: any) {
    console.error(`IPC调用错误 [${channel}]:`, error);
    return {
      success: false,
      error: error.message || '未知错误'
    };
  }
}

// 为渲染进程提供的API
const electronAPI = {
  send: (channel: string, data?: any) => {
    console.log(`发送IPC消息: ${channel}`, data);
    ipcRenderer.send(channel, data);
  },

  invoke: async <T = any>(channel: string, data?: any): Promise<IPCResponse<T>> => {
    return invokeIPC<T>(channel, data);
  },

  receive: (channel: string, func: (...args: any[]) => void) => {
    console.log(`注册IPC监听器: ${channel}`);
    ipcRenderer.on(channel, (event, ...args) => func(...args));
    return () => {
      console.log(`移除IPC监听器: ${channel}`);
      ipcRenderer.removeListener(channel, func);
    };
  },

  // 添加移除指定监听器的方法
  removeListener: (channel: string, listener?: Function) => {
    console.log(`移除IPC监听器: ${channel}`);
    if (listener) {
      ipcRenderer.removeListener(channel, listener as any);
    }
  },

  // 添加移除所有监听器的方法
  removeAllListeners: (channel: string) => {
    console.log(`移除所有IPC监听器: ${channel}`);
    ipcRenderer.removeAllListeners(channel);
  }
};

// 导出IPC常量供前端使用
const ipcConstants = {
  CONFIG_CHANNELS,
  APP_CHANNELS,
  DB_CHANNELS
};

// 暴露给渲染进程的API
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
contextBridge.exposeInMainWorld('IPC_CONSTANTS', ipcConstants);

console.log('预加载脚本已完成，所有API已暴露给渲染进程'); 