import { ProjectMember } from '../entity/ProjectMember';
import { BaseDAO } from './BaseDAOImpl';
import { ProjectMemberDAO } from './ProjectMemberDAO';

/**
 * 项目成员数据访问实现类
 */
export class ProjectMemberDAOImpl extends BaseDAO<ProjectMember> implements ProjectMemberDAO {
  private static instance: ProjectMemberDAOImpl;

  private constructor() {
    super('project_members');
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ProjectMemberDAOImpl {
    if (!ProjectMemberDAOImpl.instance) {
      ProjectMemberDAOImpl.instance = new ProjectMemberDAOImpl();
    }
    return ProjectMemberDAOImpl.instance;
  }

  /**
   * 创建项目成员
   * @param entity 项目成员实体
   */
  public async create(entity: Omit<ProjectMember, 'id'>): Promise<ProjectMember> {
    try {
      const now = new Date().toISOString();
      const memberData: Omit<ProjectMember, 'id'> = {
        ...entity,
        createdTime: entity.createdTime || now,
        updatedTime: entity.updatedTime || now
      };

      const id = await this.insert(memberData);
      return { ...memberData, id } as ProjectMember;
    } catch (error) {
      console.error('创建项目成员失败:', error);
      throw error;
    }
  }

  /**
   * 查找项目的所有成员
   * @param projectId 项目ID
   */
  public async findByProjectId(projectId: number): Promise<ProjectMember[]> {
    return this.find('project_id = ?', [projectId]);
  }

  /**
   * 查找用户加入的所有项目成员关系
   * @param userId 用户ID
   */
  public async findByUserId(userId: number): Promise<ProjectMember[]> {
    return this.find('user_id = ?', [userId]);
  }

  /**
   * 查找用户在项目中的角色
   * @param projectId 项目ID
   * @param userId 用户ID
   */
  public async findMemberRole(projectId: number, userId: number): Promise<number | null> {
    const member = await this.findOne('project_id = ? AND user_id = ?', [projectId, userId]);
    return member ? member.role : null;
  }

  /**
   * 更新成员角色
   * @param projectId 项目ID
   * @param userId 用户ID
   * @param role 新角色
   */
  public async updateRole(projectId: number, userId: number, role: number): Promise<boolean> {
    const now = new Date().toISOString();
    return this.updateWhere(
      { role, updatedTime: now },
      'project_id = ? AND user_id = ?',
      [projectId, userId]
    );
  }

  /**
   * 检查用户是否是项目成员
   * @param projectId 项目ID
   * @param userId 用户ID
   */
  public async isMember(projectId: number, userId: number): Promise<boolean> {
    return this.existsWhere('project_id = ? AND user_id = ?', [projectId, userId]);
  }

  /**
   * 删除项目成员
   * @param projectId 项目ID
   * @param userId 用户ID
   */
  public async removeMember(projectId: number, userId: number): Promise<boolean> {
    return this.deleteWhere('project_id = ? AND user_id = ?', [projectId, userId]);
  }
} 