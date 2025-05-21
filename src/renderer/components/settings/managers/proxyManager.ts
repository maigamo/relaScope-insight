/**
 * 代理管理器
 * 用于管理HTTP代理设置
 */

// 使用window上的全局API进行IPC通信
const ipc = (window as any).electron?.ipcRenderer || {
  invoke: (...args: any[]) => {
    console.error('IPC not available:', args);
    return Promise.reject(new Error('IPC not available'));
  }
};

// 代理配置接口
export interface ProxyConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'socks4' | 'socks5';
  auth?: {
    username: string;
    password: string;
  };
  isActive: boolean;
  isEnabled: boolean;
}

/**
 * 代理管理器类
 * 单例模式实现
 */
class ProxyManager {
  private static instance: ProxyManager;
  private proxiesCache: ProxyConfig[] = [];
  private isInitialized: boolean = false;

  private constructor() {
    // 初始化
  }

  /**
   * 获取ProxyManager实例
   */
  public static getInstance(): ProxyManager {
    if (!ProxyManager.instance) {
      ProxyManager.instance = new ProxyManager();
    }
    return ProxyManager.instance;
  }

  /**
   * 初始化代理管理器
   */
  public async init(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // 加载代理配置
      await this.getProxies(true);
      this.isInitialized = true;
    } catch (error) {
      console.error('初始化代理管理器失败:', error);
      this.isInitialized = false;
    }
  }

  /**
   * 获取所有代理配置
   * @param forceRefresh 是否强制刷新缓存
   */
  public async getProxies(forceRefresh = false): Promise<ProxyConfig[]> {
    try {
      // 如果有缓存且不需要强制刷新，直接返回
      if (!forceRefresh && this.proxiesCache.length > 0) {
        return this.proxiesCache;
      }
      
      // 调用IPC获取代理配置
      const proxies = await ipc.invoke('proxy:getProxies');
      
      // 如果获取成功且返回有效数据
      if (proxies && Array.isArray(proxies)) {
        // 更新缓存
        this.proxiesCache = proxies;
        return proxies;
      }
      
      return [];
    } catch (error) {
      console.error('获取代理配置列表失败:', error);
      return [];
    }
  }

  /**
   * 获取当前活跃代理配置
   */
  public async getActiveProxy(): Promise<ProxyConfig | null> {
    try {
      const proxies = await this.getProxies();
      return proxies.find(proxy => proxy.isActive) || null;
    } catch (error) {
      console.error('获取活跃代理配置失败:', error);
      return null;
    }
  }

  /**
   * 添加代理配置
   * @param proxy 代理配置（不含ID）
   */
  public async addProxy(proxy: Omit<ProxyConfig, 'id'>): Promise<ProxyConfig | null> {
    try {
      // 调用IPC保存代理配置
      const savedProxy = await ipc.invoke('proxy:saveProxy', proxy);
      
      if (savedProxy) {
        // 更新缓存
        
        // 如果设置为活跃代理，需要更新其他代理的状态
        if (proxy.isActive) {
          this.proxiesCache.forEach(p => p.isActive = false);
        }
        
        // 添加新代理到缓存
        this.proxiesCache.push(savedProxy);
        
        return savedProxy;
      }
      
      return null;
    } catch (error) {
      console.error('添加代理配置失败:', error);
      return null;
    }
  }

  /**
   * 更新代理配置
   * @param proxyId 代理ID
   * @param updates 更新内容
   */
  public async updateProxy(
    proxyId: string, 
    updates: Partial<Omit<ProxyConfig, 'id'>>
  ): Promise<ProxyConfig | null> {
    try {
      // 获取当前代理配置
      const currentProxies = await this.getProxies();
      const proxyToUpdate = currentProxies.find(p => p.id === proxyId);
      
      if (!proxyToUpdate) {
        console.warn(`找不到要更新的代理配置: ${proxyId}`);
        return null;
      }
      
      // 创建更新后的代理对象
      const updatedProxy = { ...proxyToUpdate, ...updates };
      
      // 调用IPC更新代理配置
      const result = await ipc.invoke('proxy:updateProxy', proxyId, updates);
      
      if (result) {
        // 更新缓存
        const updatedProxies = currentProxies.map(p => p.id === proxyId ? updatedProxy : p);
        
        // 如果设置了新的活跃代理，需要更新其他代理的状态
        if (updates.isActive) {
          updatedProxies.forEach(p => {
            if (p.id !== proxyId) {
              p.isActive = false;
            }
          });
        }
        
        this.proxiesCache = updatedProxies;
        
        return updatedProxy;
      }
      
      return null;
    } catch (error) {
      console.error(`更新代理配置 ${proxyId} 失败:`, error);
      return null;
    }
  }

  /**
   * 删除代理配置
   * @param proxyId 代理ID
   */
  public async deleteProxy(proxyId: string): Promise<boolean> {
    try {
      // 调用IPC删除代理配置
      const result = await ipc.invoke('proxy:deleteProxy', proxyId);
      
      if (result) {
        // 更新缓存
        this.proxiesCache = this.proxiesCache.filter(p => p.id !== proxyId);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`删除代理配置 ${proxyId} 失败:`, error);
      return false;
    }
  }

  /**
   * 启用代理
   * @param proxyId 代理ID
   */
  public async enableProxy(proxyId: string): Promise<boolean> {
    try {
      return !!(await this.updateProxy(proxyId, { isEnabled: true }));
    } catch (error) {
      console.error(`启用代理配置 ${proxyId} 失败:`, error);
      return false;
    }
  }

  /**
   * 禁用代理
   * @param proxyId 代理ID
   */
  public async disableProxy(proxyId: string): Promise<boolean> {
    try {
      return !!(await this.updateProxy(proxyId, { isEnabled: false }));
    } catch (error) {
      console.error(`禁用代理配置 ${proxyId} 失败:`, error);
      return false;
    }
  }

  /**
   * 设置活跃代理
   * @param proxyId 代理ID
   */
  public async setActiveProxy(proxyId: string): Promise<boolean> {
    try {
      return !!(await this.updateProxy(proxyId, { isActive: true }));
    } catch (error) {
      console.error(`设置活跃代理配置 ${proxyId} 失败:`, error);
      return false;
    }
  }

  /**
   * 测试代理连接
   * @param proxyId 代理ID
   */
  public async testProxyConnection(proxyId: string): Promise<boolean> {
    try {
      // 调用IPC测试代理连接
      return await ipc.invoke('proxy:testConnection', proxyId);
    } catch (error) {
      console.error(`测试代理配置 ${proxyId} 连接失败:`, error);
      return false;
    }
  }

  /**
   * 清除代理缓存
   */
  public clearCache(): void {
    this.proxiesCache = [];
  }
}

// 导出单例实例
export const proxyManager = ProxyManager.getInstance();

export default proxyManager; 