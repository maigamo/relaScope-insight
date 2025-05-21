/**
 * 全局设置面板
 * 用于配置LLM的全局设置，如默认提供商、主题等
 */
import React, { useCallback, useState, useEffect } from 'react';
import { Card, Typography, Form, Switch, Select, Divider, Button, Space, Alert, Tooltip, message, Collapse, Input, InputNumber } from 'antd';
import { InfoCircleOutlined, SaveOutlined, ReloadOutlined, GlobalOutlined } from '@ant-design/icons';
import { useForm } from 'antd/es/form/Form';
import { LLMProvider, ProxyConfig } from '../../../../common/types/llm';
import { getProviderName } from '../utils/formatters';
import { cardContainerStyle, flexContainerStyle } from '../utils/styles';
import providerManager from '../managers/providerManager';
import * as proxyIPC from '../utils/ipc/proxy';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

// 代理协议枚举
enum ProxyProtocol {
  HTTP = 'http',
  HTTPS = 'https',
  SOCKS5 = 'socks5',
  SOCKS4 = 'socks4'
}

// 全局设置表单值接口
interface GlobalSettingsFormValues {
  defaultProvider: LLMProvider;
  darkMode: boolean;
  autoSave: boolean;
  saveHistory: boolean;
  defaultMaxTokens: number;
  // 代理设置
  proxyEnabled: boolean;
  proxyProtocol: ProxyProtocol;
  proxyHost: string;
  proxyPort: number;
  proxyAuth: boolean;
  proxyUsername?: string;
  proxyPassword?: string;
}

// 全局代理配置接口，扩展ProxyConfig
interface GlobalProxyConfig extends ProxyConfig {
  isGlobal: boolean;
}

/**
 * 全局设置面板组件
 */
const GlobalSettingsPanel: React.FC = () => {
  const [form] = useForm<GlobalSettingsFormValues>();
  const [loading, setLoading] = useState(false);
  const [proxyAuthEnabled, setProxyAuthEnabled] = useState(false);
  const [globalProxy, setGlobalProxy] = useState<GlobalProxyConfig | null>(null);
  
  // 获取全局代理设置
  const fetchGlobalProxy = useCallback(async () => {
    try {
      setLoading(true);
      // 调用IPC接口获取全局代理配置
      const proxy = await proxyIPC.getGlobalProxy();
      
      if (proxy) {
        const globalProxyConfig: GlobalProxyConfig = {
          enabled: !!proxy.enabled,
          host: proxy.host || '',
          port: proxy.port || 1080,
          protocol: proxy.protocol || 'http',
          isGlobal: true,
          // 将username和password处理为ProxyConfig支持的格式
          username: proxy.username,
          password: proxy.password
        };
        
        setGlobalProxy(globalProxyConfig);
        
        // 检查是否存在认证信息
        const hasAuth = !!(proxy.username && proxy.password);
        
        // 更新表单值
        form.setFieldsValue({
          proxyEnabled: !!proxy.enabled,
          proxyHost: proxy.host || '',
          proxyPort: proxy.port || 1080,
          proxyProtocol: (proxy.protocol as ProxyProtocol) || ProxyProtocol.HTTP,
          proxyAuth: hasAuth,
          proxyUsername: proxy.username || '',
          proxyPassword: proxy.password || ''
        });
        
        // 更新认证状态
        setProxyAuthEnabled(hasAuth);
      }
    } catch (error) {
      console.error('获取全局代理配置失败:', error);
    } finally {
      setLoading(false);
    }
  }, [form]);
  
  // 保存全局代理设置
  const saveGlobalProxy = useCallback(async (proxyConfig: GlobalProxyConfig): Promise<boolean> => {
    try {
      setLoading(true);
      // 将GlobalProxyConfig转换为ProxyConfig以符合IPC函数参数要求
      const proxyToSave: ProxyConfig = {
        enabled: proxyConfig.enabled,
        host: proxyConfig.host,
        port: proxyConfig.port,
        protocol: proxyConfig.protocol,
        username: proxyConfig.username,
        password: proxyConfig.password
      };
      
      // 调用IPC保存全局代理
      const result = await proxyIPC.setGlobalProxy(proxyToSave);
      
      if (result) {
        setGlobalProxy(proxyConfig);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('保存全局代理配置失败:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 初始化时获取全局代理设置
  useEffect(() => {
    fetchGlobalProxy();
  }, [fetchGlobalProxy]);
  
  // 重置设置
  const handleReset = useCallback(() => {
    form.resetFields();
  }, [form]);
  
  // 保存设置
  const handleSave = useCallback(async (values: GlobalSettingsFormValues) => {
    try {
      setLoading(true);
      
      // 设置默认提供商
      await providerManager.setDefaultProvider(values.defaultProvider);
      
      // 保存代理设置
      const proxyConfig: GlobalProxyConfig = {
        enabled: values.proxyEnabled,
        host: values.proxyHost,
        port: values.proxyPort,
        protocol: values.proxyProtocol,
        isGlobal: true,
        // 如果启用了认证，添加认证信息
        ...(values.proxyAuth ? {
          username: values.proxyUsername,
          password: values.proxyPassword
        } : {})
      };
      
      const proxyResult = await saveGlobalProxy(proxyConfig);
      
      if (!proxyResult) {
        message.error('保存代理设置失败');
        return;
      }
      
      // 保存其他全局设置
      // TODO: 实现其他全局设置的保存
      
      message.success('全局设置已保存');
    } catch (error) {
      console.error('保存全局设置失败:', error);
      message.error('保存全局设置失败');
    } finally {
      setLoading(false);
    }
  }, [saveGlobalProxy]);
  
  // 清除所有缓存
  const clearAllCaches = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: 实现清除所有缓存
      message.success('所有缓存已清除');
    } catch (error) {
      console.error('清除缓存失败:', error);
      message.error('清除缓存失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 认证开关变化
  const handleAuthChange = (checked: boolean) => {
    setProxyAuthEnabled(checked);
    if (!checked) {
      form.setFieldsValue({ proxyUsername: '', proxyPassword: '' });
    }
  };
  
  return (
    <Card 
      title={<Title level={4}>全局设置</Title>}
      style={cardContainerStyle}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="全局设置将影响所有LLM相关功能"
          description="这些设置会应用于所有LLM配置，除非在特定配置中进行了覆盖。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            defaultProvider: LLMProvider.OPENAI,
            darkMode: false,
            autoSave: true,
            saveHistory: true,
            defaultMaxTokens: 2048,
            // 代理设置初始值 - 将在fetchGlobalProxy中更新
            proxyEnabled: false,
            proxyProtocol: ProxyProtocol.HTTP,
            proxyHost: '',
            proxyPort: 1080,
            proxyAuth: false
          }}
        >
          <Form.Item
            name="defaultProvider"
            label={
              <Space>
                <span>默认LLM提供商</span>
                <Tooltip title="设置系统默认使用的LLM提供商">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            rules={[{ required: true, message: '请选择默认提供商' }]}
          >
            <Select placeholder="选择默认LLM提供商">
              {Object.values(LLMProvider).map(provider => (
                <Option key={provider} value={provider}>
                  {getProviderName(provider)}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="darkMode"
            label={
              <Space>
                <span>深色模式</span>
                <Tooltip title="启用全局深色模式">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="autoSave"
            label={
              <Space>
                <span>自动保存</span>
                <Tooltip title="自动保存对LLM配置的更改">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="saveHistory"
            label={
              <Space>
                <span>保存历史记录</span>
                <Tooltip title="保存LLM请求和响应的历史记录">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          {/* 代理设置折叠面板 */}
          <Collapse 
            bordered={false} 
            style={{ background: 'transparent', marginBottom: 16 }}
          >
            <Panel 
              header={
                <Space>
                  <GlobalOutlined />
                  <span>全局代理设置</span>
                </Space>
              } 
              key="proxy"
            >
              <Form.Item
                name="proxyEnabled"
                valuePropName="checked"
                label="启用全局代理"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="proxyProtocol"
                label="代理协议"
                rules={[{ required: true, message: '请选择代理协议' }]}
              >
                <Select>
                  <Option value={ProxyProtocol.HTTP}>HTTP</Option>
                  <Option value={ProxyProtocol.HTTPS}>HTTPS</Option>
                  <Option value={ProxyProtocol.SOCKS5}>SOCKS5</Option>
                  <Option value={ProxyProtocol.SOCKS4}>SOCKS4</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="proxyHost"
                label="代理服务器地址"
                rules={[{ required: true, message: '请输入代理服务器地址' }]}
              >
                <Input placeholder="例如: 127.0.0.1" />
              </Form.Item>
              
              <Form.Item
                name="proxyPort"
                label="代理服务器端口"
                rules={[{ required: true, message: '请输入代理服务器端口' }]}
              >
                <InputNumber min={1} max={65535} style={{ width: '100%' }} placeholder="例如: 1080" />
              </Form.Item>
              
              <Form.Item
                name="proxyAuth"
                valuePropName="checked"
                label="代理认证"
              >
                <Switch onChange={handleAuthChange} />
              </Form.Item>
              
              {proxyAuthEnabled && (
                <>
                  <Form.Item
                    name="proxyUsername"
                    label="代理用户名"
                    rules={[{ required: proxyAuthEnabled, message: '请输入代理用户名' }]}
                  >
                    <Input placeholder="代理用户名" />
                  </Form.Item>
                  
                  <Form.Item
                    name="proxyPassword"
                    label="代理密码"
                    rules={[{ required: proxyAuthEnabled, message: '请输入代理密码' }]}
                  >
                    <Input.Password placeholder="代理密码" />
                  </Form.Item>
                </>
              )}
            </Panel>
          </Collapse>
          
          <Divider />
          
          <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Space>
              <Button
                type="default"
                icon={<ReloadOutlined />}
                onClick={clearAllCaches}
                loading={loading}
              >
                清除所有缓存
              </Button>
            </Space>
            
            <Space>
              <Button onClick={handleReset}>
                重置
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                htmlType="submit"
                loading={loading}
              >
                保存设置
              </Button>
            </Space>
          </Space>
        </Form>
        
        <Divider />
        
        <Paragraph type="secondary">
          提示：全局设置会影响所有LLM服务，请谨慎修改。一些设置可能需要重启应用后才能生效。
        </Paragraph>
      </Space>
    </Card>
  );
};

export default GlobalSettingsPanel; 