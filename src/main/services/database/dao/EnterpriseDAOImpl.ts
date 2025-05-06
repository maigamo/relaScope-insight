import { Enterprise } from '../entity/Enterprise';
import { BaseDAO } from './BaseDAOImpl';
import { EnterpriseDAO } from './EnterpriseDAO';

/**
 * 企业数据访问实现类
 */
export class EnterpriseDAOImpl extends BaseDAO<Enterprise> implements EnterpriseDAO {
  private static instance: EnterpriseDAOImpl;

  private constructor() {
    super('enterprises');
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): EnterpriseDAOImpl {
    if (!EnterpriseDAOImpl.instance) {
      EnterpriseDAOImpl.instance = new EnterpriseDAOImpl();
    }
    return EnterpriseDAOImpl.instance;
  }

  /**
   * 创建企业
   * @param entity 企业实体
   */
  public async create(entity: Omit<Enterprise, 'id'>): Promise<Enterprise> {
    try {
      const now = new Date().toISOString();
      const enterpriseData: Omit<Enterprise, 'id'> = {
        ...entity,
        createdTime: entity.createdTime || now,
        updatedTime: entity.updatedTime || now
      };

      const id = await this.insert(enterpriseData);
      return { ...enterpriseData, id } as Enterprise;
    } catch (error) {
      console.error('创建企业失败:', error);
      throw error;
    }
  }

  /**
   * 根据名称查找企业
   * @param name 企业名称
   */
  public async findByName(name: string): Promise<Enterprise | null> {
    return this.findOne('name = ?', [name]);
  }

  /**
   * 模糊查询企业
   * @param keyword 关键词
   */
  public async searchByKeyword(keyword: string): Promise<Enterprise[]> {
    const searchParam = `%${keyword}%`;
    return this.find('name LIKE ? OR description LIKE ? OR contact_person LIKE ?', 
      [searchParam, searchParam, searchParam]);
  }

  /**
   * 查找一段时间内创建的企业
   * @param startTime 开始时间
   * @param endTime 结束时间
   */
  public async findByCreationTime(startTime: Date, endTime: Date): Promise<Enterprise[]> {
    const start = startTime.toISOString();
    const end = endTime.toISOString();
    return this.find('created_time >= ? AND created_time <= ?', [start, end]);
  }

  /**
   * 更新企业Logo
   * @param id 企业ID
   * @param logoPath Logo路径
   */
  public async updateLogo(id: number, logoPath: string): Promise<boolean> {
    return this.update(id, { 
      logoPath, 
      updatedTime: new Date().toISOString() 
    });
  }
} 