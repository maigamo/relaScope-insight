import { Project } from '../entity/Project';
import { ExtendedDAO } from './DAOInterfaces';

/**
 * 项目数据访问接口
 */
export interface ProjectDAO extends ExtendedDAO<Project> {
  /**
   * 查找企业的所有项目
   * @param enterpriseId 企业ID
   */
  findByEnterpriseId(enterpriseId: number): Promise<Project[]>;
  
  /**
   * 查找用户拥有的项目
   * @param ownerId 用户ID
   */
  findByOwnerId(ownerId: number): Promise<Project[]>;
  
  /**
   * 查找用户参与的项目
   * @param userId 用户ID
   */
  findByUserId(userId: number): Promise<Project[]>;
  
  /**
   * 按名称搜索项目
   * @param keyword 关键词
   * @param enterpriseId 企业ID（可选）
   */
  searchByName(keyword: string, enterpriseId?: number): Promise<Project[]>;
  
  /**
   * 更新项目状态
   * @param id 项目ID
   * @param status 项目状态
   */
  updateStatus(id: number, status: number): Promise<boolean>;
  
  /**
   * 更新项目Logo
   * @param id 项目ID
   * @param logoPath Logo路径
   */
  updateLogo(id: number, logoPath: string): Promise<boolean>;
} 