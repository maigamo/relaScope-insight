/**
 * IPC通信通道常量定义
 * 集中管理所有通道名称，避免重复定义和不一致
 */

// 配置相关通道
export const CONFIG_CHANNELS = {
  GET_CONFIG: 'config:get',
  SET_CONFIG: 'config:set',
  GET_ALL_CONFIGS: 'config:getAll'
};

// 应用窗口相关通道
export const APP_CHANNELS = {
  MINIMIZE: 'app:minimize',
  MAXIMIZE: 'app:maximize',
  CLOSE: 'app:close',
  CHECK_FOR_UPDATES: 'app:checkForUpdates'
};

// 数据库基础操作通道
export const DB_CHANNELS = {
  INITIALIZE: 'db:initialize',
  EXECUTE_QUERY: 'db:executeQuery',
  CREATE_BACKUP: 'db:create-backup',
  RESTORE_BACKUP: 'db:restore-backup',
  GET_BACKUP_FILES: 'db:get-backup-files',
  
  // 配置文件相关频道
  PROFILE: {
    GET_ALL: 'db:profile:getAll',
    GET_BY_ID: 'db:profile:getById',
    CREATE: 'db:profile:create',
    UPDATE: 'db:profile:update',
    DELETE: 'db:profile:delete',
    SEARCH: 'db:profile:search',
    GET_RECENT: 'db:profile:getRecent'
  },
  
  // 引用相关频道
  QUOTE: {
    GET_ALL: 'db:quote:getAll',
    GET_BY_ID: 'db:quote:getById',
    CREATE: 'db:quote:create',
    UPDATE: 'db:quote:update',
    DELETE: 'db:quote:delete',
    SEARCH: 'db:quote:search',
    GET_BY_PROFILE: 'db:quote:getByProfile'
  },
  
  // 经历相关频道
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
  }
};

// 档案相关操作通道
export const PROFILE_CHANNELS = {
  CREATE: 'profile:create',
  UPDATE: 'profile:update',
  GET_ALL: 'profile:get-all',
  GET_BY_ID: 'profile:get-by-id',
  DELETE: 'profile:delete',
  GET_RECENT: 'profile:get-recent'
};

// 语录相关操作通道
export const QUOTE_CHANNELS = {
  CREATE: 'quote:create',
  UPDATE: 'quote:update',
  GET_BY_PROFILE: 'quote:get-by-profile',
  DELETE: 'quote:delete',
  GET_RECENT: 'quote:get-recent'
};

// 经历相关操作通道
export const EXPERIENCE_CHANNELS = {
  CREATE: 'db:experience:create',
  UPDATE: 'db:experience:update',
  GET_ALL: 'db:experience:getAll',
  GET_BY_ID: 'db:experience:getById',
  GET_BY_PROFILE: 'db:experience:getByProfile',
  DELETE: 'db:experience:delete',
  GET_RECENT: 'db:experience:getRecent',
  GET_TIMELINE: 'db:experience:getTimeline',
  FIND_BY_TAG: 'db:experience:findByTag'
};

// 分析相关操作通道
export const ANALYSIS_CHANNELS = {
  CREATE: 'analysis:create',
  UPDATE: 'analysis:update',
  GET_BY_PROFILE: 'analysis:get-by-profile',
  GET_RECENT: 'analysis:get-recent',
  GET_STATS: 'analysis:get-stats'
};

// 六边形模型相关操作通道
export const HEXAGON_CHANNELS = {
  CREATE: 'db:hexagon:create',
  UPDATE: 'db:hexagon:update',
  GET_ALL: 'db:hexagon:getAll',
  GET_BY_ID: 'db:hexagon:getById',
  GET_BY_PROFILE: 'db:hexagon:getByProfile',
  DELETE: 'db:hexagon:delete'
}; 