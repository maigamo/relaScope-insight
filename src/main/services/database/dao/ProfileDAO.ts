import { BaseDAO } from '../BaseDAO';
import { Profile } from '../models/Profile';

export class ProfileDAO extends BaseDAO<Profile> {
  constructor() {
    super('profiles');
  }

  // 创建个人信息
  public async create(profile: Omit<Profile, 'id'>): Promise<Profile> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const { name, gender, age, occupation, interests, notes } = profile;
      
      const query = `
        INSERT INTO profiles (name, gender, age, occupation, interests, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const result = await this.db?.run(
        query,
        name,
        gender || null,
        age || null,
        occupation || null,
        interests || null,
        notes || null
      );
      
      if (result?.lastID) {
        return this.findById(result.lastID) as Promise<Profile>;
      }
      
      throw new Error('创建个人信息失败');
    } catch (error) {
      console.error('创建个人信息时出错:', error);
      throw error;
    }
  }

  // 更新个人信息
  public async update(id: number, profile: Partial<Profile>): Promise<boolean> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const { sql, params } = this.generateUpdateSQL(profile);
      params.push(id); // 添加WHERE条件的ID参数
      
      const result = await this.db?.run(sql, ...params);
      
      return result?.changes ? result.changes > 0 : false;
    } catch (error) {
      console.error(`更新ID为${id}的个人信息时出错:`, error);
      throw error;
    }
  }

  // 根据名称搜索个人信息
  public async findByName(name: string): Promise<Profile[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const query = `SELECT * FROM profiles WHERE name LIKE ? ORDER BY id DESC`;
      const results = await this.db?.all<Profile[]>(query, `%${name}%`);
      
      return results || [];
    } catch (error) {
      console.error(`根据名称"${name}"搜索个人信息时出错:`, error);
      throw error;
    }
  }

  // 模糊搜索个人信息（在多个字段中搜索）
  public async search(keyword: string): Promise<Profile[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const searchPattern = `%${keyword}%`;
      const query = `
        SELECT * FROM profiles 
        WHERE name LIKE ? 
        OR occupation LIKE ? 
        OR interests LIKE ? 
        OR notes LIKE ?
        ORDER BY id DESC
      `;
      
      const results = await this.db?.all<Profile[]>(
        query,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern
      );
      
      return results || [];
    } catch (error) {
      console.error(`搜索个人信息时出错:`, error);
      throw error;
    }
  }

  // 获取统计信息
  public async getStatistics(): Promise<any> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const totalCount = await this.count();
      
      // 按职业分组
      const occupationQuery = `
        SELECT occupation, COUNT(*) as count
        FROM profiles
        WHERE occupation IS NOT NULL AND occupation != ''
        GROUP BY occupation
        ORDER BY count DESC
        LIMIT 5
      `;
      const occupationStats = await this.db?.all(occupationQuery);
      
      // 最近添加的个人信息
      const recentQuery = `
        SELECT id, name, created_at
        FROM profiles
        ORDER BY created_at DESC
        LIMIT 5
      `;
      const recentProfiles = await this.db?.all(recentQuery);
      
      return {
        totalCount,
        occupationStats: occupationStats || [],
        recentProfiles: recentProfiles || []
      };
    } catch (error) {
      console.error('获取个人信息统计数据时出错:', error);
      throw error;
    }
  }

  /**
   * 获取最近创建的档案
   * @param limit 限制条数
   * @returns 档案列表
   */
  async getRecent(limit: number): Promise<Profile[]> {
    try {
      return await this.find('1=1', [], `ORDER BY created_at DESC LIMIT ${limit}`);
    } catch (error) {
      console.error('获取最近档案失败:', error);
      throw new Error(`获取最近档案失败: ${error}`);
    }
  }
} 