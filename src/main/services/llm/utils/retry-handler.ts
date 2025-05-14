/**
 * 重试处理器
 * 用于处理LLM请求的重试逻辑
 */
export class RetryHandler {
  /**
   * 使用重试机制执行异步操作
   * @param operation 要执行的异步操作
   * @param maxRetries 最大重试次数
   * @param initialDelayMs 初始延迟时间(毫秒)
   * @param maxDelayMs 最大延迟时间(毫秒)
   * @returns 操作结果
   */
  public static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelayMs: number = 1000,
    maxDelayMs: number = 10000
  ): Promise<T> {
    let lastError: Error | null = null;
    let retryCount = 0;
    let delay = initialDelayMs;

    while (retryCount <= maxRetries) {
      try {
        if (retryCount > 0) {
          console.log(`重试尝试 ${retryCount}/${maxRetries}...`);
        }
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // 检查是否应该重试这个错误
        if (!this.isRetryableError(error)) {
          console.error('遇到不可重试的错误:', error);
          throw error;
        }
        
        retryCount++;
        
        if (retryCount > maxRetries) {
          console.error(`达到最大重试次数(${maxRetries})，操作失败:`, error);
          throw new Error(`操作失败，已重试${maxRetries}次: ${lastError.message}`);
        }
        
        console.warn(`操作失败，将在${delay}ms后重试:`, error);
        
        // 等待延迟时间后重试
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // 使用指数退避策略增加延迟时间，但不超过最大延迟
        delay = Math.min(delay * 2, maxDelayMs);
      }
    }
    
    // 这里理论上不会执行到，但为了类型安全
    throw lastError || new Error('未知错误');
  }

  /**
   * 判断错误是否可以重试
   * @param error 错误对象
   * @returns 是否可以重试
   */
  private static isRetryableError(error: any): boolean {
    // 如果是网络错误、超时或服务器过载等情况，可以重试
    if (!error) return false;

    // 检查错误消息
    const errorMessage = error.message || '';
    if (
      errorMessage.includes('timeout') ||
      errorMessage.includes('socket hang up') ||
      errorMessage.includes('ECONNRESET') ||
      errorMessage.includes('ETIMEDOUT') ||
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('network error') ||
      errorMessage.includes('server overloaded') ||
      errorMessage.includes('too many requests') ||
      errorMessage.includes('internal server error')
    ) {
      return true;
    }

    // 检查HTTP状态码
    const statusCode = error.status || error.statusCode || (error.response && error.response.status);
    if (statusCode) {
      // 5xx错误和429(太多请求)可以重试
      return statusCode === 429 || (statusCode >= 500 && statusCode < 600);
    }

    // 检查特定的API错误代码
    const errorCode = error.code || (error.error && error.error.code);
    if (
      errorCode === 'rate_limit_exceeded' ||
      errorCode === 'server_error' ||
      errorCode === 'timeout'
    ) {
      return true;
    }

    return false;
  }

  /**
   * 使用超时执行操作
   * @param operation 要执行的异步操作
   * @param timeoutMs 超时时间(毫秒)
   * @returns 操作结果
   */
  public static async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number = 30000
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // 设置超时
      const timeoutId = setTimeout(() => {
        reject(new Error(`操作超时(${timeoutMs}ms)`));
      }, timeoutMs);
      
      // 执行操作
      operation()
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }
} 