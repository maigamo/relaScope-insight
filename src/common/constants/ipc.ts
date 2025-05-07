/**
 * IPC通信频道名称常量
 * 这些常量用于主进程和渲染进程之间的通信
 */


// 配置相关
export const CONFIG_CHANNELS = {
  GET_CONFIG: 'config:get',
  SET_CONFIG: 'config:set',
  GET_ALL_CONFIGS: 'config:getAll'
};

// 应用相关
export const APP_CHANNELS = {
  MINIMIZE: 'app:minimize',
  MAXIMIZE: 'app:maximize',
  CLOSE: 'app:close',
  CHECK_FOR_UPDATES: 'app:checkForUpdates'
};

// 数据库相关
export const DB_CHANNELS = {
  INITIALIZE: 'db:initialize',
  EXECUTE_QUERY: 'db:executeQuery',
  
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
    GET_BY_PROFILE: 'db:quote:getByProfile',
  }
}; 