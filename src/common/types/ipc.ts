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

// 通用响应格式
export interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
} 