import { ipcMain } from 'electron';
import { LLMService } from '../services/llm/llm-service';
import { z } from 'zod';
import { LLM_CHANNELS } from '../../common/constants/ipcChannels';
import { IPCResponse } from '../../common/types/ipc';
import { ProxyConfig, LLMProvider } from '../../common/types/llm';

// 全局代理配置
let globalProxyConfig: ProxyConfig = {
  enabled: false,
  host: '',
  port: 1080,
  protocol: 'http'
};

/**
 * 注册与LLM相关的IPC处理程序
 */
export function setupLLMHandlers() {
  const llmService = LLMService.getInstance();
  const promptManager = llmService.getPromptManager();
  
  // 获取所有LLM配置
  ipcMain.handle(LLM_CHANNELS.GET_ALL_CONFIGS, async () => {
    try {
      const configs = await llmService.getAllConfigs();
      return { success: true, data: configs } as IPCResponse;
    } catch (error: any) {
      console.error(`获取LLM配置失败: ${error.message}`);
      return { 
        success: false, 
        error: `获取LLM配置失败: ${error.message}` 
      } as IPCResponse;
    }
  });
  
  // 获取特定LLM配置
  ipcMain.handle(LLM_CHANNELS.GET_CONFIG, async (_, id: string) => {
    try {
      const config = await llmService.getConfig(id);
      return { success: true, data: config } as IPCResponse;
    } catch (error: any) {
      console.error(`获取LLM配置失败: ${error.message}`);
      return { 
        success: false, 
        error: `获取LLM配置失败: ${error.message}` 
      } as IPCResponse;
    }
  });
  
  // 保存LLM配置
  ipcMain.handle(LLM_CHANNELS.SAVE_CONFIG, async (_, config: any) => {
    try {
      const savedConfig = await llmService.saveConfig(config);
      return { success: true, data: savedConfig } as IPCResponse;
    } catch (error: any) {
      console.error(`保存LLM配置失败: ${error.message}`);
      return { 
        success: false, 
        error: `保存LLM配置失败: ${error.message}` 
      } as IPCResponse;
    }
  });
  
  // 删除LLM配置
  ipcMain.handle(LLM_CHANNELS.DELETE_CONFIG, async (_, id: string) => {
    try {
      await llmService.deleteConfig(id);
      return { success: true };
    } catch (error: any) {
      console.error(`删除LLM配置失败: ${error.message}`);
      return { 
        success: false, 
        error: `删除LLM配置失败: ${error.message}` 
      } as IPCResponse;
    }
  });
  
  // 设置默认LLM配置
  ipcMain.handle(LLM_CHANNELS.SET_DEFAULT_CONFIG, async (_, id: string) => {
    try {
      await llmService.setDefaultConfig(id);
      return { success: true } as IPCResponse;
    } catch (error: any) {
      console.error(`设置默认LLM配置失败: ${error.message}`);
      return { 
        success: false, 
        error: `设置默认LLM配置失败: ${error.message}` 
      } as IPCResponse;
    }
  });
  
  // 发送文本到LLM
  ipcMain.handle(LLM_CHANNELS.QUERY, async (_, prompt: string, options: any = {}) => {
    try {
      const result = await llmService.query(prompt, options);
      return { success: true, data: result } as IPCResponse;
    } catch (error: any) {
      console.error(`LLM查询失败: ${error.message}`);
      return { 
        success: false, 
        error: `LLM查询失败: ${error.message}` 
      } as IPCResponse;
    }
  });
  
  // 使用模板发送文本到LLM
  ipcMain.handle(LLM_CHANNELS.QUERY_WITH_TEMPLATE, async (_, templateId: string, variables: Record<string, string>, options: any = {}) => {
    try {
      const result = await llmService.queryWithTemplate(templateId, variables, options);
      return { success: true, data: result } as IPCResponse;
    } catch (error: any) {
      console.error(`使用模板查询LLM失败: ${error.message}`);
      return { 
        success: false, 
        error: `使用模板查询LLM失败: ${error.message}` 
      } as IPCResponse;
    }
  });
  
  // 获取所有提示词模板
  ipcMain.handle(LLM_CHANNELS.GET_ALL_TEMPLATES, async () => {
    try {
      const templates = promptManager.getAllTemplates();
      return { success: true, data: templates } as IPCResponse;
    } catch (error: any) {
      console.error(`获取提示词模板失败: ${error.message}`);
      return { 
        success: false, 
        error: `获取提示词模板失败: ${error.message}` 
      } as IPCResponse;
    }
  });
  
  // 获取特定提示词模板
  ipcMain.handle(LLM_CHANNELS.GET_TEMPLATE, async (_, id: string) => {
    try {
      const template = promptManager.getTemplate(id);
      return { success: true, data: template } as IPCResponse;
    } catch (error: any) {
      console.error(`获取提示词模板失败: ${error.message}`);
      return { 
        success: false, 
        error: `获取提示词模板失败: ${error.message}` 
      } as IPCResponse;
    }
  });
  
  // 保存提示词模板
  ipcMain.handle(LLM_CHANNELS.SAVE_TEMPLATE, async (_, template: any) => {
    try {
      await promptManager.saveTemplate(template);
      return { success: true } as IPCResponse;
    } catch (error: any) {
      console.error(`保存提示词模板失败: ${error.message}`);
      return { 
        success: false, 
        error: `保存提示词模板失败: ${error.message}` 
      } as IPCResponse;
    }
  });
  
  // 删除提示词模板
  ipcMain.handle(LLM_CHANNELS.DELETE_TEMPLATE, async (_, id: string) => {
    try {
      await promptManager.deleteTemplate(id);
      return { success: true } as IPCResponse;
    } catch (error: any) {
      console.error(`删除提示词模板失败: ${error.message}`);
      return { 
        success: false, 
        error: `删除提示词模板失败: ${error.message}` 
      } as IPCResponse;
    }
  });

  // 全局代理配置处理器
  ipcMain.handle('llm:getGlobalProxy', async () => {
    try {
      // 这里可以从存储中读取，目前简单从内存返回
      return globalProxyConfig;
    } catch (error) {
      console.error('获取全局代理配置失败', error);
      throw error;
    }
  });

  ipcMain.handle('llm:setGlobalProxy', async (_, proxyConfig: ProxyConfig) => {
    try {
      // 更新全局代理配置
      globalProxyConfig = proxyConfig;
      // 这里可以将配置写入存储
      return true;
    } catch (error) {
      console.error('设置全局代理配置失败', error);
      throw error;
    }
  });

  // 添加获取可用模型处理程序
  ipcMain.handle(LLM_CHANNELS.GET_AVAILABLE_MODELS, async (_, provider: string) => {
    try {
      // 获取服务对应的模型列表
      const models = await llmService.getAvailableModels(provider);
      return { success: true, data: models } as IPCResponse;
    } catch (error: any) {
      console.error(`获取模型列表失败: ${error.message}`);
      return { 
        success: false, 
        error: `获取模型列表失败: ${error.message}` 
      } as IPCResponse;
    }
  });

  // 添加测试API密钥的处理程序
  ipcMain.handle(LLM_CHANNELS.TEST_API_KEY, async (_, args) => {
    try {
      // 解构参数，同时处理不同的传参方式
      let provider, apiKey, model;
      
      // 检查参数是否作为数组传递
      if (Array.isArray(args)) {
        // 如果是数组格式，获取参数
        [provider, apiKey, model] = args;
      } else if (typeof args === 'object' && args !== null) {
        // 如果是对象格式，直接解构
        ({ provider, apiKey, model } = args);
      } else {
        // 传统的单参数方式（用于兼容）
        provider = args;
        apiKey = arguments[2]; // 第三个参数
        model = arguments[3]; // 第四个参数
      }
      
      // 详细记录参数信息（不记录完整API密钥）
      console.log(`测试API密钥, provider: ${provider}, 类型: ${typeof provider}, 密钥长度: ${apiKey ? apiKey.length : 0}, 模型: ${model || '未指定'}`);
      
      if (!provider || typeof provider !== 'string') {
        console.error(`测试API密钥失败: 无效的提供商类型`, provider);
        // 返回失败结果
        return { 
          success: false, 
          models: [],
          error: '无效的提供商类型'
        };
      }
      
      if (!apiKey || typeof apiKey !== 'string') {
        console.error(`测试API密钥失败: 无效的API密钥`);
        return {
          success: false,
          models: [],
          error: 'API密钥不能为空'
        };
      }
      
      // 去除两端空格
      const trimmedProvider = provider.trim();
      const trimmedApiKey = apiKey.trim();
      const trimmedModel = model ? String(model).trim() : undefined;
      
      try {
        // 调用实际的测试API密钥函数，传递模型参数
        const result = await llmService.testApiKey(trimmedProvider, trimmedApiKey, trimmedModel);
        
        // 记录结果
        console.log(`API密钥测试结果: 成功=${result.success}, 获取到${result.models?.length || 0}个模型`);
        
        // 直接返回结果对象
        return result;
      } catch (specificError: any) {
        console.error(`测试API密钥时出现特定错误:`, specificError);
        return { 
          success: false, 
          models: [],
          error: specificError.message || '测试API密钥时出现未知错误'
        };
      }
    } catch (error: any) {
      console.error(`测试API密钥处理失败:`, error);
      return { 
        success: false, 
        models: [],
        error: error.message || '测试API密钥处理失败'
      };
    }
  });

  // 添加设置API密钥的处理程序
  ipcMain.handle(LLM_CHANNELS.SET_API_KEY, async (_, args) => {
    try {
      // 解构参数，同时处理不同的传参方式
      let provider, apiKey;
      
      // 检查参数是否作为数组传递
      if (Array.isArray(args)) {
        // 如果是数组格式，获取第一个元素作为provider，第二个元素作为apiKey
        [provider, apiKey] = args;
      } else if (typeof args === 'object' && args !== null) {
        // 如果是对象格式，直接解构provider和apiKey
        ({ provider, apiKey } = args);
      } else {
        // 传统的单参数方式（用于兼容）
        provider = args;
        apiKey = arguments[2]; // 第三个参数
      }
      
      // 参数校验
      console.log(`正在设置API密钥, provider:`, provider, `类型:`, typeof provider);
      
      if (!provider || typeof provider !== 'string') {
        console.error(`设置API密钥失败: 无效的提供商类型`, provider);
        return { 
          success: false, 
          error: `无效的提供商类型` 
        };
      }
      
      if (!apiKey || typeof apiKey !== 'string') {
        console.error(`设置API密钥失败: 无效的API密钥`);
        return {
          success: false,
          error: `API密钥不能为空`
        };
      }
      
      // 去除两端空格
      const trimmedProvider = provider.trim();
      const trimmedApiKey = apiKey.trim();
      
      if (!trimmedProvider) {
        return {
          success: false,
          error: `提供商类型不能为空`
        };
      }
      
      if (!trimmedApiKey) {
        return {
          success: false,
          error: `API密钥不能为空`
        };
      }
      
      // 尝试将提供商字符串转换为LLMProvider枚举
      const providerEnum = trimmedProvider as LLMProvider;
      
      try {
        // 设置API密钥
        await llmService.setApiKey(providerEnum, trimmedApiKey);
        return { success: true };
      } catch (specificError: any) {
        console.error(`设置API密钥时出现特定错误:`, specificError);
        return { 
          success: false, 
          error: `设置API密钥失败: ${specificError.message || '未知错误'}` 
        };
      }
    } catch (error: any) {
      console.error(`设置API密钥处理失败:`, error);
      return { 
        success: false, 
        error: `设置API密钥失败: ${error.message || '未知错误'}` 
      };
    }
  });

  // 添加获取API密钥的处理程序
  ipcMain.handle(LLM_CHANNELS.GET_API_KEY, async (_, args) => {
    try {
      // 解析参数，支持多种传参方式
      let provider;
      
      if (Array.isArray(args)) {
        // 如果是数组格式，获取第一个元素作为provider
        [provider] = args;
      } else if (typeof args === 'object' && args !== null) {
        // 如果是对象格式，直接解构provider
        ({ provider } = args);
      } else {
        // 传统的单参数方式
        provider = args;
      }
      
      // 参数校验和日志
      console.log(`正在获取API密钥, provider:`, provider, typeof provider);
      
      if (!provider || typeof provider !== 'string') {
        console.error(`获取API密钥失败: 无效的提供商类型`, provider);
        return { 
          success: false, 
          error: `无效的提供商类型` 
        };
      }
      
      // 去除两端空格
      const trimmedProvider = provider.trim();
      
      if (!trimmedProvider) {
        return {
          success: false,
          error: `提供商类型不能为空`
        };
      }
      
      // 尝试将提供商字符串转换为LLMProvider枚举
      const providerEnum = trimmedProvider as LLMProvider;
      
      try {
        // 获取API密钥
        const apiKey = await llmService.getApiKey(providerEnum);
        
        // 为了安全，返回掩码版本的密钥或者一个空值指示是否存在
        if (apiKey) {
          // 只返回掩码版本，例如 "sk-********"
          return "已设置";
        } else {
          return "";
        }
      } catch (specificError: any) {
        console.error(`获取API密钥时出现特定错误:`, specificError);
        return { 
          success: false, 
          error: `获取API密钥失败: ${specificError.message || '未知错误'}` 
        };
      }
    } catch (error: any) {
      console.error(`获取API密钥处理失败:`, error);
      return { 
        success: false, 
        error: `获取API密钥失败: ${error.message || '未知错误'}` 
      };
    }
  });
}