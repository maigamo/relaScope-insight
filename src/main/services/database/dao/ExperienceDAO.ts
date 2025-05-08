import { BaseDAO } from './BaseDAOImpl';
import { Experience } from '../models/Experience';
import { BaseDAOUtils } from './BaseDAOUtils';

export class ExperienceDAO extends BaseDAO<Experience> {
  constructor() {
    super('experiences');
  }

  // 创建经历
  public async create(experience: Omit<Experience, 'id'>): Promise<Experience> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const { profile_id, title, description, date, location, tags } = experience;
      
      const query = `
        INSERT INTO experiences (profile_id, title, description, date, location, tags)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const result = await this.db?.run(
        query,
        profile_id,
        title,
        description || null,
        date || null,
        location || null,
        tags || null
      );
      
      if (result?.lastID) {
        return this.findById(result.lastID) as Promise<Experience>;
      }
      
      throw new Error('创建经历失败');
    } catch (error) {
      console.error('创建经历时出错:', error);
      throw error;
    }
  }

  // 更新经历
  public async update(id: number, experience: Partial<Experience>): Promise<boolean> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const { sql, params } = BaseDAOUtils.generateUpdateSQL(this.tableName, experience);
      params.push(id); // 添加WHERE条件的ID参数
      
      const result = await this.db?.run(sql, ...params);
      
      return result?.changes ? result.changes > 0 : false;
    } catch (error) {
      console.error(`更新ID为${id}的经历时出错:`, error);
      throw error;
    }
  }

  // 根据个人信息ID查找经历
  public async findByProfileId(profileId: number, page: number = 1, pageSize: number = 20): Promise<Experience[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const offset = (page - 1) * pageSize;
      const query = `
        SELECT * FROM experiences
        WHERE profile_id = ?
        ORDER BY date DESC, created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const results = await this.db?.all<Experience[]>(query, profileId, pageSize, offset);
      
      // 添加驼峰式字段名，确保与前端兼容
      const formattedResults = (results || []).map(exp => {
        return {
          ...exp,
          profileId: exp.profile_id,
          startDate: exp.date,
          createdAt: exp.created_at,
          updatedAt: exp.updated_at
        };
      });
      
      return formattedResults;
    } catch (error) {
      console.error(`查找关联到个人信息ID${profileId}的经历时出错:`, error);
      throw error;
    }
  }

  // 根据标题搜索经历
  public async searchByTitle(keyword: string, profileId?: number): Promise<Experience[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      let query = `
        SELECT * FROM experiences
        WHERE title LIKE ?
      `;
      
      const params: any[] = [`%${keyword}%`];
      
      if (profileId !== undefined) {
        query += ' AND profile_id = ?';
        params.push(profileId);
      }
      
      query += ' ORDER BY date DESC, created_at DESC';
      
      const results = await this.db?.all<Experience[]>(query, ...params);
      
      return results || [];
    } catch (error) {
      console.error(`搜索经历标题时出错:`, error);
      throw error;
    }
  }

  // 根据位置搜索经历
  public async findByLocation(location: string, profileId?: number): Promise<Experience[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      let query = `
        SELECT * FROM experiences
        WHERE location LIKE ?
      `;
      
      const params: any[] = [`%${location}%`];
      
      if (profileId !== undefined) {
        query += ' AND profile_id = ?';
        params.push(profileId);
      }
      
      query += ' ORDER BY date DESC, created_at DESC';
      
      const results = await this.db?.all<Experience[]>(query, ...params);
      
      return results || [];
    } catch (error) {
      console.error(`根据位置搜索经历时出错:`, error);
      throw error;
    }
  }

  // 根据标签搜索经历
  public async findByTag(tag: string, profileId?: number): Promise<Experience[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      let query = `
        SELECT * FROM experiences
        WHERE tags LIKE ?
      `;
      
      const params: any[] = [`%${tag}%`];
      
      if (profileId !== undefined) {
        query += ' AND profile_id = ?';
        params.push(profileId);
      }
      
      query += ' ORDER BY date DESC, created_at DESC';
      
      const results = await this.db?.all<Experience[]>(query, ...params);
      
      return results || [];
    } catch (error) {
      console.error(`根据标签搜索经历时出错:`, error);
      throw error;
    }
  }

  // 获取最近的经历
  public async getRecent(limit: number = 10): Promise<Experience[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const query = `
        SELECT e.*, p.name as profile_name
        FROM experiences e
        JOIN profiles p ON e.profile_id = p.id
        ORDER BY e.created_at DESC
        LIMIT ?
      `;
      
      const results = await this.db?.all(query, limit);
      
      return results || [];
    } catch (error) {
      console.error('获取最近经历时出错:', error);
      throw error;
    }
  }

  // 获取按年份分组的经历时间轴
  public async getTimelineByProfileId(profileId: number): Promise<any> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      // 获取所有带日期的经历
      const query = `
        SELECT id, title, description, date, location, tags, created_at, updated_at
        FROM experiences
        WHERE profile_id = ? AND date IS NOT NULL
        ORDER BY date DESC
      `;
      
      const results = await this.db?.all(query, profileId);
      
      // 按年份分组
      const timeline: { [year: string]: any[] } = {};
      
      results?.forEach((experience: any) => {
        try {
          const date = new Date(experience.date);
          const year = date.getFullYear().toString();
          
          // 添加驼峰式字段名
          const enhancedExp = {
            ...experience,
            startDate: experience.date,
            createdAt: experience.created_at,
            updatedAt: experience.updated_at
          };
          
          if (!timeline[year]) {
            timeline[year] = [];
          }
          
          timeline[year].push(enhancedExp);
        } catch (e) {
          // 忽略无效日期
          console.warn(`经历ID ${experience.id} 的日期格式无效:`, experience.date);
        }
      });
      
      return timeline;
    } catch (error) {
      console.error(`获取个人信息ID${profileId}的经历时间轴时出错:`, error);
      throw error;
    }
  }

  // 根据ID查找实体
  public async findById(id: number): Promise<Experience | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
      const result = await this.db?.get<Experience>(query, id);
      
      if (result) {
        // 添加驼峰式字段名，确保与前端兼容
        result.profileId = result.profile_id;
        
        if (result.date) {
          result.startDate = result.date;
        }
        
        result.createdAt = result.created_at;
        result.updatedAt = result.updated_at;
      }
      
      return result || null;
    } catch (error) {
      console.error(`查找ID为${id}的${this.tableName}记录时出错:`, error);
      throw error;
    }
  }
} 