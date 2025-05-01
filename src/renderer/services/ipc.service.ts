import { 
  CONFIG_CHANNELS, 
  APP_CHANNELS, 
  DB_CHANNELS 
} from '../../common/constants/ipc';
import { 
  ConfigGetRequest,
  ConfigSetRequest,
  DBQueryRequest,
  IPCResponse 
} from '../../common/types/ipc';

// 定义全局接口，应该在window.d.ts中定义
declare global {
  interface Window {
    electronAPI: {
      send: (channel: string, data?: any) => void;
      invoke: <T = any>(channel: string, data?: any) => Promise<IPCResponse<T>>;
      receive: (channel: string, func: (...args: any[]) => void) => () => void;
    };
    electron?: {
      getConfig: <T>(key: string, defaultValue?: T) => Promise<T>;
      setConfig: <T>(key: string, value: T) => Promise<boolean>;
      dbQuery: <T>(sql: string, params?: any[]) => Promise<T[]>;
      dbTransaction: (queries: string[], paramsArray: any[][]) => Promise<boolean>;
      analyze: <T>(type: string, data: any) => Promise<T>;
    };
  }
}

/**
 * 配置服务 - 通过IPC与主进程通信获取和设置配置
 */
export const ConfigService = {
  /**
   * 获取配置项
   * @param key 配置键名
   * @param defaultValue 默认值
   */
  async getConfig<T>(key: string, defaultValue?: T): Promise<T> {
    try {
      // 直接使用预加载脚本注入的window.electron，如果存在
      if (window.electron?.getConfig) {
        return await window.electron.getConfig<T>(key, defaultValue);
      }
      
      // 否则使用标准的electronAPI
      const request: ConfigGetRequest = { key, defaultValue };
      const response = await window.electronAPI.invoke<T>(
        CONFIG_CHANNELS.GET_CONFIG, 
        request
      );
      
      if (!response.success) {
        console.error(`获取配置失败: ${response.error}`);
        return defaultValue as T;
      }
      
      return response.data as T;
    } catch (error) {
      console.error('获取配置失败:', error);
      return defaultValue as T;
    }
  },
  
  /**
   * 设置配置项
   * @param key 配置键名
   * @param value 配置值
   */
  async setConfig(key: string, value: any): Promise<boolean> {
    try {
      // 直接使用预加载脚本注入的window.electron，如果存在
      if (window.electron?.setConfig) {
        return await window.electron.setConfig(key, value);
      }
      
      // 否则使用标准的electronAPI
      const request: ConfigSetRequest = { key, value };
      const response = await window.electronAPI.invoke(
        CONFIG_CHANNELS.SET_CONFIG, 
        request
      );
      
      if (!response.success) {
        console.error(`设置配置失败: ${response.error}`);
      }
      
      return response.success;
    } catch (error) {
      console.error('设置配置失败:', error);
      return false;
    }
  },
  
  /**
   * 获取所有配置
   */
  async getAllConfigs(): Promise<Record<string, any>> {
    const response = await window.electronAPI.invoke(
      CONFIG_CHANNELS.GET_ALL_CONFIGS
    );
    
    if (!response.success) {
      console.error(`获取所有配置失败: ${response.error}`);
      return {};
    }
    
    return response.data as Record<string, any>;
  }
};

/**
 * 应用控制服务 - 提供窗口控制功能
 */
export const AppService = {
  minimize() {
    window.electronAPI.send(APP_CHANNELS.MINIMIZE);
  },
  
  maximize() {
    window.electronAPI.send(APP_CHANNELS.MAXIMIZE);
  },
  
  close() {
    window.electronAPI.send(APP_CHANNELS.CLOSE);
  },
  
  async checkForUpdates(): Promise<boolean> {
    const response = await window.electronAPI.invoke(
      APP_CHANNELS.CHECK_FOR_UPDATES
    );
    return response.success;
  }
};

/**
 * 数据库服务 - 提供数据库操作功能
 */
export const DatabaseService = {
  /**
   * 初始化数据库
   */
  async initialize(): Promise<boolean> {
    const response = await window.electronAPI.invoke(DB_CHANNELS.INITIALIZE);
    
    if (!response.success) {
      console.error(`初始化数据库失败: ${response.error}`);
    }
    
    return response.success;
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
      
      // 否则使用标准的electronAPI
      const request: DBQueryRequest = { sql, params };
      const response = await window.electronAPI.invoke<T[]>(
        DB_CHANNELS.EXECUTE_QUERY, 
        request
      );
      
      if (!response.success) {
        console.error(`执行查询失败: ${response.error}`);
        return [];
      }
      
      return response.data as T[];
    } catch (error) {
      console.error('执行查询失败:', error);
      return [];
    }
  },
  
  /**
   * 执行SQL事务
   * @param queries SQL查询语句数组
   * @param paramsArray 查询参数数组
   * @returns 是否成功
   */
  async transaction(
    queries: string[],
    paramsArray: any[][]
  ): Promise<boolean> {
    try {
      // 直接使用预加载脚本注入的window.electron，如果存在
      if (window.electron?.dbTransaction) {
        return await window.electron.dbTransaction(queries, paramsArray);
      }
      
      // 其他实现方式...
      return false;
    } catch (error) {
      console.error('执行事务失败:', error);
      return false;
    }
  }
};

/**
 * 分析服务 - 提供数据分析功能
 */
export const AnalysisService = {
  /**
   * 执行分析
   * @param type 分析类型
   * @param data 分析数据
   * @returns 分析结果
   */
  async analyze<T>(type: string, data: any): Promise<T> {
    try {
      // 直接使用预加载脚本注入的window.electron，如果存在
      if (window.electron?.analyze) {
        return await window.electron.analyze<T>(type, data);
      }
      
      // 其他实现方式...
      throw new Error('分析服务未实现');
    } catch (error) {
      console.error('执行分析失败:', error);
      throw error;
    }
  }
}; 