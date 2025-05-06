/**
 * 引用实体类
 */
export class Quote {
  id?: number;
  profileId: number;
  content: string;
  source?: string;
  date?: string;
  context?: string;
  tags?: string;
  importance?: number;
  createdAt: string;
  updatedAt: string;

  constructor(data?: Partial<Quote>) {
    this.profileId = data?.profileId || 0;
    this.content = data?.content || '';
    this.source = data?.source;
    this.date = data?.date;
    this.context = data?.context;
    this.tags = data?.tags;
    this.importance = data?.importance;
    this.createdAt = data?.createdAt || new Date().toISOString();
    this.updatedAt = data?.updatedAt || new Date().toISOString();
  }
} 