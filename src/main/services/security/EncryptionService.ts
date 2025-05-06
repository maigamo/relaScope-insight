import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

/**
 * 加密配置接口
 */
export interface EncryptionConfig {
  // 盐长度
  saltLength: number;
  // 初始化向量长度
  ivLength: number;
  // 密钥派生迭代次数
  iterations: number;
  // 密钥长度
  keyLength: number;
  // 加密算法
  algorithm: string;
  // 密钥存储路径
  keyStoragePath: string;
}

/**
 * 加密服务
 * 负责加密敏感数据
 */
export class EncryptionService {
  private static instance: EncryptionService | null = null;
  private config: EncryptionConfig;
  private masterKey: string | null = null;

  private constructor() {
    // 默认配置
    this.config = {
      saltLength: 16,
      ivLength: 16,
      iterations: 10000,
      keyLength: 32,
      algorithm: 'aes-256-cbc', // 使用更简单的CBC模式
      keyStoragePath: path.join(app.getPath('userData'), 'security', 'keys')
    };
  }

  // 获取单例实例
  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  // 更新配置
  public updateConfig(config: Partial<EncryptionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 获取配置
  public getConfig(): EncryptionConfig {
    return { ...this.config };
  }

  // 初始化加密服务
  public async initialize(): Promise<void> {
    try {
      // 确保密钥存储目录存在
      const keyDir = path.dirname(this.config.keyStoragePath);
      if (!fs.existsSync(keyDir)) {
        fs.mkdirSync(keyDir, { recursive: true });
      }

      // 加载或生成主密钥
      if (!await this.loadMasterKey()) {
        await this.generateMasterKey();
      }

      console.log('加密服务已初始化');
    } catch (error) {
      console.error('初始化加密服务失败:', error);
      throw error;
    }
  }

  // 加载主密钥
  private async loadMasterKey(): Promise<boolean> {
    try {
      const keyPath = `${this.config.keyStoragePath}.dat`;
      
      if (fs.existsSync(keyPath)) {
        this.masterKey = fs.readFileSync(keyPath, 'utf8');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('加载主密钥失败:', error);
      return false;
    }
  }

  // 生成主密钥
  private async generateMasterKey(): Promise<void> {
    try {
      // 生成随机密钥
      this.masterKey = crypto.randomBytes(this.config.keyLength).toString('hex');
      
      // 保存密钥到文件
      const keyPath = `${this.config.keyStoragePath}.dat`;
      fs.writeFileSync(keyPath, this.masterKey, 'utf8');
      
      // 设置文件权限
      try {
        if (process.platform !== 'win32') {
          fs.chmodSync(keyPath, 0o600); // 只有所有者可读写
        }
      } catch (permError) {
        console.warn('设置密钥文件权限失败:', permError);
      }
      
      console.log('已生成新的主密钥');
    } catch (error) {
      console.error('生成主密钥失败:', error);
      throw error;
    }
  }

  // 加密数据
  public encrypt(data: string, password?: string): string {
    try {
      // 生成加密所需的随机值
      const iv = crypto.randomBytes(this.config.ivLength);
      const salt = crypto.randomBytes(this.config.saltLength);
      
      // 确定使用的密钥
      let key: string;
      const usePassword = !!password;
      
      if (usePassword && password) {
        key = password;
      } else if (this.masterKey) {
        key = this.masterKey;
      } else {
        throw new Error('未提供加密所需的密钥');
      }
      
      // 派生加密密钥
      const derivedKey = crypto.pbkdf2Sync(
        key,
        salt as any,
        this.config.iterations,
        this.config.keyLength,
        'sha256'
      );
      
      // 创建加密器并加密数据
      const cipher = crypto.createCipheriv(
        this.config.algorithm as any, 
        derivedKey as any, 
        iv as any
      );
      
      let encrypted = cipher.update(data, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      
      // 组合加密结果：版本:使用模式:盐:IV:加密数据
      const version = '1';
      const mode = usePassword ? 'pwd' : 'key';
      
      return [
        version,
        mode,
        salt.toString('base64'),
        iv.toString('base64'),
        encrypted
      ].join(':');
    } catch (error) {
      console.error('加密数据失败:', error);
      throw error;
    }
  }

  // 解密数据
  public decrypt(encryptedData: string, password?: string): string {
    try {
      // 解析加密数据
      const parts = encryptedData.split(':');
      
      if (parts.length < 5) {
        throw new Error('加密数据格式无效');
      }
      
      const [version, mode, saltBase64, ivBase64, encrypted] = parts;
      
      // 检查版本
      if (version !== '1') {
        throw new Error(`不支持的加密版本: ${version}`);
      }
      
      // 解码数据
      const salt = Buffer.from(saltBase64, 'base64');
      const iv = Buffer.from(ivBase64, 'base64');
      
      // 确定使用的密钥
      let key: string;
      
      if (mode === 'pwd' && password) {
        key = password;
      } else if (mode === 'key' && this.masterKey) {
        key = this.masterKey;
      } else {
        throw new Error(`无法解密: ${mode === 'pwd' ? '需要密码' : '需要主密钥'}`);
      }
      
      // 派生解密密钥
      const derivedKey = crypto.pbkdf2Sync(
        key,
        salt as any,
        this.config.iterations,
        this.config.keyLength,
        'sha256'
      );
      
      // 创建解密器并解密数据
      const decipher = crypto.createDecipheriv(
        this.config.algorithm as any, 
        derivedKey as any, 
        iv as any
      );
      
      let decrypted = decipher.update(encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('解密数据失败:', error);
      throw error;
    }
  }

  // 哈希密码
  public hashPassword(password: string): string {
    try {
      const salt = crypto.randomBytes(this.config.saltLength);
      
      const hash = crypto.pbkdf2Sync(
        password,
        salt as any,
        this.config.iterations,
        this.config.keyLength,
        'sha256'
      );
      
      // 返回格式：算法:迭代次数:盐:哈希
      return [
        'pbkdf2',
        this.config.iterations,
        salt.toString('base64'),
        hash.toString('base64')
      ].join(':');
    } catch (error) {
      console.error('哈希密码失败:', error);
      throw error;
    }
  }
  
  // 验证密码
  public verifyPassword(password: string, hashedPassword: string): boolean {
    try {
      const parts = hashedPassword.split(':');
      
      if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
        return false;
      }
      
      const iterations = parseInt(parts[1], 10);
      const salt = Buffer.from(parts[2], 'base64');
      const storedHash = Buffer.from(parts[3], 'base64');
      
      const hash = crypto.pbkdf2Sync(
        password,
        salt as any,
        iterations,
        storedHash.length,
        'sha256'
      );
      
      try {
        return crypto.timingSafeEqual(hash as any, storedHash as any);
      } catch (e) {
        // 回退到简单比较
        return hash.toString('hex') === storedHash.toString('hex');
      }
    } catch (error) {
      console.error('验证密码失败:', error);
      return false;
    }
  }
} 