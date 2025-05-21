/**
 * 代理设置对话框
 * 用于配置LLM服务的网络代理
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, Space, Divider, Typography, message, Switch, Select, Spin } from 'antd';
import { SaveOutlined, CloseOutlined, GlobalOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { ProxyConfig } from '../../../../common/types/llm';
import { validateProxyConfig } from '../utils/validators';
import * as proxyIPC from '../utils/ipc/proxy';
import { PROXY_PROTOCOL_OPTIONS } from '../utils/constants';

const { Text, Paragraph } = Typography;
const { Option } = Select;

interface ProxyModalProps {
  visible: boolean;
  isGlobal?: boolean;
  configId?: string;
  proxyConfig?: ProxyConfig | null;
  onSave: (proxyConfig: ProxyConfig) => Promise<void>;
  onCancel: () => void;
}

/**
 * 代理设置对话框组件
 */
const ProxyModal: React.FC<ProxyModalProps> = ({
  visible,
  isGlobal = false,
  configId,
  proxyConfig,
  onSave,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [proxyEnabled, setProxyEnabled] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    const loadProxyConfig = async () => {
      if (visible) {
        try {
          setInitialLoading(true);
          
          let config: ProxyConfig;
          
          if (proxyConfig) {
            // 使用提供的代理配置
            config = proxyConfig;
          } else if (isGlobal) {
            // 加载全局代理配置
            config = await proxyIPC.getGlobalProxy();
          } else {
            // 默认配置
            config = {
              enabled: false,
              host: '',
              port: 1080,
              protocol: 'http'
            };
          }
          
          // 设置表单值
          form.setFieldsValue({
            enabled: config.enabled,
            host: config.host,
            port: config.port,
            protocol: config.protocol || 'http',
            username: config.username || '',
            password: config.password || ''
          });
          
          // 更新状态
          setProxyEnabled(config.enabled || false);
        } catch (error) {
          console.error('加载代理配置失败:', error);
        } finally {
          setInitialLoading(false);
        }
      }
    };
    
    loadProxyConfig();
  }, [visible, proxyConfig, isGlobal, form]);

  // 处理代理启用状态变更
  const handleProxyEnabledChange = (checked: boolean) => {
    setProxyEnabled(checked);
  };

  // 测试代理配置
  const handleTestProxy = async () => {
    try {
      const values = await form.validateFields();
      
      // 验证代理配置
      const validation = validateProxyConfig(values);
      if (!validation.valid) {
        form.setFields([
          {
            name: validation.error?.includes('地址') ? 'host' : 
                 validation.error?.includes('端口') ? 'port' : 'host',
            errors: [validation.error || '代理配置无效']
          }
        ]);
        return;
      }
      
      setTestLoading(true);
      
      // 测试代理配置
      const result = await proxyIPC.testProxy(values);
      
      // 显示测试结果
      if (result.success) {
        message.success('代理连接测试成功!');
      } else {
        message.error(`测试失败: ${result.message || '无法连接到代理服务器'}`);
      }
    } catch (error) {
      console.error('测试代理配置失败:', error);
      message.error('测试代理配置失败');
    } finally {
      setTestLoading(false);
    }
  };

  // 保存代理配置
  const handleSaveProxy = async () => {
    try {
      const values = await form.validateFields();
      
      // 如果代理未启用，不需要验证其他字段
      if (!values.enabled) {
        const config: ProxyConfig = {
          enabled: false,
          host: '',
          port: 1080,
          protocol: 'http'
        };
        
        await onSave(config);
        return;
      }
      
      // 验证代理配置
      const validation = validateProxyConfig(values);
      if (!validation.valid) {
        form.setFields([
          {
            name: validation.error?.includes('地址') ? 'host' : 
                 validation.error?.includes('端口') ? 'port' : 'host',
            errors: [validation.error || '代理配置无效']
          }
        ]);
        return;
      }
      
      setLoading(true);
      
      // 创建代理配置对象
      const config: ProxyConfig = {
        enabled: values.enabled,
        host: values.host,
        port: values.port,
        protocol: values.protocol,
        username: values.username || undefined,
        password: values.password || undefined
      };
      
      // 保存代理配置
      await onSave(config);
    } catch (error) {
      console.error('保存代理配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isGlobal ? "全局代理设置" : "配置特定代理设置"}
      open={visible}
      onCancel={onCancel}
      maskClosable={false}
      footer={[
        <Button key="cancel" onClick={onCancel} icon={<CloseOutlined />}>
          取消
        </Button>,
        <Button
          key="test"
          onClick={handleTestProxy}
          loading={testLoading}
          disabled={!proxyEnabled}
          icon={<CheckCircleOutlined />}
        >
          测试
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSaveProxy}
          icon={<SaveOutlined />}
        >
          保存
        </Button>
      ]}
      width={550}
    >
      {initialLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '10px' }}>加载代理配置...</div>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="enabled"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="启用代理" 
              unCheckedChildren="禁用代理"
              onChange={handleProxyEnabledChange}
            />
          </Form.Item>
          
          {proxyEnabled && (
            <>
              <Form.Item
                name="protocol"
                label="代理协议"
                initialValue="http"
              >
                <Select>
                  {PROXY_PROTOCOL_OPTIONS.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="host"
                label="代理服务器地址"
                rules={[{ required: true, message: '请输入代理服务器地址' }]}
              >
                <Input placeholder="例如: 127.0.0.1" />
              </Form.Item>

              <Form.Item
                name="port"
                label="代理服务器端口"
                rules={[{ required: true, message: '请输入代理服务器端口' }]}
              >
                <InputNumber min={1} max={65535} style={{ width: '100%' }} placeholder="例如: 1080" />
              </Form.Item>
              
              <Divider>身份验证（可选）</Divider>
              
              <Form.Item
                name="username"
                label="用户名"
              >
                <Input placeholder="代理服务器用户名（如果需要）" />
              </Form.Item>
              
              <Form.Item
                name="password"
                label="密码"
              >
                <Input.Password placeholder="代理服务器密码（如果需要）" />
              </Form.Item>
            </>
          )}
          
          <Divider dashed />
          
          <Paragraph type="secondary">
            <GlobalOutlined /> {isGlobal ? 
              "全局代理设置将应用于所有没有特定代理配置的LLM请求。" : 
              "此处的代理设置将仅应用于当前配置的LLM请求，它将覆盖全局代理设置。"}
          </Paragraph>
        </Form>
      )}
    </Modal>
  );
};

export default ProxyModal; 