import { ProjectMember } from '../entity/ProjectMember';
import { ExtendedDAO } from './DAOInterfaces';

/**
 * 项目成员数据访问接口
 */
export interface ProjectMemberDAO extends ExtendedDAO<ProjectMember> {
  /**
   * 查找项目的所有成员
   * @param projectId 项目ID
   */
  findByProjectId(projectId: number): Promise<ProjectMember[]>;
  
  /**
   * 查找用户加入的所有项目成员关系
   * @param userId 用户ID
   */
  findByUserId(userId: number): Promise<ProjectMember[]>;
  
  /**
   * 查找用户在项目中的角色
   * @param projectId 项目ID
   * @param userId 用户ID
   */
  findMemberRole(projectId: number, userId: number): Promise<number | null>;
  
  /**
   * 更新成员角色
   * @param projectId 项目ID
   * @param userId 用户ID
   * @param role 新角色
   */
  updateRole(projectId: number, userId: number, role: number): Promise<boolean>;
  
  /**
   * 检查用户是否是项目成员
   * @param projectId 项目ID
   * @param userId 用户ID
   */
  isMember(projectId: number, userId: number): Promise<boolean>;
  
  /**
   * 删除项目成员
   * @param projectId 项目ID
   * @param userId 用户ID
   */
  removeMember(projectId: number, userId: number): Promise<boolean>;
} 