import { IPCResponse } from '../../common/types/ipc';

interface ConfigServiceAPI {
  getConfig: <T>(args: { key: string; defaultValue?: T }) => Promise<IPCResponse<T>>;
  setConfig: <T>(args: { key: string; value: T }) => Promise<IPCResponse<void>>;
  getAllConfigs: () => Promise<IPCResponse<Record<string, any>>>;
}

interface AppControlAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

interface DBServiceAPI {
  initialize: () => Promise<IPCResponse<void>>;
  executeQuery: <T>(args: { sql: string; params?: any[] }) => Promise<IPCResponse<T[]>>;
}

interface ElectronAPI {
  configService: ConfigServiceAPI;
  appControl: AppControlAPI;
  dbService: DBServiceAPI;
  getAppVersion: () => string;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
} 