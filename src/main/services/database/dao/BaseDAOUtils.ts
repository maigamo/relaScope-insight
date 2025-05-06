/**
 * 数据库辅助工具类
 * 包含命名转换、SQL生成等工具方法
 */
export class BaseDAOUtils {
  /**
   * 生成更新SQL
   * @param tableName 表名
   * @param entity 实体对象
   * @param whereClause WHERE子句，默认为"id = ?"
   * @returns SQL语句和参数数组
   */
  public static generateUpdateSQL(tableName: string, entity: Partial<any>, whereClause: string = "id = ?"): { sql: string, params: any[] } {
    const keys = Object.keys(entity);
    const setClauses = keys.map(key => `${BaseDAOUtils.camelToSnake(key)} = ?`).join(', ');
    const params = keys.map(key => entity[key]);
    
    const sql = `UPDATE ${tableName} SET ${setClauses} WHERE ${whereClause}`;
    
    return { sql, params };
  }

  /**
   * 生成插入数据的SQL参数
   * @param entity 实体对象
   * @returns 列名、占位符和值数组
   */
  public static generateInsertData(entity: Record<string, any>): { columns: string, placeholders: string, values: any[] } {
    const keys = Object.keys(entity);
    const columns = keys.map(key => BaseDAOUtils.camelToSnake(key)).join(', ');
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map(key => entity[key]);
    
    return { columns, placeholders, values };
  }

  /**
   * 驼峰命名转蛇形命名
   * @param str 输入字符串
   * @returns 转换后的字符串
   */
  public static camelToSnake(str: string): string {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  /**
   * 蛇形命名转驼峰命名
   * @param str 输入字符串
   * @returns 转换后的字符串
   */
  public static snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * 转换对象字段为驼峰命名
   * @param obj 输入对象
   * @returns 转换后的对象
   */
  public static convertToCamelCase<T>(obj: any): T {
    if (!obj) return obj;
    
    const result: any = {};
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = BaseDAOUtils.snakeToCamel(key);
        result[camelKey] = obj[key];
      }
    }
    
    return result as T;
  }

  /**
   * 转换对象字段为蛇形命名
   * @param obj 输入对象
   * @returns 转换后的对象
   */
  public static convertToSnakeCase<T>(obj: any): T {
    if (!obj) return obj;
    
    const result: any = {};
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = BaseDAOUtils.camelToSnake(key);
        result[snakeKey] = obj[key];
      }
    }
    
    return result as T;
  }

  /**
   * 生成查询条件子句
   * @param conditions 条件映射对象
   * @returns 条件子句和参数数组
   */
  public static generateWhereClause(conditions: Record<string, any>): { whereClause: string, params: any[] } {
    const keys = Object.keys(conditions);
    const clauses = keys.map(key => `${BaseDAOUtils.camelToSnake(key)} = ?`);
    const params = keys.map(key => conditions[key]);
    
    return {
      whereClause: clauses.join(' AND '),
      params
    };
  }

  /**
   * 生成模糊查询条件子句
   * @param field 字段名
   * @param value 查询值
   * @returns 条件子句和参数
   */
  public static generateLikeClause(field: string, value: string): { clause: string, param: string } {
    return {
      clause: `${BaseDAOUtils.camelToSnake(field)} LIKE ?`,
      param: `%${value}%`
    };
  }
} 