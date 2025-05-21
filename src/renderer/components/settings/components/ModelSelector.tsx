import React, { useCallback, useEffect, useState } from 'react';
import { Typography, Select, Space, Spin, message } from 'antd';
import { LLMModelConfig, LLMProvider } from '../../../../common/types/llm';
import * as modelIPC from '../utils/ipc/model';

/**
 * 模型选择器属性
 */
interface ModelSelectorProps {
  providerId: string | null;
  initialModelId?: string | null;
  onModelSelect?: (modelId: string, modelName: string) => void;
}

/**
 * 模型选择器组件
 * 用于选择LLM模型
 */
const ModelSelector: React.FC<ModelSelectorProps> = ({
  providerId,
  initialModelId,
  onModelSelect
}) => {
  const [models, setModels] = useState<LLMModelConfig[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(initialModelId || null);
  const [loading, setLoading] = useState(false);

  // 加载模型列表
  const loadModels = useCallback(async () => {
    if (!providerId) return;

    try {
      setLoading(true);
      const availableModels = await modelIPC.getAvailableModels(providerId as LLMProvider);
      setModels(availableModels || []);
      
      // 如果有初始模型ID，选择它，否则默认选择第一个模型
      if (initialModelId && availableModels?.some(model => model.id === initialModelId)) {
        setSelectedModel(initialModelId);
      } else if (availableModels?.length > 0 && !selectedModel) {
        setSelectedModel(availableModels[0].id);
        // 通知父组件选择的模型
        if (onModelSelect) {
          onModelSelect(availableModels[0].id, availableModels[0].name);
        }
      }
    } catch (error) {
      console.error('加载模型失败:', error);
      message.error('无法加载模型列表');
    } finally {
      setLoading(false);
    }
  }, [providerId, selectedModel, initialModelId, onModelSelect]);

  // 当提供商变更时，加载模型
  useEffect(() => {
    if (providerId) {
      loadModels();
    } else {
      setModels([]);
      setSelectedModel(null);
    }
  }, [providerId, loadModels]);

  // 处理模型变更
  const handleModelChange = useCallback((value: string) => {
    setSelectedModel(value);
    
    // 通知父组件选择的模型
    if (onModelSelect) {
      const selectedModelObj = models.find(model => model.id === value);
      if (selectedModelObj) {
        onModelSelect(value, selectedModelObj.name);
      }
    }
  }, [models, onModelSelect]);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Typography.Text>选择模型:</Typography.Text>
      
      {loading ? (
        <Spin size="small" />
      ) : (
        <Select
          style={{ width: '100%' }}
          placeholder="请选择模型"
          value={selectedModel}
          onChange={handleModelChange}
          disabled={!providerId || models.length === 0}
        >
          {models.map(model => (
            <Select.Option key={model.id} value={model.id}>
              {model.name}
            </Select.Option>
          ))}
        </Select>
      )}
      
      {models.length === 0 && providerId && !loading && (
        <Typography.Text type="secondary">
          没有可用的模型，请检查API密钥是否正确设置
        </Typography.Text>
      )}
    </Space>
  );
};

export default ModelSelector; 