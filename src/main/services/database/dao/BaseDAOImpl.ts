import { Database } from 'sqlite';
import { DatabaseManager } from '../DatabaseManager';
import { ExtendedDAO } from './DAOInterfaces';
import { BaseDAOUtils } from './BaseDAOUtils';

/**
 * 基础数据访问对象抽象类
 * 实现数据库通用操作
 */
export abstract class BaseDAO<T extends { id?: number }> implements ExtendedDAO<T> {
  protected db: Database | null = null;
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.initializeDatabase();
  }

  // 初始化数据库连接
  protected async initializeDatabase(): Promise<void> {
    const dbManager = DatabaseManager.getInstance();
    this.db = dbManager.getDatabase();
    
    if (!this.db) {
      throw new Error('数据库初始化失败');
    }
  }

  // 根据ID查找实体
  public async findById(id: number): Promise<T | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
      const result = await this.db?.get<T>(query, id);
      
      return result || null;
    } catch (error) {
      console.error(`查找ID为${id}的${this.tableName}记录时出错:`, error);
      throw error;
    }
  }

  // 按条件查询单条记录
  public async findOne(where: string, params: any[] = []): Promise<T | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const query = `SELECT * FROM ${this.tableName} WHERE ${where} LIMIT 1`;
      const result = await this.db?.get<T>(query, ...params);
      
      return result || null;
    } catch (error) {
      console.error(`查找${this.tableName}记录时出错:`, error);
      throw error;
    }
  }
  
  // 按条件查询多条记录
  public async find(where: string, params: any[] = [], options: string = ''): Promise<T[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const query = `SELECT * FROM ${this.tableName} WHERE ${where} ${options}`;
      const results = await this.db?.all<T[]>(query, ...params);
      
      return results || [];
    } catch (error) {
      console.error(`查找${this.tableName}记录时出错:`, error);
      throw error;
    }
  }

  // 查找所有实体
  public async findAll(): Promise<T[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const query = `SELECT * FROM ${this.tableName}`;
      const results = await this.db?.all<T[]>(query);
      
      return results || [];
    } catch (error) {
      console.error(`查找所有${this.tableName}记录时出错:`, error);
      throw error;
    }
  }

  // 带分页的查找
  public async findAllPaginated(page: number = 1, pageSize: number = 20): Promise<T[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const offset = (page - 1) * pageSize;
      const query = `SELECT * FROM ${this.tableName} ORDER BY id DESC LIMIT ? OFFSET ?`;
      const results = await this.db?.all<T[]>(query, pageSize, offset);
      
      return results || [];
    } catch (error) {
      console.error(`分页查找${this.tableName}记录时出错:`, error);
      throw error;
    }
  }

  // 插入实体并返回ID
  public async insert(entity: Omit<T, 'id'>): Promise<number> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const keys = Object.keys(entity);
      const placeholders = keys.map(() => '?').join(', ');
      const values = keys.map(key => (entity as any)[key]);
      
      const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
      const result = await this.db?.run(sql, ...values);
      
      return result?.lastID || 0;
    } catch (error) {
      console.error(`插入${this.tableName}记录时出错:`, error);
      throw error;
    }
  }

  // 抽象方法：创建实体
  public abstract create(entity: Omit<T, 'id'>): Promise<T>;

  // 根据ID更新实体
  public async update(id: number, entity: Partial<T>): Promise<boolean> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const { sql, params } = BaseDAOUtils.generateUpdateSQL(this.tableName, entity);
      params.push(id); // 添加WHERE条件的ID
      
      const result = await this.db?.run(sql, ...params);
      
      return result?.changes ? result.changes > 0 : false;
    } catch (error) {
      console.error(`更新ID为${id}的${this.tableName}记录时出错:`, error);
      throw error;
    }
  }
  
  // 根据条件更新实体
  public async updateWhere(entity: Partial<T>, whereClause: string, whereParams: any[]): Promise<boolean> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const keys = Object.keys(entity);
      if (keys.length === 0) {
        return false;
      }
      
      const setClauses = keys.map(key => `${BaseDAOUtils.camelToSnake(key)} = ?`).join(', ');
      const params = [...keys.map(key => (entity as any)[key]), ...whereParams];
      
      const sql = `UPDATE ${this.tableName} SET ${setClauses} WHERE ${whereClause}`;
      const result = await this.db?.run(sql, ...params);
      
      return result?.changes ? result.changes > 0 : false;
    } catch (error) {
      console.error(`更新${this.tableName}记录时出错:`, error);
      throw error;
    }
  }

  // 根据条件删除实体
  public async deleteWhere(whereClause: string, whereParams: any[]): Promise<boolean> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const sql = `DELETE FROM ${this.tableName} WHERE ${whereClause}`;
      const result = await this.db?.run(sql, ...whereParams);
      
      return result?.changes ? result.changes > 0 : false;
    } catch (error) {
      console.error(`删除${this.tableName}记录时出错:`, error);
      throw error;
    }
  }

  // 删除实体
  public async delete(id: number): Promise<boolean> {
    return this.deleteWhere('id = ?', [id]);
  }

  // 批量删除实体
  public async batchDelete(ids: number[]): Promise<boolean> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      // 开始事务
      await this.db?.exec('BEGIN TRANSACTION');
      
      let success = true;
      for (const id of ids) {
        const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
        const result = await this.db?.run(query, id);
        
        if (!result?.changes || result.changes === 0) {
          success = false;
          break;
        }
      }
      
      if (success) {
        await this.db?.exec('COMMIT');
        return true;
      } else {
        await this.db?.exec('ROLLBACK');
        return false;
      }
    } catch (error) {
      console.error(`批量删除${this.tableName}记录时出错:`, error);
      // 出错时回滚事务
      await this.db?.exec('ROLLBACK');
      throw error;
    }
  }

  // 统计实体数量
  public async count(): Promise<number> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
      const result = await this.db?.get<{ count: number }>(query);
      
      return result?.count || 0;
    } catch (error) {
      console.error(`统计${this.tableName}记录数量时出错:`, error);
      throw error;
    }
  }

  // 条件统计
  public async countWhere(whereClause: string, whereParams: any[]): Promise<number> {
    try {
      if (!this.db) await this.initializeDatabase();
      
      const query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE ${whereClause}`;
      const result = await this.db?.get<{ count: number }>(query, ...whereParams);
      
      return result?.count || 0;
    } catch (error) {
      console.error(`条件统计${this.tableName}记录时出错:`, error);
      throw error;
    }
  }

  // 检查实体是否存在
  public async exists(id: number): Promise<boolean> {
    try {
      const count = await this.countWhere('id = ?', [id]);
      return count > 0;
    } catch (error) {
      console.error(`检查${this.tableName}记录存在性时出错:`, error);
      throw error;
    }
  }

  // 条件检查实体是否存在
  public async existsWhere(whereClause: string, whereParams: any[]): Promise<boolean> {
    try {
      const count = await this.countWhere(whereClause, whereParams);
      return count > 0;
    } catch (error) {
      console.error(`条件检查${this.tableName}记录存在性时出错:`, error);
      throw error;
    }
  }
} 