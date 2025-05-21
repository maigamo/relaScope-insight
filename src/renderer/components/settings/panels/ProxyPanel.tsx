/**
 * 代理设置面板
 * 用于配置HTTP代理服务器设置，支持全局代理配置
 */
import React, { useState, useEffect } from 'react';
import { Card, Typography, Form, Switch, Input, Button, Space, Divider, Select, message } from 'antd';
import { SaveOutlined, ReloadOutlined, GlobalOutlined } from '@ant-design/icons';
import { useForm } from 'antd/es/form/Form';
import { useLLMContext } from '../context/LLMContext';
import { cardContainerStyle, flexContainerStyle } from '../utils/styles';
import { DEFAULT_PROXY_CONFIG } from '../utils/constants';

// 代理协议枚举
enum ProxyProtocol {
  HTTP = 'http',
  HTTPS = 'https',
  SOCKS5 = 'socks5',
  SOCKS4 = 'socks4'
}

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface ProxyForm {
  enabled: boolean;
  protocol: ProxyProtocol;
  host: string;
  port: string;
  auth: boolean;
  username?: string;
  password?: string;
}

// 代理配置接口
interface ProxyConfig {
  enabled: boolean;
  protocol: ProxyProtocol;
  host: string;
  port: string;
  username?: string;
  password?: string;
}

/**
 * 代理设置面板组件
 */
const ProxyPanel: React.FC = () => {
  // 创建模拟数据，真实情况应从LLMContext获取
  const proxyConfig: ProxyConfig = DEFAULT_PROXY_CONFIG as unknown as ProxyConfig;
  const updateProxyConfig = async (config: ProxyConfig) => {
    console.log('更新代理配置:', config);
    return true;
  };

  const [form] = useForm<ProxyForm>();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [authEnabled, setAuthEnabled] = useState(false);

  // 初始化表单
  useEffect(() => {
    if (proxyConfig) {
      form.setFieldsValue({
        enabled: proxyConfig.enabled,
        protocol: proxyConfig.protocol || ProxyProtocol.HTTP,
        host: proxyConfig.host || '',
        port: proxyConfig.port?.toString() || '',
        auth: !!proxyConfig.username, // 如果有用户名，则启用认证
        username: proxyConfig.username || '',
        password: proxyConfig.password || '',
      });
      setAuthEnabled(!!proxyConfig.username);
    } else {
      resetForm();
    }
  }, [proxyConfig, form]);

  // 重置表单到默认值
  const resetForm = () => {
    form.setFieldsValue({
      enabled: DEFAULT_PROXY_CONFIG.enabled,
      protocol: DEFAULT_PROXY_CONFIG.protocol as ProxyProtocol,
      host: DEFAULT_PROXY_CONFIG.host,
      port: DEFAULT_PROXY_CONFIG.port?.toString() || '',
      auth: false,
      username: '',
      password: '',
    });
    setAuthEnabled(false);
  };

  // 提交表单
  const handleSubmit = async (values: ProxyForm) => {
    try {
      setLoading(true);
      
      const newProxyConfig: ProxyConfig = {
        enabled: values.enabled,
        protocol: values.protocol,
        host: values.host,
        port: values.port,
        username: values.auth ? values.username : undefined,
        password: values.auth ? values.password : undefined,
      };
      
      await updateProxyConfig(newProxyConfig);
      message.success('代理设置已保存');
    } catch (error) {
      console.error('保存代理设置失败:', error);
      message.error(`保存代理设置失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 测试代理连接
  const testProxyConnection = async () => {
    try {
      setTestLoading(true);
      
      // 获取当前表单值进行测试
      const formValues = form.getFieldsValue();
      
      // 这里应该调用实际的测试代理连接函数
      // 假设有一个testProxyIPC函数可以用来测试代理连接
      // const result = await testProxyIPC(formValues);
      
      // 模拟测试结果
      await new Promise(resolve => setTimeout(resolve, 1500));
      const success = true; // 假设测试成功
      
      if (success) {
        message.success('代理连接测试成功');
      } else {
        message.error('代理连接测试失败');
      }
    } catch (error) {
      console.error('代理连接测试失败:', error);
      message.error(`代理连接测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setTestLoading(false);
    }
  };

  // 认证开关变化
  const handleAuthChange = (checked: boolean) => {
    setAuthEnabled(checked);
    if (!checked) {
      form.setFieldsValue({ username: '', password: '' });
    }
  };

  return (
    <Card style={cardContainerStyle}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={flexContainerStyle}>
          <Title level={4}>代理设置</Title>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={resetForm}
            >
              重置
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={form.submit}
              loading={loading}
            >
              保存设置
            </Button>
          </Space>
        </div>
        
        <Text type="secondary">
          配置HTTP代理服务器，用于在网络受限环境中连接到LLM提供商的API服务。
        </Text>
        
        <Divider />
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            enabled: DEFAULT_PROXY_CONFIG.enabled,
            protocol: DEFAULT_PROXY_CONFIG.protocol as ProxyProtocol,
            host: DEFAULT_PROXY_CONFIG.host,
            port: DEFAULT_PROXY_CONFIG.port?.toString() || '',
            auth: false,
          }}
        >
          <Form.Item
            name="enabled"
            valuePropName="checked"
            label="启用代理"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="protocol"
            label="代理协议"
          >
            <Select>
              <Option value={ProxyProtocol.HTTP}>HTTP</Option>
              <Option value={ProxyProtocol.HTTPS}>HTTPS</Option>
              <Option value={ProxyProtocol.SOCKS5}>SOCKS5</Option>
              <Option value={ProxyProtocol.SOCKS4}>SOCKS4</Option>
            </Select>
          </Form.Item>
          
          <Space style={{ display: 'flex' }} align="baseline">
            <Form.Item
              name="host"
              label="代理主机"
              rules={[{ required: true, message: '请输入代理主机地址' }]}
              style={{ flex: 3 }}
            >
              <Input placeholder="例如: 127.0.0.1" />
            </Form.Item>
            
            <Form.Item
              name="port"
              label="端口"
              rules={[{ required: true, message: '请输入代理端口' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="例如: 7890" />
            </Form.Item>
          </Space>
          
          <Form.Item
            name="auth"
            valuePropName="checked"
            label="启用代理认证"
          >
            <Switch onChange={handleAuthChange} />
          </Form.Item>
          
          {authEnabled && (
            <>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: authEnabled, message: '请输入代理用户名' }]}
              >
                <Input placeholder="代理用户名" />
              </Form.Item>
              
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: authEnabled, message: '请输入代理密码' }]}
              >
                <Input.Password placeholder="代理密码" />
              </Form.Item>
            </>
          )}
          
          <Divider />
          
          <Form.Item>
            <Button 
              type="default" 
              onClick={testProxyConnection} 
              loading={testLoading}
              icon={<GlobalOutlined />}
            >
              测试代理连接
            </Button>
            <Paragraph type="secondary" style={{ marginTop: '8px' }}>
              测试代理连接功能将尝试通过当前配置的代理连接到外部服务，验证代理设置是否有效。
            </Paragraph>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  );
};

export default ProxyPanel; 