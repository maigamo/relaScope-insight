import React, { useCallback } from 'react';
import { Typography, Select, Space } from 'antd';
import { Provider } from '../core/state';

/**
 * 提供商选择器属性
 */
interface ProviderSelectorProps {
  providers: Provider[];
  providerId: string | null;
  onProviderChange: (providerId: string) => void;
}

/**
 * 提供商选择器组件
 * 用于选择LLM提供商
 */
const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  providers,
  providerId,
  onProviderChange
}) => {
  // 处理提供商变更
  const handleChange = useCallback((value: string) => {
    onProviderChange(value);
  }, [onProviderChange]);

  return (
    <Space direction="vertical" style={{ width: '100%', padding: '8px 0' }}>
      <Typography.Text>提供商选择:</Typography.Text>
      <Select
        style={{ width: '100%' }}
        value={providerId || undefined}
        onChange={handleChange}
        placeholder="请选择提供商"
      >
        {providers.map(provider => (
          <Select.Option key={provider.id} value={provider.id}>
            {provider.name}
          </Select.Option>
        ))}
      </Select>
    </Space>
  );
};

export default ProviderSelector; 