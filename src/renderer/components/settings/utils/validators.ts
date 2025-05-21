/**
 * 验证工具函数
 * 用于表单验证和输入检查
 */
import { ProxyConfig } from '../../../../common/types/llm';

/**
 * 验证API密钥是否有效
 * @param apiKey API密钥
 * @returns 验证结果
 */
export const validateApiKey = (apiKey: string): { valid: boolean; message?: string } => {
  if (!apiKey) {
    return { valid: false, message: 'API密钥不能为空' };
  }

  // OpenAI API密钥格式验证
  if (apiKey.startsWith('sk-') && apiKey.length < 20) {
    return { valid: false, message: 'OpenAI API密钥格式不正确' };
  }

  return { valid: true };
};

/**
 * 验证代理配置是否有效
 * @param proxyConfig 代理配置
 * @returns 验证结果
 */
export const validateProxyConfig = (proxyConfig: ProxyConfig): { valid: boolean; message?: string } => {
  if (!proxyConfig.enabled) {
    return { valid: true };
  }

  if (!proxyConfig.host) {
    return { valid: false, message: '代理主机不能为空' };
  }

  if (!proxyConfig.port || proxyConfig.port <= 0 || proxyConfig.port > 65535) {
    return { valid: false, message: '代理端口必须在1-65535之间' };
  }

  return { valid: true };
};

/**
 * 验证配置名称是否有效
 * @param name 配置名称
 * @returns 验证结果
 */
export const validateConfigName = (name: string): { valid: boolean; message?: string } => {
  if (!name) {
    return { valid: false, message: '配置名称不能为空' };
  }

  if (name.length > 50) {
    return { valid: false, message: '配置名称不能超过50个字符' };
  }

  return { valid: true };
};

/**
 * 验证模板内容是否有效
 * @param content 模板内容
 * @returns 验证结果
 */
export const validateTemplateContent = (content: string): { valid: boolean; message?: string } => {
  if (!content) {
    return { valid: false, message: '模板内容不能为空' };
  }

  // 检查变量格式是否正确 ({{variable}})
  const variablePattern = /\{\{([^{}]+)\}\}/g;
  const matches = content.match(variablePattern);

  if (matches) {
    for (const match of matches) {
      const variable = match.slice(2, -2).trim();
      if (!variable) {
        return { valid: false, message: '变量名不能为空' };
      }

      if (!/^[a-zA-Z0-9_]+$/.test(variable)) {
        return { valid: false, message: `变量名 ${variable} 只能包含字母、数字和下划线` };
      }
    }
  }

  return { valid: true };
};

/**
 * 验证模板 - 为了兼容现有代码，包装validateTemplateContent
 * @param values 表单值对象
 * @returns 验证结果
 */
export const validateTemplate = (values: any): { valid: boolean; error?: string } => {
  // 验证名称
  if (!values.name) {
    return { valid: false, error: '模板名称不能为空' };
  }
  
  // 验证内容
  const contentValidation = validateTemplateContent(values.content);
  if (!contentValidation.valid) {
    return { valid: false, error: contentValidation.message };
  }
  
  return { valid: true };
};

/**
 * 验证URL是否有效
 * @param url URL字符串
 * @returns 验证结果
 */
export const validateUrl = (url: string): { valid: boolean; message?: string } => {
  if (!url) {
    return { valid: false, message: 'URL不能为空' };
  }

  try {
    new URL(url);
    return { valid: true };
  } catch (error) {
    return { valid: false, message: 'URL格式不正确' };
  }
}; 