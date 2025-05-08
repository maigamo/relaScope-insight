import { Experience } from '../../../common/types/database';
import { ipcService } from './core';
import { EXPERIENCE_CHANNELS } from './channels';

/**
 * 经历服务 - 提供经历记录的增删改查等功能
 */
export const ExperienceService = {
  /**
   * 创建新经历记录
   * @param experience 经历数据
   */
  async createExperience(experience: Experience): Promise<Experience> {
    try {
      return await ipcService.invoke<Experience>(EXPERIENCE_CHANNELS.CREATE, experience);
    } catch (error) {
      console.error('创建经历记录失败:', error);
      throw error;
    }
  },
  
  /**
   * 更新经历记录
   * @param experience 经历数据
   */
  async updateExperience(experience: Experience): Promise<boolean> {
    try {
      return await ipcService.invoke<boolean>(EXPERIENCE_CHANNELS.UPDATE, experience);
    } catch (error) {
      console.error('更新经历记录失败:', error);
      return false;
    }
  },
  
  /**
   * 根据档案ID获取经历记录
   * @param profileId 档案ID
   */
  async getExperiencesByProfileId(profileId: number): Promise<Experience[]> {
    try {
      return await ipcService.invoke<Experience[]>(EXPERIENCE_CHANNELS.GET_BY_PROFILE, profileId);
    } catch (error) {
      console.error(`获取档案(ID=${profileId})的经历记录失败:`, error);
      return [];
    }
  },
  
  /**
   * 删除经历记录
   * @param id 经历ID
   */
  async deleteExperience(id: number): Promise<boolean> {
    try {
      return await ipcService.invoke<boolean>(EXPERIENCE_CHANNELS.DELETE, id);
    } catch (error) {
      console.error(`删除经历记录(ID=${id})失败:`, error);
      return false;
    }
  },
  
  /**
   * 获取最近的经历记录
   * @param limit 限制数量
   */
  async getRecentExperiences(limit: number = 10): Promise<Experience[]> {
    try {
      return await ipcService.invoke<Experience[]>(EXPERIENCE_CHANNELS.GET_RECENT, limit);
    } catch (error) {
      console.error('获取最近经历记录失败:', error);
      return [];
    }
  }
}; 