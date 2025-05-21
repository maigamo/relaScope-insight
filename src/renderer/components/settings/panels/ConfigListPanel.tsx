/**
 * 配置列表面板
 * 用于展示指定提供商的所有LLM配置
 */
import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Button, Empty, Collapse, Row, Col, Tag, Tooltip, message, Input, Divider } from 'antd';
import { EditOutlined, DeleteOutlined, GlobalOutlined, PlusOutlined, CheckCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useLLMContext } from '../context/LLMContext';
import { cardContainerStyle } from '../utils/styles';
import * as configIPC from '../utils/ipc/config';

const { Title, Text } = Typography;
const { Panel } = Collapse;

// 组件属性接口
interface ConfigListPanelProps {
  providerId: string;
}

// 按模型分组的配置
interface ConfigsByModel {
  [key: string]: any[];
}

/**
 * 配置列表面板组件
 */
const ConfigListPanel: React.FC<ConfigListPanelProps> = ({ providerId }) => {
  const { 
    providers, 
    configs,
    refreshConfigs,
    toggleModal, 
    setSelectedConfig,
  } = useLLMContext();
  
  const [searchValue, setSearchValue] = useState<string>('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  
  // 获取当前提供商信息
  const currentProvider = providers.find(p => p.id === providerId);
  
  // 初始加载及提供商变更时重新加载配置
  useEffect(() => {
    if (providerId) {
      refreshConfigs();
    }
  }, [providerId, refreshConfigs]);
  
  // 过滤配置
  const filteredConfigs = configs.filter(config => {
    const searchLower = searchValue.toLowerCase();
    return (
      config.name?.toLowerCase().includes(searchLower) ||
      config.model?.toLowerCase().includes(searchLower) ||
      Object.keys(config.parameters || {}).some(key => 
        String(config.parameters[key]).toLowerCase().includes(searchLower)
      )
    );
  });
  
  // 处理创建新配置
  const handleCreateConfig = () => {
    setSelectedConfig({
      provider: providerId,
      isDefault: false,
      parameters: {}
    });
    toggleModal('isCreateConfig', true);
    toggleModal('isModalVisible', true);
  };
  
  // 处理编辑配置
  const handleEditConfig = (config: any, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡到折叠面板
    setSelectedConfig(config);
    toggleModal('isCreateConfig', false);
    toggleModal('isModalVisible', true);
  };
  
  // 处理删除配置
  const handleDeleteConfig = async (configId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡到折叠面板
    try {
      await configIPC.deleteConfig(configId);
      message.success('配置删除成功');
      refreshConfigs();
    } catch (error) {
      console.error('删除配置失败:', error);
      message.error('删除配置失败');
    }
  };
  
  // 处理代理设置
  const handleProxySettings = (config: any, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡到折叠面板
    setSelectedConfig(config);
    toggleModal('isProxyVisible', true);
  };
  
  // 切换面板展开状态
  const handlePanelChange = (key: string | string[]) => {
    setExpandedKeys(Array.isArray(key) ? key : [key]);
  };
  
  // 渲染每个配置的详细信息
  const renderConfigDetails = (config: any) => {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text strong>基本信息</Text>
            <div>
              <Text type="secondary">提供商: </Text>
              <Text>{currentProvider?.name}</Text>
            </div>
            <div>
              <Text type="secondary">模型: </Text>
              <Text>{config.model}</Text>
            </div>
            <div>
              <Text type="secondary">API密钥: </Text>
              <Text>{config.useGlobalApiKey ? '使用全局API密钥' : '使用自定义API密钥'}</Text>
            </div>
            <div>
              <Text type="secondary">代理设置: </Text>
              <Text>{config.proxy?.enabled ? '已启用' : '未启用'}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text strong>参数配置</Text>
            {Object.entries(config.parameters || {}).map(([key, value]: [string, any]) => (
              <div key={key}>
                <Text type="secondary">{key}: </Text>
                <Text>{typeof value === 'object' ? JSON.stringify(value) : value}</Text>
              </div>
            ))}
          </Col>
        </Row>
      </Space>
    );
  };
  
  // 如果没有提供商ID，显示提示
  if (!providerId) {
    return (
      <Card style={cardContainerStyle}>
        <Empty description="请先选择一个提供商" />
      </Card>
    );
  }
  
  // 将配置按模型分组
  const configsByModel: ConfigsByModel = filteredConfigs.reduce((acc: ConfigsByModel, config: any) => {
    const modelName = config.model || '未知模型';
    if (!acc[modelName]) {
      acc[modelName] = [];
    }
    acc[modelName].push(config);
    return acc;
  }, {});
  
  return (
    <Card 
      title={
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Title level={4}>{currentProvider?.name} 配置</Title>
            {currentProvider && (
              <Tag color="blue">{configs.length} 个配置</Tag>
            )}
          </Space>
          <Input
            placeholder="搜索配置..."
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ width: 300 }}
          />
        </Space>
      }
      extra={
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleCreateConfig}
        >
          创建新配置
        </Button>
      }
      style={cardContainerStyle}
    >
      {filteredConfigs.length === 0 ? (
        <Empty description={searchValue ? "没有找到匹配的配置" : "暂无配置"} />
      ) : (
        <Space direction="vertical" style={{ width: '100%' }}>
          {Object.entries(configsByModel).map(([model, modelConfigs]) => (
            <div key={model}>
              <Divider orientation="left">{model}</Divider>
              <Collapse 
                activeKey={expandedKeys}
                onChange={handlePanelChange}
                expandIconPosition="end"
              >
                {modelConfigs.map((config) => (
                  <Panel 
                    key={config.id} 
                    header={
                      <Space>
                        <span>{config.name || `${currentProvider?.name}-${config.model}`}</span>
                        {config.isDefault && (
                          <Tag color="green">
                            <CheckCircleOutlined /> 默认
                          </Tag>
                        )}
                      </Space>
                    }
                    extra={
                      <Space onClick={e => e.stopPropagation()}>
                        <Tooltip title="编辑配置">
                          <Button 
                            type="text" 
                            icon={<EditOutlined />} 
                            onClick={(e) => handleEditConfig(config, e)}
                          />
                        </Tooltip>
                        <Tooltip title="代理设置">
                          <Button 
                            type="text" 
                            icon={<GlobalOutlined />} 
                            onClick={(e) => handleProxySettings(config, e)}
                          />
                        </Tooltip>
                        <Tooltip title="删除配置">
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                            onClick={(e) => handleDeleteConfig(config.id, e)}
                          />
                        </Tooltip>
                      </Space>
                    }
                  >
                    {renderConfigDetails(config)}
                  </Panel>
                ))}
              </Collapse>
            </div>
          ))}
        </Space>
      )}
    </Card>
  );
};

export default ConfigListPanel; 