/**
 * useModels钩子
 * 用于获取和管理LLM模型列表
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { message } from 'antd';

import { LLMModelConfig, LLMProvider } from '../../../../common/types/llm';
import modelManager from '../managers/modelManager';
import { filterModels } from '../utils/filters';

interface UseModelsProps {
  providerId?: string | LLMProvider;
  includeCustomModels?: boolean;
  searchQuery?: string;
}

interface UseModelsReturn {
  models: LLMModelConfig[];
  filteredModels: LLMModelConfig[];
  loading: boolean;
  error: string | null;
  refreshModels: (providerId: string | LLMProvider, forceRefresh?: boolean) => Promise<void>;
  addCustomModel: (providerId: string, model: Omit<LLMModelConfig, 'id'>) => Promise<LLMModelConfig | null>;
  deleteCustomModel: (providerId: string, modelId: string) => Promise<boolean>;
  getAllModels: (providerId: string | LLMProvider) => Promise<LLMModelConfig[]>;
  getModelById: (modelId: string) => LLMModelConfig | undefined;
}

/**
 * 获取和管理LLM模型的钩子
 */
export const useModels = ({
  providerId,
  includeCustomModels = true,
  searchQuery = ''
}: UseModelsProps = {}): UseModelsReturn => {
  const [models, setModels] = useState<LLMModelConfig[]>([]);
  const [customModels, setCustomModels] = useState<LLMModelConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 加载指定提供商的模型
   */
  const fetchModels = useCallback(async (providerId: string | LLMProvider, forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchedModels = await modelManager.getAvailableModels(providerId, forceRefresh);
      setModels(fetchedModels);
      return fetchedModels;
    } catch (err) {
      console.error("获取模型列表失败:", err);
      setError('获取模型列表失败，请检查API密钥或网络连接');
      message.error('获取模型列表失败');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 加载自定义模型
   */
  const fetchCustomModels = useCallback(async (providerId: string) => {
    try {
      const fetchedCustomModels = await modelManager.getCustomModels(providerId);
      setCustomModels(fetchedCustomModels);
      return fetchedCustomModels;
    } catch (err) {
      console.error("获取自定义模型失败:", err);
      message.error('获取自定义模型失败');
      return [];
    }
  }, []);
  
  /**
   * 添加自定义模型
   */
  const addCustomModel = useCallback(async (providerId: string, model: Omit<LLMModelConfig, 'id'>): Promise<LLMModelConfig | null> => {
    try {
      const newModel = await modelManager.addCustomModel(providerId, model);
      
      if (newModel) {
        // 重新加载自定义模型列表
        await fetchCustomModels(providerId);
        return newModel;
      }
      return null;
    } catch (err) {
      console.error("添加自定义模型失败:", err);
      message.error('添加自定义模型失败');
      return null;
    }
  }, [fetchCustomModels]);
  
  /**
   * 删除自定义模型
   */
  const deleteCustomModel = useCallback(async (providerId: string, modelId: string) => {
    try {
      const deleted = await modelManager.deleteCustomModel(providerId, modelId);
      
      if (deleted) {
        // 更新自定义模型列表
        setCustomModels(prev => prev.filter(model => model.id !== modelId));
        message.success('删除自定义模型成功');
        return true;
      }
      
      message.error('删除自定义模型失败');
      return false;
    } catch (err) {
      console.error("删除自定义模型失败:", err);
      message.error('删除自定义模型失败');
      return false;
    }
  }, []);
  
  /**
   * 获取所有模型（包括自定义模型）
   */
  const getAllModels = useCallback(async (providerId: string | LLMProvider) => {
    try {
      return await modelManager.getAllModels(providerId);
    } catch (err) {
      console.error("获取所有模型失败:", err);
      message.error('获取所有模型失败');
      return [];
    }
  }, []);
  
  /**
   * 根据ID获取模型
   */
  const getModelById = useCallback((modelId: string) => {
    const allModels = [...models, ...customModels];
    return allModels.find(model => model.id === modelId);
  }, [models, customModels]);
  
  /**
   * 初始化 - 加载自定义模型
   */
  useEffect(() => {
    fetchCustomModels(providerId as string);
  }, [fetchCustomModels, providerId]);

  // 根据搜索条件过滤模型
  const filteredModels = useMemo(() => {
    return filterModels(models, searchQuery);
  }, [models, searchQuery]);

  return {
    models,
    customModels,
    loading,
    error,
    refreshModels: fetchModels,
    addCustomModel,
    deleteCustomModel,
    getAllModels,
    getModelById,
    filteredModels
  };
};

export default useModels; 