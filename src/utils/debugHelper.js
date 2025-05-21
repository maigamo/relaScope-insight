/**
 * debugHelper.js
 * 提供简单的调试功能
 */

// 日志级别
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// 当前日志级别
let currentLogLevel = LOG_LEVELS.INFO;

/**
 * 设置日志级别
 * @param {number} level - 日志级别
 */
function setLogLevel(level) {
  if (level >= LOG_LEVELS.DEBUG && level <= LOG_LEVELS.ERROR) {
    currentLogLevel = level;
    log(`日志级别设置为: ${getLogLevelName(level)}`);
  } else {
    console.error(`无效的日志级别: ${level}`);
  }
}

/**
 * 获取日志级别名称
 * @param {number} level - 日志级别
 * @returns {string} 日志级别名称
 */
function getLogLevelName(level) {
  return Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level) || 'UNKNOWN';
}

/**
 * 记录日志
 * @param {string} message - 日志消息
 * @param {number} level - 日志级别，默认为INFO
 */
function log(message, level = LOG_LEVELS.INFO) {
  if (level >= currentLogLevel) {
    const timestamp = new Date().toISOString();
    const levelName = getLogLevelName(level);
    
    switch (level) {
      case LOG_LEVELS.DEBUG:
        console.debug(`[${timestamp}] [${levelName}] ${message}`);
        break;
      case LOG_LEVELS.INFO:
        console.info(`[${timestamp}] [${levelName}] ${message}`);
        break;
      case LOG_LEVELS.WARN:
        console.warn(`[${timestamp}] [${levelName}] ${message}`);
        break;
      case LOG_LEVELS.ERROR:
        console.error(`[${timestamp}] [${levelName}] ${message}`);
        break;
      default:
        console.log(`[${timestamp}] [${levelName}] ${message}`);
    }
  }
}

/**
 * 调试信息
 * @param {string} message - 调试消息
 */
function debug(message) {
  log(message, LOG_LEVELS.DEBUG);
}

/**
 * 信息日志
 * @param {string} message - 信息消息
 */
function info(message) {
  log(message, LOG_LEVELS.INFO);
}

/**
 * 警告日志
 * @param {string} message - 警告消息
 */
function warn(message) {
  log(message, LOG_LEVELS.WARN);
}

/**
 * 错误日志
 * @param {string} message - 错误消息
 */
function error(message) {
  log(message, LOG_LEVELS.ERROR);
}

/**
 * 应用启动检查
 */
function checkAppStartup() {
  info('正在检查应用启动状态...');
  
  try {
    // 检查是否在浏览器环境
    if (typeof window === 'undefined') {
      warn('非浏览器环境，无法检查DOM');
      return false;
    }
    
    // 检查DOM是否加载完成
    if (document.readyState === 'loading') {
      warn('DOM尚未加载完成');
      return false;
    }
    
    // 检查关键元素是否存在
    const titleElement = document.querySelector('.chakra-text.css-wjomy9');
    if (!titleElement) {
      warn('未找到标题元素');
    } else {
      info(`找到标题元素: ${titleElement.textContent}`);
    }
    
    // 检查React是否已加载
    if (!window.React) {
      warn('React未加载');
    } else {
      info('React已加载');
    }
    
    info('应用启动检查完成');
    return true;
  } catch (err) {
    error(`应用启动检查出错: ${err.message}`);
    return false;
  }
}

// 导出模块
module.exports = {
  LOG_LEVELS,
  setLogLevel,
  log,
  debug,
  info,
  warn,
  error,
  checkAppStartup
}; 