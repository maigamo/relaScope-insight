import { DatabaseConfig } from '../../../common/types/database';
import { DBQueryRequest } from '../../../common/types/ipc';
import { ipcService } from './core';
import { DB_CHANNELS } from './channels';

/**
 * 数据库服务 - 用于执行数据库基础操作
 */
export const DatabaseService = {
  /**
   * 初始化数据库
   * @param config 可选的数据库配置
   */
  async initialize(config?: Partial<DatabaseConfig>): Promise<boolean> {
    try {
      return await ipcService.invoke(DB_CHANNELS.INITIALIZE, config);
    } catch (error) {
      console.error('初始化数据库失败:', error);
      return false;
    }
  },
  
  /**
   * 执行SQL查询
   * @param sql SQL语句
   * @param params 参数
   */
  async executeQuery<T = any>(sql: string, params?: any[]): Promise<T[]> {
    try {
      // 直接使用预加载脚本注入的window.electron，如果存在
      if (window.electron?.dbQuery) {
        return await window.electron.dbQuery<T>(sql, params);
      }
      
      const request: DBQueryRequest = { sql, params };
      return await ipcService.invoke<T[]>(DB_CHANNELS.EXECUTE_QUERY, request);
    } catch (error) {
      console.error('执行SQL查询失败:', error);
      return [];
    }
  },
  
  /**
   * 执行数据库事务
   * @param queries SQL语句数组
   * @param paramsArray 参数数组
   */
  async transaction(queries: string[], paramsArray: any[][]): Promise<boolean> {
    try {
      // 直接使用预加载脚本注入的window.electron，如果存在
      if (window.electron?.dbTransaction) {
        return await window.electron.dbTransaction(queries, paramsArray);
      }
      
      return await ipcService.invoke('db:transaction', { queries, paramsArray });
    } catch (error) {
      console.error('执行事务失败:', error);
      return false;
    }
  },
  
  /**
   * 创建数据库备份
   */
  async createBackup(): Promise<string> {
    try {
      return await ipcService.invoke(DB_CHANNELS.CREATE_BACKUP);
    } catch (error) {
      console.error('创建备份失败:', error);
      throw error;
    }
  },
  
  /**
   * 从备份恢复数据库
   * @param backupPath 备份文件路径
   */
  async restoreFromBackup(backupPath: string): Promise<boolean> {
    try {
      return await ipcService.invoke(DB_CHANNELS.RESTORE_BACKUP, backupPath);
    } catch (error) {
      console.error('从备份恢复失败:', error);
      return false;
    }
  },
  
  /**
   * 获取备份文件列表
   */
  async getBackupFiles(): Promise<Array<{ path: string; date: Date; size: number }>> {
    try {
      return await ipcService.invoke(DB_CHANNELS.GET_BACKUP_FILES);
    } catch (error) {
      console.error('获取备份文件列表失败:', error);
      return [];
    }
  }
}; 