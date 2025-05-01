import { ConfigService } from './config.service';

export { ConfigService };

/**
 * 获取配置服务实例
 */
export const configService = ConfigService.getInstance(); 