import { BaseDAO } from './BaseDAOImpl';
import { Analysis } from '../models/Analysis';

export class AnalysisDAO extends BaseDAO<Analysis> {
  constructor() {
    super('analysis');
  }

  // 创建分析记录
  public async create(analysis: Omit<Analysis, 'id'>): Promise<Analysis> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const { profile_id, analysis_type, result } = analysis;
      
      const query = `
        INSERT INTO analysis (profile_id, analysis_type, result)
        VALUES (?, ?, ?)
      `;
      
      const createdResult = await this.db?.run(query, profile_id, analysis_type, result);
      
      if (createdResult?.lastID) {
        return this.findById(createdResult.lastID) as Promise<Analysis>;
      }
      
      throw new Error('创建分析记录失败');
    } catch (error) {
      console.error('创建分析记录时出错:', error);
      throw error;
    }
  }

  // 更新分析记录
  public async update(id: number, analysis: Partial<Analysis>): Promise<boolean> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      // 分析记录通常不应被修改，但提供此功能以支持特殊情况
      let setClauses = [];
      const params = [];
      
      if (analysis.profile_id !== undefined) {
        setClauses.push('profile_id = ?');
        params.push(analysis.profile_id);
      }
      
      if (analysis.analysis_type !== undefined) {
        setClauses.push('analysis_type = ?');
        params.push(analysis.analysis_type);
      }
      
      if (analysis.result !== undefined) {
        setClauses.push('result = ?');
        params.push(analysis.result);
      }
      
      if (setClauses.length === 0) {
        throw new Error('没有要更新的字段');
      }
      
      const sql = `UPDATE ${this.tableName} SET ${setClauses.join(', ')} WHERE id = ?`;
      params.push(id);
      
      const result = await this.db?.run(sql, ...params);
      
      return result?.changes ? result.changes > 0 : false;
    } catch (error) {
      console.error(`更新ID为${id}的分析记录时出错:`, error);
      throw error;
    }
  }

  // 根据个人信息ID查找分析记录
  public async findByProfileId(profileId: number): Promise<Analysis[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const query = `
        SELECT * FROM analysis
        WHERE profile_id = ?
        ORDER BY created_at DESC
      `;
      
      const results = await this.db?.all<Analysis[]>(query, profileId);
      
      return results || [];
    } catch (error) {
      console.error(`查找关联到个人信息ID${profileId}的分析记录时出错:`, error);
      throw error;
    }
  }

  // 根据个人信息ID和分析类型查找最新的分析记录
  public async findLatestByProfileIdAndType(profileId: number, analysisType: string): Promise<Analysis | undefined> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const query = `
        SELECT * FROM analysis
        WHERE profile_id = ? AND analysis_type = ?
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      const result = await this.db?.get<Analysis>(query, profileId, analysisType);
      
      return result;
    } catch (error) {
      console.error(`查找个人信息ID${profileId}的最新${analysisType}分析记录时出错:`, error);
      throw error;
    }
  }

  // 获取最近的分析记录
  public async getRecent(limit: number = 10): Promise<any[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const query = `
        SELECT a.id, a.analysis_type, a.created_at, p.id as profile_id, p.name as profile_name
        FROM analysis a
        JOIN profiles p ON a.profile_id = p.id
        ORDER BY a.created_at DESC
        LIMIT ?
      `;
      
      const results = await this.db?.all(query, limit);
      
      return results || [];
    } catch (error) {
      console.error('获取最近分析记录时出错:', error);
      throw error;
    }
  }

  // 获取分析类型统计
  public async getAnalysisTypeStats(): Promise<any[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const query = `
        SELECT analysis_type, COUNT(*) as count
        FROM analysis
        GROUP BY analysis_type
        ORDER BY count DESC
      `;
      
      const results = await this.db?.all(query);
      
      return results || [];
    } catch (error) {
      console.error('获取分析类型统计时出错:', error);
      throw error;
    }
  }

  // 检查分析记录是否存在
  public async existsByProfileIdAndType(profileId: number, analysisType: string): Promise<boolean> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const query = `
        SELECT 1 FROM analysis
        WHERE profile_id = ? AND analysis_type = ?
        LIMIT 1
      `;
      
      const result = await this.db?.get(query, profileId, analysisType);
      
      return result ? true : false;
    } catch (error) {
      console.error(`检查个人信息ID${profileId}的${analysisType}分析记录是否存在时出错:`, error);
      throw error;
    }
  }
} 