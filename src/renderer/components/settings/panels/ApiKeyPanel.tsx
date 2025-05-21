/**
 * API密钥设置面板
 * 用于管理不同LLM提供商的API密钥
 */
import React, { useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Button, Select, Divider, Space, message, Tag } from 'antd';
import { KeyOutlined, CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { LLMProvider } from '../../../../common/types/llm';
import { useLLMContext } from '../context/LLMContext';
import { cardContainerStyle, flexContainerStyle } from '../utils/styles';
import { PROVIDER_DISPLAY_NAMES, ApiKeyTestStatus } from '../utils/constants';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface ApiKeyFormValues {
  provider: LLMProvider;
  apiKey: string;
  organizationId?: string;
  baseUrl?: string;
}

/**
 * API密钥设置面板组件
 */
const ApiKeyPanel: React.FC = () => {
  const { providers } = useLLMContext();
  const [form] = Form.useForm<ApiKeyFormValues>();
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<ApiKeyTestStatus>(ApiKeyTestStatus.UNTESTED);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | null>(null);

  // 处理提交
  const handleSubmit = async (values: ApiKeyFormValues) => {
    try {
      setLoading(true);
      
      // 保存API密钥的逻辑
      // 这里应该调用apiKeyManager或者其他IPC函数进行保存
      // 示例：await apiKeyManager.saveApiKey(values);
      
      // 模拟保存延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success(`${getProviderDisplayName(values.provider)} API密钥保存成功`);
    } catch (error) {
      console.error('保存API密钥失败:', error);
      message.error(`保存API密钥失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 测试API密钥
  const testApiKey = async () => {
    try {
      const values = await form.validateFields();
      
      // 更新测试状态
      setTestStatus(ApiKeyTestStatus.TESTING);
      
      // 测试API密钥的逻辑
      // 这里应该调用apiKeyManager或者其他IPC函数进行测试
      // 示例：const result = await apiKeyManager.testApiKey(values);
      
      // 模拟测试延迟和随机结果
      await new Promise(resolve => setTimeout(resolve, 2000));
      const testSuccess = Math.random() > 0.3; // 70%概率成功
      
      // 更新测试状态
      setTestStatus(testSuccess ? ApiKeyTestStatus.SUCCESS : ApiKeyTestStatus.FAILURE);
      
      // 显示测试结果
      if (testSuccess) {
        message.success(`${getProviderDisplayName(values.provider)} API密钥测试成功`);
      } else {
        message.error(`${getProviderDisplayName(values.provider)} API密钥测试失败`);
      }
    } catch (error) {
      console.error('测试API密钥失败:', error);
      message.error(`测试API密钥失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setTestStatus(ApiKeyTestStatus.FAILURE);
    }
  };

  // 处理提供商变更
  const handleProviderChange = (provider: LLMProvider) => {
    setSelectedProvider(provider);
    setTestStatus(ApiKeyTestStatus.UNTESTED);
    
    // 清除与特定提供商相关的字段
    form.setFieldsValue({
      apiKey: '',
      organizationId: undefined,
      baseUrl: undefined
    });
  };

  // 获取提供商显示名称
  const getProviderDisplayName = (provider: LLMProvider): string => {
    return PROVIDER_DISPLAY_NAMES[provider] || provider;
  };

  // 渲染测试状态图标
  const renderTestStatusIcon = () => {
    switch (testStatus) {
      case ApiKeyTestStatus.TESTING:
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
      case ApiKeyTestStatus.SUCCESS:
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case ApiKeyTestStatus.FAILURE:
        return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      default:
        return null;
    }
  };

  // 获取提供商额外字段
  const getProviderExtraFields = () => {
    if (!selectedProvider) return null;

    switch (selectedProvider) {
      case LLMProvider.OPENAI:
        return (
          <Form.Item name="organizationId" label="组织ID (可选)">
            <Input placeholder="例如：org-xxxxxxxxxxxxxxx" />
          </Form.Item>
        );
      case LLMProvider.AZURE:
        return (
          <>
            <Form.Item 
              name="baseUrl" 
              label="API基础URL" 
              rules={[{ required: true, message: '请输入Azure API基础URL' }]}
            >
              <Input placeholder="例如：https://your-resource.openai.azure.com" />
            </Form.Item>
          </>
        );
      case LLMProvider.ANTHROPIC:
      case LLMProvider.BAIDU:
      case LLMProvider.GEMINI:
        return (
          <Form.Item name="baseUrl" label="API基础URL (可选)">
            <Input placeholder="如需自定义API端点，请在此输入" />
          </Form.Item>
        );
      default:
        return null;
    }
  };

  return (
    <Card style={cardContainerStyle}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={flexContainerStyle}>
          <Title level={4}>API密钥设置</Title>
          <Space>
            {testStatus !== ApiKeyTestStatus.UNTESTED && (
              <Tag 
                icon={renderTestStatusIcon()}
                color={
                  testStatus === ApiKeyTestStatus.TESTING ? 'processing' :
                  testStatus === ApiKeyTestStatus.SUCCESS ? 'success' :
                  testStatus === ApiKeyTestStatus.FAILURE ? 'error' : 'default'
                }
              >
                {
                  testStatus === ApiKeyTestStatus.TESTING ? '测试中' :
                  testStatus === ApiKeyTestStatus.SUCCESS ? '测试成功' :
                  testStatus === ApiKeyTestStatus.FAILURE ? '测试失败' : ''
                }
              </Tag>
            )}
          </Space>
        </div>
        
        <Text type="secondary">
          配置不同LLM提供商的API密钥，用于访问相应的服务。注意保护您的API密钥安全。
        </Text>
        
        <Divider />
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ provider: LLMProvider.OPENAI }}
        >
          <Form.Item
            name="provider"
            label="选择提供商"
            rules={[{ required: true, message: '请选择提供商' }]}
          >
            <Select 
              placeholder="选择要配置API密钥的提供商" 
              onChange={handleProviderChange}
              style={{ width: '100%' }}
            >
              {Object.values(LLMProvider).map((provider) => (
                <Option key={provider} value={provider}>
                  {getProviderDisplayName(provider)}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="apiKey"
            label="API密钥"
            rules={[{ required: true, message: '请输入API密钥' }]}
            extra="API密钥不会被分享，仅存储在本地设备上"
          >
            <Input.Password 
              placeholder="输入API密钥" 
              iconRender={visible => (visible ? <KeyOutlined /> : <KeyOutlined />)}
            />
          </Form.Item>
          
          {getProviderExtraFields()}
          
          <Divider />
          
          <Form.Item>
            <Space>
              <Button
                type="default"
                onClick={testApiKey}
                disabled={!selectedProvider || loading || testStatus === ApiKeyTestStatus.TESTING}
              >
                测试API密钥
              </Button>
              
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
              >
                保存API密钥
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  );
};

export default ApiKeyPanel; 