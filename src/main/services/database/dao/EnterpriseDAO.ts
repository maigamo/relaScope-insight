import { Enterprise } from '../entity/Enterprise';
import { ExtendedDAO } from './DAOInterfaces';

/**
 * 企业数据访问接口
 */
export interface EnterpriseDAO extends ExtendedDAO<Enterprise> {
  /**
   * 根据名称查找企业
   * @param name 企业名称
   */
  findByName(name: string): Promise<Enterprise | null>;
  
  /**
   * 模糊查询企业
   * @param keyword 关键词
   */
  searchByKeyword(keyword: string): Promise<Enterprise[]>;
  
  /**
   * 查找一段时间内创建的企业
   * @param startTime 开始时间
   * @param endTime 结束时间
   */
  findByCreationTime(startTime: Date, endTime: Date): Promise<Enterprise[]>;
  
  /**
   * 更新企业Logo
   * @param id 企业ID
   * @param logoPath Logo路径
   */
  updateLogo(id: number, logoPath: string): Promise<boolean>;
} 