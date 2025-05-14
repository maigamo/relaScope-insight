/**
 * Token计数器
 * 用于计算文本中的token数量和估算LLM请求的成本
 */
export class TokenCounter {
  // 每个模型的每1000个token的成本 (美元)
  private static readonly MODEL_COSTS: Record<string, { input: number; output: number }> = {
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
    'gpt-3.5-turbo-16k': { input: 0.003, output: 0.004 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-32k': { input: 0.06, output: 0.12 },
    'claude-2': { input: 0.01, output: 0.03 },
    'claude-instant': { input: 0.0016, output: 0.0048 }
  };

  // 支持的编码类型 (暂时使用简化方法)
  private static readonly ENCODING_RATIO: Record<string, number> = {
    'gpt-3.5-turbo': 0.25,
    'gpt-3.5-turbo-16k': 0.25,
    'gpt-4': 0.25,
    'gpt-4-32k': 0.25,
    'claude-2': 0.27,
    'claude-instant': 0.27
  };

  /**
   * 计算文本中的token数量
   * @param text 要计算的文本
   * @param model 模型名称，用于选择不同的编码方式
   * @returns token数量
   */
  public static countTokens(text: string, model: string): number {
    try {
      // 默认使用简化的方法：按照字符数 * 比例来估算
      const ratio = this.ENCODING_RATIO[model] || 0.25;
      return Math.ceil(text.length * ratio);
    } catch (error) {
      console.error('Token计数失败:', error);
      // 回退方法
      return Math.ceil(text.length * 0.25);
    }
  }

  /**
   * 计算LLM请求的成本
   * @param inputTokens 输入token数量
   * @param outputTokens 输出token数量
   * @param model 模型名称
   * @returns 成本(美元)
   */
  public static calculateCost(
    inputTokens: number,
    outputTokens: number,
    model: string
  ): number {
    const costInfo = this.MODEL_COSTS[model] || { input: 0.002, output: 0.002 };
    const inputCost = (inputTokens / 1000) * costInfo.input;
    const outputCost = (outputTokens / 1000) * costInfo.output;
    return inputCost + outputCost;
  }

  /**
   * 格式化成本为可读的字符串
   * @param cost 成本(美元)
   * @returns 格式化后的字符串，如 "$0.01"
   */
  public static formatCost(cost: number): string {
    if (cost < 0.01) {
      return `$${cost.toFixed(4)}`;
    }
    return `$${cost.toFixed(2)}`;
  }

  /**
   * 估计处理文本所需的token数量和成本
   * @param text 文本内容
   * @param model 模型名称
   * @param expectedCompletionLength 预期的回复长度(字符数)
   * @returns 估计的token数量和成本
   */
  public static estimateTextProcessing(
    text: string,
    model: string,
    expectedCompletionLength: number = 0
  ): { inputTokens: number; outputTokens: number; totalTokens: number; cost: number } {
    const inputTokens = this.countTokens(text, model);
    const outputTokens = expectedCompletionLength > 0 
      ? this.countTokens(' '.repeat(expectedCompletionLength), model)
      : Math.ceil(inputTokens * 0.5); // 如果没有指定预期长度，假设输出为输入的一半
    
    const totalTokens = inputTokens + outputTokens;
    const cost = this.calculateCost(inputTokens, outputTokens, model);
    
    return { inputTokens, outputTokens, totalTokens, cost };
  }
} 