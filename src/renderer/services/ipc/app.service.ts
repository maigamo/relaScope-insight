import { ipcService } from './core';
import { APP_CHANNELS } from './channels';

/**
 * 应用服务 - 主要用于控制窗口和应用行为
 */
export const AppService = {
  /**
   * 最小化窗口
   */
  minimize(): void {
    ipcService.send(APP_CHANNELS.MINIMIZE);
  },
  
  /**
   * 最大化/还原窗口
   */
  maximize(): void {
    ipcService.send(APP_CHANNELS.MAXIMIZE);
  },
  
  /**
   * 关闭窗口
   */
  close(): void {
    ipcService.send(APP_CHANNELS.CLOSE);
  },
  
  /**
   * 检查更新
   */
  async checkForUpdates(): Promise<boolean> {
    try {
      return await ipcService.invoke(APP_CHANNELS.CHECK_FOR_UPDATES);
    } catch (error) {
      console.error('检查更新失败:', error);
      return false;
    }
  }
}; 