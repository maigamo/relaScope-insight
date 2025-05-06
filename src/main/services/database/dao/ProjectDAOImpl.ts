import { Project } from '../entity/Project';
import { BaseDAO } from './BaseDAOImpl';
import { ProjectDAO } from './ProjectDAO';

/**
 * 项目数据访问实现类
 */
export class ProjectDAOImpl extends BaseDAO<Project> implements ProjectDAO {
  private static instance: ProjectDAOImpl;

  private constructor() {
    super('projects');
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ProjectDAOImpl {
    if (!ProjectDAOImpl.instance) {
      ProjectDAOImpl.instance = new ProjectDAOImpl();
    }
    return ProjectDAOImpl.instance;
  }

  /**
   * 创建项目
   * @param entity 项目实体
   */
  public async create(entity: Omit<Project, 'id'>): Promise<Project> {
    try {
      const now = new Date().toISOString();
      const projectData: Omit<Project, 'id'> = {
        ...entity,
        createdTime: entity.createdTime || now,
        updatedTime: entity.updatedTime || now
      };

      const id = await this.insert(projectData);
      return { ...projectData, id } as Project;
    } catch (error) {
      console.error('创建项目失败:', error);
      throw error;
    }
  }

  /**
   * 查找企业的所有项目
   * @param enterpriseId 企业ID
   */
  public async findByEnterpriseId(enterpriseId: number): Promise<Project[]> {
    return this.find('enterprise_id = ?', [enterpriseId]);
  }

  /**
   * 查找用户拥有的项目
   * @param ownerId 用户ID
   */
  public async findByOwnerId(ownerId: number): Promise<Project[]> {
    return this.find('owner_id = ?', [ownerId]);
  }

  /**
   * 查找用户参与的项目
   * @param userId 用户ID
   */
  public async findByUserId(userId: number): Promise<Project[]> {
    if (!this.db) await this.initializeDatabase();
    
    const query = `
      SELECT p.* FROM projects p
      INNER JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = ?
      UNION
      SELECT p.* FROM projects p
      WHERE p.owner_id = ?
    `;
    
    const results = await this.db?.all<Project[]>(query, userId, userId);
    return results || [];
  }

  /**
   * 按名称搜索项目
   * @param keyword 关键词
   * @param enterpriseId 企业ID（可选）
   */
  public async searchByName(keyword: string, enterpriseId?: number): Promise<Project[]> {
    const searchParam = `%${keyword}%`;
    
    if (enterpriseId) {
      return this.find('name LIKE ? AND enterprise_id = ?', [searchParam, enterpriseId]);
    }
    
    return this.find('name LIKE ?', [searchParam]);
  }

  /**
   * 更新项目状态
   * @param id 项目ID
   * @param status 项目状态
   */
  public async updateStatus(id: number, status: number): Promise<boolean> {
    return this.update(id, {
      status,
      updatedTime: new Date().toISOString()
    });
  }

  /**
   * 更新项目Logo
   * @param id 项目ID
   * @param logoPath Logo路径
   */
  public async updateLogo(id: number, logoPath: string): Promise<boolean> {
    return this.update(id, {
      logoPath,
      updatedTime: new Date().toISOString()
    });
  }
} 