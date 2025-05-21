/**
 * 添加自定义模型模态框
 * 用于添加用户自定义的模型配置
 */
import React, { useState, useCallback } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Typography, Space, Switch, Tooltip, message } from 'antd';
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { v4 as uuid } from 'uuid';
import { LLMProvider, LLMModelConfig } from '../../../../common/types/llm';
import { useModels } from '../core/hooks';
import { getProviderName } from '../utils/formatters';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface AddCustomModelModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (model: LLMModelConfig) => void;
  defaultProvider?: LLMProvider;
}

/**
 * 自定义模型表单值
 */
interface CustomModelFormValues {
  name: string;
  provider: LLMProvider;
  modelId: string;
  contextWindow: number;
  maxTokens: number;
  supportsStreaming: boolean;
  supportsFunction: boolean;
  description: string;
}

/**
 * 添加自定义模型模态框组件
 */
const AddCustomModelModal: React.FC<AddCustomModelModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  defaultProvider = LLMProvider.OPENAI
}) => {
  const [form] = Form.useForm<CustomModelFormValues>();
  const [loading, setLoading] = useState(false);
  const { addCustomModel } = useModels();
  
  // 重置表单
  const resetForm = useCallback(() => {
    form.resetFields();
    // 如果有默认提供商，设置为默认值
    if (defaultProvider) {
      form.setFieldsValue({ provider: defaultProvider });
    }
  }, [form, defaultProvider]);
  
  // 处理取消
  const handleCancel = useCallback(() => {
    resetForm();
    onCancel();
  }, [resetForm, onCancel]);
  
  // 提交表单
  const handleSubmit = useCallback(async (values: CustomModelFormValues) => {
    try {
      setLoading(true);
      
      // 创建自定义模型配置
      const customModel: LLMModelConfig = {
        id: `custom-${uuid()}`,
        provider: values.provider,
        maxTokens: values.maxTokens,
        name: values.name,
        isCustom: true,
        createdAt: new Date().toISOString()
      };
      
      // 如果存在其他字段，添加到模型配置中
      (customModel as any).contextWindow = values.contextWindow;
      (customModel as any).modelId = values.modelId;
      (customModel as any).supportsStreaming = values.supportsStreaming;
      (customModel as any).supportsFunction = values.supportsFunction;
      (customModel as any).description = values.description;
      
      // 添加自定义模型
      const success = await addCustomModel(customModel, values.provider);
      
      if (success) {
        message.success('添加自定义模型成功');
        resetForm();
        onSuccess(customModel);
      } else {
        message.error('添加自定义模型失败');
      }
    } catch (error) {
      console.error('添加自定义模型失败:', error);
      message.error('添加自定义模型失败');
    } finally {
      setLoading(false);
    }
  }, [addCustomModel, resetForm, onSuccess]);
  
  // 模态框显示时重置表单
  React.useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible, resetForm]);
  
  return (
    <Modal
      title={
        <Space>
          <PlusOutlined />
          <span>添加自定义模型</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          provider: defaultProvider,
          contextWindow: 4096,
          maxTokens: 2048,
          supportsStreaming: true,
          supportsFunction: false
        }}
      >
        <Form.Item
          name="name"
          label="模型名称"
          rules={[{ required: true, message: '请输入模型名称' }]}
        >
          <Input placeholder="输入模型显示名称" />
        </Form.Item>
        
        <Form.Item
          name="provider"
          label="提供商"
          rules={[{ required: true, message: '请选择提供商' }]}
        >
          <Select placeholder="选择模型提供商">
            {Object.values(LLMProvider).map(provider => (
              <Option key={provider} value={provider}>
                {getProviderName(provider)}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="modelId"
          label={
            <Space>
              <span>模型ID</span>
              <Tooltip title="API调用时使用的实际模型ID，例如：gpt-4-turbo">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
          rules={[{ required: true, message: '请输入模型ID' }]}
        >
          <Input placeholder="输入模型ID，例如：gpt-4-turbo" />
        </Form.Item>
        
        <Space style={{ width: '100%' }} direction="vertical">
          <Text type="secondary">模型能力设置</Text>
          
          <Space style={{ width: '100%' }}>
            <Form.Item
              name="contextWindow"
              label="上下文窗口"
              tooltip="模型能处理的最大token数"
              style={{ marginBottom: 0, width: '50%' }}
              rules={[{ required: true, message: '请输入上下文窗口大小' }]}
            >
              <InputNumber min={1} max={128000} style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="maxTokens"
              label="最大输出"
              tooltip="模型能生成的最大token数"
              style={{ marginBottom: 0, width: '50%' }}
              rules={[{ required: true, message: '请输入最大输出token数' }]}
            >
              <InputNumber min={1} max={32000} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          
          <Space style={{ width: '100%' }}>
            <Form.Item
              name="supportsStreaming"
              label="支持流式输出"
              tooltip="模型是否支持流式文本生成"
              valuePropName="checked"
              style={{ marginBottom: 0, width: '50%' }}
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name="supportsFunction"
              label="支持函数调用"
              tooltip="模型是否支持OpenAI兼容的函数调用"
              valuePropName="checked"
              style={{ marginBottom: 0, width: '50%' }}
            >
              <Switch />
            </Form.Item>
          </Space>
        </Space>
        
        <Form.Item
          name="description"
          label="描述"
          style={{ marginTop: 16 }}
        >
          <TextArea
            rows={2}
            placeholder="输入模型描述（可选）"
          />
        </Form.Item>
        
        <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              添加模型
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCustomModelModal; 