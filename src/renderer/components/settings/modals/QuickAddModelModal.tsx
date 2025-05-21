/**
 * 快速添加模型模态框
 * 用于为特定提供商快速添加预配置的模型
 */
import React, { useState, useEffect } from 'react';
import { Modal, Button, List, Card, Typography, Tag, Spin, message } from 'antd';
import { LLMProvider, LLMModelConfig } from '../../../../common/types/llm';
import { PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import './QuickAddModelModal.css';

const { Text, Title } = Typography;

// 预定义的模型配置
const PRE_CONFIGURED_MODELS: Record<string, LLMModelConfig[]> = {
  'openai': [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: LLMProvider.OPENAI,
      maxTokens: 128000,
      defaultTemperature: 0.7,
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: LLMProvider.OPENAI,
      maxTokens: 128000,
      defaultTemperature: 0.7,
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: LLMProvider.OPENAI,
      maxTokens: 16385,
      defaultTemperature: 0.7,
    }
  ],
  'anthropic': [
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      provider: LLMProvider.ANTHROPIC,
      maxTokens: 200000,
      defaultTemperature: 0.7,
    },
    {
      id: 'claude-3-sonnet-20240229',
      name: 'Claude 3 Sonnet',
      provider: LLMProvider.ANTHROPIC,
      maxTokens: 200000,
      defaultTemperature: 0.7,
    },
    {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      provider: LLMProvider.ANTHROPIC,
      maxTokens: 200000,
      defaultTemperature: 0.7,
    }
  ],
  'gemini': [
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: LLMProvider.GEMINI,
      maxTokens: 32000,
      defaultTemperature: 0.7,
    },
    {
      id: 'gemini-ultra',
      name: 'Gemini Ultra',
      provider: LLMProvider.GEMINI,
      maxTokens: 32000,
      defaultTemperature: 0.7,
    }
  ],
  'ollama': [
    {
      id: 'llama3',
      name: 'Llama 3',
      provider: LLMProvider.OLLAMA,
      maxTokens: 8192,
      defaultTemperature: 0.7,
    },
    {
      id: 'mistral',
      name: 'Mistral',
      provider: LLMProvider.OLLAMA,
      maxTokens: 8192,
      defaultTemperature: 0.7,
    }
  ]
};

interface QuickAddModelModalProps {
  visible: boolean;
  providerId?: string;
  onCancel: () => void;
  onSuccess: (models: LLMModelConfig[]) => void;
}

const QuickAddModelModal: React.FC<QuickAddModelModalProps> = ({
  visible,
  providerId,
  onCancel,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<LLMModelConfig[]>([]);

  // 当提供商ID变更时，加载可用模型
  useEffect(() => {
    if (visible && providerId) {
      loadModels();
    } else {
      setSelectedModels([]);
    }
  }, [visible, providerId]);

  // 加载模型
  const loadModels = () => {
    setLoading(true);

    // 获取预配置的模型
    const preConfiguredModels = PRE_CONFIGURED_MODELS[providerId as string] || [];
    
    // 这里可以添加从API获取提供商支持的模型逻辑
    // const fetchedModels = await someApiCall();
    
    setAvailableModels(preConfiguredModels);
    setLoading(false);
  };

  // 切换模型选择状态
  const toggleModelSelection = (modelId: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      } else {
        return [...prev, modelId];
      }
    });
  };

  // 获取选择的模型配置
  const getSelectedModelConfigs = (): LLMModelConfig[] => {
    return availableModels.filter(model => selectedModels.includes(model.id));
  };

  // 处理确认添加
  const handleConfirm = () => {
    if (selectedModels.length === 0) {
      message.warning('请至少选择一个模型');
      return;
    }

    const modelConfigs = getSelectedModelConfigs();
    onSuccess(modelConfigs);
    setSelectedModels([]);
  };

  // 处理取消
  const handleCancel = () => {
    setSelectedModels([]);
    onCancel();
  };

  return (
    <Modal
      title="快速添加模型"
      open={visible}
      onCancel={handleCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={selectedModels.length === 0}
          onClick={handleConfirm}
        >
          添加所选模型
        </Button>
      ]}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin />
          <div style={{ marginTop: '10px' }}>加载模型列表...</div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <Text>为 {providerId} 选择要添加的模型：</Text>
          </div>

          {availableModels.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text type="secondary">暂无可用的预配置模型</Text>
            </div>
          ) : (
            <List
              grid={{ gutter: 16, column: 2 }}
              dataSource={availableModels}
              renderItem={(model) => {
                const isSelected = selectedModels.includes(model.id);
                return (
                  <List.Item>
                    <Card
                      hoverable
                      className={`quick-add-model-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleModelSelection(model.id)}
                    >
                      <div className="model-card-content">
                        <div className="model-card-header">
                          <Title level={5}>{model.name}</Title>
                          {isSelected && (
                            <CheckCircleOutlined className="selected-icon" />
                          )}
                        </div>
                        <div>
                          <Text type="secondary">ID: {model.id}</Text>
                        </div>
                        <div>
                          <Text type="secondary">最大Token: {model.maxTokens}</Text>
                        </div>
                        <div className="model-card-tags">
                          <Tag color="blue">{providerId}</Tag>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                );
              }}
            />
          )}
        </div>
      )}
    </Modal>
  );
};

export default QuickAddModelModal; 