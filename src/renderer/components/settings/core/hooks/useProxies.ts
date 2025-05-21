/**
 * 代理管理钩子
 * 用于管理代理设置的状态与操作
 */
import { useState, useCallback, useEffect } from 'react';
import { ProxyConfig } from '../../../../../common/types/llm';
import { proxyManager } from '../../managers';
import { useLLMContext } from '../../context/LLMContext';
import { message } from 'antd';
import * as proxyIPC from '../../utils/ipc/proxy';

// 使用预加载脚本中注入的IPC渲染器
const ipc = (window as any).electron?.ipcRenderer || {
  invoke: (...args: any[]) => {
    console.error('IPC not available:', args);
    return Promise.reject(new Error('IPC not available'));
  }
};

// 全局代理配置类型
export interface GlobalProxyConfig extends Omit<ProxyConfig, 'id' | 'name' | 'isActive'> {
  isGlobal: boolean;
}

/**
 * 代理管理钩子
 * 提供代理配置的获取、保存等功能
 */
export const useProxies = () => {
  const [proxies, setProxies] = useState<any[]>([]); // 使用any类型暂时绕过类型检查
  const [globalProxy, setGlobalProxy] = useState<GlobalProxyConfig>({
    enabled: false,
    host: '',
    port: 1080,
    protocol: 'http',
    isGlobal: true
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [globalProxyExpanded, setGlobalProxyExpanded] = useState<boolean>(false);
  
  // 获取所有代理配置
  const getAllProxies = useCallback(async () => {
    try {
      setLoading(true);
      const result = await proxyManager.getProxies(true);
      setProxies(result || []);
      return result;
    } catch (error) {
      console.error('获取代理配置失败:', error);
      message.error('获取代理配置失败');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 获取全局代理配置
  const getGlobalProxy = useCallback(async () => {
    try {
      setLoading(true);
      // 调用IPC获取全局代理
      const proxy = await ipc.invoke('proxy:getGlobalProxy');
      
      if (proxy) {
        const globalProxyConfig: GlobalProxyConfig = {
          enabled: !!proxy.enabled,
          host: proxy.host || '',
          port: proxy.port || 1080,
          protocol: proxy.protocol || 'http',
          isGlobal: true
        };
        
        setGlobalProxy(globalProxyConfig);
        return globalProxyConfig;
      }
      
      return null;
    } catch (error) {
      console.error('获取全局代理失败:', error);
      message.error('获取全局代理失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 保存全局代理配置
  const saveGlobalProxy = useCallback(async (proxy: GlobalProxyConfig) => {
    try {
      setLoading(true);
      
      // 转换为IPC接口接受的格式
      const proxyToSave = {
        enabled: proxy.enabled,
        host: proxy.host,
        port: proxy.port,
        protocol: proxy.protocol
      };
      
      // 调用IPC保存全局代理
      const result = await ipc.invoke('proxy:saveGlobalProxy', proxyToSave);
      
      if (result) {
        setGlobalProxy(proxy);
        message.success('保存全局代理成功');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('保存全局代理失败:', error);
      message.error('保存全局代理失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 添加代理配置
  const addProxy = useCallback(async (proxy: any) => {
    try {
      setLoading(true);
      const result = await proxyManager.addProxy(proxy);
      
      if (result) {
        // 刷新代理列表
        await getAllProxies();
        message.success('添加代理配置成功');
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('添加代理配置失败:', error);
      message.error('添加代理配置失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAllProxies]);
  
  // 更新代理配置
  const updateProxy = useCallback(async (proxyId: string, updates: any) => {
    try {
      setLoading(true);
      const result = await proxyManager.updateProxy(proxyId, updates);
      
      if (result) {
        // 刷新代理列表
        await getAllProxies();
        message.success('更新代理配置成功');
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('更新代理配置失败:', error);
      message.error('更新代理配置失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAllProxies]);
  
  // 删除代理配置
  const deleteProxy = useCallback(async (proxyId: string) => {
    try {
      setLoading(true);
      const result = await proxyManager.deleteProxy(proxyId);
      
      if (result) {
        // 刷新代理列表
        await getAllProxies();
        message.success('删除代理配置成功');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('删除代理配置失败:', error);
      message.error('删除代理配置失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, [getAllProxies]);
  
  // 设置活跃代理
  const setActiveProxy = useCallback(async (proxyId: string) => {
    try {
      setLoading(true);
      const result = await proxyManager.setActiveProxy(proxyId);
      
      if (result) {
        // 刷新代理列表
        await getAllProxies();
        message.success('设置活跃代理成功');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('设置活跃代理失败:', error);
      message.error('设置活跃代理失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, [getAllProxies]);
  
  // 测试代理连接
  const testProxy = useCallback(async (proxyId: string) => {
    try {
      setLoading(true);
      const result = await proxyManager.testProxyConnection(proxyId);
      
      if (result) {
        message.success('代理连接测试成功');
        return true;
      } else {
        message.error('代理连接测试失败');
        return false;
      }
    } catch (error) {
      console.error('测试代理连接失败:', error);
      message.error('测试代理连接失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 切换全局代理展开状态
  const toggleGlobalProxyExpanded = useCallback(() => {
    setGlobalProxyExpanded(prev => !prev);
  }, []);
  
  // 清除缓存
  const clearCache = useCallback(() => {
    proxyManager.clearCache();
    message.success('代理缓存已清除');
  }, []);
  
  // 初始化时加载代理配置和全局代理
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        getAllProxies(),
        getGlobalProxy()
      ]);
    };
    
    loadData();
  }, [getAllProxies, getGlobalProxy]);
  
  return {
    proxies,
    globalProxy,
    loading,
    globalProxyExpanded,
    getAllProxies,
    getGlobalProxy,
    saveGlobalProxy,
    addProxy,
    updateProxy,
    deleteProxy,
    setActiveProxy,
    testProxy,
    toggleGlobalProxyExpanded,
    clearCache
  };
}; 