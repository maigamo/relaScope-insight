import { User } from '../entity/User';
import { ExtendedDAO } from './DAOInterfaces';

/**
 * 用户数据访问接口
 */
export interface UserDAO extends ExtendedDAO<User> {
  /**
   * 根据用户名查找用户
   * @param username 用户名
   */
  findByUsername(username: string): Promise<User | null>;
  
  /**
   * 根据邮箱查找用户
   * @param email 邮箱
   */
  findByEmail(email: string): Promise<User | null>;
  
  /**
   * 根据手机号查找用户
   * @param phone 手机号
   */
  findByPhone(phone: string): Promise<User | null>;
  
  /**
   * 查找企业下的所有用户
   * @param enterpriseId 企业ID
   */
  findByEnterpriseId(enterpriseId: number): Promise<User[]>;
  
  /**
   * 更新用户登录时间
   * @param id 用户ID
   */
  updateLastLoginTime(id: number): Promise<boolean>;
  
  /**
   * 更新用户密码
   * @param id 用户ID
   * @param password 新密码（已加密）
   * @param salt 新盐值
   */
  updatePassword(id: number, password: string, salt: string): Promise<boolean>;
  
  /**
   * 更新用户头像
   * @param id 用户ID
   * @param avatarPath 头像路径
   */
  updateAvatar(id: number, avatarPath: string): Promise<boolean>;
} 