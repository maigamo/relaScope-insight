/**
 * 提供商详情面板组件
 * 用于展示提供商的详细信息和模型列表
 */
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Switch, 
  Input, 
  Button, 
  Divider, 
  Collapse, 
  Card, 
  Space, 
  Tooltip, 
  message,
  Empty,
  Modal
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined, 
  SettingOutlined, 
  LinkOutlined,
  CaretRightOutlined,
  PlusOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { LLMModelConfig } from '../../../../common/types/llm';
import * as apiKeyIPC from '../utils/ipc/apiKey';
import * as providerIPC from '../utils/ipc/provider';
import './ProviderDetailPanel.css';

const { Text, Title, Paragraph } = Typography;
const { Panel } = Collapse;
const { Search } = Input;

// 接口定义
interface ExtendedModelConfig extends LLMModelConfig {
  temperature?: number;
  systemMessage?: string;
}

interface ProviderDetailProps {
  providerId: string;
  onModelAdd?: (providerId: string) => void;
  onModelEdit?: (modelId: string, model: ExtendedModelConfig) => void;
  onModelDelete?: (modelId: string) => void;
  onApiKeyChange?: (apiKey: string) => void;
}

// 提供商URL映射
const PROVIDER_URLS: Record<string, string> = {
  'openai': 'https://openai.com',
  'anthropic': 'https://anthropic.com',
  'gemini': 'https://deepmind.google/technologies/gemini/',
  'deepseek': 'https://deepseek.com',
  'zhipu': 'https://open.bigmodel.cn',
  'openrouter': 'https://openrouter.ai',
  'ollama': 'https://ollama.com',
  'azure': 'https://azure.microsoft.com'
};

// 默认API地址映射
const DEFAULT_API_URLS: Record<string, string> = {
  'openai': 'https://api.openai.com/v1/chat/completions',
  'anthropic': 'https://api.anthropic.com/v1/messages',
  'gemini': 'https://generativelanguage.googleapis.com/v1/models',
  'deepseek': 'https://api.deepseek.com/v1/chat/completions',
  'zhipu': 'https://open.bigmodel.cn/api/paas/v3/model-api',
  'openrouter': 'https://openrouter.ai/api/v1/chat/completions',
  'azure': 'https://{resource}.openai.azure.com/openai/deployments/{deployment}'
};

// 申请API密钥URL映射
const API_KEY_APPLY_URLS: Record<string, string> = {
  'openai': 'https://platform.openai.com/api-keys',
  'anthropic': 'https://console.anthropic.com/settings/keys',
  'gemini': 'https://aistudio.google.com/app/apikey',
  'deepseek': 'https://platform.deepseek.com/api-keys',
  'zhipu': 'https://open.bigmodel.cn/usercenter/apikeys',
  'openrouter': 'https://openrouter.ai/keys',
  'azure': 'https://portal.azure.com/'
};

/**
 * 模型卡片组件
 */
interface ModelCardProps {
  model: ExtendedModelConfig;
  onEdit: (model: ExtendedModelConfig) => void;
  onDelete: (modelId: string) => void;
  onConfigProxy: (modelId: string) => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, onEdit, onDelete, onConfigProxy }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`model-card ${expanded ? 'model-card-expanded' : ''}`}>
      <div className="model-card-header">
        <div className="model-card-title">{model.name}</div>
        <div className="model-card-actions">
          <Tooltip title={expanded ? "收起" : "展开"}>
            <Button 
              type="text" 
              icon={<CaretRightOutlined rotate={expanded ? 90 : 0} />} 
              onClick={() => setExpanded(!expanded)}
            />
          </Tooltip>
          <Tooltip title="配置代理">
            <Button 
              type="text" 
              icon={<SettingOutlined />} 
              onClick={() => onConfigProxy(model.id)}
            />
          </Tooltip>
          <Tooltip title="删除模型">
            <Button 
              type="text" 
              danger
              icon={<DeleteOutlined />} 
              onClick={() => onDelete(model.id)}
            />
          </Tooltip>
          <Tooltip title="编辑模型">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => onEdit(model)}
            />
          </Tooltip>
        </div>
      </div>
      
      {expanded && (
        <div className="model-card-content">
          <div className="model-param-item">
            <Text type="secondary">模型ID: </Text>
            <Text>{model.id}</Text>
          </div>
          <div className="model-param-item">
            <Text type="secondary">最大Token: </Text>
            <Text>{model.maxTokens || '不限制'}</Text>
          </div>
          <div className="model-param-item">
            <Text type="secondary">温度: </Text>
            <Text>{model.temperature || model.defaultTemperature || 0.7}</Text>
          </div>
          <div className="model-param-item">
            <Text type="secondary">系统提示语: </Text>
            <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}>
              {model.systemMessage || '无系统提示语'}
            </Paragraph>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 快速添加模型弹窗组件
 */
interface QuickAddModelModalProps {
  visible: boolean;
  providerId: string;
  onCancel: () => void;
  onAdd: (models: ExtendedModelConfig[]) => void;
}

const QuickAddModelModal: React.FC<QuickAddModelModalProps> = ({ 
  visible, 
  providerId, 
  onCancel, 
  onAdd 
}) => {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // 预配置的模型列表（根据provider不同而变化）
  const getPresetModels = (): ExtendedModelConfig[] => {
    switch (providerId) {
      case 'openai':
        return [
          { id: 'gpt-4o', name: 'GPT-4o', maxTokens: 128000, defaultTemperature: 0.7 },
          { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 128000, defaultTemperature: 0.7 },
          { id: 'gpt-4', name: 'GPT-4', maxTokens: 8192, defaultTemperature: 0.7 },
          { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 16385, defaultTemperature: 0.7 },
        ];
      case 'anthropic':
        return [
          { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', maxTokens: 200000, defaultTemperature: 0.7 },
          { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', maxTokens: 200000, defaultTemperature: 0.7 },
          { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', maxTokens: 200000, defaultTemperature: 0.7 },
        ];
      case 'gemini':
        return [
          { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', maxTokens: 1048576, defaultTemperature: 0.7 },
          { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', maxTokens: 1048576, defaultTemperature: 0.7 },
          { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', maxTokens: 32768, defaultTemperature: 0.7 },
        ];
      default:
        return [];
    }
  };
  
  // 重置选择
  useEffect(() => {
    if (visible) {
      setSelectedModels([]);
    }
  }, [visible]);
  
  // 处理模型选择
  const handleModelSelect = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      setSelectedModels(selectedModels.filter(id => id !== modelId));
    } else {
      setSelectedModels([...selectedModels, modelId]);
    }
  };
  
  // 处理确认添加
  const handleAddConfirm = () => {
    if (selectedModels.length === 0) {
      message.warning('请至少选择一个模型');
      return;
    }
    
    setLoading(true);
    
    try {
      // 根据选中的ID过滤出完整的模型配置
      const modelsToAdd = getPresetModels().filter(model => 
        selectedModels.includes(model.id)
      );
      
      onAdd(modelsToAdd);
      onCancel();
    } catch (error) {
      console.error('添加模型失败:', error);
      message.error('添加模型失败');
    } finally {
      setLoading(false);
    }
  };
  
  const presetModels = getPresetModels();
  
  return (
    <Modal
      title={`快速添加${providerIPC.getProviderName(providerId as any)}模型`}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button 
          key="add" 
          type="primary" 
          loading={loading}
          onClick={handleAddConfirm}
          disabled={selectedModels.length === 0}
        >
          添加选中模型
        </Button>
      ]}
    >
      <div className="quick-add-model-list">
        {presetModels.length > 0 ? (
          presetModels.map(model => (
            <div 
              key={model.id} 
              className={`quick-add-model-item ${selectedModels.includes(model.id) ? 'selected' : ''}`}
              onClick={() => handleModelSelect(model.id)}
            >
              <div className="model-info">
                <div className="model-name">{model.name}</div>
                <div className="model-id">{model.id}</div>
              </div>
              <div className="model-tokens">最大Token: {model.maxTokens}</div>
            </div>
          ))
        ) : (
          <Empty description="没有可用的预配置模型" />
        )}
      </div>
    </Modal>
  );
};

/**
 * 提供商详情面板组件
 */
const ProviderDetailPanel: React.FC<ProviderDetailProps> = ({ 
  providerId,
  onModelAdd,
  onModelEdit,
  onModelDelete,
  onApiKeyChange
}) => {
  const [provider, setProvider] = useState<any>(null);
  const [enabled, setEnabled] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [filteredModels, setFilteredModels] = useState<ExtendedModelConfig[]>([]);
  const [models, setModels] = useState<ExtendedModelConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [quickAddModalVisible, setQuickAddModalVisible] = useState(false);
  
  // 加载提供商数据
  useEffect(() => {
    const loadProviderData = async () => {
      if (!providerId) return;
      
      setLoading(true);
      try {
        // 获取提供商数据
        const providerData = await providerIPC.getProvider(providerId);
        if (providerData) {
          setProvider(providerData);
          setEnabled(!!providerData.enabled);
          
          // 加载API密钥
          try {
            const key = await apiKeyIPC.getApiKey(providerId);
            setApiKey(key || '');
          } catch (error) {
            console.error('获取API密钥失败:', error);
            setApiKey('');
          }
          
          // 设置API URL
          setApiUrl(providerData.apiUrl || DEFAULT_API_URLS[providerId] || '');
          
          // 加载模型配置
          const providerModels = providerData.models || [];
          setModels(providerModels);
          setFilteredModels(providerModels);
        }
      } catch (error) {
        console.error('加载提供商数据失败:', error);
        message.error('加载提供商数据失败');
      } finally {
        setLoading(false);
      }
    };
    
    loadProviderData();
  }, [providerId]);
  
  // 过滤模型
  useEffect(() => {
    if (!searchValue) {
      setFilteredModels(models);
      return;
    }
    
    const filtered = models.filter(model => 
      model.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      model.id.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    setFilteredModels(filtered);
  }, [searchValue, models]);
  
  // 处理启用状态变更
  const handleEnabledChange = async (checked: boolean) => {
    setEnabled(checked);
    try {
      await providerIPC.updateProvider(providerId, { enabled: checked });
      message.success(`${checked ? '启用' : '禁用'}提供商成功`);
    } catch (error) {
      console.error('更新提供商状态失败:', error);
      message.error('更新提供商状态失败');
      setEnabled(!checked); // 回滚状态
    }
  };
  
  // 处理API密钥保存
  const handleSaveApiKey = async () => {
    if (!providerId) return;
    
    try {
      await apiKeyIPC.setApiKey(providerId, apiKey);
      
      if (onApiKeyChange) {
        onApiKeyChange(apiKey);
      }
      
      message.success('API密钥保存成功');
    } catch (error) {
      console.error('保存API密钥失败:', error);
      message.error('保存API密钥失败');
    }
  };
  
  // 处理API密钥检测
  const handleTestApiKey = async () => {
    if (!apiKey) {
      message.warning('请先输入API密钥');
      return;
    }
    
    if (!providerId) return;
    
    message.loading('正在检测API密钥...', 1.5);
    
    try {
      const result = await apiKeyIPC.testApiKey(providerId, apiKey);
      if (result.success) {
        message.success('API密钥有效');
      } else {
        message.error(`API密钥无效: ${result.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('检测API密钥失败:', error);
      message.error('检测API密钥失败');
    }
  };
  
  // 处理API地址保存
  const handleSaveApiUrl = async () => {
    if (!providerId) return;
    
    try {
      await providerIPC.updateProvider(providerId, { apiUrl });
      message.success('API地址保存成功');
    } catch (error) {
      console.error('保存API地址失败:', error);
      message.error('保存API地址失败');
    }
  };
  
  // 处理编辑模型
  const handleEditModel = (model: ExtendedModelConfig) => {
    if (onModelEdit) {
      onModelEdit(model.id, model);
    } else {
      message.info('编辑模型功能将在后续版本提供');
    }
  };
  
  // 处理删除模型
  const handleDeleteModel = (modelId: string) => {
    if (onModelDelete) {
      onModelDelete(modelId);
    } else {
      message.info('删除模型功能将在后续版本提供');
    }
  };
  
  // 处理配置代理
  const handleConfigProxy = (modelId: string) => {
    message.info('模型代理配置功能将在后续版本提供');
  };
  
  // 处理添加模型
  const handleAddModel = () => {
    if (onModelAdd) {
      onModelAdd(providerId);
    } else {
      message.info('添加模型功能将在后续版本提供');
    }
  };
  
  // 处理快速添加模型
  const handleQuickAddModels = (modelsToAdd: ExtendedModelConfig[]) => {
    // 这里可以实现真正的添加逻辑
    message.success(`成功添加了 ${modelsToAdd.length} 个模型`);
    
    // 更新模型列表（实际应用中这里应该调用刷新API）
    const newModels = [...models, ...modelsToAdd];
    setModels(newModels);
    setFilteredModels(searchValue ? 
      newModels.filter(model => 
        model.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        model.id.toLowerCase().includes(searchValue.toLowerCase())
      ) : 
      newModels
    );
  };
  
  // 打开申请API密钥页面
  const handleOpenApiKeyApply = () => {
    const url = API_KEY_APPLY_URLS[providerId];
    if (url) {
      window.open(url, '_blank');
    } else {
      message.info('没有可用的API密钥申请地址');
    }
  };
  
  // 渲染提供商信息
  if (!provider || loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>加载中...</div>
      </div>
    );
  }
  
  const providerName = provider?.name || 'Unknown Provider';
  const providerUrl = PROVIDER_URLS[providerId] || '#';
  
  return (
    <div className="provider-detail-panel">
      {/* 提供商标题和启用开关 */}
      <div className="provider-header">
        <Title level={4} className="provider-title">
          {providerName}
          <a href={providerUrl} target="_blank" rel="noopener noreferrer">
            <LinkOutlined style={{ fontSize: '16px', marginLeft: '8px' }} />
          </a>
        </Title>
        <div className="provider-actions">
          <Switch 
            checked={enabled} 
            onChange={handleEnabledChange} 
            checkedChildren="已启用" 
            unCheckedChildren="已禁用"
          />
        </div>
      </div>
      
      <Divider />
      
      {/* API密钥配置区域 */}
      <div className="provider-api">
        <div className="api-key-section">
          <Title level={5}>API密钥配置</Title>
          <Input.Password
            className="api-key-input"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="输入API密钥"
            visibilityToggle
            iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
          />
          <div className="api-key-tips">
            <a className="apply-key-link" onClick={handleOpenApiKeyApply}>点击这里申请密钥</a>
            <span className="multiple-keys-tip">多个密钥以英文逗号分隔</span>
          </div>
          <Space className="api-key-buttons">
            <Button onClick={handleSaveApiKey} type="primary">保存</Button>
            <Button onClick={handleTestApiKey}>测试</Button>
          </Space>
        </div>
        
        {/* API 地址配置区域 */}
        <div className="provider-api">
          <Title level={5}>API 地址配置</Title>
          <div className="api-url-tip">
            <Space>
              <InfoCircleOutlined />
              <Text type="secondary">设置自定义 API 地址，为空则使用默认地址</Text>
            </Space>
          </div>
          <div className="api-url-input">
            <Input
              placeholder={DEFAULT_API_URLS[providerId] || '请输入自定义 API 地址'}
              value={apiUrl}
              onChange={e => setApiUrl(e.target.value)}
              suffix={
                <Tooltip title="保存">
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    size="small"
                    onClick={handleSaveApiUrl}
                  />
                </Tooltip>
              }
            />
          </div>
          <div className="api-url-tip">
            <Text type="secondary">
              建议仅在使用自建代理或私有服务时修改，否则请保留默认值
            </Text>
          </div>
        </div>
      </div>
      
      <Divider />
      
      {/* 模型列表区域 */}
      <div className="models-section">
        <div className="models-header">
          <div className="models-title">
            <Title level={5} style={{ margin: 0 }}>模型列表</Title>
            {showSearch ? (
              <Search
                placeholder="搜索模型"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{ width: 220 }}
                onBlur={() => {
                  if (!searchValue) {
                    setShowSearch(false);
                  }
                }}
                allowClear
                autoFocus
              />
            ) : (
              <Button 
                type="text" 
                icon={<SearchOutlined />} 
                onClick={() => setShowSearch(true)}
              />
            )}
          </div>
        </div>
        
        {/* 模型列表内容 */}
        <div className="models-container">
          {filteredModels.length > 0 ? (
            filteredModels.map(model => (
              <ModelCard
                key={model.id}
                model={model}
                onEdit={handleEditModel}
                onDelete={handleDeleteModel}
                onConfigProxy={handleConfigProxy}
              />
            ))
          ) : (
            <Empty 
              description={searchValue ? "没有匹配的模型" : "没有可用的模型"}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
        
        {/* 添加模型按钮区域 */}
        <div className="models-actions">
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddModel}
            >
              添加模型
            </Button>
            <Button
              onClick={() => setQuickAddModalVisible(true)}
            >
              快速添加
              <Tooltip title="添加预配置的常用模型">
                <QuestionCircleOutlined style={{ marginLeft: '5px' }} />
              </Tooltip>
            </Button>
          </Space>
        </div>
      </div>
      
      {/* 快速添加模型弹窗 */}
      <QuickAddModelModal
        visible={quickAddModalVisible}
        providerId={providerId}
        onCancel={() => setQuickAddModalVisible(false)}
        onAdd={handleQuickAddModels}
      />
    </div>
  );
};

export default ProviderDetailPanel; 