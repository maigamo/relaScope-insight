/**
 * 日志工具
 * 提供统一的日志记录接口
 */

// 日志级别
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

// 日志记录器接口
export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

/**
 * 基础日志记录器实现
 */
class ConsoleLogger implements Logger {
  private readonly prefix: string;
  private level: LogLevel;

  constructor(prefix = 'App', level = LogLevel.INFO) {
    this.prefix = prefix;
    this.level = level;
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * 格式化日志消息
   */
  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${this.prefix}] ${message}`;
  }

  /**
   * 记录调试级别日志
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('debug', message), ...args);
    }
  }

  /**
   * 记录信息级别日志
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('info', message), ...args);
    }
  }

  /**
   * 记录警告级别日志
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  /**
   * 记录错误级别日志
   */
  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('error', message), ...args);
    }
  }

  /**
   * 检查是否应该记录指定级别的日志
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.level);
    const targetLevelIndex = levels.indexOf(level);
    return targetLevelIndex >= currentLevelIndex;
  }
}

// 创建主应用日志记录器实例
export const logger = new ConsoleLogger('relaScope', 
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
);

// 创建LLM服务日志记录器实例
export const llmLogger = new ConsoleLogger('LLM-Service', 
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
);

// 导出默认记录器
export default logger; 