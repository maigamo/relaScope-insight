/**
 * 项目实体类
 */
export class Project {
  id?: number;
  name: string;
  description?: string;
  logoPath?: string;
  enterpriseId: number;
  ownerId: number;
  status: number; // 0: 禁用, 1: 活跃, 2: 已归档
  createdTime: string | Date;
  updatedTime: string | Date;

  constructor(data?: Partial<Project>) {
    this.name = data?.name || '';
    this.description = data?.description;
    this.logoPath = data?.logoPath;
    this.enterpriseId = data?.enterpriseId || 0;
    this.ownerId = data?.ownerId || 0;
    this.status = data?.status ?? 1;
    this.createdTime = data?.createdTime || new Date();
    this.updatedTime = data?.updatedTime || new Date();
  }
} 