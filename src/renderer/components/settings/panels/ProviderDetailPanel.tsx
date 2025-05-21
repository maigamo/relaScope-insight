/**
 * 提供商详情面板
 * 展示LLM提供商的详细配置
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
  message 
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined, 
  SettingOutlined, 
  LinkOutlined,
  CaretRightOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useLLMContext } from '../context/LLMContext';
import { LLMProvider, LLMModelConfig, LLMConfig } from '../../../../common/types/llm';
import './ProviderDetailPanel.css';
import * as apiKeyIPC from '../utils/ipc/apiKey';

const { Text, Title, Paragraph } = Typography;
const { Panel } = Collapse;
const { Search } = Input;

// 扩展LLMModelConfig接口以包含需要的字段
interface ExtendedModelConfig extends LLMModelConfig {
  temperature?: number;
  systemMessage?: string;
}

// 定义提供商URL映射
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

interface ModelCardProps {
  model: ExtendedModelConfig;
  onEdit: (model: ExtendedModelConfig) => void;
  onDelete: (modelId: string) => void;
  onConfigProxy: (modelId: string) => void;
}

// 模型卡片组件
const ModelCard: React.FC<ModelCardProps> = ({ model, onEdit, onDelete, onConfigProxy }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card 
      className={`model-card ${expanded ? 'model-card-expanded' : ''}`}
      bordered={true}
    >
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
    </Card>
  );
};

interface ProviderDetailPanelProps {
  providerId: string | null;
}

const ProviderDetailPanel: React.FC<ProviderDetailPanelProps> = ({ providerId }) => {
  const { 
    providers, 
    toggleModal, 
    setSelectedConfig, 
    setActiveProviderId,
    refreshProviders
  } = useLLMContext();
  
  const [provider, setProvider] = useState<any>(null);
  const [enabled, setEnabled] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [filteredModels, setFilteredModels] = useState<ExtendedModelConfig[]>([]);
  const [models, setModels] = useState<ExtendedModelConfig[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  
  // 加载提供商数据
  useEffect(() => {
    const loadProviderData = async () => {
      if (!providerId) return;
      
      const providerData = providers.find(p => p.id === providerId);
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
        setModels(providerData.models || []);
        setFilteredModels(providerData.models || []);
      }
    };
    
    loadProviderData();
  }, [providerId, providers]);
  
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
  const handleEnabledChange = (checked: boolean) => {
    setEnabled(checked);
    // TODO: 保存启用状态到后端
    message.success(`${checked ? '启用' : '禁用'}提供商成功`);
  };
  
  // 处理API密钥保存
  const handleSaveApiKey = async () => {
    if (!providerId) return;
    
    try {
      await apiKeyIPC.setApiKey(providerId, apiKey);
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
  
  // 处理编辑模型
  const handleEditModel = (model: ExtendedModelConfig) => {
    setSelectedConfig(model);
    toggleModal('isModalVisible', true);
  };
  
  // 处理删除模型
  const handleDeleteModel = (modelId: string) => {
    // TODO: 实现删除模型逻辑
    message.success(`删除模型 ${modelId} 成功`);
  };
  
  // 处理配置代理
  const handleConfigProxy = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (model) {
      setSelectedConfig(model);
      toggleModal('isProxyVisible', true);
    }
  };
  
  // 处理添加模型
  const handleAddModel = () => {
    if (!providerId) return;
    
    setActiveProviderId(providerId);
    
    // 创建一个空配置作为初始值
    const newConfig: Partial<LLMConfig> = {
      provider: providerId as unknown as LLMProvider,
      isDefault: false,
      temperature: 0.7,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      maxTokens: 2048,
      systemMessage: '',
    };
    
    setSelectedConfig(newConfig);
    toggleModal('isModalVisible', true);
  };
  
  // 处理快速添加
  const handleQuickAdd = () => {
    toggleModal('isCustomModelModalVisible', true);
  };
  
  // 如果没有选中提供商，显示提示信息
  if (!providerId || !provider) {
    return (
      <div className="empty-provider-tip">
        <div>请在左侧选择一个提供商</div>
      </div>
    );
  }
  
  const providerName = provider.name || providerId;
  const providerUrl = PROVIDER_URLS[providerId] || '#';
  
  return (
    <div className="provider-detail-container">
      {/* 标题区域 - 提供商名称和启用开关 */}
      <div className="provider-header">
        <div className="provider-title">
          <a 
            href={providerUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="provider-name-link"
          >
            {providerName} <LinkOutlined />
          </a>
        </div>
        <div className="provider-enabled">
          <Text type="secondary">启用</Text>
          <Switch checked={enabled} onChange={handleEnabledChange} />
        </div>
      </div>
      
      <Divider className="section-divider" />
      
      {/* API密钥配置 */}
      <div className="api-key-section">
        <Title level={5}>API密钥</Title>
        <div className="api-key-input-container">
          <Input.Password
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="请输入API密钥"
            visibilityToggle={{ visible: showApiKey, onVisibleChange: setShowApiKey }}
            className="api-key-input"
          />
          <Button type="primary" onClick={handleTestApiKey}>检测</Button>
        </div>
        <div className="api-key-tips">
          <a 
            href={providerUrl + "/api-keys"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="apply-key-link"
          >
            点击这里申请密钥
          </a>
          <Text type="secondary" className="multiple-keys-tip">多个密钥以英文逗号分隔</Text>
        </div>
      </div>
      
      {/* API地址配置 - 可折叠 */}
      <Collapse 
        ghost 
        className="api-url-collapse"
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      >
        <Panel header={<Title level={5}>API地址</Title>} key="api-url">
          <Input
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="请输入API地址"
            className="api-url-input"
          />
          <Text type="secondary" className="api-url-tip">
            留空将使用默认API地址: {DEFAULT_API_URLS[providerId] || '无默认地址'}
          </Text>
        </Panel>
      </Collapse>
      
      <Divider className="section-divider" />
      
      {/* 模型配置区域 */}
      <div className="models-section">
        <div className="models-header">
          <Title level={5}>模型</Title>
          {showSearch ? (
            <Search
              placeholder="搜索模型"
              allowClear
              onChange={e => setSearchValue(e.target.value)}
              className="model-search-input"
              onBlur={() => !searchValue && setShowSearch(false)}
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
        
        <div className="models-list">
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
            <div className="empty-models-tip">
              <div>暂无模型配置，请点击下方按钮添加</div>
            </div>
          )}
        </div>
        
        <div className="models-actions">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddModel}
          >
            添加模型
          </Button>
          <Button 
            onClick={handleQuickAdd}
          >
            快速添加
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailPanel; 