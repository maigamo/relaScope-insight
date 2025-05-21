/**
 * apiKey.ts
 * 封装与API密钥相关的操作
 * 注意: 由于IPC通信可能未完全实现，此文件提供模拟数据用于开发
 */
import { message } from 'antd';

// 模拟的API密钥存储
const mockApiKeys: Record<string, string> = {
  'openai': 'sk-mock-openai-key-12345',
  'anthropic': 'sk-ant-mock-key67890',
  'gemini': 'AIza-mock-gemini-key-12345'
};

/**
 * 获取API密钥
 * @param providerId 提供商ID
 * @returns Promise<string>
 */
export const getApiKey = async (providerId: string): Promise<string> => {
  if (!providerId) {
    console.error('获取API密钥失败: 提供商ID不能为空');
    return '';
  }

  try {
    // 返回模拟数据
    return mockApiKeys[providerId] || '';
  } catch (error) {
    console.error(`获取API密钥失败 (${providerId}):`, error);
    return '';
  }
};

/**
 * 设置API密钥
 * @param providerId 提供商ID
 * @param apiKey API密钥
 * @returns Promise<boolean>
 */
export const setApiKey = async (providerId: string, apiKey: string): Promise<boolean> => {
  if (!providerId) {
    message.error('设置API密钥失败: 提供商ID不能为空');
    return false;
  }

  try {
    // 模拟设置成功
    console.log(`设置 ${providerId} 的API密钥: ${apiKey ? apiKey.substring(0, 4) + '...' : '(已清空)'}`);
    mockApiKeys[providerId] = apiKey;
    message.success('设置API密钥成功（模拟）');
    return true;
  } catch (error) {
    console.error(`设置API密钥失败 (${providerId}):`, error);
    message.error('设置API密钥失败');
    return false;
  }
};

/**
 * 测试API密钥
 * @param providerId 提供商ID
 * @param apiKey API密钥
 * @returns Promise<{success: boolean, error?: string}>
 */
export const testApiKey = async (
  providerId: string, 
  apiKey: string
): Promise<{success: boolean, error?: string}> => {
  if (!providerId) {
    return { success: false, error: '提供商ID不能为空' };
  }

  if (!apiKey) {
    return { success: false, error: 'API密钥不能为空' };
  }

  try {
    // 模拟测试结果
    if (apiKey.startsWith('sk-') || apiKey.startsWith('AIza')) {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: '无效的API密钥格式，请检查密钥是否正确'
      };
    }
  } catch (error) {
    console.error(`测试API密钥失败 (${providerId}):`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '测试API密钥失败'
    };
  }
};

/**
 * 遮蔽API密钥显示
 * 将API密钥的大部分字符替换为*，只显示前4位和后4位
 * @param apiKey API密钥
 * @returns 遮蔽后的字符串
 */
export const maskApiKey = (apiKey: string): string => {
  if (!apiKey || apiKey.length <= 8) return apiKey;
  
  const prefix = apiKey.substring(0, 4);
  const suffix = apiKey.substring(apiKey.length - 4);
  const masked = '*'.repeat(Math.min(apiKey.length - 8, 20));
  
  return `${prefix}${masked}${suffix}`;
};

/**
 * 删除API密钥
 * @param providerId 提供商ID
 * @returns Promise<boolean>
 */
export const deleteApiKey = async (providerId: string): Promise<boolean> => {
  if (!providerId) {
    message.error('删除API密钥失败: 提供商ID不能为空');
    return false;
  }

  try {
    // 模拟删除，设置为空即可
    delete mockApiKeys[providerId];
    message.success('删除API密钥成功（模拟）');
    return true;
  } catch (error) {
    console.error(`删除API密钥失败 (${providerId}):`, error);
    message.error('删除API密钥失败');
    return false;
  }
};

/**
 * 获取所有API密钥
 * @returns Promise<Record<string, string>>
 */
export const getAllApiKeys = async (): Promise<Record<string, string>> => {
  try {
    // 返回模拟数据
    return { ...mockApiKeys };
  } catch (error) {
    console.error('获取所有API密钥失败:', error);
    message.error('获取所有API密钥失败');
    return {};
  }
};
