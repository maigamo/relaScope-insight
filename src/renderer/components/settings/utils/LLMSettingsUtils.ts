import { useColorMode } from '@chakra-ui/react';
import { LLMProvider, LLMModelConfig } from '../../../../common/types/llm';
import { StyleConfig } from '../types/LLMSettingsTypes';

/**
 * 获取提供商显示名称
 * @param provider 提供商枚举值
 * @returns 提供商显示名称
 */
export function getProviderName(provider: LLMProvider): string {
  switch (provider) {
    case LLMProvider.OPENAI:
      return 'OpenAI';
    case LLMProvider.AZURE:
      return 'Azure';
    case LLMProvider.ANTHROPIC:
      return 'Anthropic';
    case LLMProvider.GEMINI:
      return 'Gemini';
    case LLMProvider.BAIDU:
      return 'Baidu';
    case LLMProvider.OLLAMA:
      return 'Ollama';
    case LLMProvider.OPENROUTER:
      return 'OpenRouter';
    case LLMProvider.SILICON_FLOW:
      return 'Silicon Flow';
    case LLMProvider.LOCAL:
      return 'Local';
    case LLMProvider.DEEPSEEK:
      return 'DeepSeek';
    default:
      return provider || '未知提供商';
  }
}

/**
 * 定义扩展的模型配置类型，包含额外的描述字段
 */
interface EnhancedModelConfig extends LLMModelConfig {
  description?: string;
}

/**
 * 获取默认模型配置
 * @param provider 提供商类型
 * @returns 模型配置列表
 */
export function getDefaultModels(provider: LLMProvider): EnhancedModelConfig[] {
  switch (provider) {
    case LLMProvider.OPENAI:
      return [
        { id: 'gpt-4o', name: 'GPT-4o', maxTokens: 128000, isDefault: true, provider, description: '支持多模态的最新GPT-4模型' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 128000, provider, description: '强大的GPT-4模型，价格更低' },
        { id: 'gpt-4-0125-preview', name: 'GPT-4 Preview (0125)', maxTokens: 128000, provider, description: '最新预览版本的GPT-4模型' },
        { id: 'gpt-4', name: 'GPT-4', maxTokens: 8192, provider, description: '强大而精确的GPT-4模型' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 16385, provider, description: '平衡性能和成本的高效模型' },
      ];
    case LLMProvider.ANTHROPIC:
      return [
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', maxTokens: 200000, isDefault: true, provider, description: '最强大的Claude模型，擅长复杂任务' },
        { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', maxTokens: 200000, provider, description: '平衡性能和速度的中端模型' },
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', maxTokens: 200000, provider, description: '快速响应的轻量级模型' },
        { id: 'claude-2.1', name: 'Claude 2.1', maxTokens: 100000, provider, description: '改进的Claude 2模型' },
        { id: 'claude-2.0', name: 'Claude 2', maxTokens: 100000, provider, description: '原始Claude 2模型' },
        { id: 'claude-instant-1.2', name: 'Claude Instant 1.2', maxTokens: 100000, provider, description: '优化的快速响应模型' },
      ];
    case LLMProvider.GEMINI:
      return [
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', maxTokens: 1000000, isDefault: true, provider, description: '谷歌最先进的多模态模型' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', maxTokens: 1000000, provider, description: '更快速的Gemini 1.5版本' },
        { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', maxTokens: 32768, provider, description: '平衡各种任务的高性能模型' },
        { id: 'gemini-1.0-ultra', name: 'Gemini 1.0 Ultra', maxTokens: 32768, provider, description: '最强大的Gemini 1.0模型' },
      ];
    case LLMProvider.BAIDU:
      return [
        { id: 'ernie-bot', name: 'ERNIE Bot', maxTokens: 4096, isDefault: true, provider, description: '百度文心一言基础版' },
        { id: 'ernie-bot-4', name: 'ERNIE Bot 4.0', maxTokens: 8192, provider, description: '百度文心一言高级版' },
      ];
    case LLMProvider.OLLAMA:
      return [
        { id: 'llama3', name: 'Llama 3 8B', maxTokens: 8192, isDefault: true, provider, description: '最新的Meta Llama 3模型' },
        { id: 'llama3:70b', name: 'Llama 3 70B', maxTokens: 8192, provider, description: '最强大的Meta Llama 3版本' },
        { id: 'llama2', name: 'Llama 2', maxTokens: 4096, provider, description: 'Meta的开源大语言模型' },
        { id: 'mixtral', name: 'Mixtral 8x7B', maxTokens: 32768, provider, description: '混合专家模型，性能出色' },
        { id: 'mistral', name: 'Mistral 7B', maxTokens: 8192, provider, description: '高效的7B基础模型' },
      ];
    case LLMProvider.SILICON_FLOW:
      return [
        { id: 'BAAI/bge-m3', name: 'BGE-M3', maxTokens: 4096, isDefault: true, provider, description: '先进的中文嵌入模型' },
        { id: 'Qwen2.5-7B-Instruct', name: 'Qwen2.5 7B Instruct', maxTokens: 32768, provider, description: '通义千问2.5模型' },
        { id: 'corom-12b', name: 'Corom 12B', maxTokens: 8192, provider, description: '高性能推理模型' },
        { id: 'llama-3-8b-chat', name: 'Llama 3 8B Chat', maxTokens: 8192, provider, description: 'Llama 3聊天优化版' },
      ];
    case LLMProvider.OPENROUTER:
      return [
        { id: 'openai/gpt-4-turbo', name: 'OpenAI GPT-4 Turbo', maxTokens: 128000, isDefault: true, provider, description: '通过OpenRouter访问的GPT-4' },
        { id: 'anthropic/claude-3-opus', name: 'Anthropic Claude 3 Opus', maxTokens: 200000, provider, description: '通过OpenRouter访问的Claude' },
        { id: 'meta-llama/llama-3-70b-instruct', name: 'Meta Llama 3 70B', maxTokens: 8192, provider, description: 'Llama 3大型模型' },
      ];
    default:
      return [];
  }
}

/**
 * 格式化日期字符串
 * @param dateStr ISO日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '未知日期';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('日期格式化错误', error);
    return dateStr;
  }
}

/**
 * 根据当前颜色模式获取样式配置
 * @returns 样式配置对象
 */
export function useStyleConfig(): StyleConfig {
  const { colorMode } = useColorMode();
  
  if (colorMode === 'dark') {
    // 暗色模式
    return {
      backgroundColor: '#1A202C',
      cardBgColor: '#2D3748',
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      textColor: '#E2E8F0',
      borderColor: '#4A5568',
      hoverBgColor: '#2D3748',
      activeProviderBgColor: '#4A5568',
      navRadius: '8px'
    };
  } else {
    // 亮色模式
    return {
      backgroundColor: '#F7FAFC',
      cardBgColor: '#FFFFFF',
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      textColor: '#1A202C',
      borderColor: '#E2E8F0',
      hoverBgColor: '#EDF2F7',
      activeProviderBgColor: '#EDF2F7',
      navRadius: '8px'
    };
  }
} 