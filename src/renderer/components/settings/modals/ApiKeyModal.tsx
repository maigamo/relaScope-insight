/**
 * API密钥管理对话框
 * 用于设置和测试LLM提供商的API密钥
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Divider, Typography, message, Spin } from 'antd';
import { SaveOutlined, CloseOutlined, KeyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { LLMProvider } from '../../../../common/types/llm';
import { getProviderName } from '../utils/formatters';
import * as apiKeyIPC from '../utils/ipc/apiKey';
import { validateApiKey } from '../utils/validators';
import { maskApiKey } from '../utils/ipc/apiKey';

const { Text, Paragraph } = Typography;

interface ApiKeyModalProps {
  visible: boolean;
  providerId: string | null;
  onSave: (providerId: string, apiKey: string) => Promise<void>;
  onCancel: () => void;
}

/**
 * API密钥管理对话框组件
 */
const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  visible,
  providerId,
  onSave,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [providerName, setProviderName] = useState('');
  const [initialLoading, setInitialLoading] = useState(false);

  // 加载API密钥
  useEffect(() => {
    const loadApiKey = async () => {
      if (visible && providerId) {
        try {
          setInitialLoading(true);
          
          // 获取提供商名称
          setProviderName(getProviderName(providerId as LLMProvider));
          
          // 获取API密钥
          const storedApiKey = await apiKeyIPC.getApiKey(providerId);
          
          // 设置API密钥和表单值
          setApiKey(storedApiKey);
          form.setFieldsValue({ apiKey: storedApiKey });
        } catch (error) {
          console.error('加载API密钥失败:', error);
        } finally {
          setInitialLoading(false);
        }
      }
    };
    
    loadApiKey();
  }, [visible, providerId, form]);

  // 处理API密钥变更
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  // 测试API密钥
  const handleTestApiKey = async () => {
    if (!providerId) {
      message.error('未选择提供商');
      return;
    }
    
    const currentApiKey = form.getFieldValue('apiKey');
    
    // 验证API密钥
    const validation = validateApiKey(currentApiKey, providerId);
    if (!validation.valid) {
      form.setFields([
        {
          name: 'apiKey',
          errors: [validation.error || 'API密钥无效']
        }
      ]);
      return;
    }
    
    try {
      setTestLoading(true);
      
      // 测试API密钥
      const result = await apiKeyIPC.testApiKey(providerId, currentApiKey);
      
      // 显示测试结果
      if (result.success) {
        message.success(`${providerName} API密钥测试成功!`);
      } else {
        message.error(`测试失败: ${result.error || '未知错误'}`);
        form.setFields([
          {
            name: 'apiKey',
            errors: [result.error || 'API密钥测试失败']
          }
        ]);
      }
    } catch (error) {
      console.error('测试API密钥失败:', error);
      message.error('测试API密钥失败');
    } finally {
      setTestLoading(false);
    }
  };

  // 保存API密钥
  const handleSaveApiKey = async () => {
    try {
      const values = await form.validateFields();
      
      // 验证API密钥
      const validation = validateApiKey(values.apiKey, providerId as string);
      if (!validation.valid) {
        form.setFields([
          {
            name: 'apiKey',
            errors: [validation.error || 'API密钥无效']
          }
        ]);
        return;
      }
      
      setLoading(true);
      
      // 保存API密钥
      if (providerId) {
        await onSave(providerId, values.apiKey);
      }
    } catch (error) {
      console.error('保存API密钥失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`${providerName || '提供商'} API密钥设置`}
      open={visible}
      onCancel={onCancel}
      maskClosable={false}
      footer={[
        <Button key="cancel" onClick={onCancel} icon={<CloseOutlined />}>
          取消
        </Button>,
        <Button
          key="test"
          onClick={handleTestApiKey}
          loading={testLoading}
          icon={<CheckCircleOutlined />}
        >
          测试
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSaveApiKey}
          icon={<SaveOutlined />}
        >
          保存
        </Button>
      ]}
    >
      {initialLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '10px' }}>加载API密钥...</div>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="apiKey"
            label={
              <Space>
                <KeyOutlined />
                <span>API密钥</span>
              </Space>
            }
            rules={[{ required: true, message: '请输入API密钥' }]}
            tooltip={`请输入您的${providerName || '提供商'} API密钥，它将安全地存储在您的本地计算机上`}
          >
            <Input.Password
              placeholder={`输入${providerName || '提供商'} API密钥`}
              onChange={handleApiKeyChange}
              visibilityToggle
            />
          </Form.Item>
          
          {apiKey && (
            <Paragraph type="secondary">
              当前存储的密钥: <Text code>{maskApiKey(apiKey)}</Text>
            </Paragraph>
          )}
          
          <Divider dashed />
          
          <Paragraph type="secondary">
            API密钥用于访问{providerName || '提供商'}的服务。您的API密钥将安全地存储在本地，不会发送到其他地方。
          </Paragraph>
          
          {providerId === LLMProvider.OPENAI && (
            <Paragraph type="secondary">
              您可以在<a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer">OpenAI平台</a>上获取您的API密钥。
            </Paragraph>
          )}
          
          {providerId === LLMProvider.ANTHROPIC && (
            <Paragraph type="secondary">
              您可以在<a href="https://console.anthropic.com/account/keys" target="_blank" rel="noopener noreferrer">Anthropic控制台</a>上获取您的API密钥。
            </Paragraph>
          )}
          
          {providerId === LLMProvider.GEMINI && (
            <Paragraph type="secondary">
              您可以在<a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>上获取您的API密钥。
            </Paragraph>
          )}
        </Form>
      )}
    </Modal>
  );
};

export default ApiKeyModal; 