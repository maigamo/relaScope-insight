import React, { createContext, useContext, useState, useEffect } from 'react';
import { LLMProvider } from '../../../../common/types/llm';
import modelManager from '../managers/modelManager';
import providerManager from '../managers/providerManager';
import configManager from '../managers/configManager';
import proxyManager from '../managers/proxyManager';
import apiKeyManager from '../managers/apiKeyManager';
import templateManager from '../managers/templateManager';

// 定义模态框状态接口
export interface ModalStates {
  isModalVisible: boolean;
  isCreateConfig: boolean;
  isApiKeyVisible: boolean;
  isEditTemplateVisible: boolean;
  isCustomModelModalVisible: boolean;
  isProxyVisible: boolean;
  isExportImportVisible: boolean;
  isSettingsVisible: boolean;
}

// 定义LLM上下文接口
export interface LLMContextType {
  activeSection: 'global' | 'models' | 'providers' | 'templates' | 'apiKeys' | 'proxy' | 'configs';
  setActiveSection: (section: 'global' | 'models' | 'providers' | 'templates' | 'apiKeys' | 'proxy' | 'configs') => void;
  activeProviderId: string;
  setActiveProviderId: (id: string) => void;
  providers: any[];
  configs: any[];
  templates: any[];
  apiKeys: any[];
  models: any[];
  modalStates: ModalStates;
  toggleModal: (modalName: keyof ModalStates, visible: boolean) => void;
  selectedConfig: any;
  setSelectedConfig: (config: any) => void;
  currentTemplate: any;
  setCurrentTemplate: (template: any) => void;
  globalProxy: any;
  currentProxy: any;
  refreshProviders: () => Promise<void>;
  refreshConfigs: () => Promise<void>;
  refreshTemplates: () => Promise<void>;
  refreshApiKeys: () => Promise<void>;
  refreshModels: () => Promise<void>;
}

// 创建上下文
export const LLMContext = createContext<LLMContextType | undefined>(undefined);

// 提供LLM上下文的自定义钩子
export const useLLMContext = () => {
  const context = useContext(LLMContext);
  if (!context) {
    throw new Error('useLLMContext must be used within a LLMContextProvider');
  }
  return context;
};

// 确保兼容默认导出
export default LLMContext; 