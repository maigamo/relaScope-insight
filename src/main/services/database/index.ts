import { DatabaseManager } from './DatabaseManager';
import { EnterpriseDAOImpl } from './dao/EnterpriseDAOImpl';
import { UserDAOImpl } from './dao/UserDAOImpl';
import { ProjectDAOImpl } from './dao/ProjectDAOImpl';
import { ProjectMemberDAOImpl } from './dao/ProjectMemberDAOImpl';

// 数据库管理器实例
const dbManager = DatabaseManager.getInstance();

// 初始化数据库
export const initializeDatabase = async (): Promise<void> => {
  try {
    await dbManager.initialize();
    console.log('数据库系统初始化成功');
  } catch (error) {
    console.error('数据库系统初始化失败:', error);
    throw error;
  }
};

// 关闭数据库
export const closeDatabase = async (): Promise<void> => {
  try {
    await dbManager.close();
    console.log('数据库系统已关闭');
  } catch (error) {
    console.error('关闭数据库系统失败:', error);
    throw error;
  }
};

// 导出DAO实例
export const getEnterpriseDAO = () => EnterpriseDAOImpl.getInstance();
export const getUserDAO = () => UserDAOImpl.getInstance();
export const getProjectDAO = () => ProjectDAOImpl.getInstance();
export const getProjectMemberDAO = () => ProjectMemberDAOImpl.getInstance();

// 导出备份和恢复功能
export const backupDatabase = async (path?: string): Promise<string> => {
  return dbManager.backup(path);
};

export const restoreDatabase = async (backupPath: string): Promise<void> => {
  return dbManager.restore(backupPath);
};

// 导出实体类型
export * from './entity/Enterprise';
export * from './entity/User';
export * from './entity/Project';
export * from './entity/ProjectMember';

// 导出DAO接口
export * from './dao/DAOInterfaces';
export * from './dao/EnterpriseDAO';
export * from './dao/UserDAO';
export * from './dao/ProjectDAO';
export * from './dao/ProjectMemberDAO'; 