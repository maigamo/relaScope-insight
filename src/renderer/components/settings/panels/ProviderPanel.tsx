/**
 * 提供商面板
 * 管理和选择LLM提供商
 */
import React, { useState, useEffect } from 'react';
import { List, Card, Input, Button, Typography, Empty, Space, Tag, Tooltip, message, Divider } from 'antd';
import { SearchOutlined, GlobalOutlined, ApiOutlined, StarOutlined, StarFilled, PlusOutlined } from '@ant-design/icons';
import { useLLMContext } from '../context/LLMContext';
import { filterProviders } from '../utils/filters';
import { fadeIn } from '../utils/animations';
import { containerStyle, cardBodyStyle, cardStyle, cardContentStyle } from '../utils/styles';

const { Title, Text } = Typography;

/**
 * 提供商面板组件
 */
const ProviderPanel: React.FC = () => {
  const { 
    providers, 
    activeProviderId, 
    setActiveProviderId, 
    toggleModal,
    searchQuery,
    setSearchQuery,
    handleSetDefaultProvider
  } = useLLMContext();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [filteredProviders, setFilteredProviders] = useState(providers);

  // 监听提供商列表变化
  useEffect(() => {
    setFilteredProviders(filterProviders(providers, searchQuery));
  }, [providers, searchQuery]);

  // 选择提供商
  const handleProviderSelect = (providerId: string) => {
    setActiveProviderId(providerId);
  };

  // 设置默认提供商
  const handleDefaultProvider = (providerId: string) => {
    if (handleSetDefaultProvider) {
      handleSetDefaultProvider(providerId);
    } else {
      message.error('设置默认提供商功能不可用');
    }
  };

  // 打开API文档链接
  const openApiDocs = (providerId: string) => {
    // 提供商对应的API文档
    const docsLinks: Record<string, string> = {
      'openai': 'https://platform.openai.com/docs/api-reference',
      'anthropic': 'https://docs.anthropic.com/claude/reference',
      'gemini': 'https://ai.google.dev/docs',
      'baidu': 'https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html',
      'azure': 'https://learn.microsoft.com/en-us/azure/cognitive-services/openai/',
      'aliyun': 'https://help.aliyun.com/document_detail/2400135.html',
      'xunfei': 'https://www.xfyun.cn/doc/spark/SparkAPI.html'
    };

    // 根据提供商ID找到对应的文档链接
    const docUrl = docsLinks[providerId] || 'https://platform.openai.com/docs/api-reference';

    // 打开链接
    window.open(docUrl, '_blank');
  };

  // 搜索处理函数
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 配置API密钥
  const openApiSettings = (providerId: string) => {
    setActiveProviderId(providerId);
    toggleModal('isApiKeyVisible', true);
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: 20 }}>
        <Title level={3}>LLM提供商</Title>
        <Text>选择并配置LLM服务提供商</Text>
      </div>

      <Input
        placeholder="搜索提供商"
        prefix={<SearchOutlined />}
        allowClear
        onChange={handleSearch}
        value={searchQuery}
        style={{ marginBottom: 20 }}
      />

      {filteredProviders.length === 0 ? (
        <Empty description="没有找到匹配的提供商" />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 4 }}
          dataSource={filteredProviders}
          loading={loading}
          renderItem={provider => (
            <List.Item key={provider.id}>
              <Card
                style={{ 
                  ...cardStyle,
                  borderColor: provider.id === activeProviderId ? '#1890ff' : undefined,
                  transform: provider.id === activeProviderId ? 'translateY(-2px)' : undefined,
                  boxShadow: provider.id === activeProviderId ? '0 6px 16px -8px rgba(0, 0, 0, 0.2)' : undefined,
                  ...fadeIn
                }}
                bodyStyle={cardBodyStyle}
                hoverable
                onClick={() => handleProviderSelect(provider.id)}
              >
                <div style={{ ...cardContentStyle, height: '100px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Title level={4} style={{ margin: 0 }}>{provider.name || provider.id}</Title>
                    {provider.isDefault && (
                      <Tag color="blue">默认</Tag>
                    )}
                  </div>
                  
                  <div style={{ marginTop: 'auto' }}>
                    <Space>
                      <Tooltip title="查看API文档">
                        <Button 
                          type="text" 
                          icon={<GlobalOutlined />} 
                          onClick={(e) => {
                            e.stopPropagation();
                            openApiDocs(provider.id);
                          }}
                        />
                      </Tooltip>
                      
                      <Tooltip title="配置API密钥">
                        <Button 
                          type="text" 
                          icon={<ApiOutlined />} 
                          onClick={(e) => {
                            e.stopPropagation();
                            openApiSettings(provider.id);
                          }}
                        />
                      </Tooltip>
                      
                      <Tooltip title={provider.isDefault ? "默认提供商" : "设为默认"}>
                        <Button 
                          type="text" 
                          icon={provider.isDefault ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />} 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDefaultProvider(provider.id);
                          }}
                        />
                      </Tooltip>
                    </Space>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
      
      <Divider />
      
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => message.info('添加自定义提供商功能即将上线')}
        >
          添加提供商
        </Button>
      </div>
    </div>
  );
};

export default ProviderPanel; 