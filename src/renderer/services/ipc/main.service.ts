import { LLMConfig } from '../../../common/types/llm';
import { GlobalProxyConfig, ProxyConfig } from '../../components/settings/types/LLMSettingsTypes';
import { ipcService } from './core';

/**
 * 主服务接口，用于调用主进程的服务
 */
interface MainService {
  getConfigs(): Promise<LLMConfig[]>;
  createConfig(config: Partial<LLMConfig>): Promise<LLMConfig>;
  updateConfig(config: Partial<LLMConfig>): Promise<LLMConfig>;
  deleteConfig(configId: string): Promise<void>;
  setDefaultConfig(configId: string): Promise<void>;
  getGlobalProxy(): Promise<GlobalProxyConfig>;
  setGlobalProxy(config: GlobalProxyConfig): Promise<void>;
  setConfigProxy(configId: string, proxy: ProxyConfig): Promise<void>;
  getConfigProxy(configId: string): Promise<ProxyConfig | null>;
}

class MainServiceImpl implements MainService {
  /**
   * 获取所有LLM配置
   */
  async getConfigs(): Promise<LLMConfig[]> {
    try {
      return await ipcService.invoke('main:getConfigs');
    } catch (error) {
      console.error('获取LLM配置失败', error);
      throw error;
    }
  }

  /**
   * 创建LLM配置
   * @param config LLM配置
   */
  async createConfig(config: Partial<LLMConfig>): Promise<LLMConfig> {
    try {
      return await ipcService.invoke('main:createConfig', config);
    } catch (error) {
      console.error('创建LLM配置失败', error);
      throw error;
    }
  }

  /**
   * 更新LLM配置
   * @param config LLM配置
   */
  async updateConfig(config: Partial<LLMConfig>): Promise<LLMConfig> {
    try {
      return await ipcService.invoke('main:updateConfig', config);
    } catch (error) {
      console.error('更新LLM配置失败', error);
      throw error;
    }
  }

  /**
   * 删除LLM配置
   * @param configId 配置ID
   */
  async deleteConfig(configId: string): Promise<void> {
    try {
      await ipcService.invoke('main:deleteConfig', configId);
    } catch (error) {
      console.error('删除LLM配置失败', error);
      throw error;
    }
  }

  /**
   * 设置默认LLM配置
   * @param configId 配置ID
   */
  async setDefaultConfig(configId: string): Promise<void> {
    try {
      await ipcService.invoke('main:setDefaultConfig', configId);
    } catch (error) {
      console.error('设置默认LLM配置失败', error);
      throw error;
    }
  }

  /**
   * 获取全局代理配置
   */
  async getGlobalProxy(): Promise<GlobalProxyConfig> {
    try {
      return await ipcService.invoke('main:getGlobalProxy');
    } catch (error) {
      console.error('获取全局代理配置失败', error);
      throw error;
    }
  }

  /**
   * 设置全局代理配置
   * @param config 代理配置
   */
  async setGlobalProxy(config: GlobalProxyConfig): Promise<void> {
    try {
      await ipcService.invoke('main:setGlobalProxy', config);
    } catch (error) {
      console.error('设置全局代理配置失败', error);
      throw error;
    }
  }

  /**
   * 设置配置的代理
   * @param configId 配置ID
   * @param proxy 代理配置
   */
  async setConfigProxy(configId: string, proxy: ProxyConfig): Promise<void> {
    try {
      await ipcService.invoke('main:setConfigProxy', { configId, proxy });
    } catch (error) {
      console.error('设置配置代理失败', error);
      throw error;
    }
  }

  /**
   * 获取配置的代理
   * @param configId 配置ID
   */
  async getConfigProxy(configId: string): Promise<ProxyConfig | null> {
    try {
      return await ipcService.invoke('main:getConfigProxy', configId);
    } catch (error) {
      console.error('获取配置代理失败', error);
      return null;
    }
  }
}

// 单例实例
let mainService: MainService | null = null;

/**
 * 获取MainService实例
 */
export function getMainService(): MainService {
  if (!mainService) {
    mainService = new MainServiceImpl();
  }
  return mainService;
} 