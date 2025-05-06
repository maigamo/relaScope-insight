/**
 * 数据访问对象接口
 * 定义了基础的数据库操作方法
 */
export interface DAO<T> {
  /**
   * 根据ID查找单个实体
   * @param id 实体ID
   * @returns 查找到的实体或null
   */
  findById(id: number): Promise<T | null>;
  
  /**
   * 查找所有实体
   * @returns 实体数组
   */
  findAll(): Promise<T[]>;
  
  /**
   * 插入新实体
   * @param entity 要插入的实体(不包含ID)
   * @returns 新插入实体的ID
   */
  insert(entity: Omit<T, 'id'>): Promise<number>;
  
  /**
   * 更新实体
   * @param id 实体ID
   * @param entity 要更新的实体字段
   * @returns 是否更新成功
   */
  update(id: number, entity: Partial<T>): Promise<boolean>;
  
  /**
   * 删除实体
   * @param id 实体ID
   * @returns 是否删除成功
   */
  delete(id: number): Promise<boolean>;
  
  /**
   * 统计实体总数
   * @returns 实体总数
   */
  count(): Promise<number>;
}

/**
 * 扩展数据访问对象接口
 * 提供更丰富的查询和批量操作功能
 */
export interface ExtendedDAO<T> extends DAO<T> {
  /**
   * 按条件查询单个实体
   * @param where WHERE子句
   * @param params 参数数组
   * @returns 查询结果或null
   */
  findOne(where: string, params: any[]): Promise<T | null>;
  
  /**
   * 按条件查询多个实体
   * @param where WHERE子句
   * @param params 参数数组
   * @param options 额外选项(如ORDER BY, LIMIT等)
   * @returns 查询结果数组
   */
  find(where: string, params: any[], options?: string): Promise<T[]>;
  
  /**
   * 分页查询实体
   * @param page 页码(从1开始)
   * @param pageSize 每页大小
   * @returns 查询结果数组
   */
  findAllPaginated(page?: number, pageSize?: number): Promise<T[]>;
  
  /**
   * 按条件更新实体
   * @param entity 要更新的字段
   * @param whereClause WHERE子句
   * @param whereParams WHERE参数数组
   * @returns 是否更新成功
   */
  updateWhere(entity: Partial<T>, whereClause: string, whereParams: any[]): Promise<boolean>;
  
  /**
   * 按条件删除实体
   * @param whereClause WHERE子句
   * @param whereParams WHERE参数数组
   * @returns 是否删除成功
   */
  deleteWhere(whereClause: string, whereParams: any[]): Promise<boolean>;
  
  /**
   * 批量删除实体
   * @param ids ID数组
   * @returns 是否全部删除成功
   */
  batchDelete(ids: number[]): Promise<boolean>;
  
  /**
   * 按条件统计实体数量
   * @param whereClause WHERE子句
   * @param whereParams WHERE参数数组
   * @returns 符合条件的实体数量
   */
  countWhere(whereClause: string, whereParams: any[]): Promise<number>;
  
  /**
   * 检查实体是否存在
   * @param id 实体ID
   * @returns 是否存在
   */
  exists(id: number): Promise<boolean>;
  
  /**
   * 按条件检查实体是否存在
   * @param whereClause WHERE子句
   * @param whereParams WHERE参数数组
   * @returns 是否存在
   */
  existsWhere(whereClause: string, whereParams: any[]): Promise<boolean>;
  
  /**
   * 创建新实体并返回完整实体对象
   * @param entity 要创建的实体(不包含ID)
   * @returns 创建后的完整实体
   */
  create(entity: Omit<T, 'id'>): Promise<T>;
} 