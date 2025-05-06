import { DB_CHANNELS } from '../../common/constants/ipc';
import { Profile } from '../../common/types/database';

/**
 * 个人信息服务 - 提供个人信息管理功能
 */
export const ProfileService = {
  /**
   * 获取所有个人信息
   */
  async getAllProfiles(): Promise<Profile[]> {
    try {
      const response = await window.electronAPI.invoke(DB_CHANNELS.PROFILE.GET_ALL);
      
      if (!response.success) {
        console.error(`获取个人信息列表失败: ${response.error}`);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('获取个人信息列表出错:', error);
      return [];
    }
  },
  
  /**
   * 根据ID获取个人信息
   * @param id 个人信息ID
   */
  async getProfileById(id: number): Promise<Profile | null> {
    try {
      const response = await window.electronAPI.invoke(
        DB_CHANNELS.PROFILE.GET_BY_ID, 
        id
      );
      
      if (!response.success) {
        console.error(`获取个人信息详情失败: ${response.error}`);
        return null;
      }
      
      return response.data || null;
    } catch (error) {
      console.error(`获取个人信息(ID:${id})出错:`, error);
      return null;
    }
  },
  
  /**
   * 创建个人信息
   * @param profile 个人信息数据
   */
  async createProfile(profile: Omit<Profile, 'id'>): Promise<Profile> {
    try {
      const response = await window.electronAPI.invoke(
        DB_CHANNELS.PROFILE.CREATE, 
        profile
      );
      
      if (!response.success) {
        console.error(`创建个人信息失败: ${response.error}`);
        throw new Error(response.error || '创建个人信息失败');
      }
      
      if (!response.data) {
        throw new Error('创建个人信息后未返回数据');
      }
      
      return response.data;
    } catch (error) {
      console.error('创建个人信息出错:', error);
      throw error;
    }
  },
  
  /**
   * 更新个人信息
   * @param id 个人信息ID
   * @param profile 个人信息数据
   */
  async updateProfile(id: number, profile: Partial<Profile>): Promise<boolean> {
    try {
      const response = await window.electronAPI.invoke(
        DB_CHANNELS.PROFILE.UPDATE, 
        { id, profile }
      );
      
      if (!response.success) {
        console.error(`更新个人信息失败: ${response.error}`);
        throw new Error(response.error || '更新个人信息失败');
      }
      
      return response.data === true;
    } catch (error) {
      console.error(`更新个人信息(ID:${id})出错:`, error);
      throw error;
    }
  },
  
  /**
   * 删除个人信息
   * @param id 个人信息ID
   */
  async deleteProfile(id: number): Promise<boolean> {
    try {
      const response = await window.electronAPI.invoke(
        DB_CHANNELS.PROFILE.DELETE, 
        id
      );
      
      if (!response.success) {
        console.error(`删除个人信息失败: ${response.error}`);
        throw new Error(response.error || '删除个人信息失败');
      }
      
      return response.data === true;
    } catch (error) {
      console.error(`删除个人信息(ID:${id})出错:`, error);
      throw error;
    }
  },
  
  /**
   * 搜索个人信息
   * @param keyword 搜索关键词
   */
  async searchProfiles(keyword: string): Promise<Profile[]> {
    try {
      const response = await window.electronAPI.invoke(
        DB_CHANNELS.PROFILE.SEARCH, 
        keyword
      );
      
      if (!response.success) {
        console.error(`搜索个人信息失败: ${response.error}`);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error(`搜索个人信息出错:`, error);
      return [];
    }
  },
  
  /**
   * 获取最近创建的个人信息
   * @param limit 限制数量
   */
  async getRecentProfiles(limit: number = 5): Promise<Profile[]> {
    try {
      const response = await window.electronAPI.invoke(
        DB_CHANNELS.PROFILE.GET_RECENT, 
        limit
      );
      
      if (!response.success) {
        console.error(`获取最近个人信息失败: ${response.error}`);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('获取最近个人信息出错:', error);
      return [];
    }
  }
};

export default ProfileService; 