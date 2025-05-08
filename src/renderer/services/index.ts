/**
 * 服务层统一导出
 */

// 导出IPC服务核心组件和新的业务服务模块
export {
  ipcService,
  ConfigService as IpcConfigService,
  AppService,
  DatabaseService,
  ProfileService as IpcProfileService,
  QuoteService,
  ExperienceService,
  AnalysisService,
  HexagonService
} from './ipc';

// 导出原有服务（兼容旧代码）
export { ProfileService } from './profile.service';
export { ConfigService } from './ConfigService'; 