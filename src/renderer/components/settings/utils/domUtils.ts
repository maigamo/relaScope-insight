/**
 * DOM操作工具类
 * 提供用于DOM元素操作的各种实用函数
 */

declare global {
  interface Window {
    currentAppTitle?: string;
  }
}

/**
 * 更新应用标题
 * @param title 要设置的标题文本
 */
export const updateAppTitle = (title: string): void => {
  // 更新全局变量存储当前标题
  window.currentAppTitle = title;
  
  // 如果存在特定DOM元素也直接更新
  const titleElement = document.getElementById('app-title-text');
  if (titleElement) {
    titleElement.innerText = title;
  }

  // 可选：更新文档标题
  document.title = `RelaSoft - ${title}`;
};

/**
 * 恢复应用标题到默认值
 */
export const restoreAppTitle = (): void => {
  window.currentAppTitle = undefined;
  
  // 恢复DOM元素的默认标题
  const titleElement = document.getElementById('app-title-text');
  if (titleElement) {
    titleElement.innerText = 'RelaSoft';
  }
  
  // 恢复文档标题
  document.title = 'RelaSoft';
};

/**
 * 获取元素的绝对位置
 * @param element 目标DOM元素
 * @returns 元素的位置坐标
 */
export const getElementPosition = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height
  };
};

/**
 * 创建DOM元素并添加到父元素
 * @param tagName 标签名
 * @param options 元素选项（类名、ID等）
 * @param parent 父元素（可选）
 * @returns 创建的DOM元素
 */
export const createElement = <T extends HTMLElement>(
  tagName: string,
  options: {
    className?: string;
    id?: string;
    styles?: Partial<CSSStyleDeclaration>;
    attributes?: Record<string, string>;
    innerHTML?: string;
  } = {},
  parent?: HTMLElement
): T => {
  const element = document.createElement(tagName) as T;
  
  if (options.className) {
    element.className = options.className;
  }
  
  if (options.id) {
    element.id = options.id;
  }
  
  if (options.styles) {
    Object.assign(element.style, options.styles);
  }
  
  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
  
  if (options.innerHTML) {
    element.innerHTML = options.innerHTML;
  }
  
  if (parent) {
    parent.appendChild(element);
  }
  
  return element;
};

/**
 * 添加/移除全局事件监听器
 */
const eventListeners: Record<string, Array<(e: Event) => void>> = {};

export const addGlobalEventListener = (
  eventType: string,
  callback: (e: Event) => void
): void => {
  if (!eventListeners[eventType]) {
    eventListeners[eventType] = [];
  }
  eventListeners[eventType].push(callback);
  window.addEventListener(eventType, callback);
};

export const removeGlobalEventListener = (
  eventType: string,
  callback: (e: Event) => void
): void => {
  if (eventListeners[eventType]) {
    eventListeners[eventType] = eventListeners[eventType].filter(
      (cb) => cb !== callback
    );
  }
  window.removeEventListener(eventType, callback);
};

export const removeAllGlobalEventListeners = (): void => {
  Object.entries(eventListeners).forEach(([eventType, callbacks]) => {
    callbacks.forEach((callback) => {
      window.removeEventListener(eventType, callback);
    });
  });
  
  // 清空监听器记录
  Object.keys(eventListeners).forEach((key) => {
    delete eventListeners[key];
  });
};

// 默认导出
export default {
  updateAppTitle,
  restoreAppTitle,
  getElementPosition,
  createElement,
  addGlobalEventListener,
  removeGlobalEventListener,
  removeAllGlobalEventListeners
}; 