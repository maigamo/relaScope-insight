/**
 * 过滤工具函数
 * 用于过滤和搜索LLM配置、提供商和模板
 */
import { LLMConfig, LLMProvider, PromptTemplate, LLMModelConfig } from '../../../../common/types/llm';
import { getProviderName } from './formatters';

/**
 * 提供商实体接口
 */
export interface Provider {
  id: string;
  provider: LLMProvider;
  name?: string;
  isDefault?: boolean;
}

/**
 * 配置项显示类型，用于列表和卡片展示
 */
export interface ProviderItem {
  id: string;
  provider: LLMProvider;
  name?: string;
  isDefault?: boolean;
}

/**
 * 过滤提供商配置
 * @param configs LLM配置列表
 * @param providerId 提供商ID
 * @returns 过滤后的配置列表
 */
export const filterConfigsByProvider = (configs: LLMConfig[], providerId: string): LLMConfig[] => {
  if (!providerId) return [];
  return configs.filter(config => config.provider === providerId);
};

/**
 * 按名称搜索配置
 * @param configs LLM配置列表
 * @param query 搜索关键词
 * @returns 过滤后的配置列表
 */
export const searchConfigs = (configs: LLMConfig[], query: string): LLMConfig[] => {
  if (!query) return configs;
  
  const lowerCaseQuery = query.toLowerCase();
  return configs.filter(config => 
    config.name.toLowerCase().includes(lowerCaseQuery) || 
    config.modelName?.toLowerCase().includes(lowerCaseQuery) ||
    config.systemMessage?.toLowerCase().includes(lowerCaseQuery)
  );
};

/**
 * 过滤提供商
 * @param providers 提供商列表
 * @param query 搜索关键词
 * @returns 过滤后的提供商列表
 */
export const filterProviders = (providers: Provider[], query: string): Provider[] => {
  if (!query) return providers;
  
  const lowerCaseQuery = query.toLowerCase();
  return providers.filter(provider => {
    const providerName = getProviderName(provider.provider);
    return providerName.toLowerCase().includes(lowerCaseQuery);
  });
};

/**
 * 按提供商对配置进行分组
 * @param configs LLM配置列表
 * @param providers 提供商列表
 * @returns 按提供商分组的配置
 */
export const groupConfigsByProvider = (configs: LLMConfig[], providers: Provider[]): Record<string, ProviderItem[]> => {
  const groups: Record<string, ProviderItem[]> = {};
  
  // 找出所有有效的提供商
  const validProviders = providers.filter(p => 
    p && p.id && p.id !== 'undefined' && 
    p.provider && 
    typeof p.provider === 'string'
  );
  
  // 先为每个有效的提供商创建一个空数组
  validProviders.forEach(p => {
    groups[p.id] = [];
  });
  
  // 然后将配置分配到相应的提供商下
  configs.forEach(config => {
    if (!config || !config.provider) return;
    
    // 查找对应的提供商ID
    const providerId = validProviders.find(p => p.provider === config.provider)?.id;
    
    // 如果找到对应的提供商ID，则添加配置
    if (providerId && groups[providerId]) {
      groups[providerId].push({
        id: config.id,
        provider: config.provider,
        name: config.name,
        isDefault: config.isDefault
      });
    }
  });
  
  return groups;
};

/**
 * 过滤模板
 * @param templates 模板列表
 * @param query 搜索关键词
 * @returns 过滤后的模板列表
 */
export const filterTemplates = (templates: PromptTemplate[], query: string): PromptTemplate[] => {
  if (!query) return templates;
  
  const lowerCaseQuery = query.toLowerCase();
  return templates.filter(template => 
    template.name.toLowerCase().includes(lowerCaseQuery) || 
    template.content.toLowerCase().includes(lowerCaseQuery) ||
    template.description?.toLowerCase().includes(lowerCaseQuery) ||
    template.variables.some(v => v.toLowerCase().includes(lowerCaseQuery))
  );
};

/**
 * 过滤模型
 * @param models 模型列表
 * @param query 搜索关键词
 * @returns 过滤后的模型列表
 */
export const filterModels = (models: LLMModelConfig[], query: string): LLMModelConfig[] => {
  if (!query) return models;
  
  const lowerCaseQuery = query.toLowerCase();
  return models.filter(model => 
    model.name.toLowerCase().includes(lowerCaseQuery) || 
    model.id.toLowerCase().includes(lowerCaseQuery)
  );
};

/**
 * 对配置进行排序
 * @param configs 配置列表
 * @param orderBy 排序依据
 * @param ascending 是否升序
 * @returns 排序后的配置列表
 */
export const sortConfigs = (
  configs: LLMConfig[], 
  orderBy: 'name' | 'provider' | 'createdAt' | 'updatedAt' = 'name', 
  ascending: boolean = true
): LLMConfig[] => {
  return [...configs].sort((a, b) => {
    let comparison = 0;
    
    switch (orderBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'provider':
        comparison = a.provider.localeCompare(b.provider);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      default:
        comparison = a.name.localeCompare(b.name);
    }
    
    return ascending ? comparison : -comparison;
  });
};

/**
 * 过滤代理配置列表
 * @param proxies 代理配置列表
 * @param searchQuery 搜索关键词
 * @returns 过滤后的代理配置列表
 */
export const filterProxies = (
  proxies: any[],
  searchQuery: string
): any[] => {
  if (!searchQuery || searchQuery.trim() === '') {
    return proxies;
  }

  const query = searchQuery.toLowerCase().trim();
  
  return proxies.filter(proxy => {
    // 如果存在name字段，匹配名称
    if (proxy.name && proxy.name.toLowerCase().includes(query)) {
      return true;
    }
    
    // 匹配主机地址
    if (proxy.host && proxy.host.toLowerCase().includes(query)) {
      return true;
    }
    
    // 匹配协议
    if (proxy.protocol && proxy.protocol.toLowerCase().includes(query)) {
      return true;
    }
    
    // 匹配端口（如果是数字需要转换为字符串）
    if (proxy.port && String(proxy.port).includes(query)) {
      return true;
    }
    
    return false;
  });
};

/**
 * 过滤API密钥列表
 * @param apiKeys API密钥列表
 * @param searchQuery 搜索关键词
 * @returns 过滤后的API密钥列表
 */
export const filterApiKeys = (
  apiKeys: any[],
  searchQuery: string
): any[] => {
  if (!searchQuery || searchQuery.trim() === '') {
    return apiKeys;
  }

  const query = searchQuery.toLowerCase().trim();
  
  return apiKeys.filter(apiKey => {
    // 匹配名称
    if (apiKey.name && apiKey.name.toLowerCase().includes(query)) {
      return true;
    }
    
    // 匹配密钥ID
    if (apiKey.id && apiKey.id.toLowerCase().includes(query)) {
      return true;
    }
    
    // 匹配提供商
    if (apiKey.provider && String(apiKey.provider).toLowerCase().includes(query)) {
      return true;
    }
    
    // 部分匹配密钥值（安全考虑只匹配前几个字符）
    if (apiKey.key && apiKey.key.substring(0, 8).toLowerCase().includes(query)) {
      return true;
    }
    
    return false;
  });
}; 