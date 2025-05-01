import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// 获取根元素
const container = document.getElementById('root');
if (!container) throw new Error('找不到根元素 #root');

// 创建React根实例
const root = createRoot(container);

// 渲染应用
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 