import { ipcService } from './core';
import { LLM_CHANNELS } from './channels';
import { LLMProvider, ProxyConfig } from '../../../common/types/llm';

/**
 * LLM服务
 * 用于与大型语言模型交互
 */
export const LLMService = {
  /**
   * 获取所有LLM配置
   * @returns 配置列表
   */
  async getAllConfigs<T = any>(): Promise<T[]> {
    const res = await ipcService.invoke(LLM_CHANNELS.GET_ALL_CONFIGS);
    console.log('LLMService.getAllConfigs ipcService.invoke 返回:', res);
    if (res && typeof res === 'object') {
      if ('success' in res && 'data' in res) {
        if (res.success && res.data) return res.data;
        return [];
      }
      if (Array.isArray(res)) {
        return res;
      }
    }
    return [];
  },

  /**
   * 获取特定LLM配置
   * @param id 配置ID
   * @returns 配置
   */
  async getConfig<T = any>(id: string): Promise<T> {
    return ipcService.invoke(LLM_CHANNELS.GET_CONFIG, id);
  },

  /**
   * 保存LLM配置
   * @param config 配置数据
   * @returns 是否成功
   */
  async saveConfig<T = any>(config: T): Promise<T> {
    const res = await ipcService.invoke(LLM_CHANNELS.SAVE_CONFIG, config);
    console.log('LLMService.saveConfig ipcService.invoke 返回:', res);
    if (res && typeof res === 'object') {
      if ('success' in res && 'data' in res) {
        if (res.success && res.data) return res.data;
        return undefined as any;
      }
      if ('id' in res && 'name' in res && 'provider' in res) {
        return res as T;
      }
    }
    return undefined as any;
  },

  /**
   * 删除LLM配置
   * @param id 配置ID
   * @returns 是否成功
   */
  async deleteConfig(id: string): Promise<boolean> {
    const res = await ipcService.invoke(LLM_CHANNELS.DELETE_CONFIG, id);
    console.log('LLMService.deleteConfig ipcService.invoke 返回:', res);
    if (!res) return true; // 如果后端没返回，认为已删除（兼容性兜底）
    if (typeof res === 'object') {
      if ('success' in res) {
        return !!res.success;
      }
      if ('成功' in res) {
        return !!res['成功'];
      }
      if ('原始响应' in res && res['原始响应'] && typeof res['原始响应'] === 'object' && 'success' in res['原始响应']) {
        return !!res['原始响应'].success;
      }
    }
    return false;
  },

  /**
   * 设置默认LLM配置
   * @param id 配置ID
   * @returns 是否成功
   */
  async setDefaultConfig(id: string): Promise<boolean> {
    return ipcService.invoke(LLM_CHANNELS.SET_DEFAULT_CONFIG, id);
  },

  /**
   * 查询LLM
   * @param prompt 提示文本
   * @param options 选项
   * @returns 响应
   */
  async query<T = any>(prompt: string, options: any = {}): Promise<T> {
    return ipcService.invoke(LLM_CHANNELS.QUERY, prompt, options);
  },

  /**
   * 使用模板查询LLM
   * @param templateId 模板ID
   * @param variables 变量
   * @param options 选项
   * @returns 响应
   */
  async queryWithTemplate<T = any>(
    templateId: string, 
    variables: Record<string, string>, 
    options: any = {}
  ): Promise<T> {
    return ipcService.invoke(
      LLM_CHANNELS.QUERY_WITH_TEMPLATE, 
      templateId, 
      variables, 
      options
    );
  },

  /**
   * 获取所有提示词模板
   * @returns 模板列表
   */
  async getAllTemplates<T = any>(): Promise<T[]> {
    return ipcService.invoke(LLM_CHANNELS.GET_ALL_TEMPLATES);
  },

  /**
   * 获取特定提示词模板
   * @param id 模板ID
   * @returns 模板
   */
  async getTemplate<T = any>(id: string): Promise<T> {
    return ipcService.invoke(LLM_CHANNELS.GET_TEMPLATE, id);
  },

  /**
   * 保存提示词模板
   * @param template 模板数据
   * @returns 是否成功
   */
  async saveTemplate<T = any>(template: T): Promise<boolean> {
    return ipcService.invoke(LLM_CHANNELS.SAVE_TEMPLATE, template);
  },

  /**
   * 删除提示词模板
   * @param id 模板ID
   * @returns 是否成功
   */
  async deleteTemplate(id: string): Promise<boolean> {
    return ipcService.invoke(LLM_CHANNELS.DELETE_TEMPLATE, id);
  },

  /**
   * 进行六边形人格模型分析
   * @param profile 个人档案数据
   * @param quotes 语录数据
   * @param experiences 经历数据
   * @param options 选项
   * @returns 分析结果
   */
  async analyzeHexagonPersonality<T = any>(
    profile: any,
    quotes: any[],
    experiences: any[],
    options: any = {}
  ): Promise<T> {
    return ipcService.invoke(
      LLM_CHANNELS.ANALYZE_HEXAGON_PERSONALITY,
      profile,
      quotes,
      experiences,
      options
    );
  },

  /**
   * 获取API密钥
   * @param provider 提供商
   * @returns API密钥
   */
  async getApiKey(provider: string | LLMProvider): Promise<string> {
    try {
      // 确保provider是字符串类型
      const providerString = typeof provider === 'object' ? JSON.stringify(provider) : String(provider);
      
      console.log('LLMService.getApiKey准备调用:', {
        provider: providerString,
        providerType: typeof providerString
      });
      
      // 移除可能的空白字符
      const trimmedProvider = providerString.trim();
      
      if (!trimmedProvider) {
        console.error('getApiKey: 提供商类型为空');
        throw new Error('提供商类型不能为空');
      }
      
      // 调用后端获取API密钥
      const result = await ipcService.invoke(LLM_CHANNELS.GET_API_KEY, trimmedProvider);
      
      // 如果密钥存在，返回密钥字符串，否则返回空字符串
      return typeof result === 'string' ? result : '';
    } catch (error) {
      console.error('getApiKey 调用失败:', error);
      // 出错时返回空字符串，避免界面出错
      return '';
    }
  },

  /**
   * 测试API密钥
   * @param provider 提供商
   * @param apiKey API密钥
   * @param model 可选的模型ID，用于测试特定模型
   * @returns 测试结果
   */
  async testApiKey(provider: string | LLMProvider, apiKey: string, model?: string): Promise<{success: boolean, error?: string, models?: any[]}> {
    try {
      // 确保provider是字符串类型
      const providerString = typeof provider === 'object' ? JSON.stringify(provider) : String(provider);
      
      console.log('LLMService.testApiKey准备调用:', {
        provider: providerString,
        providerType: typeof providerString,
        apiKeyLength: apiKey ? apiKey.length : 0,
        apiKeyFirstChars: apiKey ? apiKey.substring(0, 10) + '...' : '',
        model: model || '未指定'
      });
      
      // 移除可能的空白字符
      const trimmedProvider = providerString.trim();
      const trimmedApiKey = apiKey.trim();
      const trimmedModel = model ? model.trim() : undefined;
      
      if (!trimmedProvider) {
        console.error('testApiKey: 提供商类型为空');
        return { success: false, error: '提供商类型不能为空' };
      }
      
      if (!trimmedApiKey) {
        console.error('testApiKey: API密钥为空');
        return { success: false, error: 'API密钥不能为空' };
      }
      
      // 调用IPC方法
      console.log(`调用IPC: ${LLM_CHANNELS.TEST_API_KEY} 参数:`, {
        provider: trimmedProvider,
        apiKeyLength: trimmedApiKey.length,
        model: trimmedModel
      });
      
      // 向后端传递模型参数
      const rawResponse = await ipcService.invoke(LLM_CHANNELS.TEST_API_KEY, trimmedProvider, trimmedApiKey, trimmedModel);
      
      // 详细记录原始响应
      console.log('testApiKey 原始响应:', rawResponse);
      
      // 如果响应为空，返回错误
      if (!rawResponse) {
        console.error('testApiKey: 服务器返回空结果');
        return { success: false, error: '服务器返回空响应' };
      }
      
      // 判断响应类型和结构
      if (typeof rawResponse === 'object' && 'success' in rawResponse) {
        // 标准响应格式
        return {
          success: Boolean(rawResponse.success),
          error: rawResponse.error,
          models: rawResponse.models || []
        };
      } else if (typeof rawResponse === 'object' && 'models' in rawResponse) {
        // 只有模型数组的响应格式
        return {
          success: true,
          models: rawResponse.models
        };
      } else if (typeof rawResponse === 'boolean') {
        // 布尔值响应
        return {
          success: rawResponse,
          error: rawResponse ? undefined : '测试失败'
        };
      }
      
      // 兜底返回原始响应
      console.log('返回标准化对象:', rawResponse);
      return rawResponse;
    } catch (error) {
      console.error('testApiKey 调用失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  /**
   * 设置API密钥
   * @param provider 提供商
   * @param apiKey API密钥
   * @returns 是否成功
   */
  async setApiKey(provider: string | LLMProvider, apiKey: string): Promise<boolean> {
    try {
      // 确保provider是字符串类型
      const providerString = typeof provider === 'object' ? JSON.stringify(provider) : String(provider);
      
      console.log('LLMService.setApiKey准备调用:', {
        provider: providerString,
        providerType: typeof providerString,
        apiKeyLength: apiKey ? apiKey.length : 0
      });
      
      // 移除可能的空白字符
      const trimmedProvider = providerString.trim();
      const trimmedApiKey = apiKey.trim();
      
      if (!trimmedProvider) {
        console.error('setApiKey: 提供商类型为空');
        throw new Error('提供商类型不能为空');
      }
      
      if (!trimmedApiKey) {
        console.error('setApiKey: API密钥为空');
        throw new Error('API密钥不能为空');
      }
      
      const result = await ipcService.invoke(LLM_CHANNELS.SET_API_KEY, trimmedProvider, trimmedApiKey);
      return result === true || (result && result.success === true);
    } catch (error) {
      console.error('setApiKey 调用失败:', error);
      throw error;
    }
  },

  /**
   * 获取可用模型列表
   * @param provider 提供商
   * @returns 模型列表
   */
  async getAvailableModels<T = any>(provider: string): Promise<T[]> {
    return ipcService.invoke(LLM_CHANNELS.GET_AVAILABLE_MODELS, provider);
  },

  /**
   * 设置活跃模型
   * @param provider 提供商
   * @param modelId 模型ID
   * @returns 是否成功
   */
  async setActiveModel(provider: string, modelId: string): Promise<boolean> {
    return ipcService.invoke(LLM_CHANNELS.SET_ACTIVE_MODEL, provider, modelId);
  },

  /**
   * 获取全局代理配置
   * @returns 全局代理配置
   */
  async getGlobalProxy(): Promise<ProxyConfig> {
    try {
      return await ipcService.invoke<ProxyConfig>('llm:getGlobalProxy');
    } catch (error) {
      console.error('获取全局代理配置失败:', error);
      throw error;
    }
  },

  /**
   * 设置全局代理配置
   * @param proxyConfig 全局代理配置
   * @returns 设置结果
   */
  async setGlobalProxy(proxyConfig: ProxyConfig): Promise<boolean> {
    try {
      return await ipcService.invoke<boolean>('llm:setGlobalProxy', proxyConfig);
    } catch (error) {
      console.error('设置全局代理配置失败:', error);
      throw error;
    }
  }
}; 