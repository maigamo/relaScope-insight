import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import Store from 'electron-store';
import { app } from 'electron';
import { AllConfigs } from '../../../common/types/config';
import { defaultConfigs } from './default-configs';

/**
 * 配置服务类
 * 负责配置文件的读写和管理
 */
export class ConfigService {
  private static instance: ConfigService;
  private stores: Record<string, Store>;
  private configDir: string;

  /**
   * 获取配置服务实例
   */
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * 构造函数 - 初始化配置存储
   */
  private constructor() {
    this.configDir = this.getConfigPath();
    this.stores = {};
    this.initializeStores();
  }

  /**
   * 根据操作系统获取配置文件路径
   */
  private getConfigPath(): string {
    let configPath: string;
    
    switch (process.platform) {
      case 'win32':
        configPath = path.join(app.getPath('appData'), 'RelaScope Insight', 'Config');
        break;
      case 'darwin':
        configPath = path.join(os.homedir(), 'Library', 'Application Support', 'RelaScope Insight', 'Config');
        break;
      default: // linux and others
        configPath = path.join(os.homedir(), '.config', 'relascope-insight');
    }
    
    // 确保配置目录存在
    if (!fs.existsSync(configPath)) {
      fs.mkdirSync(configPath, { recursive: true });
    }
    
    return configPath;
  }

  /**
   * 初始化所有配置存储
   */
  private initializeStores() {
    const configTypes = [
      'app', 'ui', 'db', 'llm', 'analysis', 'security', 'export', 'update'
    ];
    
    configTypes.forEach(type => {
      const configPath = path.join(this.configDir, `${type}-config.json`);
      this.stores[type] = new Store({
        name: `${type}-config`,
        cwd: this.configDir,
        defaults: defaultConfigs[type as keyof typeof defaultConfigs]
      });
    });
  }

  /**
   * 获取配置值
   * @param type 配置类型
   * @param key 配置键
   * @param defaultValue 默认值
   */
  public get<T>(
    type: keyof AllConfigs, 
    key: string, 
    defaultValue?: any
  ): T {
    try {
      if (!this.stores[type]) {
        console.error(`配置类型不存在: ${type}`);
        return defaultValue;
      }
      
      return this.stores[type].get(key, defaultValue) as T;
    } catch (error: any) {
      console.error(`获取配置失败: ${error.message}`);
      return defaultValue;
    }
  }

  /**
   * 设置配置值
   * @param type 配置类型
   * @param key 配置键
   * @param value 配置值
   */
  public set<T>(
    type: keyof AllConfigs, 
    key: string, 
    value: T
  ): boolean {
    try {
      if (!this.stores[type]) {
        console.error(`配置类型不存在: ${type}`);
        return false;
      }
      
      this.stores[type].set(key, value);
      return true;
    } catch (error: any) {
      console.error(`设置配置失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 获取指定类型的所有配置
   * @param type 配置类型
   */
  public getAll(type: keyof AllConfigs): any {
    try {
      if (!this.stores[type]) {
        console.error(`配置类型不存在: ${type}`);
        return defaultConfigs[type];
      }
      
      return this.stores[type].store;
    } catch (error: any) {
      console.error(`获取所有配置失败: ${error.message}`);
      return defaultConfigs[type];
    }
  }

  /**
   * 获取所有配置
   */
  public getAllConfigs(): AllConfigs {
    const configs = {} as AllConfigs;
    Object.keys(this.stores).forEach(type => {
      configs[type as keyof AllConfigs] = this.getAll(type as keyof AllConfigs);
    });
    return configs;
  }

  /**
   * 重置指定类型的配置
   * @param type 配置类型
   */
  public reset(type: keyof AllConfigs): boolean {
    try {
      if (!this.stores[type]) {
        console.error(`配置类型不存在: ${type}`);
        return false;
      }
      
      this.stores[type].clear();
      this.stores[type].set(defaultConfigs[type]);
      return true;
    } catch (error: any) {
      console.error(`重置配置失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 重置所有配置
   */
  public resetAll(): boolean {
    try {
      Object.keys(this.stores).forEach(type => {
        this.reset(type as keyof AllConfigs);
      });
      return true;
    } catch (error: any) {
      console.error(`重置所有配置失败: ${error.message}`);
      return false;
    }
  }
} 