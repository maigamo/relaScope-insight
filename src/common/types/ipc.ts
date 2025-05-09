import { Profile, Quote, Experience, HexagonModel } from './database';

/**
 * IPC通信相关的类型定义
 */

// 配置相关
export interface ConfigGetRequest {
  key: string;
  defaultValue?: any;
}

export interface ConfigSetRequest {
  key: string;
  value: any;
}

// 数据库查询相关
export interface DBQueryRequest {
  sql: string;
  params?: any[];
}

export interface DBQueryResponse {
  success: boolean;
  data?: any[];
  error?: string;
}

/**
 * IPC响应统一格式
 */
export interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * IPC通道参数类型映射
 * 为每个通道定义请求参数类型
 */
export interface IPCChannelParams {
  // 数据库基础操作
  'db:initialize': void;
  'db:executeQuery': { query: string; params?: any[] };
  'db:createBackup': { path?: string };
  'db:restoreBackup': { path: string };
  'db:getBackupFiles': void;
  
  // 个人档案操作
  'db:profile:getAll': void;
  'db:profile:getById': { id: number };
  'db:profile:create': Omit<Profile, 'id'>;
  'db:profile:update': Profile;
  'db:profile:delete': { id: number };
  'db:profile:search': { query: string };
  'db:profile:getRecent': { limit?: number };
  
  // 语录操作
  'db:quote:getAll': void;
  'db:quote:getById': { id: number };
  'db:quote:create': Omit<Quote, 'id'>;
  'db:quote:update': Quote;
  'db:quote:delete': { id: number };
  'db:quote:search': { query: string };
  'db:quote:getByProfile': { profileId: number };
  
  // 经历操作
  'db:experience:getAll': void;
  'db:experience:getById': { id: number };
  'db:experience:create': Omit<Experience, 'id'>;
  'db:experience:update': Experience;
  'db:experience:delete': { id: number };
  'db:experience:getByProfile': { profileId: number };
  'db:experience:getTimeline': { profileId: number };
  'db:experience:findByTag': { tag: string };
  'db:experience:getRecent': { limit?: number };
  
  // 六边形模型操作
  'db:hexagon:getAll': void;
  'db:hexagon:getById': { id: number };
  'db:hexagon:create': Omit<HexagonModel, 'id'>;
  'db:hexagon:update': HexagonModel;
  'db:hexagon:delete': { id: number };
  'db:hexagon:getByProfile': { profileId: number };
  
  // 应用窗口操作
  'app:minimize': void;
  'app:maximize': void;
  'app:close': void;
  'app:checkForUpdates': void;
  
  // 配置操作
  'config:get': { key: string };
  'config:set': { key: string; value: any };
  'config:getAll': void;
  
  // 分析操作
  'analysis:create': { profileId: number; type: string };
  'analysis:update': { id: number; data: any };
  'analysis:getByProfile': { profileId: number };
  'analysis:getRecent': { limit?: number };
  'analysis:getStats': void;
}

/**
 * IPC通道响应类型映射
 * 为每个通道定义响应数据类型
 */
export interface IPCChannelResponses {
  // 数据库基础操作
  'db:initialize': IPCResponse<boolean>;
  'db:executeQuery': IPCResponse<any>;
  'db:createBackup': IPCResponse<{ path: string }>;
  'db:restoreBackup': IPCResponse<boolean>;
  'db:getBackupFiles': IPCResponse<string[]>;
  
  // 个人档案操作
  'db:profile:getAll': IPCResponse<Profile[]>;
  'db:profile:getById': IPCResponse<Profile | null>;
  'db:profile:create': IPCResponse<Profile>;
  'db:profile:update': IPCResponse<boolean>;
  'db:profile:delete': IPCResponse<boolean>;
  'db:profile:search': IPCResponse<Profile[]>;
  'db:profile:getRecent': IPCResponse<Profile[]>;
  
  // 语录操作
  'db:quote:getAll': IPCResponse<Quote[]>;
  'db:quote:getById': IPCResponse<Quote | null>;
  'db:quote:create': IPCResponse<Quote>;
  'db:quote:update': IPCResponse<boolean>;
  'db:quote:delete': IPCResponse<boolean>;
  'db:quote:search': IPCResponse<Quote[]>;
  'db:quote:getByProfile': IPCResponse<Quote[]>;
  
  // 经历操作
  'db:experience:getAll': IPCResponse<Experience[]>;
  'db:experience:getById': IPCResponse<Experience | null>;
  'db:experience:create': IPCResponse<Experience>;
  'db:experience:update': IPCResponse<boolean>;
  'db:experience:delete': IPCResponse<boolean>;
  'db:experience:getByProfile': IPCResponse<Experience[]>;
  'db:experience:getTimeline': IPCResponse<Experience[]>;
  'db:experience:findByTag': IPCResponse<Experience[]>;
  'db:experience:getRecent': IPCResponse<Experience[]>;
  
  // 六边形模型操作
  'db:hexagon:getAll': IPCResponse<HexagonModel[]>;
  'db:hexagon:getById': IPCResponse<HexagonModel | null>;
  'db:hexagon:create': IPCResponse<HexagonModel>;
  'db:hexagon:update': IPCResponse<boolean>;
  'db:hexagon:delete': IPCResponse<boolean>;
  'db:hexagon:getByProfile': IPCResponse<HexagonModel[]>;
  
  // 应用窗口操作
  'app:minimize': IPCResponse<boolean>;
  'app:maximize': IPCResponse<boolean>;
  'app:close': IPCResponse<boolean>;
  'app:checkForUpdates': IPCResponse<{ available: boolean; version?: string }>;
  
  // 配置操作
  'config:get': IPCResponse<any>;
  'config:set': IPCResponse<boolean>;
  'config:getAll': IPCResponse<Record<string, any>>;
  
  // 分析操作
  'analysis:create': IPCResponse<{ id: number }>;
  'analysis:update': IPCResponse<boolean>;
  'analysis:getByProfile': IPCResponse<any[]>;
  'analysis:getRecent': IPCResponse<any[]>;
  'analysis:getStats': IPCResponse<any>;
} 