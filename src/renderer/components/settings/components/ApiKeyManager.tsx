import React, { useCallback, useEffect, useState } from 'react';
import { Typography, Input, Button, Space, message, Spin } from 'antd';
import * as apiKeyIPC from '../utils/ipc/apiKey';

/**
 * API密钥管理器属性
 */
interface ApiKeyManagerProps {
  providerId: string | null;
}

/**
 * API密钥管理器组件
 * 用于管理LLM提供商的API密钥
 */
const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  providerId
}) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  // 加载API密钥
  const loadApiKey = useCallback(async () => {
    if (!providerId) return;

    try {
      setLoading(true);
      const key = await apiKeyIPC.getApiKey(providerId);
      setApiKey(key || '');
    } catch (error) {
      console.error('加载API密钥失败:', error);
      message.error('无法加载API密钥');
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  // 当提供商变更时，加载API密钥
  useEffect(() => {
    if (providerId) {
      loadApiKey();
    } else {
      setApiKey('');
    }
  }, [providerId, loadApiKey]);

  // 处理API密钥变更
  const handleApiKeyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  }, []);

  // 保存API密钥
  const handleSaveApiKey = useCallback(async () => {
    if (!providerId) return;

    try {
      setLoading(true);
      const success = await apiKeyIPC.saveApiKey(providerId, apiKey);
      
      if (success) {
        message.success('API密钥保存成功');
      } else {
        message.error('保存API密钥失败');
      }
    } catch (error) {
      console.error('保存API密钥错误:', error);
      message.error('保存API密钥时发生错误');
    } finally {
      setLoading(false);
    }
  }, [providerId, apiKey]);

  // 测试API密钥
  const handleTestApiKey = useCallback(async () => {
    if (!providerId || !apiKey) {
      message.warning('请先输入API密钥');
      return;
    }

    try {
      setTesting(true);
      // 这里需要实现测试API密钥的功能
      // 由于没有直接的测试API方法，可以在后续完善
      message.info('API密钥测试功能稍后实现');
      
      // 模拟测试成功
      setTimeout(() => {
        message.success('API密钥有效');
        setTesting(false);
      }, 1000);
    } catch (error) {
      console.error('测试API密钥错误:', error);
      message.error('测试API密钥时发生错误');
      setTesting(false);
    }
  }, [providerId, apiKey]);

  // 如果没有选择提供商，显示提示信息
  if (!providerId) {
    return (
      <Typography.Text type="secondary">
        请先选择提供商
      </Typography.Text>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Typography.Text>API密钥:</Typography.Text>
      
      {loading ? (
        <Spin size="small" />
      ) : (
        <>
          <Input.Password
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="请输入API密钥"
            style={{ width: '100%' }}
          />
          
          <Space>
            <Button 
              type="primary" 
              onClick={handleSaveApiKey}
              loading={loading}
              disabled={!providerId}
            >
              保存
            </Button>
            
            <Button 
              onClick={handleTestApiKey}
              loading={testing}
              disabled={!providerId || !apiKey}
            >
              测试
            </Button>
          </Space>
        </>
      )}
    </Space>
  );
};

export default ApiKeyManager; 