/**
 * 管理器索引文件
 * 统一导出所有设置管理器
 */

// 导出设置管理器
export { default as configManager } from './configManager';
export { default as providerManager } from './providerManager';
export { default as templateManager } from './templateManager';
export { default as modelManager } from './modelManager';
export { default as apiKeyManager } from './apiKeyManager';
export { default as proxyManager } from './proxyManager';

// 以下管理器将在实现后取消注释
// export { otherManager } from './otherManager'; 