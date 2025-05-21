/**
 * useApiKeys钩子
 * 用于获取和管理API密钥
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { message } from 'antd';

import { apiKeyManager, ApiKey } from '../managers/apiKeyManager';
import { filterApiKeys } from '../utils/filters';

interface UseApiKeysProps {
  providerId?: string;
  searchQuery?: string;
}

interface UseApiKeysReturn {
  apiKeys: ApiKey[];
  filteredApiKeys: ApiKey[];
  activeApiKey: ApiKey | null;
  loading: boolean;
  error: string | null;
  refreshApiKeys: () => Promise<void>;
  addApiKey: (key: string, name?: string, setActive?: boolean) => Promise<ApiKey | null>;
  updateApiKey: (keyId: string, updates: Partial<Omit<ApiKey, 'id' | 'provider'>>) => Promise<ApiKey | null>;
  deleteApiKey: (keyId: string) => Promise<boolean>;
  setActiveApiKey: (keyId: string) => Promise<boolean>;
  verifyApiKey: (keyId: string) => Promise<boolean>;
}

/**
 * 获取和管理API密钥的钩子
 */
export const useApiKeys = ({
  providerId,
  searchQuery = ''
}: UseApiKeysProps = {}): UseApiKeysReturn => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [activeApiKey, setActiveApiKey] = useState<ApiKey | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 获取API密钥列表
  const fetchApiKeys = useCallback(async (forceRefresh = false) => {
    if (!providerId) {
      setApiKeys([]);
      setActiveApiKey(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 获取API密钥列表
      const keysList = await apiKeyManager.getApiKeys(providerId, forceRefresh);
      setApiKeys(keysList);
      
      // 获取当前活跃API密钥
      const active = await apiKeyManager.getActiveApiKey(providerId);
      setActiveApiKey(active);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '获取API密钥列表失败';
      setError(errorMsg);
      message.error(`获取API密钥列表失败: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  // 初始加载和providerId改变时刷新API密钥列表
  useEffect(() => {
    if (providerId) {
      fetchApiKeys();
    }
  }, [providerId, fetchApiKeys]);

  // 刷新API密钥列表
  const refreshApiKeys = useCallback(async () => {
    await fetchApiKeys(true);
  }, [fetchApiKeys]);

  // 添加API密钥
  const addApiKey = useCallback(async (
    key: string, 
    name?: string, 
    setActive = false
  ) => {
    if (!providerId) {
      message.error('未指定提供商ID，无法添加API密钥');
      return null;
    }
    
    try {
      const newApiKey = await apiKeyManager.addApiKey(providerId, key, name, setActive);
      
      if (newApiKey) {
        // 刷新API密钥列表
        await refreshApiKeys();
        message.success('API密钥添加成功');
        return newApiKey;
      } else {
        message.error('添加API密钥失败');
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '添加API密钥失败';
      message.error(`添加API密钥失败: ${errorMsg}`);
      return null;
    }
  }, [providerId, refreshApiKeys]);

  // 更新API密钥
  const updateApiKey = useCallback(async (
    keyId: string, 
    updates: Partial<Omit<ApiKey, 'id' | 'provider'>>
  ) => {
    if (!providerId) {
      message.error('未指定提供商ID，无法更新API密钥');
      return null;
    }
    
    try {
      const updatedApiKey = await apiKeyManager.updateApiKey(providerId, keyId, updates);
      
      if (updatedApiKey) {
        // 刷新API密钥列表
        await refreshApiKeys();
        message.success('API密钥更新成功');
        return updatedApiKey;
      } else {
        message.error('更新API密钥失败');
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '更新API密钥失败';
      message.error(`更新API密钥失败: ${errorMsg}`);
      return null;
    }
  }, [providerId, refreshApiKeys]);

  // 删除API密钥
  const deleteApiKey = useCallback(async (keyId: string) => {
    if (!providerId) {
      message.error('未指定提供商ID，无法删除API密钥');
      return false;
    }
    
    try {
      const success = await apiKeyManager.deleteApiKey(providerId, keyId);
      
      if (success) {
        // 刷新API密钥列表
        await refreshApiKeys();
        message.success('API密钥删除成功');
        return true;
      } else {
        message.error('删除API密钥失败');
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '删除API密钥失败';
      message.error(`删除API密钥失败: ${errorMsg}`);
      return false;
    }
  }, [providerId, refreshApiKeys]);

  // 设置活跃API密钥
  const setActiveApiKeyFn = useCallback(async (keyId: string) => {
    if (!providerId) {
      message.error('未指定提供商ID，无法设置活跃API密钥');
      return false;
    }
    
    try {
      const success = await apiKeyManager.setActiveApiKey(providerId, keyId);
      
      if (success) {
        // 刷新API密钥列表
        await refreshApiKeys();
        message.success('设置活跃API密钥成功');
        return true;
      } else {
        message.error('设置活跃API密钥失败');
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '设置活跃API密钥失败';
      message.error(`设置活跃API密钥失败: ${errorMsg}`);
      return false;
    }
  }, [providerId, refreshApiKeys]);

  // 验证API密钥
  const verifyApiKey = useCallback(async (keyId: string) => {
    if (!providerId) {
      message.error('未指定提供商ID，无法验证API密钥');
      return false;
    }
    
    try {
      const isValid = await apiKeyManager.verifyApiKey(providerId, keyId);
      
      if (isValid) {
        message.success('API密钥验证成功');
        return true;
      } else {
        message.error('API密钥验证失败');
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'API密钥验证失败';
      message.error(`API密钥验证失败: ${errorMsg}`);
      return false;
    }
  }, [providerId]);

  // 根据搜索条件过滤API密钥
  const filteredApiKeys = useMemo(() => {
    return filterApiKeys(apiKeys, searchQuery);
  }, [apiKeys, searchQuery]);

  return {
    apiKeys,
    filteredApiKeys,
    activeApiKey,
    loading,
    error,
    refreshApiKeys,
    addApiKey,
    updateApiKey,
    deleteApiKey,
    setActiveApiKey: setActiveApiKeyFn,
    verifyApiKey
  };
};

export default useApiKeys; 