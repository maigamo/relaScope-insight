/**
 * IPC通道常量定义文件
 * 统一所有通道命名规范，采用camelCase风格
 * 结构：域名:实体:操作
 */

export const IPC_CHANNELS = {
  // 数据库相关通道
  DB: {
    // 初始化和通用操作
    INITIALIZE: 'db:initialize',
    EXECUTE_QUERY: 'db:executeQuery',
    CREATE_BACKUP: 'db:createBackup',
    RESTORE_BACKUP: 'db:restoreBackup',
    GET_BACKUP_FILES: 'db:getBackupFiles',
    
    // 个人档案相关
    PROFILE: {
      GET_ALL: 'db:profile:getAll',
      GET_BY_ID: 'db:profile:getById',
      CREATE: 'db:profile:create',
      UPDATE: 'db:profile:update',
      DELETE: 'db:profile:delete',
      SEARCH: 'db:profile:search',
      GET_RECENT: 'db:profile:getRecent'
    },
    
    // 语录相关
    QUOTE: {
      GET_ALL: 'db:quote:getAll',
      GET_BY_ID: 'db:quote:getById',
      CREATE: 'db:quote:create',
      UPDATE: 'db:quote:update',
      DELETE: 'db:quote:delete',
      SEARCH: 'db:quote:search',
      GET_BY_PROFILE: 'db:quote:getByProfile'
    },
    
    // 经历相关
    EXPERIENCE: {
      GET_ALL: 'db:experience:getAll',
      GET_BY_ID: 'db:experience:getById',
      CREATE: 'db:experience:create',
      UPDATE: 'db:experience:update',
      DELETE: 'db:experience:delete',
      GET_BY_PROFILE: 'db:experience:getByProfile',
      GET_TIMELINE: 'db:experience:getTimeline',
      FIND_BY_TAG: 'db:experience:findByTag',
      GET_RECENT: 'db:experience:getRecent'
    },
    
    // 六边形模型相关
    HEXAGON: {
      GET_ALL: 'db:hexagon:getAll',
      GET_BY_ID: 'db:hexagon:getById',
      CREATE: 'db:hexagon:create',
      UPDATE: 'db:hexagon:update',
      DELETE: 'db:hexagon:delete',
      GET_BY_PROFILE: 'db:hexagon:getByProfile'
    }
  },
  
  // 应用窗口相关通道
  APP: {
    MINIMIZE: 'app:minimize',
    MAXIMIZE: 'app:maximize',
    CLOSE: 'app:close',
    CHECK_FOR_UPDATES: 'app:checkForUpdates'
  },
  
  // 配置相关通道
  CONFIG: {
    GET: 'config:get',
    SET: 'config:set',
    GET_ALL: 'config:getAll'
  },
  
  // 分析相关通道
  ANALYSIS: {
    CREATE: 'analysis:create',
    UPDATE: 'analysis:update',
    GET_BY_PROFILE: 'analysis:getByProfile',
    GET_RECENT: 'analysis:getRecent',
    GET_STATS: 'analysis:getStats'
  }
};

// 导出单个命名空间，方便直接导入使用
export const DB_CHANNELS = IPC_CHANNELS.DB;
export const APP_CHANNELS = IPC_CHANNELS.APP;
export const CONFIG_CHANNELS = IPC_CHANNELS.CONFIG;
export const ANALYSIS_CHANNELS = IPC_CHANNELS.ANALYSIS;

// 具体领域的通道
export const PROFILE_CHANNELS = IPC_CHANNELS.DB.PROFILE;
export const QUOTE_CHANNELS = IPC_CHANNELS.DB.QUOTE;
export const EXPERIENCE_CHANNELS = IPC_CHANNELS.DB.EXPERIENCE;
export const HEXAGON_CHANNELS = IPC_CHANNELS.DB.HEXAGON; 