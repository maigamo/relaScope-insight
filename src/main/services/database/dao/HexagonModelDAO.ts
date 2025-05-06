import { BaseDAO } from './BaseDAOImpl';
import { HexagonModel } from '../models/HexagonModel';
import { BaseDAOUtils } from './BaseDAOUtils';

export class HexagonModelDAO extends BaseDAO<HexagonModel> {
  constructor() {
    super('hexagon_models');
  }

  // 创建六边形模型
  public async create(hexagonModel: Omit<HexagonModel, 'id'>): Promise<HexagonModel> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const { 
        profile_id, 
        security, 
        achievement, 
        freedom, 
        belonging, 
        novelty, 
        control, 
        notes 
      } = hexagonModel;
      
      const query = `
        INSERT INTO hexagon_models (
          profile_id, security, achievement, freedom, belonging, novelty, control, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = await this.db?.run(
        query,
        profile_id,
        security,
        achievement,
        freedom,
        belonging,
        novelty,
        control,
        notes || null
      );
      
      if (result?.lastID) {
        return this.findById(result.lastID) as Promise<HexagonModel>;
      }
      
      throw new Error('创建六边形模型失败');
    } catch (error) {
      console.error('创建六边形模型时出错:', error);
      throw error;
    }
  }

  // 更新六边形模型
  public async update(id: number, hexagonModel: Partial<HexagonModel>): Promise<boolean> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const { sql, params } = BaseDAOUtils.generateUpdateSQL(this.tableName, hexagonModel);
      params.push(id); // 添加WHERE条件的ID参数
      
      const result = await this.db?.run(sql, ...params);
      
      return result?.changes ? result.changes > 0 : false;
    } catch (error) {
      console.error(`更新ID为${id}的六边形模型时出错:`, error);
      throw error;
    }
  }

  // 根据个人信息ID查找六边形模型
  public async findByProfileId(profileId: number): Promise<HexagonModel[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const query = `
        SELECT * FROM hexagon_models
        WHERE profile_id = ?
        ORDER BY created_at DESC
      `;
      
      const results = await this.db?.all<HexagonModel[]>(query, profileId);
      
      return results || [];
    } catch (error) {
      console.error(`查找关联到个人信息ID${profileId}的六边形模型时出错:`, error);
      throw error;
    }
  }

  // 查找个人信息的最新六边形模型
  public async findLatestByProfileId(profileId: number): Promise<HexagonModel | undefined> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const query = `
        SELECT * FROM hexagon_models
        WHERE profile_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      const result = await this.db?.get<HexagonModel>(query, profileId);
      
      return result;
    } catch (error) {
      console.error(`查找个人信息ID${profileId}的最新六边形模型时出错:`, error);
      throw error;
    }
  }

  // 获取最近的六边形模型
  public async getRecent(limit: number = 10): Promise<any[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const query = `
        SELECT h.*, p.name as profile_name
        FROM hexagon_models h
        JOIN profiles p ON h.profile_id = p.id
        ORDER BY h.created_at DESC
        LIMIT ?
      `;
      
      const results = await this.db?.all(query, limit);
      
      return results || [];
    } catch (error) {
      console.error('获取最近六边形模型时出错:', error);
      throw error;
    }
  }

  // 获取六边形模型维度的平均值
  public async getAverageDimensions(): Promise<any> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const query = `
        SELECT 
          AVG(security) as avg_security,
          AVG(achievement) as avg_achievement,
          AVG(freedom) as avg_freedom,
          AVG(belonging) as avg_belonging,
          AVG(novelty) as avg_novelty,
          AVG(control) as avg_control,
          COUNT(*) as total_count
        FROM hexagon_models
      `;
      
      const result = await this.db?.get(query);
      
      return result || {
        avg_security: 0,
        avg_achievement: 0,
        avg_freedom: 0,
        avg_belonging: 0,
        avg_novelty: 0,
        avg_control: 0,
        total_count: 0
      };
    } catch (error) {
      console.error('获取六边形模型维度平均值时出错:', error);
      throw error;
    }
  }

  // 比较两个六边形模型
  public async compareModels(modelId1: number, modelId2: number): Promise<any> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const model1 = await this.findById(modelId1);
      const model2 = await this.findById(modelId2);
      
      if (!model1 || !model2) {
        throw new Error('找不到指定的六边形模型');
      }
      
      // 计算差异
      const differences = {
        security: (model1.security - model2.security).toFixed(2),
        achievement: (model1.achievement - model2.achievement).toFixed(2),
        freedom: (model1.freedom - model2.freedom).toFixed(2),
        belonging: (model1.belonging - model2.belonging).toFixed(2),
        novelty: (model1.novelty - model2.novelty).toFixed(2),
        control: (model1.control - model2.control).toFixed(2),
        created_at_diff: new Date(model1.created_at as string).getTime() - new Date(model2.created_at as string).getTime()
      };
      
      return {
        model1,
        model2,
        differences
      };
    } catch (error) {
      console.error(`比较六边形模型ID ${modelId1} 和 ${modelId2} 时出错:`, error);
      throw error;
    }
  }
} 