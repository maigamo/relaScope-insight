/**
 * 数据库API服务
 * 处理与主进程数据库服务的所有通信
 */
import * as channels from '../../common/constants/ipcChannels';
import { 
  Profile, 
  Quote, 
  Experience, 
  Analysis, 
  HexagonModel,
  HexagonCompareResult,
  DBConfig,
  ProfileCreateOptions,
  HexagonStats
} from '../../common/types/database';

// 使用预加载脚本中注入的IPC渲染器
const ipc = (window as any).electron?.ipcRenderer || {
  invoke: (...args: any[]) => {
    console.error('IPC not available:', args);
    return Promise.reject(new Error('IPC not available'));
  }
};

/**
 * 数据库API服务类
 * 单例模式实现
 */
class DatabaseApiService {
  private static instance: DatabaseApiService;

  private constructor() {
    // 初始化
  }

  /**
   * 获取DatabaseApiService实例
   */
  public static getInstance(): DatabaseApiService {
    if (!DatabaseApiService.instance) {
      DatabaseApiService.instance = new DatabaseApiService();
    }
    return DatabaseApiService.instance;
  }

  /**
   * 初始化数据库
   * @param config 数据库配置
   */
  public async initializeDatabase(config?: DBConfig): Promise<boolean> {
    try {
      return ipc.invoke(channels.DB_INITIALIZE, config);
    } catch (error) {
      console.error('初始化数据库失败:', error);
      return false;
    }
  }

  /**
   * 创建数据库备份
   */
  public async createBackup(): Promise<string | null> {
    try {
      return ipc.invoke(channels.DB_CREATE_BACKUP);
    } catch (error) {
      console.error('创建数据库备份失败:', error);
      return null;
    }
  }

  /**
   * 从备份恢复数据库
   * @param backupPath 备份文件路径
   */
  public async restoreFromBackup(backupPath: string): Promise<boolean> {
    try {
      return ipc.invoke(channels.DB_RESTORE_BACKUP, backupPath);
    } catch (error) {
      console.error('从备份恢复数据库失败:', error);
      return false;
    }
  }

  /**
   * 获取备份文件列表
   */
  public async getBackupFiles(): Promise<string[]> {
    try {
      return ipc.invoke(channels.DB_GET_BACKUP_FILES);
    } catch (error) {
      console.error('获取备份文件列表失败:', error);
      return [];
    }
  }

  /**
   * 创建个人资料
   */
  public async createProfile(profile: ProfileCreateOptions): Promise<Profile | null> {
    try {
      return ipc.invoke(channels.PROFILE_CREATE, profile);
    } catch (error) {
      console.error('创建个人资料失败:', error);
      return null;
    }
  }

  /**
   * 更新个人资料
   */
  public async updateProfile(profile: Profile): Promise<boolean> {
    try {
      return ipc.invoke(channels.PROFILE_UPDATE, profile);
    } catch (error) {
      console.error('更新个人资料失败:', error);
      return false;
    }
  }

  /**
   * 获取所有个人资料
   */
  public async getAllProfiles(): Promise<Profile[]> {
    try {
      return ipc.invoke(channels.PROFILE_GET_ALL);
    } catch (error) {
      console.error('获取所有个人资料失败:', error);
      return [];
    }
  }

  /**
   * 根据ID获取个人资料
   */
  public async getProfileById(id: number): Promise<Profile | null> {
    try {
      return ipc.invoke(channels.PROFILE_GET_BY_ID, id);
    } catch (error) {
      console.error(`获取ID为 ${id} 的个人资料失败:`, error);
      return null;
    }
  }

  /**
   * 删除个人资料
   */
  public async deleteProfile(id: number): Promise<boolean> {
    try {
      return ipc.invoke(channels.PROFILE_DELETE, id);
    } catch (error) {
      console.error(`删除ID为 ${id} 的个人资料失败:`, error);
      return false;
    }
  }

  /**
   * 获取最近更新的个人资料
   */
  public async getRecentProfiles(limit: number = 10): Promise<Profile[]> {
    try {
      return ipc.invoke(channels.PROFILE_GET_RECENT, limit);
    } catch (error) {
      console.error('获取最近个人资料失败:', error);
      return [];
    }
  }

  /**
   * 创建引用
   */
  public async createQuote(quote: Omit<Quote, 'id'>): Promise<Quote | null> {
    try {
      return ipc.invoke(channels.QUOTE_CREATE, quote);
    } catch (error) {
      console.error('创建引用失败:', error);
      return null;
    }
  }

  /**
   * 更新引用
   */
  public async updateQuote(quote: Quote): Promise<boolean> {
    try {
      return ipc.invoke(channels.QUOTE_UPDATE, quote);
    } catch (error) {
      console.error('更新引用失败:', error);
      return false;
    }
  }

  /**
   * 获取指定个人资料的所有引用
   */
  public async getQuotesByProfile(profileId: number): Promise<Quote[]> {
    try {
      return ipc.invoke(channels.QUOTE_GET_BY_PROFILE, profileId);
    } catch (error) {
      console.error(`获取个人资料ID ${profileId} 的引用失败:`, error);
      return [];
    }
  }

  /**
   * 删除引用
   */
  public async deleteQuote(id: number): Promise<boolean> {
    try {
      return ipc.invoke(channels.QUOTE_DELETE, id);
    } catch (error) {
      console.error(`删除ID为 ${id} 的引用失败:`, error);
      return false;
    }
  }

  /**
   * 获取最近的引用
   */
  public async getRecentQuotes(limit: number = 10): Promise<Quote[]> {
    try {
      return ipc.invoke(channels.QUOTE_GET_RECENT, limit);
    } catch (error) {
      console.error('获取最近引用失败:', error);
      return [];
    }
  }

  /**
   * 创建经历
   */
  public async createExperience(experience: Omit<Experience, 'id'>): Promise<Experience | null> {
    try {
      return ipc.invoke(channels.EXPERIENCE_CREATE, experience);
    } catch (error) {
      console.error('创建经历失败:', error);
      return null;
    }
  }

  /**
   * 更新经历
   */
  public async updateExperience(experience: Experience): Promise<boolean> {
    try {
      return ipc.invoke(channels.EXPERIENCE_UPDATE, experience);
    } catch (error) {
      console.error('更新经历失败:', error);
      return false;
    }
  }

  /**
   * 获取指定个人资料的所有经历
   */
  public async getExperiencesByProfile(profileId: number): Promise<Experience[]> {
    try {
      return ipc.invoke(channels.EXPERIENCE_GET_BY_PROFILE, profileId);
    } catch (error) {
      console.error(`获取个人资料ID ${profileId} 的经历失败:`, error);
      return [];
    }
  }

  /**
   * 删除经历
   */
  public async deleteExperience(id: number): Promise<boolean> {
    try {
      return ipc.invoke(channels.EXPERIENCE_DELETE, id);
    } catch (error) {
      console.error(`删除ID为 ${id} 的经历失败:`, error);
      return false;
    }
  }

  /**
   * 获取最近的经历
   */
  public async getRecentExperiences(limit: number = 10): Promise<Experience[]> {
    try {
      return ipc.invoke(channels.EXPERIENCE_GET_RECENT, limit);
    } catch (error) {
      console.error('获取最近经历失败:', error);
      return [];
    }
  }

  /**
   * 创建分析
   */
  public async createAnalysis(analysis: Omit<Analysis, 'id'>): Promise<Analysis | null> {
    try {
      return ipc.invoke(channels.ANALYSIS_CREATE, analysis);
    } catch (error) {
      console.error('创建分析失败:', error);
      return null;
    }
  }

  /**
   * 更新分析
   */
  public async updateAnalysis(analysis: Analysis): Promise<boolean> {
    try {
      return ipc.invoke(channels.ANALYSIS_UPDATE, analysis);
    } catch (error) {
      console.error('更新分析失败:', error);
      return false;
    }
  }

  /**
   * 获取指定个人资料的所有分析
   */
  public async getAnalysesByProfile(profileId: number): Promise<Analysis[]> {
    try {
      return ipc.invoke(channels.ANALYSIS_GET_BY_PROFILE, profileId);
    } catch (error) {
      console.error(`获取个人资料ID ${profileId} 的分析失败:`, error);
      return [];
    }
  }

  /**
   * 获取最近的分析
   */
  public async getRecentAnalyses(limit: number = 10): Promise<Analysis[]> {
    try {
      return ipc.invoke(channels.ANALYSIS_GET_RECENT, limit);
    } catch (error) {
      console.error('获取最近分析失败:', error);
      return [];
    }
  }
  
  /**
   * 获取分析统计信息
   */
  public async getAnalysisStats(): Promise<any> {
    try {
      return ipc.invoke(channels.ANALYSIS_GET_STATS);
    } catch (error) {
      console.error('获取分析统计信息失败:', error);
      return null;
    }
  }

  /**
   * 创建六边形模型
   */
  public async createHexagon(model: Omit<HexagonModel, 'id'>): Promise<HexagonModel | null> {
    try {
      return ipc.invoke(channels.HEXAGON_CREATE, model);
    } catch (error) {
      console.error('创建六边形模型失败:', error);
      return null;
    }
  }

  /**
   * 更新六边形模型
   */
  public async updateHexagon(model: HexagonModel): Promise<boolean> {
    try {
      return ipc.invoke(channels.HEXAGON_UPDATE, model);
    } catch (error) {
      console.error('更新六边形模型失败:', error);
      return false;
    }
  }

  /**
   * 获取指定个人资料的所有六边形模型
   */
  public async getHexagonsByProfile(profileId: number): Promise<HexagonModel[]> {
    try {
      return ipc.invoke(channels.HEXAGON_GET_BY_PROFILE, profileId);
    } catch (error) {
      console.error(`获取个人资料ID ${profileId} 的六边形模型失败:`, error);
      return [];
    }
  }

  /**
   * 获取最新的六边形模型
   */
  public async getLatestHexagon(profileId: number): Promise<HexagonModel | null> {
    try {
      return ipc.invoke(channels.HEXAGON_GET_LATEST, profileId);
    } catch (error) {
      console.error(`获取个人资料ID ${profileId} 的最新六边形模型失败:`, error);
      return null;
    }
  }

  /**
   * 获取最近的六边形模型
   */
  public async getRecentHexagons(limit: number = 10): Promise<HexagonModel[]> {
    try {
      return ipc.invoke(channels.HEXAGON_GET_RECENT, limit);
    } catch (error) {
      console.error('获取最近六边形模型失败:', error);
      return [];
    }
  }

  /**
   * 获取平均六边形统计数据
   */
  public async getAverageHexagon(): Promise<HexagonStats | null> {
    try {
      return ipc.invoke(channels.HEXAGON_GET_AVERAGE);
    } catch (error) {
      console.error('获取平均六边形统计数据失败:', error);
      return null;
    }
  }
  
  /**
   * 比较两个六边形模型
   */
  public async compareHexagons(id1: number, id2: number): Promise<HexagonCompareResult | null> {
    try {
      return ipc.invoke(channels.HEXAGON_COMPARE, id1, id2);
    } catch (error) {
      console.error(`比较六边形模型 ${id1} 和 ${id2} 失败:`, error);
      return null;
    }
  }
}

// 导出单例实例
export default DatabaseApiService.getInstance(); 