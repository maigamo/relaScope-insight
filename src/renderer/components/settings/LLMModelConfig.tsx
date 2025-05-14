import React, { useState } from 'react';
import { Button, Card, Form, Input, InputNumber, message, Modal, Select, Spin, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { LLMConfig, LLMProvider, LLMModelConfig as LLMModelConfigType } from '../../../common/types/llm';
import { LLMService } from '../../services/ipc';

const { Title, Text } = Typography;
const { Option } = Select;

interface ModelConfigProps {
  config: LLMConfig | null;
  availableModels: LLMModelConfigType[];
  customModels: LLMModelConfigType[];
  currentProvider: LLMProvider;
  loadingModels: boolean;
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
  onProviderChange: (provider: LLMProvider) => Promise<void>;
  onCustomModelsChange: (models: LLMModelConfigType[]) => void;
  onAvailableModelsChange: (models: LLMModelConfigType[]) => void;
  configForm: any;
}

/**
 * LLM模型配置组件
 */
const LLMModelConfig: React.FC<ModelConfigProps> = ({
  config,
  availableModels,
  customModels,
  currentProvider,
  loadingModels,
  selectedModelId,
  setSelectedModelId,
  onProviderChange,
  onCustomModelsChange,
  onAvailableModelsChange,
  configForm
}) => {
  const [isCustomModelModalVisible, setIsCustomModelModalVisible] = useState<boolean>(false);
  const [customModelForm] = Form.useForm();

  // 获取服务商显示名称
  const getProviderName = (provider: LLMProvider): string => {
    const providerMap: Record<LLMProvider, string> = {
      [LLMProvider.OPENAI]: 'OpenAI',
      [LLMProvider.ANTHROPIC]: 'Anthropic',
      [LLMProvider.BAIDU]: 'Baidu',
      [LLMProvider.AZURE]: 'Azure',
      [LLMProvider.GEMINI]: 'Gemini',
      [LLMProvider.OLLAMA]: 'Ollama',
      [LLMProvider.LOCAL]: 'Local',
      [LLMProvider.DEEPSEEK]: 'DeepSeek'
    };
    return providerMap[provider] || provider;
  };

  // 打开添加自定义模型对话框
  const openAddCustomModelModal = (provider: LLMProvider) => {
    customModelForm.resetFields();
    setIsCustomModelModalVisible(true);
  };

  // 添加自定义模型
  const handleAddCustomModel = async (values: any) => {
    try {
      // 检查ID是否已存在
      const modelIdExists = [...availableModels, ...customModels].some(
        m => m.id === values.modelId
      );
      
      if (modelIdExists) {
        message.error('模型ID已存在，请使用唯一的ID');
        return;
      }
      
      const newModel: LLMModelConfigType = {
        provider: currentProvider,
        id: values.modelId,
        name: values.modelName,
        maxTokens: values.contextLength || 4096,
        isCustom: true
      };
      
      // 添加到自定义模型列表
      const updatedCustomModels = [...customModels, newModel];
      onCustomModelsChange(updatedCustomModels);
      
      // 同时添加到当前可用模型列表
      const updatedAvailableModels = [...availableModels, newModel];
      onAvailableModelsChange(updatedAvailableModels);
      
      // 选中新添加的模型
      setSelectedModelId(newModel.id);
      configForm.setFieldValue('modelId', newModel.id);
      configForm.setFieldValue('modelName', newModel.name);
      
      message.success('自定义模型添加成功');
      setIsCustomModelModalVisible(false);
    } catch (error) {
      console.error('添加自定义模型错误:', error);
      message.error('添加自定义模型失败，请重试');
    }
  };

  // 删除自定义模型
  const handleDeleteCustomModel = async (modelId: string) => {
    try {
      // 从自定义模型列表中移除
      const updatedCustomModels = customModels.filter(m => m.id !== modelId);
      onCustomModelsChange(updatedCustomModels);
      
      // 从当前可用模型列表中移除
      const updatedAvailableModels = availableModels.filter(m => m.id !== modelId);
      onAvailableModelsChange(updatedAvailableModels);
      
      // 如果删除的是当前选中的模型，重置选中状态
      if (selectedModelId === modelId) {
        const defaultModel = updatedAvailableModels[0];
        if (defaultModel) {
          setSelectedModelId(defaultModel.id);
          configForm.setFieldValue('modelId', defaultModel.id);
          configForm.setFieldValue('modelName', defaultModel.name);
        } else {
          setSelectedModelId('');
          configForm.setFieldValue('modelId', '');
          configForm.setFieldValue('modelName', '');
        }
      }
      
      message.success('自定义模型删除成功');
    } catch (error) {
      console.error('删除自定义模型错误:', error);
      message.error('删除自定义模型失败，请重试');
    }
  };

  return (
    <>
      <Form.Item
        label="服务提供商"
        name="provider"
        rules={[{ required: true, message: '请选择服务提供商' }]}
      >
        <Select 
          placeholder="选择服务提供商" 
          onChange={(value) => onProviderChange(value as LLMProvider)}
        >
          <Option value={LLMProvider.OPENAI}>{getProviderName(LLMProvider.OPENAI)}</Option>
          <Option value={LLMProvider.ANTHROPIC}>{getProviderName(LLMProvider.ANTHROPIC)}</Option>
          <Option value={LLMProvider.BAIDU}>{getProviderName(LLMProvider.BAIDU)}</Option>
          <Option value={LLMProvider.AZURE}>{getProviderName(LLMProvider.AZURE)}</Option>
          <Option value={LLMProvider.GEMINI}>{getProviderName(LLMProvider.GEMINI)}</Option>
          <Option value={LLMProvider.DEEPSEEK}>{getProviderName(LLMProvider.DEEPSEEK)}</Option>
          <Option value={LLMProvider.OLLAMA}>{getProviderName(LLMProvider.OLLAMA)}</Option>
          <Option value={LLMProvider.LOCAL}>{getProviderName(LLMProvider.LOCAL)}</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="模型"
        name="modelId"
        rules={[{ required: true, message: '请选择模型' }]}
      >
        <Select 
          placeholder="选择模型" 
          loading={loadingModels}
          onChange={(value) => {
            setSelectedModelId(value);
            // 设置modelName
            const selectedModel = availableModels.find(m => m.id === value);
            if (selectedModel) {
              configForm.setFieldValue('modelName', selectedModel.name);
            }
          }}
          dropdownRender={menu => (
            <>
              {menu}
              <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                <Button 
                  type="link" 
                  icon={<PlusOutlined />} 
                  onClick={() => openAddCustomModelModal(currentProvider)}
                >
                  添加自定义模型
                </Button>
              </div>
            </>
          )}
        >
          {loadingModels ? (
            <Option value="" disabled>加载中...</Option>
          ) : availableModels.length === 0 ? (
            <Option value="" disabled>没有可用模型</Option>
          ) : (
            availableModels.map(model => (
              <Option key={model.id} value={model.id}>
                {model.name}
                {model.isDefault && " (默认)"}
                {model.isCustom && " (自定义)"}
                {model.isCustom && (
                  <DeleteOutlined 
                    style={{ marginLeft: 8 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCustomModel(model.id);
                    }}
                  />
                )}
              </Option>
            ))
          )}
        </Select>
      </Form.Item>

      {/* 自定义模型对话框 */}
      <Modal
        title="添加自定义模型"
        open={isCustomModelModalVisible}
        onCancel={() => setIsCustomModelModalVisible(false)}
        footer={null}
      >
        <Form
          form={customModelForm}
          layout="vertical"
          onFinish={handleAddCustomModel}
        >
          <Form.Item
            label="模型ID"
            name="modelId"
            rules={[{ required: true, message: '请输入模型ID' }]}
          >
            <Input placeholder="输入模型ID，如custom-model-1" />
          </Form.Item>
          
          <Form.Item
            label="模型名称"
            name="modelName"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="输入显示名称，如自定义模型1" />
          </Form.Item>
          
          <Form.Item
            label="上下文长度"
            name="contextLength"
            initialValue={4096}
          >
            <InputNumber min={1024} max={1000000} step={1024} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              添加
            </Button>
            <Button onClick={() => setIsCustomModelModalVisible(false)}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default LLMModelConfig; 