import React from 'react';
import { Form, Input, InputNumber, Switch, Typography, Select } from 'antd';
import { ProxyConfig } from '../../../common/types/llm';

const { Title } = Typography;
const { Option } = Select;

interface ProxyConfigProps {
  initialValues?: ProxyConfig;
}

/**
 * LLM代理配置组件
 */
const LLMProxyConfig: React.FC<ProxyConfigProps> = ({
  initialValues
}) => {
  return (
    <>
      <Title level={4}>代理配置</Title>
      
      <Form.Item
        name={['proxy', 'enabled']}
        valuePropName="checked"
        initialValue={initialValues?.enabled || false}
      >
        <Switch checkedChildren="启用代理" unCheckedChildren="禁用代理" />
      </Form.Item>
      
      <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
        prevValues?.proxy?.enabled !== currentValues?.proxy?.enabled
      }>
        {({ getFieldValue }) => {
          const proxyEnabled = getFieldValue(['proxy', 'enabled']);
          
          return proxyEnabled ? (
            <>
              <Form.Item
                label="代理协议"
                name={['proxy', 'protocol']}
                initialValue={initialValues?.protocol || 'http'}
                rules={[{ required: true, message: '请选择代理协议' }]}
              >
                <Select>
                  <Option value="http">HTTP</Option>
                  <Option value="https">HTTPS</Option>
                  <Option value="socks4">SOCKS4</Option>
                  <Option value="socks5">SOCKS5</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                label="代理服务器地址"
                name={['proxy', 'host']}
                initialValue={initialValues?.host || ''}
                rules={[{ required: true, message: '请输入代理服务器地址' }]}
              >
                <Input placeholder="例如: 127.0.0.1" />
              </Form.Item>
              
              <Form.Item
                label="代理服务器端口"
                name={['proxy', 'port']}
                initialValue={initialValues?.port || 7890}
                rules={[{ required: true, message: '请输入端口号' }]}
              >
                <InputNumber min={1} max={65535} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                label="代理用户名"
                name={['proxy', 'username']}
                initialValue={initialValues?.username || ''}
              >
                <Input placeholder="(可选) 代理认证用户名" />
              </Form.Item>
              
              <Form.Item
                label="代理密码"
                name={['proxy', 'password']}
                initialValue={initialValues?.password || ''}
              >
                <Input.Password placeholder="(可选) 代理认证密码" />
              </Form.Item>
            </>
          ) : null;
        }}
      </Form.Item>
    </>
  );
};

export default LLMProxyConfig; 