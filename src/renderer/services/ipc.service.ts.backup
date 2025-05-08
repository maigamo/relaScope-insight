// 删除直接导入electron的代码
// import { ipcRenderer } from 'electron';

// 注释掉导入常量的代码，改用预加载脚本中暴露的常量
// import { 
//   CONFIG_CHANNELS, 
//   APP_CHANNELS, 
//   DB_CHANNELS 
// } from '../../common/constants/ipc';
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
      removeListener: (channel: string, listener?: Function) => void;
      removeAllListeners: (channel: string) => void;
    };
    IPC_CONSTANTS: {
      CONFIG_CHANNELS: {
        GET_CONFIG: string;
        SET_CONFIG: string;
        GET_ALL_CONFIGS: string;
      };
      APP_CHANNELS: {
        MINIMIZE: string;
        MAXIMIZE: string;
        CLOSE: string;
        CHECK_FOR_UPDATES: string;
      };
      DB_CHANNELS: {
        INITIALIZE: string;
        EXECUTE_QUERY: string;
        PROFILE: {
          GET_ALL: string;
          GET_BY_ID: string;
          CREATE: string;
          UPDATE: string;
          DELETE: string;
          SEARCH: string;
          GET_RECENT: string;
        };
        QUOTE: {
          GET_ALL: string;
          GET_BY_ID: string;
          CREATE: string;
          UPDATE: string;
          DELETE: string;
          SEARCH: string;
        };
      };
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

// 使用预加载脚本中的常量
const { CONFIG_CHANNELS, APP_CHANNELS, DB_CHANNELS } = window.IPC_CONSTANTS || {
  CONFIG_CHANNELS: {
    GET_CONFIG: 'config:get',
    SET_CONFIG: 'config:set',
    GET_ALL_CONFIGS: 'config:getAll'
  },
  APP_CHANNELS: {
    MINIMIZE: 'app:minimize',
    MAXIMIZE: 'app:maximize',
    CLOSE: 'app:close',
    CHECK_FOR_UPDATES: 'app:checkForUpdates'
  },
  DB_CHANNELS: {
    INITIALIZE: 'db:initialize',
    EXECUTE_QUERY: 'db:executeQuery',
    PROFILE: {
      GET_ALL: 'db:profile:getAll',
      GET_BY_ID: 'db:profile:getById',
      CREATE: 'db:profile:create',
      UPDATE: 'db:profile:update',
      DELETE: 'db:profile:delete',
      SEARCH: 'db:profile:search',
      GET_RECENT: 'db:profile:getRecent'
    },
    QUOTE: {
      GET_ALL: 'db:quote:getAll',
      GET_BY_ID: 'db:quote:getById',
      CREATE: 'db:quote:create',
      UPDATE: 'db:quote:update',
      DELETE: 'db:quote:delete',
      SEARCH: 'db:quote:search'
    }
  }
};

/**
 * IPC 通信服务
 * 用于前端与后端通信
 */
class IpcService {
  /**
   * 标准化IPC响应，确保所有响应格式统一
   * @param response 原始响应
   * @returns 标准化后的IPCResponse
   */
  private normalizeResponse<T>(response: any): IPCResponse<T> {
    // 如果已经是标准格式
    if (response && typeof response === 'object' && 'success' in response) {
      return response as IPCResponse<T>;
    }
    
    // 处理布尔值
    if (typeof response === 'boolean') {
      return {
        success: response,
        data: null as any
      };
    }
    
    // 处理直接返回的数据对象或数组
    if (response !== null && response !== undefined) {
      return {
        success: true,
        data: response as T
      };
    }
    
    // 处理null或undefined
    return {
      success: false,
      error: '接收到空响应'
    };
  }

  /**
   * 发送异步 IPC 消息并等待响应
   * @param channel IPC 通道名称
   * @param args 传递的参数
   * @returns 返回后端响应的数据
   */
  public async invoke<T = any>(channel: string, ...args: any[]): Promise<T> {
    try {
      if (!window.electronAPI) {
        console.error('electronAPI未在预加载脚本中定义');
        throw new Error('electronAPI未定义');
      }
      
      // 获取原始响应
      let originalResponse = await window.electronAPI.invoke<T>(channel, args.length === 1 ? args[0] : args);
      
      // 标准化响应
      const response = this.normalizeResponse<T>(originalResponse);
      
      // 控制台记录详细响应信息（可在生产环境删除）
      console.log(`IPC响应 [${channel}]:`, {
        原始响应: originalResponse,
        标准化响应: response,
        类型: typeof originalResponse,
        成功: response.success
      });
      
      if (!response.success) {
        console.error(`IPC 调用错误 [${channel}]: ${response.error}`);
        throw new Error(response.error || `IPC调用失败: ${channel}`);
      }
      
      return response.data as T;
    } catch (error) {
      console.error(`IPC 调用错误 [${channel}]:`, error);
      throw error;
    }
  }

  /**
   * 发送异步 IPC 消息
   * @param channel IPC 通道名称
   * @param args 传递的参数
   */
  public send(channel: string, ...args: any[]): void {
    try {
      if (!window.electronAPI) {
        console.error('electronAPI未在预加载脚本中定义');
        throw new Error('electronAPI未定义');
      }
      window.electronAPI.send(channel, args.length === 1 ? args[0] : args);
    } catch (error) {
      console.error(`IPC 发送错误 [${channel}]:`, error);
      throw error;
    }
  }

  /**
   * 注册 IPC 监听器
   * @param channel IPC 通道名称
   * @param listener 监听器回调函数
   * @returns 返回一个取消监听的函数
   */
  public on<T = any>(channel: string, listener: (event: any, ...args: any[]) => void): () => void {
    if (!window.electronAPI) {
      console.error('electronAPI未在预加载脚本中定义');
      return () => {};
    }
    
    // 使用预加载脚本中的receive方法
    const removeListener = window.electronAPI.receive(channel, (data) => {
      // 适配listener的调用方式，保持与原来的ipcRenderer.on接口一致
      listener({}, data);
    });
    
    return removeListener;
  }

  /**
   * 注册一次性 IPC 监听器
   * @param channel IPC 通道名称
   * @param listener 监听器回调函数
   */
  public once<T = any>(channel: string, listener: (event: any, ...args: any[]) => void): void {
    if (!window.electronAPI) {
      console.error('electronAPI未在预加载脚本中定义');
      return;
    }
    
    // 创建一个包装函数，执行一次后自动移除监听
    const wrappedListener = (data: any) => {
      listener({}, data);
      window.electronAPI.removeListener(channel, wrappedListener);
    };
    
    window.electronAPI.receive(channel, wrappedListener);
  }

  /**
   * 移除 IPC 监听器
   * @param channel IPC 通道名称
   * @param listener 监听器回调函数
   */
  public removeListener(channel: string, listener: (...args: any[]) => void): void {
    if (!window.electronAPI) {
      console.error('electronAPI未在预加载脚本中定义');
      return;
    }
    window.electronAPI.removeListener(channel, listener);
  }

  /**
   * 移除指定通道的所有监听器
   * @param channel IPC 通道名称
   */
  public removeAllListeners(channel: string): void {
    if (!window.electronAPI) {
      console.error('electronAPI未在预加载脚本中定义');
      return;
    }
    window.electronAPI.removeAllListeners(channel);
  }
}

// 单例模式
export const ipcService = new IpcService();

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
      if (!window.electronAPI) {
        console.error('electronAPI未在预加载脚本中定义');
        return defaultValue as T;
      }
      
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
      if (!window.electronAPI) {
        console.error('electronAPI未在预加载脚本中定义');
        return false;
      }
      
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
    if (!window.electronAPI) {
      console.error('electronAPI未在预加载脚本中定义');
      return {};
    }
    
    const response = await window.electronAPI.invoke(
      CONFIG_CHANNELS.GET_ALL_CONFIGS
    );
    
    if (!response.success) {
      console.error(`获取所有配置失败: ${response.error}`);
      return {};
    }
    
    return response.data || {};
  }
};

/**
 * 应用服务 - 主要用于控制窗口和应用行为
 */
export const AppService = {
  /**
   * 最小化窗口
   */
  minimize() {
    if (!window.electronAPI) return;
    window.electronAPI.send(APP_CHANNELS.MINIMIZE);
  },
  
  /**
   * 最大化窗口
   */
  maximize() {
    if (!window.electronAPI) return;
    window.electronAPI.send(APP_CHANNELS.MAXIMIZE);
  },
  
  /**
   * 关闭窗口
   */
  close() {
    if (!window.electronAPI) return;
    window.electronAPI.send(APP_CHANNELS.CLOSE);
  },
  
  /**
   * 检查更新
   */
  async checkForUpdates(): Promise<boolean> {
    if (!window.electronAPI) {
      console.error('electronAPI未在预加载脚本中定义');
      return false;
    }
    
    const response = await window.electronAPI.invoke(
      APP_CHANNELS.CHECK_FOR_UPDATES
    );
    
    if (!response.success) {
      console.error(`检查更新失败: ${response.error}`);
    }
    
    return response.success;
  }
};

/**
 * 数据库服务 - 用于执行数据库操作
 */
export const DatabaseService = {
  /**
   * 初始化数据库
   */
  async initialize(): Promise<boolean> {
    if (!window.electronAPI) {
      console.error('electronAPI未在预加载脚本中定义');
      return false;
    }
    
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
      if (!window.electronAPI) {
        console.error('electronAPI未在预加载脚本中定义');
        return [];
      }
      
      const request: DBQueryRequest = { sql, params };
      const response = await window.electronAPI.invoke<T[]>(
        DB_CHANNELS.EXECUTE_QUERY,
        request
      );
      
      if (!response.success) {
        console.error(`执行查询失败: ${response.error}`, { sql, params });
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('执行查询失败:', error, { sql, params });
      return [];
    }
  },
  
  /**
   * 执行事务
   * @param queries SQL语句数组
   * @param paramsArray 参数数组
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
      
      // 否则使用标准的electronAPI
      if (!window.electronAPI) {
        console.error('electronAPI未在预加载脚本中定义');
        return false;
      }
      
      const request = { queries, paramsArray };
      const response = await window.electronAPI.invoke(
        'db:transaction',
        request
      );
      
      if (!response.success) {
        console.error(`执行事务失败: ${response.error}`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('执行事务失败:', error);
      return false;
    }
  }
};

/**
 * 分析服务 - 用于执行LLM分析
 */
export const AnalysisService = {
  /**
   * 执行分析
   * @param type 分析类型
   * @param data 分析数据
   */
  async analyze<T>(type: string, data: any): Promise<T> {
    try {
      // 直接使用预加载脚本注入的window.electron，如果存在
      if (window.electron?.analyze) {
        return await window.electron.analyze<T>(type, data);
      }
      
      // 否则使用标准的electronAPI
      if (!window.electronAPI) {
        console.error('electronAPI未在预加载脚本中定义');
        throw new Error('electronAPI未定义');
      }
      
      const response = await window.electronAPI.invoke<T>(
        'analysis:analyze',
        { type, data }
      );
      
      if (!response.success) {
        console.error(`执行分析失败: ${response.error}`);
        throw new Error(response.error || '执行分析失败');
      }
      
      return response.data as T;
    } catch (error) {
      console.error('执行分析失败:', error);
      throw error;
    }
  }
}; 