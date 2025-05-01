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
  EXECUTE_QUERY: 'db:executeQuery'
}; 