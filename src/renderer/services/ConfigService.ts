import { IPCResponse } from '../../common/types/ipc';
import { CONFIG_CHANNELS } from '../../common/constants/ipc';

/**
 * 配置服务
 * 用于与主进程通信，获取和设置应用配置
 */

interface Config {
  language?: string;
  theme?: string;
  fontSize?: number;
  [key: string]: any;
}

export class ConfigService {
  /**
   * 获取全部配置
   */
  static async getConfig(): Promise<Config> {
    // 这里应该是通过IPC调用主进程来获取实际配置
    // 暂时返回模拟数据
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          language: 'zh',
          theme: 'light',
          fontSize: 14
        });
      }, 500);
    });
  }

  /**
   * 获取特定配置项
   * @param key 配置键
   * @param defaultValue 默认值
   */
  static async getConfigItem<T>(key: string, defaultValue?: T): Promise<T> {
    try {
      const config = await this.getConfig();
      return (config[key] as T) || defaultValue as T;
    } catch (error) {
      console.error(`获取配置项${key}失败:`, error);
      return defaultValue as T;
    }
  }

  /**
   * 设置配置项
   * @param key 配置键
   * @param value 配置值
   */
  static async setConfigItem<T>(key: string, value: T): Promise<boolean> {
    // 这里应该是通过IPC调用主进程来设置实际配置
    // 暂时返回成功
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`配置项${key}已设置为`, value);
        resolve(true);
      }, 300);
    });
  }

  /**
   * 获取所有配置
   * @returns 所有配置
   */
  static async getAllConfigs(): Promise<Record<string, any> | null> {
    try {
      if (!window.electron) {
        console.warn('Electron API不可用，无法获取所有配置');
        return null;
      }

      const response = await window.electron.configService.getAllConfigs();

      if (!response.success) {
        console.error(`获取所有配置失败: ${response.error}`);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('获取所有配置时出错:', error);
      return null;
    }
  }
} 