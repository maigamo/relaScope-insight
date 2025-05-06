/**
 * 项目成员实体类
 */
export class ProjectMember {
  id?: number;
  projectId: number;
  userId: number;
  role: number; // 1: 成员, 2: 管理员, 3: 所有者
  createdTime: string | Date;
  updatedTime: string | Date;

  constructor(data?: Partial<ProjectMember>) {
    this.projectId = data?.projectId || 0;
    this.userId = data?.userId || 0;
    this.role = data?.role ?? 1;
    this.createdTime = data?.createdTime || new Date();
    this.updatedTime = data?.updatedTime || new Date();
  }
} 