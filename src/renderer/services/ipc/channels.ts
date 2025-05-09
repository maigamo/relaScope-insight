/**
 * IPC通信通道常量定义
 * 集中管理所有通道名称，避免重复定义和不一致
 * 
 * 该文件已废弃，请使用 src/common/constants/ipcChannels.ts
 * 为了保持兼容性，导出从公共模块导入的常量
 */

import {
  IPC_CHANNELS,
  DB_CHANNELS,
  APP_CHANNELS,
  CONFIG_CHANNELS,
  PROFILE_CHANNELS as COMMON_PROFILE_CHANNELS,
  QUOTE_CHANNELS as COMMON_QUOTE_CHANNELS,
  EXPERIENCE_CHANNELS as COMMON_EXPERIENCE_CHANNELS,
  HEXAGON_CHANNELS as COMMON_HEXAGON_CHANNELS,
  ANALYSIS_CHANNELS as COMMON_ANALYSIS_CHANNELS
} from '../../../common/constants/ipcChannels';

// 重新导出基础通道常量
export { IPC_CHANNELS, DB_CHANNELS, APP_CHANNELS, CONFIG_CHANNELS };

// 档案相关操作通道
export const PROFILE_CHANNELS = {
  CREATE: 'profile:create',
  UPDATE: 'profile:update',
  GET_ALL: 'profile:getAll',  // 已更新为camelCase
  GET_BY_ID: 'profile:getById',  // 已更新为camelCase
  DELETE: 'profile:delete',
  GET_RECENT: 'profile:getRecent'  // 已更新为camelCase
};

// 语录相关操作通道
export const QUOTE_CHANNELS = {
  CREATE: 'quote:create',
  UPDATE: 'quote:update',
  GET_BY_PROFILE: 'quote:getByProfile',  // 已更新为camelCase
  DELETE: 'quote:delete',
  GET_RECENT: 'quote:getRecent'  // 已更新为camelCase
};

// 经历相关操作通道 - 使用新的通道模式
export const EXPERIENCE_CHANNELS = COMMON_EXPERIENCE_CHANNELS;

// 分析相关操作通道
export const ANALYSIS_CHANNELS = {
  CREATE: 'analysis:create',
  UPDATE: 'analysis:update',
  GET_BY_PROFILE: 'analysis:getByProfile',  // 已更新为camelCase
  GET_RECENT: 'analysis:getRecent',  // 已更新为camelCase
  GET_STATS: 'analysis:getStats'  // 已更新为camelCase
};

// 六边形模型相关操作通道 - 使用新的通道模式
export const HEXAGON_CHANNELS = COMMON_HEXAGON_CHANNELS;

// 导出数据库前缀的通道，方便直接访问
export const DB_PROFILE_CHANNELS = COMMON_PROFILE_CHANNELS;
export const DB_QUOTE_CHANNELS = COMMON_QUOTE_CHANNELS;
export const DB_EXPERIENCE_CHANNELS = COMMON_EXPERIENCE_CHANNELS;
export const DB_HEXAGON_CHANNELS = COMMON_HEXAGON_CHANNELS; 