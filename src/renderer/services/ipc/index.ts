/**
 * IPC服务统一导出
 * 确保所有服务都从这里导出，保持对外接口一致
 */

// 导出核心IPC服务
export { ipcService } from './core';

// 导出各业务服务
export { ConfigService } from './config.service';
export { AppService } from './app.service';
export { DatabaseService } from './database.service';
export { ProfileService } from './profile.service';
export { QuoteService } from './quote.service';
export { ExperienceService } from './experience.service';
export { AnalysisService } from './analysis.service';
export { HexagonService } from './hexagon.service'; 