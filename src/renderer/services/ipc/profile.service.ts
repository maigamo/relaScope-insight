import { Profile } from '../../../common/types/database';
import { ipcService } from './core';
import { PROFILE_CHANNELS } from './channels';

/**
 * 档案服务 - 提供档案的增删改查等功能
 */
export const ProfileService = {
  /**
   * 创建新档案
   * @param profile 档案数据
   */
  async createProfile(profile: Profile): Promise<Profile> {
    try {
      return await ipcService.invoke<Profile>(PROFILE_CHANNELS.CREATE, profile);
    } catch (error) {
      console.error('创建档案失败:', error);
      throw error;
    }
  },
  
  /**
   * 更新档案
   * @param profile 档案数据
   */
  async updateProfile(profile: Profile): Promise<boolean> {
    try {
      return await ipcService.invoke<boolean>(PROFILE_CHANNELS.UPDATE, profile);
    } catch (error) {
      console.error('更新档案失败:', error);
      return false;
    }
  },
  
  /**
   * 获取所有档案
   */
  async getAllProfiles(): Promise<Profile[]> {
    try {
      return await ipcService.invoke<Profile[]>(PROFILE_CHANNELS.GET_ALL);
    } catch (error) {
      console.error('获取所有档案失败:', error);
      return [];
    }
  },
  
  /**
   * 根据ID获取档案
   * @param id 档案ID
   */
  async getProfileById(id: number): Promise<Profile | null> {
    try {
      return await ipcService.invoke<Profile | null>(PROFILE_CHANNELS.GET_BY_ID, id);
    } catch (error) {
      console.error(`获取档案(ID=${id})失败:`, error);
      return null;
    }
  },
  
  /**
   * 删除档案
   * @param id 档案ID
   */
  async deleteProfile(id: number): Promise<boolean> {
    try {
      return await ipcService.invoke<boolean>(PROFILE_CHANNELS.DELETE, id);
    } catch (error) {
      console.error(`删除档案(ID=${id})失败:`, error);
      return false;
    }
  },
  
  /**
   * 获取最近的档案
   * @param limit 限制数量
   */
  async getRecentProfiles(limit: number = 10): Promise<Profile[]> {
    try {
      return await ipcService.invoke<Profile[]>(PROFILE_CHANNELS.GET_RECENT, limit);
    } catch (error) {
      console.error('获取最近档案失败:', error);
      return [];
    }
  }
};