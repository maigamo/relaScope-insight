/**
 * 引用实体类
 */
export class Quote {
  id?: number;
  profile_id: number;
  content: string;
  source?: string;
  date?: string;
  context?: string;
  tags?: string;
  importance?: number;
  created_at: string;
  updated_at: string;

  constructor(data?: Partial<Quote>) {
    this.profile_id = data?.profile_id || 0;
    this.content = data?.content || '';
    this.source = data?.source;
    this.date = data?.date;
    this.context = data?.context;
    this.tags = data?.tags;
    this.importance = data?.importance;
    this.created_at = data?.created_at || new Date().toISOString();
    this.updated_at = data?.updated_at || new Date().toISOString();
  }
} 