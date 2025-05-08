import { Quote } from '../../../common/types/database';
import { ipcService } from './core';
import { QUOTE_CHANNELS } from './channels';

/**
 * 语录服务 - 提供语录的增删改查等功能
 */
export const QuoteService = {
  /**
   * 创建新语录
   * @param quote 语录数据
   */
  async createQuote(quote: Quote): Promise<Quote> {
    try {
      return await ipcService.invoke<Quote>(QUOTE_CHANNELS.CREATE, quote);
    } catch (error) {
      console.error('创建语录失败:', error);
      throw error;
    }
  },
  
  /**
   * 更新语录
   * @param quote 语录数据
   */
  async updateQuote(quote: Quote): Promise<boolean> {
    try {
      return await ipcService.invoke<boolean>(QUOTE_CHANNELS.UPDATE, quote);
    } catch (error) {
      console.error('更新语录失败:', error);
      return false;
    }
  },
  
  /**
   * 根据档案ID获取语录
   * @param profileId 档案ID
   */
  async getQuotesByProfileId(profileId: number): Promise<Quote[]> {
    try {
      return await ipcService.invoke<Quote[]>(QUOTE_CHANNELS.GET_BY_PROFILE, profileId);
    } catch (error) {
      console.error(`获取档案(ID=${profileId})的语录失败:`, error);
      return [];
    }
  },
  
  /**
   * 删除语录
   * @param id 语录ID
   */
  async deleteQuote(id: number): Promise<boolean> {
    try {
      return await ipcService.invoke<boolean>(QUOTE_CHANNELS.DELETE, id);
    } catch (error) {
      console.error(`删除语录(ID=${id})失败:`, error);
      return false;
    }
  },
  
  /**
   * 获取最近的语录
   * @param limit 限制数量
   */
  async getRecentQuotes(limit: number = 10): Promise<Quote[]> {
    try {
      return await ipcService.invoke<Quote[]>(QUOTE_CHANNELS.GET_RECENT, limit);
    } catch (error) {
      console.error('获取最近语录失败:', error);
      return [];
    }
  }
}; 