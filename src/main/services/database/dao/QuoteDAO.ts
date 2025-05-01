import { BaseDAO } from '../BaseDAO';
import { Quote } from '../entity/Quote';

/**
 * 引用数据访问对象
 * 负责处理引用相关的数据库操作
 */
export class QuoteDAO extends BaseDAO<Quote> {
  constructor() {
    super('quotes');
  }

  /**
   * 创建引用表
   */
  public async createTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profileId INTEGER NOT NULL,
        content TEXT NOT NULL,
        source TEXT,
        author TEXT,
        context TEXT,
        tags TEXT,
        importance INTEGER,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
      )
    `;
    
    if (!this.db) await this.initializeDatabase();
    await this.db?.exec(sql);
  }

  /**
   * 创建引用
   * @param quote 引用对象
   * @returns 新创建的引用对象
   */
  public async create(quote: Omit<Quote, 'id'>): Promise<Quote> {
    const now = new Date().toISOString();
    
    // 确保必要字段存在
    const newQuote: Omit<Quote, 'id'> = {
      profileId: quote.profileId,
      content: quote.content,
      source: quote.source || '',
      tags: quote.tags || '[]',
      createdAt: quote.createdAt || now,
      updatedAt: quote.updatedAt || now
    };
    
    // 使用BaseDAO的insert方法
    const id = await this.insert(newQuote);
    
    // 返回完整的Quote对象
    return {
      id,
      ...newQuote
    };
  }

  /**
   * 根据ID查找引用
   * @param id 引用ID
   * @returns 引用对象
   */
  public async findById(id: number): Promise<Quote | null> {
    return super.findById(id);
  }

  /**
   * 查找所有引用
   * @param profileId 可选的配置文件ID过滤
   * @returns 引用对象数组
   */
  public async findAll(profileId?: number): Promise<Quote[]> {
    if (profileId === undefined) {
      return super.findAll();
    }
    
    return this.find('profileId = ?', [profileId.toString()], 'ORDER BY updatedAt DESC');
  }

  /**
   * 根据ID删除引用
   * @param id 引用ID
   * @returns 是否删除成功
   */
  public async deleteById(id: number): Promise<boolean> {
    return this.delete(id);
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
      whereClause += ' AND profileId = ?';
      params.push(profileId.toString());
    }
    
    return this.find(whereClause, params, 'ORDER BY updatedAt DESC');
  }
} 