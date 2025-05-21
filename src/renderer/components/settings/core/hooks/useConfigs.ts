/**
 * 配置管理钩子
 * 用于配置的加载、创建、编辑、删除和设置默认配置
 */
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { LLMConfig, LLMProvider } from '../../../../../common/types/llm';
import * as configIPC from '../../utils/ipc/config';
import { message } from 'antd';

/**
 * 使用配置管理功能
 * 提供配置的增删改查和设置默认配置等功能
 */
export const useConfigs = () => {
  const [configs, setConfigs] = useState<LLMConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<LLMConfig | null>(null);
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * 加载所有配置
   */
  const loadAllConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const loadedConfigs = await configIPC.getAllConfigs();
      setConfigs(loadedConfigs || []);
      
      // 选中默认配置
      const defaultConfig = loadedConfigs?.find(config => config.isDefault);
      if (defaultConfig) {
        setSelectedConfig(defaultConfig);
        setActiveConfigId(defaultConfig.id);
      } else if (loadedConfigs?.length > 0) {
        setSelectedConfig(loadedConfigs[0]);
        setActiveConfigId(loadedConfigs[0].id);
      }
      
      return loadedConfigs;
    } catch (error) {
      console.error('加载配置失败:', error);
      message.error('加载配置失败');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 通过ID选择配置
   */
  const selectConfigById = useCallback((configId: string) => {
    const config = configs.find(c => c.id === configId);
    if (config) {
      setSelectedConfig(config);
      setActiveConfigId(configId);
    }
  }, [configs]);

  /**
   * 创建新配置
   */
  const createConfig = useCallback(async (configData: Partial<LLMConfig>): Promise<LLMConfig | null> => {
    try {
      setLoading(true);
      const newConfig: LLMConfig = {
        id: uuidv4(),
        name: configData.name || '新配置',
        provider: configData.provider || LLMProvider.OPENAI,
        isDefault: false,
        modelId: configData.modelId || '',
        modelName: configData.modelName || '默认模型',
        temperature: configData.temperature || 0.7,
        topP: configData.topP || 1,
        frequencyPenalty: configData.frequencyPenalty || 0,
        presencePenalty: configData.presencePenalty || 0,
        maxTokens: configData.maxTokens || 2048,
        systemMessage: configData.systemMessage || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...configData
      };
      
      const savedConfig = await configIPC.saveConfig(newConfig);
      
      if (savedConfig) {
        // 更新状态
        setConfigs(prev => [...prev, savedConfig]);
        setSelectedConfig(savedConfig);
        setActiveConfigId(savedConfig.id);
        
        message.success('成功创建配置');
        return savedConfig;
      }
      
      return null;
    } catch (error) {
      console.error('创建配置失败:', error);
      message.error('创建配置失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 更新配置
   */
  const updateConfig = useCallback(async (configId: string, configData: Partial<LLMConfig>): Promise<LLMConfig | null> => {
    try {
      setLoading(true);
      
      // 查找现有配置
      const existingConfig = configs.find(c => c.id === configId);
      if (!existingConfig) {
        message.error('找不到要更新的配置');
        return null;
      }
      
      // 合并配置数据
      const updatedConfig: LLMConfig = {
        ...existingConfig,
        ...configData,
        updatedAt: new Date().toISOString()
      };
      
      const savedConfig = await configIPC.saveConfig(updatedConfig);
      
      if (savedConfig) {
        // 更新状态
        setConfigs(prev => prev.map(c => c.id === configId ? savedConfig : c));
        
        if (selectedConfig?.id === configId) {
          setSelectedConfig(savedConfig);
        }
        
        message.success('成功更新配置');
        return savedConfig;
      }
      
      return null;
    } catch (error) {
      console.error('更新配置失败:', error);
      message.error('更新配置失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, [configs, selectedConfig]);

  /**
   * 删除配置
   */
  const deleteConfig = useCallback(async (configId: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const success = await configIPC.deleteConfig(configId);
      
      if (success) {
        // 更新状态
        setConfigs(prev => prev.filter(c => c.id !== configId));
        
        // 如果删除的是当前选中的配置，则重新选择
        if (activeConfigId === configId) {
          const remainingConfigs = configs.filter(c => c.id !== configId);
          if (remainingConfigs.length > 0) {
            setSelectedConfig(remainingConfigs[0]);
            setActiveConfigId(remainingConfigs[0].id);
          } else {
            setSelectedConfig(null);
            setActiveConfigId(null);
          }
        }
        
        message.success('成功删除配置');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('删除配置失败:', error);
      message.error('删除配置失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, [configs, activeConfigId]);

  /**
   * 设置默认配置
   */
  const setDefaultConfig = useCallback(async (configId: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const success = await configIPC.setDefaultConfig(configId);
      
      if (success) {
        // 更新状态 - 修改isDefault标记
        setConfigs(prev => prev.map(c => ({
          ...c,
          isDefault: c.id === configId
        })));
        
        message.success('成功设置默认配置');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('设置默认配置失败:', error);
      message.error('设置默认配置失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    configs,
    selectedConfig,
    activeConfigId,
    loading,
    loadAllConfigs,
    selectConfigById,
    createConfig,
    updateConfig,
    deleteConfig,
    setDefaultConfig
  };
}; 