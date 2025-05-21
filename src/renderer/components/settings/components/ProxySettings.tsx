import React, { useCallback, useEffect, useState } from 'react';
import { Typography, Input, InputNumber, Switch, Select, Space, Button, Form, message } from 'antd';
import { GlobalProxyConfig } from '../core/state';
import * as proxyIPC from '../utils/ipc/proxy';

/**
 * 代理设置组件
 * 用于管理LLM服务的代理设置
 */
const ProxySettings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [proxyConfig, setProxyConfig] = useState<GlobalProxyConfig>({
    enabled: false,
    host: '',
    port: 1080,
    protocol: 'http',
    isGlobal: true
  });

  // 加载代理配置
  const loadProxyConfig = useCallback(async () => {
    try {
      setLoading(true);
      const config = await proxyIPC.getGlobalProxy();
      
      if (config) {
        const globalConfig: GlobalProxyConfig = {
          ...config,
          isGlobal: true
        };
        
        setProxyConfig(globalConfig);
        form.setFieldsValue({
          enabled: globalConfig.enabled,
          host: globalConfig.host,
          port: globalConfig.port,
          protocol: globalConfig.protocol
        });
      }
    } catch (error) {
      console.error('加载代理配置失败:', error);
      message.error('无法加载代理配置');
    } finally {
      setLoading(false);
    }
  }, [form]);

  // 首次加载
  useEffect(() => {
    loadProxyConfig();
  }, [loadProxyConfig]);

  // 保存代理配置
  const handleSaveProxy = useCallback(async () => {
    try {
      const values = await form.validateFields();
      
      const newConfig = {
        ...proxyConfig,
        enabled: values.enabled,
        host: values.host,
        port: values.port,
        protocol: values.protocol
      };
      
      setLoading(true);
      const success = await proxyIPC.setGlobalProxy(newConfig);
      
      if (success) {
        setProxyConfig(newConfig);
        message.success('代理配置保存成功');
      } else {
        message.error('保存代理配置失败');
      }
    } catch (error) {
      console.error('保存代理配置错误:', error);
      message.error('保存代理配置时发生错误');
    } finally {
      setLoading(false);
    }
  }, [form, proxyConfig]);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Form form={form} layout="vertical" disabled={loading}>
        <Form.Item
          name="enabled"
          label="启用代理"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        
        <Form.Item
          name="protocol"
          label="代理类型"
        >
          <Select>
            <Select.Option value="http">HTTP</Select.Option>
            <Select.Option value="https">HTTPS</Select.Option>
            <Select.Option value="socks4">SOCKS4</Select.Option>
            <Select.Option value="socks5">SOCKS5</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="host"
          label="代理服务器"
          rules={[
            { required: true, message: '请输入代理服务器地址' }
          ]}
        >
          <Input placeholder="例如: 127.0.0.1" />
        </Form.Item>
        
        <Form.Item
          name="port"
          label="端口"
          rules={[
            { required: true, message: '请输入端口号' }
          ]}
        >
          <InputNumber min={1} max={65535} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item>
          <Button 
            type="primary" 
            onClick={handleSaveProxy}
            loading={loading}
          >
            保存代理设置
          </Button>
        </Form.Item>
      </Form>
    </Space>
  );
};

export default ProxySettings; 