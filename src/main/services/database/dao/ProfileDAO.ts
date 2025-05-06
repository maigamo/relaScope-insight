import { Profile } from '../entity/Profile';

/**
 * ProfileDAO 接口
 * 定义对个人信息表的操作方法
 */
export interface ProfileDAO {
  /**
   * 创建个人信息
   * @param profile 个人信息对象
   * @returns 返回创建的个人信息对象
   */
  create(profile: Omit<Profile, 'id'>): Promise<Profile>;

  /**
   * 更新个人信息
   * @param id 个人信息ID
   * @param profile 个人信息对象的部分属性
   * @returns 返回更新结果
   */
  update(id: number, profile: Partial<Profile>): Promise<boolean>;

  /**
   * 根据ID删除个人信息
   * @param id 个人信息ID
   * @returns 返回删除结果
   */
  delete(id: number): Promise<boolean>;

  /**
   * 根据ID查找个人信息
   * @param id 个人信息ID
   * @returns 返回个人信息对象
   */
  findById(id: number): Promise<Profile | null>;

  /**
   * 获取所有个人信息
   * @returns 返回个人信息列表
   */
  findAll(): Promise<Profile[]>;

  /**
   * 根据名称搜索个人信息
   * @param name 名称关键字
   * @returns 返回匹配的个人信息列表
   */
  searchByName(name: string): Promise<Profile[]>;

  /**
   * 根据职业搜索个人信息
   * @param occupation 职业关键字
   * @returns 返回匹配的个人信息列表
   */
  searchByOccupation(occupation: string): Promise<Profile[]>;

  /**
   * 根据兴趣爱好搜索个人信息
   * @param interest 兴趣爱好关键字
   * @returns 返回匹配的个人信息列表
   */
  searchByInterest(interest: string): Promise<Profile[]>;

  /**
   * 综合搜索个人信息
   * @param keyword 搜索关键字
   * @returns 匹配的个人信息列表
   */
  search(keyword: string): Promise<Profile[]>;

  /**
   * 获取最近创建的个人信息
   * @param limit 限制条数
   * @returns 个人信息列表
   */
  getRecent(limit?: number): Promise<Profile[]>;

  /**
   * 创建个人信息表
   * @returns 返回创建结果
   */
  createTable(): Promise<void>;
} 