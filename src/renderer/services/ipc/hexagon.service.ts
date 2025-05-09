import { HexagonModel } from '../../../common/types/database';
import { ipcService } from './core';
import { HEXAGON_CHANNELS } from './channels';

/**
 * 六边形模型服务 - 提供六边形模型的增删改查等功能
 */
export const HexagonService = {
  /**
   * 创建新六边形模型
   * @param model 模型数据
   */
  async createHexagonModel(model: HexagonModel): Promise<HexagonModel> {
    try {
      return await ipcService.invoke<HexagonModel>(HEXAGON_CHANNELS.CREATE, model);
    } catch (error) {
      console.error('创建六边形模型失败:', error);
      throw error;
    }
  },
  
  /**
   * 更新六边形模型
   * @param model 模型数据
   */
  async updateHexagonModel(model: HexagonModel): Promise<boolean> {
    try {
      return await ipcService.invoke<boolean>(HEXAGON_CHANNELS.UPDATE, model);
    } catch (error) {
      console.error('更新六边形模型失败:', error);
      return false;
    }
  },
  
  /**
   * 获取所有六边形模型
   */
  async getAllHexagonModels(): Promise<HexagonModel[]> {
    try {
      return await ipcService.invoke<HexagonModel[]>(HEXAGON_CHANNELS.GET_ALL);
    } catch (error) {
      console.error('获取所有六边形模型失败:', error);
      return [];
    }
  },
  
  /**
   * 根据ID获取六边形模型
   * @param id 模型ID
   */
  async getHexagonModelById(id: number): Promise<HexagonModel | null> {
    try {
      return await ipcService.invoke<HexagonModel | null>(HEXAGON_CHANNELS.GET_BY_ID, { id });
    } catch (error) {
      console.error(`获取六边形模型(ID=${id})失败:`, error);
      return null;
    }
  },
  
  /**
   * 根据档案ID获取六边形模型
   * @param profileId 档案ID
   */
  async getHexagonModelsByProfileId(profileId: number): Promise<HexagonModel[]> {
    try {
      return await ipcService.invoke<HexagonModel[]>(HEXAGON_CHANNELS.GET_BY_PROFILE, { profileId });
    } catch (error) {
      console.error(`获取档案(ID=${profileId})的六边形模型失败:`, error);
      return [];
    }
  },
  
  /**
   * 删除六边形模型
   * @param id 模型ID
   */
  async deleteHexagonModel(id: number): Promise<boolean> {
    try {
      return await ipcService.invoke<boolean>(HEXAGON_CHANNELS.DELETE, { id });
    } catch (error) {
      console.error(`删除六边形模型(ID=${id})失败:`, error);
      return false;
    }
  }
}; 