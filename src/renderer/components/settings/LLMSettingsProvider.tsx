/**
 * LLM设置上下文提供器
 * 为整个应用提供LLM设置相关的上下文
 */
import React, { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { LLMContext, ModalStates } from './context/LLMContext';
import providerManager from './managers/providerManager';
import configManager from './managers/configManager';
import templateManager from './managers/templateManager';
import apiKeyManager from './managers/apiKeyManager';
import modelManager from './managers/modelManager';
import proxyManager from './managers/proxyManager';
import * as proxyIPC from './utils/ipc/proxy';

const LLMSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 当前激活的部分
  const [activeSection, setActiveSection] = useState<'global' | 'models' | 'providers' | 'templates' | 'apiKeys' | 'proxy' | 'configs'>('global');
  const [activeProviderId, setActiveProviderId] = useState<string>('');
  
  // 模型和配置数据
  const [providers, setProviders] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [globalProxy, setGlobalProxy] = useState<any>(null);
  
  // 选中的项
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);
  const [currentProxy, setCurrentProxy] = useState<any>(null);
  
  // 模态框状态
  const [modalStates, setModalStates] = useState<ModalStates>({
    isModalVisible: false,
    isCreateConfig: false,
    isApiKeyVisible: false,
    isEditTemplateVisible: false,
    isCustomModelModalVisible: false,
    isProxyVisible: false,
    isExportImportVisible: false,
    isSettingsVisible: false,
  });
  
  // 切换模态框状态
  const toggleModal = useCallback((modalName: keyof ModalStates, visible: boolean) => {
    setModalStates(prevState => ({
      ...prevState,
      [modalName]: visible,
    }));
  }, []);
  
  // 刷新提供商列表
  const refreshProviders = useCallback(async () => {
    try {
      const allProviders = await providerManager.getProviders();
      setProviders(allProviders);
    } catch (error) {
      console.error('获取提供商失败:', error);
      message.error('获取提供商列表失败');
    }
  }, []);
  
  // 刷新配置列表
  const refreshConfigs = useCallback(async () => {
    try {
      let configList;
      // 如果有选中的提供商，只获取该提供商的配置
      if (activeProviderId) {
        // 使用as any临时解决类型问题
        configList = await configManager.getConfigsByProvider(activeProviderId as any);
      } else {
        configList = await configManager.getConfigs();
      }
      setConfigs(configList);
    } catch (error) {
      console.error('获取配置失败:', error);
      message.error('获取配置列表失败');
    }
  }, [activeProviderId]);
  
  // 刷新模板列表
  const refreshTemplates = useCallback(async () => {
    try {
      // templateManager.getTemplates()方法不需要参数
      const templates = templateManager.getTemplates();
      setTemplates(templates);
    } catch (error) {
      console.error('获取模板失败:', error);
      message.error('获取模板列表失败');
    }
  }, []);
  
  // 刷新API密钥列表
  const refreshApiKeys = useCallback(async () => {
    try {
      // 这里需要特别注意：apiKeyManager.getApiKeys方法需要提供商ID
      // 如果有activeProviderId使用它，否则获取所有提供商的API密钥
      let keys: any[] = [];
      if (activeProviderId) {
        keys = await apiKeyManager.getApiKeys(activeProviderId);
      } else {
        // 如果没有选中的提供商，我们可能需要先获取所有提供商然后合并他们的密钥
        const providers = await providerManager.getProviders();
        const allKeysPromises = providers.map(p => apiKeyManager.getApiKeys(p.id));
        const allKeysArrays = await Promise.all(allKeysPromises);
        keys = allKeysArrays.flat();
      }
      setApiKeys(keys);
    } catch (error) {
      console.error('获取API密钥失败:', error);
      message.error('获取API密钥列表失败');
    }
  }, [activeProviderId]);
  
  // 刷新模型列表
  const refreshModels = useCallback(async () => {
    try {
      // 获取所有提供商的模型
      const allModels = await modelManager.getAvailableModels('*');
      setModels(allModels);
    } catch (error) {
      console.error('获取模型失败:', error);
      message.error('获取模型列表失败');
    }
  }, []);
  
  // 获取全局代理
  const getGlobalProxy = useCallback(async () => {
    try {
      // 直接使用IPC调用获取全局代理
      const proxy = await proxyIPC.getGlobalProxy();
      setGlobalProxy(proxy);
    } catch (error) {
      console.error('获取全局代理失败:', error);
    }
  }, []);
  
  // 当提供商或配置改变时，获取对应的代理设置
  useEffect(() => {
    if (selectedConfig && selectedConfig.id) {
      // 如果选中了具体配置，获取该配置的代理
      const configProxy = selectedConfig.proxy || null;
      setCurrentProxy(configProxy);
    } else {
      // 否则当前代理为null
      setCurrentProxy(null);
    }
  }, [selectedConfig]);
  
  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      await refreshProviders();
      await refreshConfigs();
      await refreshTemplates();
      await refreshApiKeys();
      await refreshModels();
      await getGlobalProxy();
    };
    
    initData();
  }, []);
  
  // 当activeProviderId变化时，刷新配置列表
  useEffect(() => {
    refreshConfigs();
  }, [activeProviderId, refreshConfigs]);
  
  return (
    <LLMContext.Provider
      value={{
        activeSection,
        setActiveSection,
        activeProviderId,
        setActiveProviderId,
        providers,
        configs,
        templates,
        apiKeys,
        models,
        modalStates,
        toggleModal,
        selectedConfig,
        setSelectedConfig,
        currentTemplate,
        setCurrentTemplate,
        globalProxy,
        currentProxy,
        refreshProviders,
        refreshConfigs,
        refreshTemplates,
        refreshApiKeys,
        refreshModels,
      }}
    >
      {children}
    </LLMContext.Provider>
  );
};

export default LLMSettingsProvider; 