import { IPCResponse } from '../../../common/types/ipc';

/**
 * IPC 通信核心服务
 * 提供基础的IPC通信方法
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
    
    // 处理数组格式 - 直接返回数据
    if (Array.isArray(response)) {
      return {
        success: true,
        data: response as T
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
      
      console.log(`发送IPC请求 [${channel}]:`, args);
      
      // 获取原始响应
      let originalResponse = await window.electronAPI.invoke<T>(channel, args.length === 1 ? args[0] : args);
      
      // 标准化响应
      const response = this.normalizeResponse<T>(originalResponse);
      
      // 控制台记录详细响应信息（可在生产环境删除）
      console.log(`IPC响应 [${channel}]:`, {
        原始响应: originalResponse,
        标准化响应: response,
        类型: typeof originalResponse,
        成功: response.success,
        响应数据: response.data
      });
      
      // 特殊处理setDefaultConfig通道
      if (channel === 'llm:setDefaultConfig') {
        console.log('设置默认配置响应详情:', JSON.stringify(response));
        
        // 检查返回值是否为布尔值true
        if (originalResponse === true || (typeof originalResponse === 'object' && originalResponse.success === true)) {
          return (typeof originalResponse === 'object' ? originalResponse.data : true) as T;
        }
      }
      
      // 特殊处理testApiKey通道，直接返回原始响应
      if (channel === 'llm:testApiKey') {
        console.log('测试API密钥返回原始数据:', originalResponse);
        return originalResponse as T;
      }
      
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