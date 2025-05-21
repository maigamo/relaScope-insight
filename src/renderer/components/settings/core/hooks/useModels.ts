/**
 * 模型管理钩子
 * 用于管理LLM模型相关操作
 */
import { useState, useCallback, useEffect } from 'react';
import { LLMModelConfig, LLMProvider } from '../../../../../common/types/llm';
import { modelManager } from '../../managers';
import { useLLMContext } from '../../context/LLMContext';
import { message } from 'antd';

/**
 * 模型管理钩子
 * 提供模型获取、缓存、自定义模型管理等功能
 */
export const useModels = () => {
  const [models, setModels] = useState<LLMModelConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [customModels, setCustomModels] = useState<LLMModelConfig[]>([]);
  
  // 获取某个提供商的所有可用模型
  const getProviderModels = useCallback(async (providerId: LLMProvider) => {
    try {
      setLoading(true);
      // 使用modelManager获取模型
      const availableModels = await modelManager.getAvailableModels(providerId);
      setModels(availableModels || []);
      return availableModels;
    } catch (error) {
      console.error('获取模型列表失败:', error);
      message.error('获取模型列表失败');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 获取默认模型列表，当API请求失败时使用
  const getDefaultModels = useCallback((providerId: LLMProvider): LLMModelConfig[] => {
    return modelManager.getDefaultModels(providerId);
  }, []);
  
  // 添加自定义模型
  const addCustomModel = useCallback(async (model: LLMModelConfig, providerId: LLMProvider) => {
    try {
      // 移除ID字段，因为addCustomModel接口接受Omit<LLMModelConfig, 'id'>类型
      const { id, ...modelWithoutId } = model;
      
      // 使用modelManager添加自定义模型
      const result = await modelManager.addCustomModel(providerId.toString(), modelWithoutId);
      if (result) {
        // 加载最新的自定义模型列表
        const updatedCustomModels = await modelManager.getCustomModels(providerId.toString());
        setCustomModels(updatedCustomModels || []);
        message.success('添加自定义模型成功');
        return true;
      }
      return false;
    } catch (error) {
      console.error('添加自定义模型失败:', error);
      message.error('添加自定义模型失败');
      return false;
    }
  }, []);
  
  // 删除自定义模型
  const deleteCustomModel = useCallback(async (modelId: string, providerId: LLMProvider) => {
    try {
      // 使用modelManager删除自定义模型
      const result = await modelManager.deleteCustomModel(providerId.toString(), modelId);
      if (result) {
        // 更新本地状态
        setCustomModels(prev => prev.filter(model => model.id !== modelId));
        message.success('删除自定义模型成功');
        return true;
      }
      return false;
    } catch (error) {
      console.error('删除自定义模型失败:', error);
      message.error('删除自定义模型失败');
      return false;
    }
  }, []);
  
  // 清除模型缓存
  const clearModelCache = useCallback(async (providerId?: LLMProvider) => {
    try {
      // 使用modelManager清除模型缓存
      if (providerId) {
        modelManager.clearCache(providerId.toString());
      } else {
        modelManager.clearCache();
      }
      message.success('清除模型缓存成功');
      return true;
    } catch (error) {
      console.error('清除模型缓存失败:', error);
      message.error('清除模型缓存失败');
      return false;
    }
  }, []);
  
  // 加载自定义模型列表
  useEffect(() => {
    const loadCustomModels = async () => {
      try {
        // 默认加载OpenAI的自定义模型
        const providerModels = await modelManager.getCustomModels(LLMProvider.OPENAI.toString());
        setCustomModels(providerModels || []);
      } catch (error) {
        console.error('加载自定义模型失败:', error);
      }
    };
    
    loadCustomModels();
  }, []);
  
  return {
    models,
    customModels,
    loading,
    getProviderModels,
    getDefaultModels,
    addCustomModel,
    deleteCustomModel,
    clearModelCache
  };
}; 