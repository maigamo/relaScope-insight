/**
 * 用户实体类
 */
export class User {
  id?: number;
  username: string;
  password: string;
  salt: string;
  realName?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  role: number; // 1: 普通用户, 2: 管理员, 3: 超级管理员
  enterpriseId?: number;
  department?: string;
  position?: string;
  status: number; // 0: 禁用, 1: 正常
  lastLoginTime?: string | Date;
  createdTime: string | Date;
  updatedTime: string | Date;

  constructor(data?: Partial<User>) {
    this.username = data?.username || '';
    this.password = data?.password || '';
    this.salt = data?.salt || '';
    this.realName = data?.realName;
    this.avatar = data?.avatar;
    this.email = data?.email;
    this.phone = data?.phone;
    this.role = data?.role ?? 1;
    this.enterpriseId = data?.enterpriseId;
    this.department = data?.department;
    this.position = data?.position;
    this.status = data?.status ?? 1;
    this.lastLoginTime = data?.lastLoginTime;
    this.createdTime = data?.createdTime || new Date();
    this.updatedTime = data?.updatedTime || new Date();
  }
} 