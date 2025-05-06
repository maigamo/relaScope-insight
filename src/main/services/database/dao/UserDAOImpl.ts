import { User } from '../entity/User';
import { BaseDAO } from './BaseDAOImpl';
import { UserDAO } from './UserDAO';

/**
 * 用户数据访问实现类
 */
export class UserDAOImpl extends BaseDAO<User> implements UserDAO {
  private static instance: UserDAOImpl;

  private constructor() {
    super('users');
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): UserDAOImpl {
    if (!UserDAOImpl.instance) {
      UserDAOImpl.instance = new UserDAOImpl();
    }
    return UserDAOImpl.instance;
  }

  /**
   * 创建用户
   * @param entity 用户实体
   */
  public async create(entity: Omit<User, 'id'>): Promise<User> {
    try {
      const now = new Date().toISOString();
      const userData: Omit<User, 'id'> = {
        ...entity,
        createdTime: entity.createdTime || now,
        updatedTime: entity.updatedTime || now
      };

      const id = await this.insert(userData);
      return { ...userData, id } as User;
    } catch (error) {
      console.error('创建用户失败:', error);
      throw error;
    }
  }

  /**
   * 根据用户名查找用户
   * @param username 用户名
   */
  public async findByUsername(username: string): Promise<User | null> {
    return this.findOne('username = ?', [username]);
  }

  /**
   * 根据邮箱查找用户
   * @param email 邮箱
   */
  public async findByEmail(email: string): Promise<User | null> {
    return this.findOne('email = ?', [email]);
  }

  /**
   * 根据手机号查找用户
   * @param phone 手机号
   */
  public async findByPhone(phone: string): Promise<User | null> {
    return this.findOne('phone = ?', [phone]);
  }

  /**
   * 查找企业下的所有用户
   * @param enterpriseId 企业ID
   */
  public async findByEnterpriseId(enterpriseId: number): Promise<User[]> {
    return this.find('enterprise_id = ?', [enterpriseId]);
  }

  /**
   * 更新用户登录时间
   * @param id 用户ID
   */
  public async updateLastLoginTime(id: number): Promise<boolean> {
    const now = new Date().toISOString();
    return this.update(id, {
      lastLoginTime: now,
      updatedTime: now
    });
  }

  /**
   * 更新用户密码
   * @param id 用户ID
   * @param password 新密码（已加密）
   * @param salt 新盐值
   */
  public async updatePassword(id: number, password: string, salt: string): Promise<boolean> {
    return this.update(id, {
      password,
      salt,
      updatedTime: new Date().toISOString()
    });
  }

  /**
   * 更新用户头像
   * @param id 用户ID
   * @param avatarPath 头像路径
   */
  public async updateAvatar(id: number, avatarPath: string): Promise<boolean> {
    return this.update(id, {
      avatar: avatarPath,
      updatedTime: new Date().toISOString()
    });
  }
} 