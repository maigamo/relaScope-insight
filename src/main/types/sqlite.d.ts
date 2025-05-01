declare module 'sqlite' {
  import sqlite3 from 'sqlite3';
  
  export interface Database {
    close(): Promise<void>;
    exec(sql: string): Promise<void>;
    get<T = any>(sql: string, ...params: any[]): Promise<T>;
    all<T = any>(sql: string, ...params: any[]): Promise<T>;
    run(sql: string, ...params: any[]): Promise<{ lastID: number; changes: number }>;
  }
  
  export interface OpenOptions {
    filename: string;
    driver: typeof sqlite3.Database;
  }
  
  export function open(options: OpenOptions): Promise<Database>;
} 