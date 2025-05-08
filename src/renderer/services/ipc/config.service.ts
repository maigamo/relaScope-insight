import { ConfigGetRequest, ConfigSetRequest } from '../../../common/types/ipc';
import { ipcService } from './core';
import { CONFIG_CHANNELS } from './channels';

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
      
      const request: ConfigGetRequest = { key, defaultValue };
      return await ipcService.invoke<T>(CONFIG_CHANNELS.GET_CONFIG, request);
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
      
      const request: ConfigSetRequest = { key, value };
      return await ipcService.invoke(CONFIG_CHANNELS.SET_CONFIG, request);
    } catch (error) {
      console.error('设置配置失败:', error);
      return false;
    }
  },
  
  /**
   * 获取所有配置
   */
  async getAllConfigs(): Promise<Record<string, any>> {
    try {
      return await ipcService.invoke(CONFIG_CHANNELS.GET_ALL_CONFIGS);
    } catch (error) {
      console.error('获取所有配置失败:', error);
      return {};
    }
  }
}; 