/**
 * 模态框容器组件
 * 集中管理所有LLM设置相关的模态框
 */
import React from 'react';
import { message } from 'antd';
import { useLLMContext } from '../context/LLMContext';
import { LLMProvider } from '../../../../common/types/llm';

// 导入模态框组件
import AddCustomModelModal from '../modals/AddCustomModelModal';
import ApiKeyModal from '../modals/ApiKeyModal';
import EditConfigModal from '../modals/EditConfigModal';
import EditTemplateModal from '../modals/EditTemplateModal';
import ExportImportModal from '../modals/ExportImportModal';
import ProxyModal from '../modals/ProxyModal';
import SettingsModal from '../modals/SettingsModal';
import QuickAddModelModal from '../modals/QuickAddModelModal';

// 导入IPC工具
import * as configIPC from '../utils/ipc/config';
import * as templateIPC from '../utils/ipc/template';
import * as proxyIPC from '../utils/ipc/proxy';
import * as apiKeyIPC from '../utils/ipc/apiKey';

const ModalsContainer: React.FC = () => {
  const { 
    modalStates, 
    toggleModal, 
    activeProviderId, 
    selectedConfig, 
    currentTemplate, 
    globalProxy,
    currentProxy,
    refreshConfigs
  } = useLLMContext();
  
  // 处理API密钥保存
  const handleSaveApiKey = async (providerId: string, apiKey: string) => {
    try {
      await apiKeyIPC.setApiKey(providerId, apiKey);
      toggleModal('isApiKeyVisible', false);
      message.success('API密钥保存成功');
      } catch (error) {
      console.error('保存API密钥失败:', error);
      message.error('保存API密钥失败');
    }
  };
  
  // 处理配置保存
  const handleSaveConfig = async (config: any) => {
    try {
      await configIPC.saveConfig(config);
      toggleModal('isModalVisible', false);
      message.success(modalStates.isCreateConfig ? '创建配置成功' : '更新配置成功');
      // 刷新配置列表
      refreshConfigs();
    } catch (error) {
      console.error('保存配置失败:', error);
      message.error('保存配置失败');
    }
  };

  // 处理模板保存
  const handleSaveTemplate = async (template: any) => {
    try {
      await templateIPC.saveTemplate(template);
      toggleModal('isEditTemplateVisible', false);
      message.success('保存模板成功');
    } catch (error) {
      console.error('保存模板失败:', error);
      message.error('保存模板失败');
    }
  };
  
  // 处理代理保存
  const handleSaveProxy = async (proxyConfig: any) => {
    try {
      if (selectedConfig && selectedConfig.id) {
        // 为特定配置设置代理
        const updatedConfig = { 
          ...selectedConfig,
          proxy: proxyConfig
        };
        await configIPC.saveConfig(updatedConfig);
      } else {
        // 设置全局代理
        await proxyIPC.setGlobalProxy(proxyConfig);
      }
      toggleModal('isProxyVisible', false);
      message.success('保存代理配置成功');
    } catch (error) {
      console.error('保存代理配置失败:', error);
      message.error('保存代理配置失败');
    }
  };
  
  // 处理导入完成
  const handleImportComplete = () => {
    message.success('导入成功');
  };
  
  // 处理快速添加模型成功
  const handleQuickAddSuccess = async (models: any[]) => {
    if (!models || models.length === 0) {
      return;
    }
    
    try {
      // 保存所有选择的模型配置
      for (const model of models) {
        const now = new Date().toISOString();
        const config = {
          id: `${model.id}-${Date.now()}`, // 生成唯一ID
          provider: activeProviderId as unknown as LLMProvider,
          modelId: model.id,
          modelName: model.name,
          temperature: model.defaultTemperature || 0.7,
          maxTokens: model.maxTokens,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0,
          systemMessage: '',
          name: `${model.name} 配置`,
          isDefault: false,
          createdAt: now,
          updatedAt: now
        };
        
        await configIPC.saveConfig(config);
      }
      
      toggleModal('isCustomModelModalVisible', false);
      message.success(`成功添加 ${models.length} 个模型配置`);
      // 刷新配置列表
      refreshConfigs();
    } catch (error) {
      console.error('添加模型失败:', error);
      message.error('添加模型失败');
    }
  };
    
  return (
    <>
      {/* 自定义模型模态框 */}
      <AddCustomModelModal 
        visible={modalStates.isCustomModelModalVisible}
        onCancel={() => toggleModal('isCustomModelModalVisible', false)}
        onSuccess={() => {
          toggleModal('isCustomModelModalVisible', false);
          message.success('添加自定义模型成功');
        }}
        defaultProvider={activeProviderId as any}
      />
      
      {/* API密钥模态框 */}
      <ApiKeyModal 
        visible={modalStates.isApiKeyVisible}
        providerId={activeProviderId}
        onCancel={() => toggleModal('isApiKeyVisible', false)}
        onSave={handleSaveApiKey}
      />
      
      {/* 编辑配置模态框 */}
      <EditConfigModal 
        visible={modalStates.isModalVisible}
        isCreate={modalStates.isCreateConfig}
        config={selectedConfig}
        onCancel={() => toggleModal('isModalVisible', false)}
        onSave={handleSaveConfig}
      />
      
      {/* 编辑模板模态框 */}
      <EditTemplateModal 
        visible={modalStates.isEditTemplateVisible}
        template={currentTemplate}
        onCancel={() => toggleModal('isEditTemplateVisible', false)}
        onSave={handleSaveTemplate}
      />
      
      {/* 代理设置模态框 */}
      <ProxyModal 
        visible={modalStates.isProxyVisible}
        isGlobal={!selectedConfig}
        configId={selectedConfig?.id}
        proxyConfig={selectedConfig ? currentProxy : globalProxy}
        onCancel={() => toggleModal('isProxyVisible', false)}
        onSave={handleSaveProxy}
      />
      
      {/* 快速添加模型模态框 */}
      <QuickAddModelModal
        visible={modalStates.isCustomModelModalVisible}
        providerId={activeProviderId}
        onCancel={() => toggleModal('isCustomModelModalVisible', false)}
        onSuccess={handleQuickAddSuccess}
      />
      
      {/* 导出导入模态框 - 未使用时保持隐藏状态 */}
      <ExportImportModal 
        visible={false}
        onCancel={() => {}}
        onImportComplete={handleImportComplete}
      />
      
      {/* 设置模态框 - 未使用时保持隐藏状态 */}
      <SettingsModal 
        visible={false}
        onCancel={() => {}}
        onSave={() => {}}
      />
    </>
  );
};

export default ModalsContainer; 