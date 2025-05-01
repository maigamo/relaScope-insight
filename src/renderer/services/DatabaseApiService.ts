import { ipcRenderer } from 'electron';
import { 
  DatabaseConfig, 
  Profile, 
  Quote, 
  Experience, 
  Analysis, 
  HexagonModel 
} from '../../common/types/database';

// IPC通道名称
// 注意：这些通道名需要和主进程中的DatabaseIpcHandler中定义的一致
const channels = {
  // 数据库操作
  DB_INITIALIZE: 'db:initialize',
  DB_CREATE_BACKUP: 'db:create-backup',
  DB_RESTORE_BACKUP: 'db:restore-backup',
  DB_GET_BACKUP_FILES: 'db:get-backup-files',
  
  // Profile操作
  PROFILE_CREATE: 'profile:create',
  PROFILE_UPDATE: 'profile:update',
  PROFILE_GET_ALL: 'profile:get-all',
  PROFILE_GET_BY_ID: 'profile:get-by-id',
  PROFILE_DELETE: 'profile:delete',
  PROFILE_GET_RECENT: 'profile:get-recent',
  
  // Quote操作
  QUOTE_CREATE: 'quote:create',
  QUOTE_UPDATE: 'quote:update',
  QUOTE_GET_BY_PROFILE: 'quote:get-by-profile',
  QUOTE_DELETE: 'quote:delete',
  QUOTE_GET_RECENT: 'quote:get-recent',
  
  // Experience操作
  EXPERIENCE_CREATE: 'experience:create',
  EXPERIENCE_UPDATE: 'experience:update',
  EXPERIENCE_GET_BY_PROFILE: 'experience:get-by-profile',
  EXPERIENCE_DELETE: 'experience:delete',
  EXPERIENCE_GET_RECENT: 'experience:get-recent',
  
  // Analysis操作
  ANALYSIS_CREATE: 'analysis:create',
  ANALYSIS_UPDATE: 'analysis:update',
  ANALYSIS_GET_BY_PROFILE: 'analysis:get-by-profile',
  ANALYSIS_GET_RECENT: 'analysis:get-recent',
  ANALYSIS_GET_STATS: 'analysis:get-stats',
  
  // HexagonModel操作
  HEXAGON_CREATE: 'hexagon:create',
  HEXAGON_UPDATE: 'hexagon:update',
  HEXAGON_GET_BY_PROFILE: 'hexagon:get-by-profile',
  HEXAGON_GET_LATEST: 'hexagon:get-latest',
  HEXAGON_GET_RECENT: 'hexagon:get-recent',
  HEXAGON_GET_AVERAGE: 'hexagon:get-average',
  HEXAGON_COMPARE: 'hexagon:compare'
};

/**
 * 数据库API服务
 * 渲染进程通过该服务调用主进程的数据库操作
 */
export class DatabaseApiService {
  private static instance: DatabaseApiService | null = null;

  // 获取单例实例
  public static getInstance(): DatabaseApiService {
    if (!DatabaseApiService.instance) {
      DatabaseApiService.instance = new DatabaseApiService();
    }
    return DatabaseApiService.instance;
  }

  private constructor() {
    console.log('DatabaseApiService 初始化');
  }

  // 数据库操作 API
  public async initialize(config?: Partial<DatabaseConfig>): Promise<void> {
    return ipcRenderer.invoke(channels.DB_INITIALIZE, config);
  }

  public async createBackup(): Promise<string> {
    return ipcRenderer.invoke(channels.DB_CREATE_BACKUP);
  }

  public async restoreFromBackup(backupPath: string): Promise<void> {
    return ipcRenderer.invoke(channels.DB_RESTORE_BACKUP, backupPath);
  }

  public async getBackupFiles(): Promise<Array<{ path: string; date: Date; size: number }>> {
    return ipcRenderer.invoke(channels.DB_GET_BACKUP_FILES);
  }

  // Profile 相关 API
  public async createProfile(profile: Profile): Promise<Profile> {
    return ipcRenderer.invoke(channels.PROFILE_CREATE, profile);
  }

  public async updateProfile(profile: Profile): Promise<boolean> {
    return ipcRenderer.invoke(channels.PROFILE_UPDATE, profile);
  }

  public async getAllProfiles(): Promise<Profile[]> {
    return ipcRenderer.invoke(channels.PROFILE_GET_ALL);
  }

  public async getProfileById(id: number): Promise<Profile | null> {
    return ipcRenderer.invoke(channels.PROFILE_GET_BY_ID, id);
  }

  public async deleteProfile(id: number): Promise<boolean> {
    return ipcRenderer.invoke(channels.PROFILE_DELETE, id);
  }

  public async getRecentProfiles(limit: number): Promise<Profile[]> {
    return ipcRenderer.invoke(channels.PROFILE_GET_RECENT, limit);
  }

  // Quote 相关 API
  public async createQuote(quote: Quote): Promise<Quote> {
    return ipcRenderer.invoke(channels.QUOTE_CREATE, quote);
  }

  public async updateQuote(quote: Quote): Promise<boolean> {
    return ipcRenderer.invoke(channels.QUOTE_UPDATE, quote);
  }

  public async getQuotesByProfileId(profileId: number): Promise<Quote[]> {
    return ipcRenderer.invoke(channels.QUOTE_GET_BY_PROFILE, profileId);
  }

  public async deleteQuote(id: number): Promise<boolean> {
    return ipcRenderer.invoke(channels.QUOTE_DELETE, id);
  }

  public async getRecentQuotes(limit: number): Promise<Quote[]> {
    return ipcRenderer.invoke(channels.QUOTE_GET_RECENT, limit);
  }

  // Experience 相关 API
  public async createExperience(experience: Experience): Promise<Experience> {
    return ipcRenderer.invoke(channels.EXPERIENCE_CREATE, experience);
  }

  public async updateExperience(experience: Experience): Promise<boolean> {
    return ipcRenderer.invoke(channels.EXPERIENCE_UPDATE, experience);
  }

  public async getExperiencesByProfileId(profileId: number): Promise<Experience[]> {
    return ipcRenderer.invoke(channels.EXPERIENCE_GET_BY_PROFILE, profileId);
  }

  public async deleteExperience(id: number): Promise<boolean> {
    return ipcRenderer.invoke(channels.EXPERIENCE_DELETE, id);
  }

  public async getRecentExperiences(limit: number): Promise<Experience[]> {
    return ipcRenderer.invoke(channels.EXPERIENCE_GET_RECENT, limit);
  }

  // Analysis 相关 API
  public async createAnalysis(analysis: Analysis): Promise<Analysis> {
    return ipcRenderer.invoke(channels.ANALYSIS_CREATE, analysis);
  }

  public async updateAnalysis(analysis: Analysis): Promise<boolean> {
    return ipcRenderer.invoke(channels.ANALYSIS_UPDATE, analysis);
  }

  public async getAnalysesByProfileId(profileId: number): Promise<Analysis[]> {
    return ipcRenderer.invoke(channels.ANALYSIS_GET_BY_PROFILE, profileId);
  }

  public async getRecentAnalyses(limit: number): Promise<Analysis[]> {
    return ipcRenderer.invoke(channels.ANALYSIS_GET_RECENT, limit);
  }

  public async getAnalysisTypeStats(): Promise<{ type: string; count: number }[]> {
    return ipcRenderer.invoke(channels.ANALYSIS_GET_STATS);
  }

  // HexagonModel 相关 API
  public async createHexagonModel(model: HexagonModel): Promise<HexagonModel> {
    return ipcRenderer.invoke(channels.HEXAGON_CREATE, model);
  }

  public async updateHexagonModel(model: HexagonModel): Promise<boolean> {
    return ipcRenderer.invoke(channels.HEXAGON_UPDATE, model);
  }

  public async getHexagonModelsByProfileId(profileId: number): Promise<HexagonModel[]> {
    return ipcRenderer.invoke(channels.HEXAGON_GET_BY_PROFILE, profileId);
  }

  public async getLatestHexagonModel(profileId: number): Promise<HexagonModel | null> {
    return ipcRenderer.invoke(channels.HEXAGON_GET_LATEST, profileId);
  }

  public async getRecentHexagonModels(limit: number): Promise<HexagonModel[]> {
    return ipcRenderer.invoke(channels.HEXAGON_GET_RECENT, limit);
  }

  public async getAverageHexagonDimensions(): Promise<{ [key: string]: number }> {
    return ipcRenderer.invoke(channels.HEXAGON_GET_AVERAGE);
  }

  public async compareHexagonModels(id1: number, id2: number): Promise<{ 
    differences: { [key: string]: { value1: number; value2: number; difference: number } };
    timeGap: number;
  }> {
    return ipcRenderer.invoke(channels.HEXAGON_COMPARE, id1, id2);
  }
} 