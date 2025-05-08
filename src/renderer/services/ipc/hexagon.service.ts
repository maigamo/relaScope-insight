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
   * 根据档案ID获取六边形模型
   * @param profileId 档案ID
   */
  async getHexagonModelsByProfileId(profileId: number): Promise<HexagonModel[]> {
    try {
      return await ipcService.invoke<HexagonModel[]>(HEXAGON_CHANNELS.GET_BY_PROFILE, profileId);
    } catch (error) {
      console.error(`获取档案(ID=${profileId})的六边形模型失败:`, error);
      return [];
    }
  },
  
  /**
   * 获取档案的最新六边形模型
   * @param profileId 档案ID
   */
  async getLatestHexagonModel(profileId: number): Promise<HexagonModel | null> {
    try {
      return await ipcService.invoke<HexagonModel | null>(HEXAGON_CHANNELS.GET_LATEST, profileId);
    } catch (error) {
      console.error(`获取档案(ID=${profileId})的最新六边形模型失败:`, error);
      return null;
    }
  },
  
  /**
   * 获取最近的六边形模型
   * @param limit 限制数量
   */
  async getRecentHexagonModels(limit: number = 10): Promise<HexagonModel[]> {
    try {
      return await ipcService.invoke<HexagonModel[]>(HEXAGON_CHANNELS.GET_RECENT, limit);
    } catch (error) {
      console.error('获取最近六边形模型失败:', error);
      return [];
    }
  },
  
  /**
   * 获取六边形维度的平均值
   */
  async getAverageHexagonDimensions(): Promise<{ [key: string]: number }> {
    try {
      return await ipcService.invoke<{ [key: string]: number }>(HEXAGON_CHANNELS.GET_AVERAGE);
    } catch (error) {
      console.error('获取六边形维度平均值失败:', error);
      return {};
    }
  },
  
  /**
   * 比较两个六边形模型
   * @param id1 第一个模型ID
   * @param id2 第二个模型ID
   */
  async compareHexagonModels(id1: number, id2: number): Promise<{ 
    differences: { [key: string]: { value1: number; value2: number; difference: number } };
    timeGap: number;
  }> {
    try {
      return await ipcService.invoke(HEXAGON_CHANNELS.COMPARE, id1, id2);
    } catch (error) {
      console.error(`比较六边形模型(ID=${id1}, ID=${id2})失败:`, error);
      throw error;
    }
  }
}; 