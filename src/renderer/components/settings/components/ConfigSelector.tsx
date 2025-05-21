import React, { useCallback, useState } from 'react';
import { Typography, Select, Button, Space, Modal, Form, Input, message } from 'antd';
import { LLMConfig, LLMProvider } from '../../../../common/types/llm';
import { Provider } from '../core/state';
import { v4 as uuidv4 } from 'uuid';

/**
 * 配置选择器属性
 */
interface ConfigSelectorProps {
  configs: LLMConfig[];
  activeConfigId: string | null;
  onConfigChange: (configId: string) => void;
  onSaveConfig: (config: LLMConfig) => Promise<void>;
  onDeleteConfig: (configId: string) => Promise<void>;
  onSetDefaultConfig: (configId: string) => Promise<void>;
}

/**
 * 配置选择器组件
 * 用于选择和管理LLM配置
 */
const ConfigSelector: React.FC<ConfigSelectorProps> = ({
  configs,
  activeConfigId,
  onConfigChange,
  onSaveConfig,
  onDeleteConfig,
  onSetDefaultConfig
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateConfig, setIsCreateConfig] = useState(false);
  const [form] = Form.useForm();

  // 处理配置变更
  const handleChange = useCallback((value: string) => {
    onConfigChange(value);
  }, [onConfigChange]);

  // 打开创建配置对话框
  const showCreateModal = useCallback(() => {
    setIsCreateConfig(true);
    setIsModalVisible(true);
    form.resetFields();
  }, [form]);

  // 打开编辑配置对话框
  const showEditModal = useCallback(() => {
    if (!activeConfigId) {
      message.warning('请先选择一个配置');
      return;
    }
    
    const config = configs.find(config => config.id === activeConfigId);
    if (config) {
      setIsCreateConfig(false);
      setIsModalVisible(true);
      form.setFieldsValue({
        name: config.name,
        provider: config.provider,
        systemMessage: config.systemMessage || ''
      });
    }
  }, [activeConfigId, configs, form]);

  // 关闭对话框
  const handleCancel = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  // 提交表单
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      
      if (isCreateConfig) {
        // 创建新配置
        const newConfig: LLMConfig = {
          id: uuidv4(),
          name: values.name,
          provider: values.provider as LLMProvider,
          isDefault: false,
          modelId: '', // 空，稍后设置
          modelName: '默认模型',
          temperature: 0.7,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0,
          maxTokens: 2048,
          systemMessage: values.systemMessage || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await onSaveConfig(newConfig);
        message.success('成功创建配置');
      } else if (activeConfigId) {
        // 更新已有配置
        const config = configs.find(config => config.id === activeConfigId);
        if (config) {
          const updatedConfig: LLMConfig = {
            ...config,
            name: values.name,
            provider: values.provider as LLMProvider,
            systemMessage: values.systemMessage || '',
            updatedAt: new Date().toISOString()
          };
          
          await onSaveConfig(updatedConfig);
          message.success('成功更新配置');
        }
      }
      
      setIsModalVisible(false);
    } catch (error) {
      console.error('表单提交错误:', error);
    }
  }, [activeConfigId, configs, form, isCreateConfig, onSaveConfig]);

  // 处理删除配置
  const handleDelete = useCallback(async () => {
    if (activeConfigId) {
      Modal.confirm({
        title: '确认删除',
        content: '确定要删除这个配置吗？此操作不可恢复。',
        onOk: async () => {
          await onDeleteConfig(activeConfigId);
          message.success('成功删除配置');
        }
      });
    } else {
      message.warning('请先选择一个配置');
    }
  }, [activeConfigId, onDeleteConfig]);

  // 设置为默认配置
  const handleSetDefault = useCallback(async () => {
    if (activeConfigId) {
      await onSetDefaultConfig(activeConfigId);
      message.success('成功设置为默认配置');
    } else {
      message.warning('请先选择一个配置');
    }
  }, [activeConfigId, onSetDefaultConfig]);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Space>
        <Select 
          style={{ width: 300 }}
          placeholder="选择配置"
          value={activeConfigId || undefined}
          onChange={handleChange}
        >
          {configs.map(config => (
            <Select.Option key={config.id} value={config.id}>
              {config.name} ({config.provider})
            </Select.Option>
          ))}
        </Select>
        <Button type="primary" onClick={showCreateModal}>
          新建
        </Button>
        <Button onClick={showEditModal} disabled={!activeConfigId}>
          编辑
        </Button>
        <Button danger onClick={handleDelete} disabled={!activeConfigId}>
          删除
        </Button>
        <Button onClick={handleSetDefault} disabled={!activeConfigId}>
          设为默认
        </Button>
      </Space>

      <Modal
        title={isCreateConfig ? '创建新配置' : '编辑配置'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="配置名称"
            rules={[{ required: true, message: '请输入配置名称' }]}
          >
            <Input placeholder="请输入配置名称" />
          </Form.Item>
          <Form.Item
            name="provider"
            label="提供商"
            rules={[{ required: true, message: '请选择提供商' }]}
          >
            <Select placeholder="请选择提供商">
              {Object.values(LLMProvider).map(provider => (
                <Select.Option key={provider} value={provider}>
                  {provider}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="systemMessage"
            label="系统消息"
          >
            <Input.TextArea rows={4} placeholder="请输入系统消息" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default ConfigSelector; 