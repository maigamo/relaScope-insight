import React, { FC, useState, useEffect } from 'react';
import { Input, Button, Space, Spin, message, Select } from 'antd';
import { LLMProvider, ApiKeyTestResult } from '../../../common/types/llm';
import { LLMService } from '../../services/ipc/llm.service';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface Props {
  provider: LLMProvider;
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  onApiKeyTestSuccess?: () => void;
}

// 不同提供商的默认测试模型
const PROVIDER_DEFAULT_MODELS: Record<string, Array<{value: string, label: string}>> = {
  [LLMProvider.OPENAI]: [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' }
  ],
  [LLMProvider.ANTHROPIC]: [
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku' }
  ],
  [LLMProvider.SILICON_FLOW]: [
    { value: 'BAAI/bge-m3', label: 'BAAI/bge-m3' },
    { value: 'Qwen2.5-7B-Instruct', label: 'Qwen2.5-7B-Instruct' },
    { value: 'deepseek-ai/DeepSeek-R1', label: 'deepseek-ai/DeepSeek-R1' },
    { value: 'deepseek-ai/DeepSeek-V3', label: 'deepseek-ai/DeepSeek-V3' },
    { value: 'meta-llama/Llama-3.3-70B-Instruct', label: 'meta-llama/Llama-3.3-70B-Instruct' }
  ],
  [LLMProvider.OPENROUTER]: [
    { value: 'openai/gpt-4', label: 'OpenAI GPT-4' },
    { value: 'anthropic/claude-3-opus', label: 'Anthropic Claude 3 Opus' },
    { value: 'meta-llama/llama-3-70b-instruct', label: 'Meta Llama 3 70B' }
  ],
  // 其他提供商的模型可以根据需要添加
};

const LLMApiKeyConfig: FC<Props> = ({ provider, apiKey, onApiKeyChange, onApiKeyTestSuccess }) => {
  // 本地状态管理
  const [localApiKey, setLocalApiKey] = useState(apiKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testMessage, setTestMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  
  // 获取当前提供商可用的模型列表
  const getModelsForProvider = () => {
    return PROVIDER_DEFAULT_MODELS[provider] || [];
  };

  // 当提供商变化时，重置选择的模型
  useEffect(() => {
    const models = getModelsForProvider();
    setSelectedModel(models.length > 0 ? models[0].value : '');
    
    // 当提供商变化时，尝试获取保存的API密钥
    const fetchApiKey = async () => {
      try {
        // 确保provider是字符串类型
        const providerString = typeof provider === 'object' ? JSON.stringify(provider) : String(provider);
        const result = await LLMService.getApiKey(providerString);
        
        // 如果有结果，将结果显示在输入框中
        if (result && result === '已设置') {
          message.info(`${providerString} 提供商已设置API密钥，请重新输入进行测试`);
        }
      } catch (error) {
        console.error('获取API密钥状态失败:', error);
      }
    };
    
    fetchApiKey();
  }, [provider]);

  // 当外部apiKey变化时更新本地状态
  useEffect(() => {
    if (apiKey !== localApiKey) {
      setLocalApiKey(apiKey || '');
    }
    // 重置测试状态
    setTestResult(null);
    setTestMessage('');
  }, [apiKey]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalApiKey(newValue);
    onApiKeyChange(newValue);
    // 输入变化时重置测试状态
    setTestResult(null);
    setTestMessage('');
  };

  // 处理模型选择变化
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    // 模型变化时重置测试状态
    setTestResult(null);
    setTestMessage('');
  };

  // 测试API密钥 - 增加详细日志并修复结果处理
  const testApiKey = async () => {
    if (!localApiKey.trim()) {
      message.error('请输入API密钥');
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    setTestMessage('');

    try {
      // 确保provider是字符串类型，而不是枚举
      const providerString = typeof provider === 'object' ? JSON.stringify(provider) : String(provider);
      
      // 添加更详细的日志，包括选择的模型
      console.log('开始测试API密钥:', {
        provider: providerString,
        providerType: typeof providerString,
        apiKeyLength: localApiKey.trim().length,
        apiKeyFirstChars: localApiKey.trim().substring(0, 10) + '...',
        selectedModel: selectedModel
      });
      
      // 构建测试数据
      const testData = {
        apiKey: localApiKey.trim(),
        provider: providerString.trim(),
        model: selectedModel
      };
      
      // 将测试请求内容打印到控制台，但隐藏完整的API密钥
      console.log('测试API请求内容:', {
        ...testData,
        apiKey: `${testData.apiKey.substring(0, 8)}...${testData.apiKey.substring(testData.apiKey.length - 4)}`,
        url: provider === LLMProvider.SILICON_FLOW ? 'https://api.siliconflow.cn' : undefined
      });
      
      // 调用API测试函数，传递选定的模型
      const apiResponse = await LLMService.testApiKey(
        providerString.trim(),
        localApiKey.trim(),
        selectedModel || undefined
      );
      
      // 记录返回结果
      console.log('测试API密钥返回结果:', apiResponse);

      // 安全地处理不同格式的响应
      if (!apiResponse || typeof apiResponse !== 'object') {
        console.error('测试API密钥返回无效结果:', apiResponse);
        setTestResult('error');
        setTestMessage('测试结果无效，请稍后重试');
        return;
      }

      // 检查响应对象的结构
      const responseObj = apiResponse as Record<string, any>;
      const hasSuccessField = 'success' in responseObj;
      const successValue = hasSuccessField ? responseObj.success : undefined;
      
      console.log('测试API密钥响应分析:', {
        hasSuccessField,
        successValue,
        hasErrorField: 'error' in responseObj,
        errorValue: responseObj.error,
        hasModelsField: 'models' in responseObj,
        modelsCount: responseObj.models?.length,
        hasOriginalResponse: '原始响应' in responseObj
      });

      // 根据响应内容确定测试结果
      if (hasSuccessField && successValue === true) {
        // 直接的成功响应
        const modelsCount = responseObj.models?.length || 0;
        const modelText = selectedModel 
          ? `成功连接到模型 ${selectedModel}` 
          : `发现${modelsCount}个可用模型`;
          
        setTestResult('success');
        setTestMessage(`API密钥有效，${modelText}`);
        if (onApiKeyTestSuccess) {
          onApiKeyTestSuccess();
        }
      } else if (hasSuccessField && successValue === false) {
        // 直接的失败响应
        setTestResult('error');
        setTestMessage(responseObj.error || 'API密钥无效');
      } else if ('原始响应' in responseObj && responseObj['原始响应'] && 
                 typeof responseObj['原始响应'] === 'object' && 
                 responseObj['原始响应'].success === true) {
        // 包装格式的成功响应
        setTestResult('success');
        setTestMessage('API密钥有效');
        if (onApiKeyTestSuccess) {
          onApiKeyTestSuccess();
        }
      } else {
        // 无法确定的响应状态
        console.error('无法识别的API测试响应格式:', responseObj);
        setTestResult('error');
        setTestMessage('无法确认API密钥有效性，请重试');
      }
    } catch (error) {
      console.error('测试API密钥时出错:', error);
      setTestResult('error');
      setTestMessage(error instanceof Error ? error.message : '测试API密钥失败');
    } finally {
      setIsTesting(false);
    }
  };

  // 获取不同提供商的占位符文本
  const getPlaceholder = () => {
    switch (provider) {
      case LLMProvider.OPENAI:
        return '请输入OpenAI API密钥 (sk-...)';
      case LLMProvider.AZURE:
        return '请输入Azure OpenAI API密钥';
      case LLMProvider.ANTHROPIC:
        return '请输入Anthropic API密钥 (sk-ant-...)';
      case LLMProvider.GEMINI:
        return '请输入Google Gemini API密钥';
      case LLMProvider.DEEPSEEK:
        return '请输入DeepSeek API密钥';
      case LLMProvider.BAIDU:
        return '请输入百度文心一言API密钥';
      case LLMProvider.OLLAMA:
        return '无需填写API密钥';
      case LLMProvider.LOCAL:
        return '无需填写API密钥';
      case LLMProvider.SILICON_FLOW:
        return '请输入Silicon Flow API密钥 (sk-...)';
      case LLMProvider.OPENROUTER:
        return '请输入OpenRouter API密钥 (sk-...)';
      default:
        return '请输入API密钥';
    }
  };

  // 获取当前提供商的模型
  const providerModels = getModelsForProvider();
  const showModelSelector = providerModels.length > 0;

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
        <Input.Password
        value={localApiKey}
        onChange={handleInputChange}
        placeholder={getPlaceholder()}
        allowClear
      />
      
      {showModelSelector && (
        <Select
          style={{ width: '100%' }}
          value={selectedModel}
          onChange={handleModelChange}
          placeholder="选择要测试的模型"
          options={providerModels}
        />
      )}
      
      <Space>
        <Button
          type="primary"
          onClick={testApiKey}
          loading={isTesting}
          disabled={!localApiKey.trim()}
        >
          测试API密钥
        </Button>
        {isTesting && <Spin size="small" />}
        {testResult === 'success' && (
          <Space>
            <CheckCircleOutlined style={{ color: 'green' }} />
            <span style={{ color: 'green' }}>{testMessage}</span>
          </Space>
        )}
        {testResult === 'error' && (
          <Space>
            <CloseCircleOutlined style={{ color: 'red' }} />
            <span style={{ color: 'red' }}>{testMessage}</span>
          </Space>
        )}
      </Space>
    </Space>
  );
};

export default LLMApiKeyConfig; 