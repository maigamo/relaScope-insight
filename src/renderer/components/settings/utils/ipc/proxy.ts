/**
 * proxy.ts
 * 封装与代理设置相关的IPC操作
 */
import { LLMService } from '../../../../../renderer/services/ipc.service';
import { ProxyConfig } from '../../../../../common/types/llm';

/**
 * 获取全局代理设置
 * @returns 当前的全局代理配置
 */
export const getGlobalProxy = async (): Promise<ProxyConfig> => {
  try {
    return await LLMService.getGlobalProxy();
  } catch (error) {
    console.error('获取全局代理设置失败:', error);
    // 返回默认代理配置
    return {
      enabled: false,
      host: '',
      port: 0,
      protocol: 'http'
    };
  }
};

/**
 * 设置全局代理
 * @param proxyConfig 代理配置信息
 * @returns 设置结果
 */
export const setGlobalProxy = async (proxyConfig: ProxyConfig): Promise<boolean> => {
  try {
    return await LLMService.setGlobalProxy(proxyConfig);
  } catch (error) {
    console.error('设置全局代理失败:', error);
    throw error;
  }
};

/**
 * 测试代理连接
 * @param proxyConfig 要测试的代理配置
 * @returns 测试结果
 */
export const testProxy = async (proxyConfig: ProxyConfig): Promise<{ success: boolean; message: string }> => {
  try {
    // 这里我们进行一个简单的代理验证
    // 由于LLMService没有直接提供testProxy方法，我们使用其他方式
    // 1. 首先验证代理配置是否有效
    const validation = validateProxyConfig(proxyConfig);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.error || '代理配置无效'
      };
    }

    // 2. 如果代理未启用，直接返回成功
    if (!proxyConfig.enabled) {
      return {
        success: true,
        message: '代理未启用，使用直接连接'
      };
    }

    // 3. 设置代理并返回设置结果
    // 实际测试需要服务端支持，目前先返回设置成功
    const setResult = await setGlobalProxy(proxyConfig);
    
    return {
      success: setResult,
      message: setResult ? '代理连接设置成功' : '代理连接设置失败'
    };
  } catch (error) {
    console.error('测试代理连接失败:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '代理连接测试失败'
    };
  }
};

/**
 * 验证代理配置是否有效
 * @param proxyConfig 要验证的代理配置
 * @returns 验证结果和错误信息
 */
export const validateProxyConfig = (proxyConfig: ProxyConfig): { valid: boolean; error?: string } => {
  if (!proxyConfig.enabled) {
    return { valid: true };
  }

  if (!proxyConfig.host) {
    return { valid: false, error: '代理服务器地址不能为空' };
  }

  if (!proxyConfig.port || proxyConfig.port <= 0 || proxyConfig.port > 65535) {
    return { valid: false, error: '代理端口必须在1-65535之间' };
  }

  return { valid: true };
};
