import { Quote } from '../entity/Quote';
import { BaseDAO } from './BaseDAOImpl';
import { QuoteDAO } from './QuoteDAO';

/**
 * 引用数据访问实现类
 */
export class QuoteDAOImpl extends BaseDAO<Quote> implements QuoteDAO {
  private static instance: QuoteDAOImpl;

  private constructor() {
    super('quotes');
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): QuoteDAOImpl {
    if (!QuoteDAOImpl.instance) {
      QuoteDAOImpl.instance = new QuoteDAOImpl();
    }
    return QuoteDAOImpl.instance;
  }

  /**
   * 创建引用
   * @param entity 引用实体
   */
  public async create(entity: Omit<Quote, 'id'>): Promise<Quote> {
    try {
      const now = new Date().toISOString();
      const quoteData: Omit<Quote, 'id'> = {
        ...entity,
        createdAt: entity.createdAt || now,
        updatedAt: entity.updatedAt || now
      };

      const id = await this.insert(quoteData);
      return { ...quoteData, id } as Quote;
    } catch (error) {
      console.error('创建引用失败:', error);
      throw error;
    }
  }

  /**
   * 按个人档案ID查找引用
   * @param profileId 个人档案ID
   */
  public async findByProfileId(profileId: number): Promise<Quote[]> {
    return this.find('profile_id = ?', [profileId], 'ORDER BY updated_at DESC');
  }

  /**
   * 按内容搜索
   * @param content 内容关键词
   */
  public async searchByContent(content: string): Promise<Quote[]> {
    const searchParam = `%${content}%`;
    return this.find('content LIKE ?', [searchParam]);
  }

  /**
   * 按来源搜索
   * @param source 来源关键词
   */
  public async searchBySource(source: string): Promise<Quote[]> {
    const searchParam = `%${source}%`;
    return this.find('source LIKE ?', [searchParam]);
  }

  /**
   * 按标签搜索
   * @param tag 标签关键词
   */
  public async searchByTag(tag: string): Promise<Quote[]> {
    const searchParam = `%${tag}%`;
    return this.find('tags LIKE ?', [searchParam]);
  }

  /**
   * 按重要性级别搜索
   * @param importance 重要性级别
   */
  public async findByImportance(importance: number): Promise<Quote[]> {
    return this.find('importance = ?', [importance]);
  }

  /**
   * 根据关键词搜索引用
   * @param keyword 搜索关键词
   * @param profileId 可选的配置文件ID过滤
   * @returns 匹配的引用对象数组
   */
  public async search(keyword: string, profileId?: number): Promise<Quote[]> {
    let whereClause = '(content LIKE ? OR source LIKE ? OR tags LIKE ?)';
    let params = [
      `%${keyword}%`,
      `%${keyword}%`,
      `%${keyword}%`
    ];
    
    if (profileId !== undefined) {
      whereClause += ' AND profile_id = ?';
      params.push(profileId.toString());
    }
    
    return this.find(whereClause, params, 'ORDER BY updated_at DESC');
  }

  /**
   * 组合条件搜索
   * @param criteria 搜索条件
   */
  public async searchByCriteria(criteria: {
    profileId?: number;
    content?: string;
    source?: string;
    tag?: string;
    importance?: number;
  }): Promise<Quote[]> {
    const conditions: string[] = [];
    const params: any[] = [];

    if (criteria.profileId !== undefined) {
      conditions.push('profile_id = ?');
      params.push(criteria.profileId);
    }

    if (criteria.content) {
      conditions.push('content LIKE ?');
      params.push(`%${criteria.content}%`);
    }

    if (criteria.source) {
      conditions.push('source LIKE ?');
      params.push(`%${criteria.source}%`);
    }

    if (criteria.tag) {
      conditions.push('tags LIKE ?');
      params.push(`%${criteria.tag}%`);
    }

    if (criteria.importance !== undefined) {
      conditions.push('importance = ?');
      params.push(criteria.importance);
    }

    const whereClause = conditions.length > 0 ? conditions.join(' AND ') : '1=1';
    return this.find(whereClause, params, 'ORDER BY updated_at DESC');
  }

  /**
   * 创建引用表
   */
  public async createTable(): Promise<void> {
    if (!this.db) await this.initializeDatabase();
    
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        source TEXT,
        date TEXT,
        context TEXT,
        tags TEXT,
        importance INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE
      )
    `;
    
    await this.db?.exec(sql);
  }
} 