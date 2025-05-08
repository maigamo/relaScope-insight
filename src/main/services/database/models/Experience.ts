export interface Experience {
  id?: number;
  profile_id: number;
  title: string;
  type?: string;
  organization?: string;
  description?: string;
  date?: string;
  location?: string;
  tags?: string;
  created_at?: string;
  updated_at?: string;
  
  // 驼峰命名版字段，用于前端兼容
  profileId?: number;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
} 