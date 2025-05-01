import { IPCResponse } from '../../common/types/ipc';

interface Window {
  electronAPI: {
    send: (channel: string, data?: any) => void;
    invoke: <T = any>(channel: string, data?: any) => Promise<IPCResponse<T>>;
    receive: (channel: string, func: (...args: any[]) => void) => () => void;
  }
} 