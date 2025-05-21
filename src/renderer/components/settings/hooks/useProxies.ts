/**
 * useProxies钩子
 * 用于获取和管理代理配置
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { message } from 'antd';

import { proxyManager, ProxyConfig } from '../managers/proxyManager';
import { filterProxies } from '../utils/filters';

interface UseProxiesProps {
  searchQuery?: string;
}

interface UseProxiesReturn {
  proxies: ProxyConfig[];
  filteredProxies: ProxyConfig[];
  activeProxy: ProxyConfig | null;
  loading: boolean;
  error: string | null;
  refreshProxies: () => Promise<void>;
  addProxy: (proxy: Omit<ProxyConfig, 'id'>) => Promise<ProxyConfig | null>;
  updateProxy: (proxyId: string, updates: Partial<Omit<ProxyConfig, 'id'>>) => Promise<ProxyConfig | null>;
  deleteProxy: (proxyId: string) => Promise<boolean>;
  setActiveProxy: (proxyId: string) => Promise<boolean>;
  enableProxy: (proxyId: string) => Promise<boolean>;
  disableProxy: (proxyId: string) => Promise<boolean>;
  testConnection: (proxyId: string) => Promise<boolean>;
}

/**
 * 获取和管理代理配置的钩子
 */
export const useProxies = ({
  searchQuery = ''
}: UseProxiesProps = {}): UseProxiesReturn => {
  const [proxies, setProxies] = useState<ProxyConfig[]>([]);
  const [activeProxy, setActiveProxy] = useState<ProxyConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 获取代理列表
  const fetchProxies = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      // 获取代理列表
      const proxyList = await proxyManager.getProxies(forceRefresh);
      setProxies(proxyList);
      
      // 获取当前活跃代理
      const active = await proxyManager.getActiveProxy();
      setActiveProxy(active);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '获取代理列表失败';
      setError(errorMsg);
      message.error(`获取代理列表失败: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchProxies();
  }, [fetchProxies]);

  // 刷新代理列表
  const refreshProxies = useCallback(async () => {
    await fetchProxies(true);
  }, [fetchProxies]);

  // 添加代理
  const addProxy = useCallback(async (proxy: Omit<ProxyConfig, 'id'>) => {
    try {
      const newProxy = await proxyManager.addProxy(proxy);
      
      if (newProxy) {
        // 刷新代理列表
        await refreshProxies();
        message.success('代理添加成功');
        return newProxy;
      } else {
        message.error('添加代理失败');
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '添加代理失败';
      message.error(`添加代理失败: ${errorMsg}`);
      return null;
    }
  }, [refreshProxies]);

  // 更新代理
  const updateProxy = useCallback(async (
    proxyId: string, 
    updates: Partial<Omit<ProxyConfig, 'id'>>
  ) => {
    try {
      const updatedProxy = await proxyManager.updateProxy(proxyId, updates);
      
      if (updatedProxy) {
        // 刷新代理列表
        await refreshProxies();
        message.success('代理更新成功');
        return updatedProxy;
      } else {
        message.error('更新代理失败');
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '更新代理失败';
      message.error(`更新代理失败: ${errorMsg}`);
      return null;
    }
  }, [refreshProxies]);

  // 删除代理
  const deleteProxy = useCallback(async (proxyId: string) => {
    try {
      const success = await proxyManager.deleteProxy(proxyId);
      
      if (success) {
        // 刷新代理列表
        await refreshProxies();
        message.success('代理删除成功');
        return true;
      } else {
        message.error('删除代理失败');
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '删除代理失败';
      message.error(`删除代理失败: ${errorMsg}`);
      return false;
    }
  }, [refreshProxies]);

  // 设置活跃代理
  const setActiveProxyFn = useCallback(async (proxyId: string) => {
    try {
      const success = await proxyManager.setActiveProxy(proxyId);
      
      if (success) {
        // 刷新代理列表
        await refreshProxies();
        message.success('设置活跃代理成功');
        return true;
      } else {
        message.error('设置活跃代理失败');
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '设置活跃代理失败';
      message.error(`设置活跃代理失败: ${errorMsg}`);
      return false;
    }
  }, [refreshProxies]);

  // 启用代理
  const enableProxy = useCallback(async (proxyId: string) => {
    try {
      const success = await proxyManager.enableProxy(proxyId);
      
      if (success) {
        // 刷新代理列表
        await refreshProxies();
        message.success('启用代理成功');
        return true;
      } else {
        message.error('启用代理失败');
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '启用代理失败';
      message.error(`启用代理失败: ${errorMsg}`);
      return false;
    }
  }, [refreshProxies]);

  // 禁用代理
  const disableProxy = useCallback(async (proxyId: string) => {
    try {
      const success = await proxyManager.disableProxy(proxyId);
      
      if (success) {
        // 刷新代理列表
        await refreshProxies();
        message.success('禁用代理成功');
        return true;
      } else {
        message.error('禁用代理失败');
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '禁用代理失败';
      message.error(`禁用代理失败: ${errorMsg}`);
      return false;
    }
  }, [refreshProxies]);

  // 测试代理连接
  const testConnection = useCallback(async (proxyId: string) => {
    try {
      const success = await proxyManager.testProxyConnection(proxyId);
      
      if (success) {
        message.success('代理连接测试成功');
        return true;
      } else {
        message.error('代理连接测试失败');
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '代理连接测试失败';
      message.error(`代理连接测试失败: ${errorMsg}`);
      return false;
    }
  }, []);

  // 根据搜索条件过滤代理
  const filteredProxies = useMemo(() => {
    return filterProxies(proxies, searchQuery);
  }, [proxies, searchQuery]);

  return {
    proxies,
    filteredProxies,
    activeProxy,
    loading,
    error,
    refreshProxies,
    addProxy,
    updateProxy,
    deleteProxy,
    setActiveProxy: setActiveProxyFn,
    enableProxy,
    disableProxy,
    testConnection
  };
};

export default useProxies; 