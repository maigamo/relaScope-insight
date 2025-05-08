import { Analysis } from '../../../common/types/database';
import { ipcService } from './core';
import { ANALYSIS_CHANNELS } from './channels';

/**
 * 分析服务 - 提供分析记录的增删改查等功能
 */
export const AnalysisService = {
  /**
   * 创建新分析记录
   * @param analysis 分析数据
   */
  async createAnalysis(analysis: Analysis): Promise<Analysis> {
    try {
      return await ipcService.invoke<Analysis>(ANALYSIS_CHANNELS.CREATE, analysis);
    } catch (error) {
      console.error('创建分析记录失败:', error);
      throw error;
    }
  },
  
  /**
   * 更新分析记录
   * @param analysis 分析数据
   */
  async updateAnalysis(analysis: Analysis): Promise<boolean> {
    try {
      return await ipcService.invoke<boolean>(ANALYSIS_CHANNELS.UPDATE, analysis);
    } catch (error) {
      console.error('更新分析记录失败:', error);
      return false;
    }
  },
  
  /**
   * 根据档案ID获取分析记录
   * @param profileId 档案ID
   */
  async getAnalysesByProfileId(profileId: number): Promise<Analysis[]> {
    try {
      return await ipcService.invoke<Analysis[]>(ANALYSIS_CHANNELS.GET_BY_PROFILE, profileId);
    } catch (error) {
      console.error(`获取档案(ID=${profileId})的分析记录失败:`, error);
      return [];
    }
  },
  
  /**
   * 获取最近的分析记录
   * @param limit 限制数量
   */
  async getRecentAnalyses(limit: number = 10): Promise<Analysis[]> {
    try {
      return await ipcService.invoke<Analysis[]>(ANALYSIS_CHANNELS.GET_RECENT, limit);
    } catch (error) {
      console.error('获取最近分析记录失败:', error);
      return [];
    }
  },
  
  /**
   * 获取分析类型统计数据
   */
  async getAnalysisTypeStats(): Promise<{ type: string; count: number }[]> {
    try {
      return await ipcService.invoke<{ type: string; count: number }[]>(ANALYSIS_CHANNELS.GET_STATS);
    } catch (error) {
      console.error('获取分析类型统计数据失败:', error);
      return [];
    }
  },
  
  /**
   * 执行分析
   * @param type 分析类型
   * @param data 分析数据
   */
  async analyze<T>(type: string, data: any): Promise<T> {
    try {
      // 直接使用预加载脚本注入的window.electron，如果存在
      if (window.electron?.analyze) {
        return await window.electron.analyze<T>(type, data);
      }
      
      return await ipcService.invoke<T>('analysis:execute', { type, data });
    } catch (error) {
      console.error(`执行分析(${type})失败:`, error);
      throw error;
    }
  }
}; 