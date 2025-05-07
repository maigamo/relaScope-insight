import { Quote } from '../entity/Quote';
import { ExtendedDAO } from './DAOInterfaces';

/**
 * 引用数据访问接口
 */
export interface QuoteDAO extends ExtendedDAO<Quote> {
  /**
   * 创建引用表
   */
  createTable(): Promise<void>;
  
  /**
   * 按个人档案ID查找引用
   * @param profileId 个人档案ID
   */
  findByProfileId(profileId: number): Promise<Quote[]>;
  
  /**
   * 按内容搜索
   * @param content 内容关键词
   */
  searchByContent(content: string): Promise<Quote[]>;
  
  /**
   * 按来源搜索
   * @param source 来源关键词
   */
  searchBySource(source: string): Promise<Quote[]>;
  
  /**
   * 按标签搜索
   * @param tag 标签关键词
   */
  searchByTag(tag: string): Promise<Quote[]>;
  
  /**
   * 按重要性级别搜索
   * @param importance 重要性级别
   */
  findByImportance(importance: number): Promise<Quote[]>;
  
  /**
   * 根据关键词搜索引用
   * @param keyword 搜索关键词
   * @param profileId 可选的配置文件ID过滤
   * @returns 匹配的引用对象数组
   */
  search(keyword: string, profileId?: number): Promise<Quote[]>;
  
  /**
   * 组合条件搜索
   * @param criteria 搜索条件
   */
  searchByCriteria(criteria: {
    profile_id?: number;
    content?: string;
    source?: string;
    tag?: string;
    importance?: number;
  }): Promise<Quote[]>;
} 