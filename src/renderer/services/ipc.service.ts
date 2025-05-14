/**
 * 兼容层 - 保持原有ipc.service.ts的导出，但内部使用新的模块化实现
 * 这个文件将会替代原有的ipc.service.ts，确保已有代码不会因为重构而出错
 */

// 从新的IPC服务目录导入所有服务
import { 
  ipcService, 
  ConfigService as IpcConfigService,
  AppService as IpcAppService, 
  DatabaseService as IpcDatabaseService,
  ProfileService as IpcProfileService,
  QuoteService as IpcQuoteService,
  ExperienceService as IpcExperienceService,
  AnalysisService as IpcAnalysisService,
  HexagonService as IpcHexagonService,
  LLMService as IpcLLMService
} from './ipc';

// 导入原始类型定义
import type { 
  ConfigGetRequest,
  ConfigSetRequest,
  DBQueryRequest,
  IPCResponse 
} from '../../common/types/ipc';

// 导出类型定义（确保原有import语句仍然有效）
export type { 
  ConfigGetRequest,
  ConfigSetRequest,
  DBQueryRequest,
  IPCResponse 
};

// 导出IPC服务核心类（保持原有接口兼容）
export { ipcService };

// 重新导出服务，保持原有命名
export const ConfigService = IpcConfigService;
export const AppService = IpcAppService;
export const DatabaseService = IpcDatabaseService;
export const ProfileService = IpcProfileService;
export const QuoteService = IpcQuoteService;
export const ExperienceService = IpcExperienceService;
export const AnalysisService = IpcAnalysisService;
export const HexagonService = IpcHexagonService;
export const LLMService = IpcLLMService;
