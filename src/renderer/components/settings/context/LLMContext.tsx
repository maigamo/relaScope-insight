/**
 * LLM上下文文件
 * 提供LLM设置相关的上下文
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LLMState, initialState } from '../core/state';
import { getAllConfigs } from '../utils/ipc/config';
import { getAllTemplates } from '../utils/ipc/template';
import { getGlobalProxy } from '../utils/ipc/proxy';
import { message } from 'antd';
import { getProviderName } from '../utils/formatters';
import { LLMProvider as LLMProviderEnum, LLMConfig, LLMModelConfig, PromptTemplate } from '../../../../common/types/llm';

// 创建上下文 - 保持与原LLMSettings.tsx的状态管理一致
export const LLMContext = createContext<LLMState>(initialState);

// 导出使用上下文的Hook
export const useLLMContext = () => useContext(LLMContext);

// Provider组件 - 实现与原LLMSettings.tsx相同的状态初始化和管理逻辑
export const LLMContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<LLMState>(initialState);
  
  // 实现状态更新方法
  const setSelectedConfig = (config: LLMState['selectedConfig']) => 
    setState(prev => ({ ...prev, selectedConfig: config }));
    
  const setActiveConfig = (configId: LLMState['activeConfig']) => 
    setState(prev => ({ ...prev, activeConfig: configId }));
    
  const setActiveProviderId = (providerId: LLMState['activeProviderId']) => 
    setState(prev => ({ ...prev, activeProviderId: providerId }));
    
  const setActiveSection = (section: LLMState['activeSection']) => 
    setState(prev => ({ ...prev, activeSection: section }));
    
  const setSearchQuery = (query: LLMState['searchQuery']) => 
    setState(prev => ({ ...prev, searchQuery: query }));
    
  const setApiKey = (key: LLMState['apiKey']) => 
    setState(prev => ({ ...prev, apiKey: key }));
    
  const setLoadingModels = (loading: LLMState['loadingModels']) => 
    setState(prev => ({ ...prev, loadingModels: loading }));
    
  const setAvailableModels = (models: LLMState['availableModels']) => 
    setState(prev => ({ ...prev, availableModels: models }));
    
  const toggleModal = (modalName: keyof LLMState['modalStates'], value?: boolean) => 
    setState(prev => ({
      ...prev,
      modalStates: {
        ...prev.modalStates,
        [modalName]: value !== undefined ? value : !prev.modalStates[modalName]
      }
    }));
    
  const toggleExpand = (expandName: keyof LLMState['expandStates'], value?: boolean) => 
    setState(prev => ({
      ...prev,
      expandStates: {
        ...prev.expandStates,
        [expandName]: value !== undefined ? value : !prev.expandStates[expandName]
      }
    }));
    
  const updateConfigs = (configs: LLMState['configs']) => 
    setState(prev => ({ ...prev, configs }));
    
  const updateTemplates = (templates: LLMState['templates']) => 
    setState(prev => ({ ...prev, templates }));
    
  const updateProviders = (providers: LLMState['providers']) => 
    setState(prev => ({ ...prev, providers }));
    
  const updateGlobalProxy = (globalProxy: LLMState['globalProxy']) => 
    setState(prev => ({ ...prev, globalProxy }));
  
  // 初始化数据 - 实现与原LLMSettings.tsx中loadData函数相同的逻辑
  useEffect(() => {
    const loadData = async () => {
      try {
        // 获取所有配置
        const loadedConfigs = await getAllConfigs();
        
        // 获取所有模板
        const loadedTemplates = await getAllTemplates();
        
        // 加载全局代理配置
        try {
          const globalProxyConfig = await getGlobalProxy();
          if (globalProxyConfig) {
            updateGlobalProxy({
              ...globalProxyConfig,
              isGlobal: true,
              enabled: !!globalProxyConfig.enabled
            });
          }
        } catch (error) {
          console.error('加载全局代理配置失败:', error);
        }
        
        // 提取所有提供商并去重
        const allProviders = loadedConfigs.map(config => config.provider) || [];
        const uniqueProviders = Array.from(new Set(allProviders));
        
        // 初始化提供商列表
        const initialProviders = uniqueProviders.map(provider => ({
          id: provider, // 使用provider作为id
          provider: provider as LLMProviderEnum,
          name: getProviderName(provider as LLMProviderEnum),
          isDefault: provider === LLMProviderEnum.OPENAI
        }));
        
        // 添加可能没有配置但需要显示的提供商
        const mustHaveProviders = Object.values(LLMProviderEnum);
        mustHaveProviders.forEach(provider => {
          if (!initialProviders.some(p => p.provider === provider)) {
            initialProviders.push({
              id: provider,
              provider: provider as LLMProviderEnum,
              name: getProviderName(provider as LLMProviderEnum),
              isDefault: false
            });
          }
        });
        
        // 更新状态
        updateConfigs(loadedConfigs);
        updateTemplates(loadedTemplates);
        updateProviders(initialProviders);
        
        // 选中默认配置
        const defaultConfig = loadedConfigs?.find(config => config.isDefault);
        if (defaultConfig) {
          setSelectedConfig(defaultConfig);
          setActiveConfig(defaultConfig.id);
          setActiveProviderId(defaultConfig.provider);
        } else if (initialProviders.length > 0) {
          // 如果没有默认配置，选择第一个提供商
          setActiveProviderId(initialProviders[0].id);
        }
        
        // 初始化时设置全局设置为折叠状态
        toggleExpand('isGlobalProxyExpanded', false);
        
      } catch (error) {
        console.error('加载配置失败:', error);
        message.error('加载配置失败');
      }
    };
    
    loadData();
  }, []);

  // 处理额外的方法
  const handleSaveConfig = async (config: LLMConfig) => {
    try {
      const response = await import('../utils/ipc/config').then(module => module.saveConfig(config));
      
      if (response) {
        message.success(config.id ? '更新配置成功' : '创建配置成功');
        
        // 重新加载配置
        const loadedConfigs = await getAllConfigs();
        updateConfigs(loadedConfigs);
        
        // 更新选中的配置
        const updatedConfig = loadedConfigs.find(c => c.id === config.id);
        if (updatedConfig) {
          setSelectedConfig(updatedConfig);
          setActiveConfig(updatedConfig.id);
        }
      } else {
        message.error(config.id ? '更新配置失败' : '创建配置失败');
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      message.error(config.id ? '更新配置失败' : '创建配置失败');
    }
  };
  
  const handleDeleteConfig = async (configId: string) => {
    try {
      const response = await import('../utils/ipc/config').then(module => module.deleteConfig(configId));
      
      if (response) {
        message.success('删除配置成功');
        
        // 更新配置列表
        const loadedConfigs = await getAllConfigs();
        updateConfigs(loadedConfigs);
        
        // 如果删除的是当前选中的配置，选择新的配置
        if (state.activeConfig === configId) {
          const firstConfig = loadedConfigs[0];
          if (firstConfig) {
            setSelectedConfig(firstConfig);
            setActiveConfig(firstConfig.id);
          } else {
            setSelectedConfig(null);
            setActiveConfig(null);
          }
        }
      } else {
        message.error('删除配置失败');
      }
    } catch (error) {
      console.error('删除配置失败:', error);
      message.error('删除配置失败');
    }
  };
  
  const handleSetDefaultConfig = async (configId: string) => {
    try {
      const response = await import('../utils/ipc/config').then(module => module.setDefaultConfig(configId));
      
      if (response) {
        message.success('设置默认配置成功');
        
        // 更新配置列表
        const loadedConfigs = await getAllConfigs();
        updateConfigs(loadedConfigs);
      } else {
        message.error('设置默认配置失败');
      }
    } catch (error) {
      console.error('设置默认配置失败:', error);
      message.error('设置默认配置失败');
    }
  };
  
  // 设置默认提供商的逻辑
  const handleSetDefaultProvider = async (providerId: string) => {
    try {
      // 更新提供商列表，将选中的提供商设置为默认
      const updatedProviders = state.providers.map(provider => ({
        ...provider,
        isDefault: provider.id === providerId
      }));
      
      // 更新状态
      updateProviders(updatedProviders);
      
      // 可以在这里添加与后端交互的逻辑
      message.success(`已将 ${updatedProviders.find(p => p.id === providerId)?.name} 设为默认提供商`);
    } catch (error) {
      console.error('设置默认提供商失败:', error);
      message.error('设置默认提供商失败');
    }
  };
  
  // 提供状态和更新方法
  const contextValue = {
    ...state,
    setSelectedConfig,
    setActiveConfig,
    setActiveProviderId,
    setActiveSection,
    setSearchQuery,
    setApiKey,
    setLoadingModels,
    setAvailableModels,
    toggleModal,
    toggleExpand,
    updateConfigs,
    updateTemplates,
    updateProviders,
    updateGlobalProxy,
    // 额外方法，方便组件调用
    handleSaveConfig,
    handleDeleteConfig,
    handleSetDefaultConfig,
    handleSetDefaultProvider
  };
  
  return (
    <LLMContext.Provider value={contextValue as LLMState}>
      {children}
    </LLMContext.Provider>
  );
}; 