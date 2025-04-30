import { contextBridge, ipcRenderer } from 'electron';

// 向渲染进程暴露安全的API
contextBridge.exposeInMainWorld('electronAPI', {
  // 示例方法: 发送消息到主进程
  send: (channel: string, data: any) => {
    // 白名单channels
    const validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  // 示例方法: 从主进程接收消息
  receive: (channel: string, func: (...args: any[]) => void) => {
    const validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      // 删除事件监听器，避免内存泄漏
      ipcRenderer.removeAllListeners(channel);
      // 新的事件监听器
      ipcRenderer.on(channel, (_, ...args) => func(...args));
    }
  }
}); 