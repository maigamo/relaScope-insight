/**
 * 提供商管理钩子
 * 用于LLM提供商的管理和操作
 */
import { useCallback, useState } from 'react';
import { LLMProvider } from '../../../../../common/types/llm';
import * as providerIPC from '../../utils/ipc/provider';
import { message } from 'antd';
import { getProviderName } from '../../utils/formatters';
import { Provider } from '../state';

/**
 * 使用提供商管理功能
 * 提供对LLM提供商的各种操作
 */
export const useProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [activeProviderId, setActiveProviderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * 初始化提供商列表
   * 从LLMProvider枚举生成Provider列表
   */
  const initProviders = useCallback(async () => {
    try {
      setLoading(true);
      
      // 获取默认提供商ID (如果有)
      const defaultProviderId = await providerIPC.getDefaultProviderId();
      
      // 初始化提供商列表
      const initialProviders: Provider[] = Object.keys(LLMProvider)
        .filter(key => isNaN(Number(key))) // 排除枚举的数值属性
        .map(key => {
          const providerId = LLMProvider[key as keyof typeof LLMProvider];
          return {
            id: providerId,
            provider: providerId as LLMProvider,
            name: getProviderName(providerId),
            isDefault: providerId === defaultProviderId
          };
        });
      
      // 更新状态
      setProviders(initialProviders);
      
      // 如果有默认提供商，选中它
      if (defaultProviderId) {
        setActiveProviderId(defaultProviderId);
      } else if (initialProviders.length > 0) {
        setActiveProviderId(initialProviders[0].id);
      }
      
      return initialProviders;
    } catch (error) {
      console.error('初始化提供商列表失败:', error);
      message.error('无法加载提供商列表');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 设置默认提供商
   */
  const setDefaultProvider = useCallback(async (providerId: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const success = await providerIPC.setDefaultProvider(providerId);
      
      if (success) {
        // 更新提供商列表中的isDefault属性
        setProviders(prev => prev.map(p => ({
          ...p,
          isDefault: p.id === providerId
        })));
        
        message.success('成功设置默认提供商');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('设置默认提供商失败:', error);
      message.error('设置默认提供商失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 获取提供商详情
   */
  const getProviderDetail = useCallback((providerId: string | null): Provider | null => {
    if (!providerId) return null;
    return providers.find(p => p.id === providerId) || null;
  }, [providers]);

  /**
   * 获取提供商API密钥
   */
  const getProviderApiKey = useCallback(async (providerId: string): Promise<string> => {
    try {
      if (!providerId) return '';
      
      setLoading(true);
      const apiKey = await providerIPC.getApiKey(providerId);
      return apiKey;
    } catch (error) {
      console.error('获取API密钥失败:', error);
      return '';
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 测试提供商API密钥
   */
  const testProviderApiKey = useCallback(async (providerId: string, apiKey: string) => {
    try {
      setLoading(true);
      
      if (!providerId || !apiKey) {
        message.error('提供商ID和API密钥不能为空');
        return { success: false, error: '提供商ID和API密钥不能为空' };
      }
      
      const result = await providerIPC.testApiKey(providerId as LLMProvider, apiKey);
      
      if (result.success) {
        message.success('API密钥验证成功');
      } else {
        message.error(`API密钥验证失败: ${result.error || '未知错误'}`);
      }
      
      return result;
    } catch (error) {
      console.error('测试API密钥失败:', error);
      message.error('测试API密钥失败');
      return { success: false, error: '测试API密钥失败' };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 根据提供商获取可用模型列表
   */
  const getProviderModels = useCallback(async (providerId: string) => {
    try {
      setLoading(true);
      
      if (!providerId) {
        return [];
      }
      
      const models = await providerIPC.getAvailableModels(providerId as LLMProvider);
      return models;
    } catch (error) {
      console.error('获取模型列表失败:', error);
      message.error('无法获取模型列表');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    providers,
    activeProviderId,
    loading,
    setActiveProviderId,
    initProviders,
    setDefaultProvider,
    getProviderDetail,
    getProviderApiKey,
    testProviderApiKey,
    getProviderModels
  };
}; 