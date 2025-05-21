/**
 * API密钥管理钩子
 * 用于管理API密钥的状态与操作
 */
import { useState, useCallback, useEffect } from 'react';
import { LLMProvider } from '../../../../../common/types/llm';
import { apiKeyManager } from '../../managers';
import { useLLMContext } from '../../context/LLMContext';
import { message } from 'antd';
import * as apiKeyIPC from '../../utils/ipc/apiKey';

// 使用预加载脚本中注入的IPC渲染器
const ipc = (window as any).electron?.ipcRenderer || {
  invoke: (...args: any[]) => {
    console.error('IPC not available:', args);
    return Promise.reject(new Error('IPC not available'));
  }
};

// API密钥对象接口
export interface ApiKey {
  id: string;
  provider: LLMProvider;
  key: string;
  name?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

/**
 * API密钥管理钩子
 * 提供API密钥的获取、保存、验证等功能
 */
export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  
  // 获取所有提供商的API密钥
  const getAllApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      // 获取各个主要提供商的密钥
      const providers = Object.values(LLMProvider);
      const keysPromises = providers.map(provider => 
        apiKeyManager.getApiKeys(provider.toString())
      );
      
      const results = await Promise.all(keysPromises);
      const allKeys = results.flat();
      
      setApiKeys(allKeys || []);
      return allKeys;
    } catch (error) {
      console.error('获取API密钥失败:', error);
      message.error('获取API密钥失败');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 获取指定提供商的API密钥
  const getProviderApiKeys = useCallback(async (provider: LLMProvider) => {
    try {
      setLoading(true);
      const keys = await apiKeyManager.getApiKeys(provider.toString(), true);
      return keys || [];
    } catch (error) {
      console.error(`获取${provider}提供商的API密钥失败:`, error);
      message.error(`获取${provider}提供商的API密钥失败`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 添加或更新API密钥
  const saveApiKey = useCallback(async (apiKey: ApiKey) => {
    try {
      setLoading(true);
      const { provider, key, name, isActive } = apiKey;
      
      // 如果有ID，更新现有密钥
      if (apiKey.id) {
        const updatedKey = await apiKeyManager.updateApiKey(
          provider.toString(),
          apiKey.id,
          { key, name, isActive }
        );
        
        if (updatedKey) {
          await getAllApiKeys(); // 刷新所有密钥
          message.success('更新API密钥成功');
          return true;
        }
      } else {
        // 否则添加新密钥
        const newKey = await apiKeyManager.addApiKey(
          provider.toString(),
          key,
          name,
          !!isActive
        );
        
        if (newKey) {
          await getAllApiKeys(); // 刷新所有密钥
          message.success('添加API密钥成功');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('保存API密钥失败:', error);
      message.error('保存API密钥失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, [getAllApiKeys]);
  
  // 删除API密钥
  const deleteApiKey = useCallback(async (keyId: string, provider: LLMProvider) => {
    try {
      setLoading(true);
      const result = await apiKeyManager.deleteApiKey(provider.toString(), keyId);
      if (result) {
        // 更新本地状态
        setApiKeys(prev => prev.filter(key => key.id !== keyId));
        message.success('删除API密钥成功');
        return true;
      }
      return false;
    } catch (error) {
      console.error('删除API密钥失败:', error);
      message.error('删除API密钥失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 设置默认/活跃API密钥
  const setDefaultApiKey = useCallback(async (keyId: string, provider: LLMProvider) => {
    try {
      setLoading(true);
      const result = await apiKeyManager.setActiveApiKey(provider.toString(), keyId);
      if (result) {
        // 刷新密钥列表以获取更新后的状态
        await getAllApiKeys();
        message.success('设置默认API密钥成功');
        return true;
      }
      return false;
    } catch (error) {
      console.error('设置默认API密钥失败:', error);
      message.error('设置默认API密钥失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, [getAllApiKeys]);
  
  // 验证API密钥
  const testApiKey = useCallback(async (provider: LLMProvider, key: string) => {
    try {
      setTestingKey(key);
      // 创建临时密钥对象
      const tempKey: Omit<ApiKey, 'id'> = {
        provider,
        key,
        name: '测试密钥',
        isActive: false
      };
      
      // 调用IPC测试API密钥
      const isValid = await ipc.invoke('apiKey:testKey', provider.toString(), tempKey);
      
      if (isValid) {
        message.success('API密钥验证成功');
        return true;
      } else {
        message.error('API密钥验证失败');
        return false;
      }
    } catch (error) {
      console.error('测试API密钥失败:', error);
      message.error('测试API密钥失败');
      return false;
    } finally {
      setTestingKey(null);
    }
  }, []);
  
  // 获取指定提供商的API密钥
  const getApiKeyForProvider = useCallback((provider: LLMProvider): ApiKey | undefined => {
    // 首先查找该提供商的活跃/默认密钥
    const activeKey = apiKeys.find(key => 
      key.provider === provider && (key.isActive || key.isDefault)
    );
    
    if (activeKey) return activeKey;
    
    // 如果没有活跃/默认密钥，返回该提供商的第一个密钥
    return apiKeys.find(key => key.provider === provider);
  }, [apiKeys]);
  
  // 清除缓存
  const clearCache = useCallback(async (provider?: LLMProvider) => {
    if (provider) {
      apiKeyManager.clearCache(provider.toString());
    } else {
      apiKeyManager.clearCache();
    }
    // 重新加载数据
    await getAllApiKeys();
    message.success('API密钥缓存已清除');
  }, [getAllApiKeys]);
  
  // 初始化时加载API密钥
  useEffect(() => {
    getAllApiKeys();
  }, [getAllApiKeys]);
  
  return {
    apiKeys,
    loading,
    testingKey,
    getAllApiKeys,
    getProviderApiKeys,
    saveApiKey,
    deleteApiKey,
    setDefaultApiKey,
    testApiKey,
    getApiKeyForProvider,
    clearCache
  };
}; 