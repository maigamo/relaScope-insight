import { BaseDAO } from './BaseDAOImpl';
import { ProfileDAO } from './ProfileDAO';
import { Profile } from '../entity/Profile';
import { BaseDAOUtils } from './BaseDAOUtils';

/**
 * ProfileDAO 实现类
 * 实现对个人信息表的操作
 */
export class ProfileDAOImpl extends BaseDAO<Profile> implements ProfileDAO {
  private static instance: ProfileDAOImpl;

  /**
   * 单例模式获取实例
   */
  public static getInstance(): ProfileDAOImpl {
    if (!ProfileDAOImpl.instance) {
      ProfileDAOImpl.instance = new ProfileDAOImpl();
    }
    return ProfileDAOImpl.instance;
  }

  /**
   * 构造函数
   */
  private constructor() {
    super('profiles');
  }

  /**
   * 创建个人信息表
   */
  public async createTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        gender TEXT,
        age INTEGER,
        occupation TEXT,
        interests TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      if (!this.db) await this.initializeDatabase();
      await this.db?.exec(sql);
      console.log('个人信息表创建成功或已存在');
    } catch (error) {
      console.error('创建个人信息表失败:', error);
      throw new Error(`创建个人信息表失败: ${error}`);
    }
  }

  /**
   * 创建个人信息
   * @param profile 个人信息对象
   * @returns 返回创建的个人信息对象
   */
  public async create(profile: Omit<Profile, 'id'>): Promise<Profile> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const now = new Date().toISOString();
      const profileData = {
        ...profile,
        created_at: now,
        updated_at: now
      };
      
      const keys = Object.keys(profileData);
      const placeholders = keys.map(() => '?').join(', ');
      const values = keys.map(key => (profileData as any)[key]);
      
      const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
      const result = await this.db?.run(sql, ...values);
      
      if (result && result.lastID) {
        const newProfile = await this.findById(result.lastID);
        if (!newProfile) {
          throw new Error('创建个人信息后未找到记录');
        }
        return newProfile;
      }
      
      throw new Error('创建个人信息失败');
    } catch (error) {
      console.error('创建个人信息时出错:', error);
      throw new Error(`创建个人信息失败: ${error}`);
    }
  }

  /**
   * 更新个人信息
   * @param id 个人信息ID
   * @param profile 个人信息对象
   * @returns 返回更新结果
   */
  public async update(id: number, profile: Partial<Profile>): Promise<boolean> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const updateData = {
        ...profile,
        updated_at: new Date().toISOString()
      };
      
      const { sql, params } = BaseDAOUtils.generateUpdateSQL(this.tableName, updateData);
      params.push(id); // 添加WHERE条件的ID参数
      
      const result = await this.db?.run(sql, ...params);
      
      return result?.changes ? result.changes > 0 : false;
    } catch (error) {
      console.error(`更新ID为${id}的个人信息时出错:`, error);
      throw new Error(`更新个人信息失败: ${error}`);
    }
  }

  /**
   * 根据ID删除个人信息
   * @param id 个人信息ID
   * @returns 返回删除结果
   */
  public async delete(id: number): Promise<boolean> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
      const result = await this.db?.run(sql, id);
      
      return result?.changes ? result.changes > 0 : false;
    } catch (error) {
      console.error(`删除ID为${id}的个人信息时出错:`, error);
      throw new Error(`删除个人信息失败: ${error}`);
    }
  }

  /**
   * 根据ID查找个人信息
   * @param id 个人信息ID
   * @returns 返回个人信息对象
   */
  public async findById(id: number): Promise<Profile | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
      const result = await this.db?.get<Profile>(sql, id);
      
      return result || null;
    } catch (error) {
      console.error(`查找ID为${id}的个人信息时出错:`, error);
      throw new Error(`查找个人信息失败: ${error}`);
    }
  }

  /**
   * 获取所有个人信息
   * @returns 返回个人信息列表
   */
  public async findAll(): Promise<Profile[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const sql = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC`;
      const results = await this.db?.all<Profile[]>(sql);
      
      return results || [];
    } catch (error) {
      console.error('获取所有个人信息时出错:', error);
      throw new Error(`获取所有个人信息失败: ${error}`);
    }
  }

  /**
   * 根据名称搜索个人信息
   * @param name 名称关键字
   * @returns 返回匹配的个人信息列表
   */
  public async searchByName(name: string): Promise<Profile[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const sql = `SELECT * FROM ${this.tableName} WHERE name LIKE ? ORDER BY created_at DESC`;
      const results = await this.db?.all<Profile[]>(sql, `%${name}%`);
      
      return results || [];
    } catch (error) {
      console.error(`根据名称"${name}"搜索个人信息时出错:`, error);
      throw new Error(`搜索个人信息失败: ${error}`);
    }
  }

  /**
   * 根据职业搜索个人信息
   * @param occupation 职业关键字
   * @returns 返回匹配的个人信息列表
   */
  public async searchByOccupation(occupation: string): Promise<Profile[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const sql = `SELECT * FROM ${this.tableName} WHERE occupation LIKE ? ORDER BY created_at DESC`;
      const results = await this.db?.all<Profile[]>(sql, `%${occupation}%`);
      
      return results || [];
    } catch (error) {
      console.error(`根据职业"${occupation}"搜索个人信息时出错:`, error);
      throw new Error(`搜索个人信息失败: ${error}`);
    }
  }

  /**
   * 根据兴趣爱好搜索个人信息
   * @param interest 兴趣爱好关键字
   * @returns 返回匹配的个人信息列表
   */
  public async searchByInterest(interest: string): Promise<Profile[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const sql = `SELECT * FROM ${this.tableName} WHERE interests LIKE ? ORDER BY created_at DESC`;
      const results = await this.db?.all<Profile[]>(sql, `%${interest}%`);
      
      return results || [];
    } catch (error) {
      console.error(`根据兴趣爱好"${interest}"搜索个人信息时出错:`, error);
      throw new Error(`搜索个人信息失败: ${error}`);
    }
  }

  /**
   * 综合搜索，在多个字段中查找
   * @param keyword 搜索关键字
   * @returns 返回符合条件的个人信息列表
   */
  public async search(keyword: string): Promise<Profile[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const searchPattern = `%${keyword}%`;
      const sql = `
        SELECT * FROM ${this.tableName} 
        WHERE name LIKE ? 
        OR occupation LIKE ? 
        OR interests LIKE ? 
        OR notes LIKE ?
        ORDER BY created_at DESC
      `;
      
      const results = await this.db?.all<Profile[]>(
        sql,
        [searchPattern, searchPattern, searchPattern, searchPattern]
      );
      
      return results || [];
    } catch (error) {
      console.error(`搜索个人信息时出错:`, error);
      throw new Error(`搜索个人信息失败: ${error}`);
    }
  }

  /**
   * 获取最近创建的个人信息
   * @param limit 限制条数
   * @returns 个人信息列表
   */
  public async getRecent(limit: number = 5): Promise<Profile[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const sql = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT ?`;
      const results = await this.db?.all<Profile[]>(sql, limit);
      
      return results || [];
    } catch (error) {
      console.error('获取最近个人信息失败:', error);
      throw new Error(`获取最近个人信息失败: ${error}`);
    }
  }
} 