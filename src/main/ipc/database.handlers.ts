import { ipcMain } from 'electron';
import { DatabaseService } from '../services/database/DatabaseService';
import { DatabaseIpcHandler } from '../services/database/DatabaseIpcHandler';

/**
 * 注册与数据库相关的IPC处理程序
 */
export function setupDatabaseHandlers() {
  // 注册新的数据库IPC处理器，使用专用的处理类
  const databaseIpcHandler = DatabaseIpcHandler.getInstance();
  databaseIpcHandler.registerHandlers();
  console.log('数据库IPC处理程序已注册');
} 