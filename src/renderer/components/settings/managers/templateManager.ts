/**
 * 模板管理器
 * 负责管理LLM提示模板的加载、保存、删除等操作
 */
import { PromptTemplate } from '../../../../common/types/llm';
import * as templateIPC from '../utils/ipc/template';
import { DEFAULT_TEMPLATE_CONTENT } from '../utils/constants';

/**
 * 模板管理器类
 */
class TemplateManager {
  private static instance: TemplateManager;
  private templates: PromptTemplate[] = [];

  /**
   * 获取单例实例
   */
  public static getInstance(): TemplateManager {
    if (!TemplateManager.instance) {
      TemplateManager.instance = new TemplateManager();
    }
    return TemplateManager.instance;
  }

  /**
   * 私有构造函数，确保单例模式
   */
  private constructor() {}

  /**
   * 加载所有模板
   */
  public async loadAllTemplates(): Promise<PromptTemplate[]> {
    try {
      const templates = await templateIPC.getAllTemplates();
      this.templates = templates || [];
      return this.templates;
    } catch (error) {
      console.error('加载模板失败:', error);
      return [];
    }
  }

  /**
   * 获取所有模板
   */
  public getTemplates(): PromptTemplate[] {
    return [...this.templates];
  }

  /**
   * 通过ID获取模板
   */
  public getTemplateById(templateId: string): PromptTemplate | null {
    return this.templates.find(template => template.id === templateId) || null;
  }

  /**
   * 创建新模板
   */
  public async createTemplate(name: string, content: string = DEFAULT_TEMPLATE_CONTENT, description: string = ''): Promise<PromptTemplate | null> {
    try {
      // 提取变量
      const variables = this.extractVariables(content);
      
      // 创建新模板对象
      const newTemplate: PromptTemplate = {
        id: `template_${Date.now()}`,
        name,
        content,
        description,
        variables,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 保存模板
      const result = await templateIPC.saveTemplate(newTemplate);
      
      // 检查结果类型，如果是布尔值，则根据值决定是否返回模板
      if (typeof result === 'boolean') {
        if (result) {
          // 更新本地缓存
          this.templates.push(newTemplate);
          return newTemplate;
        }
        return null;
      } else if (result) {
        // 如果是模板对象，则返回该对象并更新缓存
        this.templates.push(result);
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('创建模板失败:', error);
      return null;
    }
  }

  /**
   * 更新模板
   */
  public async updateTemplate(templateId: string, updates: Partial<PromptTemplate>): Promise<PromptTemplate | null> {
    try {
      // 查找现有模板
      const existingIndex = this.templates.findIndex(template => template.id === templateId);
      if (existingIndex === -1) {
        console.error('未找到要更新的模板:', templateId);
        return null;
      }
      
      // 如果更新了内容，重新提取变量
      const variables = updates.content 
        ? this.extractVariables(updates.content)
        : this.templates[existingIndex].variables;
      
      // 合并模板数据
      const updatedTemplate: PromptTemplate = {
        ...this.templates[existingIndex],
        ...updates,
        variables,
        updatedAt: new Date().toISOString()
      };
      
      // 保存模板
      const result = await templateIPC.saveTemplate(updatedTemplate);
      
      // 检查结果类型，如果是布尔值，则根据值决定是否返回模板
      if (typeof result === 'boolean') {
        if (result) {
          // 更新本地缓存
          this.templates[existingIndex] = updatedTemplate;
          return updatedTemplate;
        }
        return null;
      } else if (result) {
        // 如果是模板对象，则返回该对象并更新缓存
        this.templates[existingIndex] = result;
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('更新模板失败:', error);
      return null;
    }
  }

  /**
   * 删除模板
   */
  public async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      const success = await templateIPC.deleteTemplate(templateId);
      
      if (success) {
        // 更新本地缓存
        this.templates = this.templates.filter(template => template.id !== templateId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('删除模板失败:', error);
      return false;
    }
  }

  /**
   * 从内容中提取变量
   */
  private extractVariables(content: string): string[] {
    if (!content) return [];
    
    const variablePattern = /\{\{([^{}]+)\}\}/g;
    const matches = content.match(variablePattern) || [];
    
    // 提取变量名并去重
    const variables = matches.map(match => match.slice(2, -2).trim());
    return Array.from(new Set(variables));
  }

  /**
   * 验证模板变量是否正确
   */
  public validateTemplateVariables(content: string): { valid: boolean; message?: string } {
    if (!content) {
      return { valid: false, message: '模板内容不能为空' };
    }
    
    const variablePattern = /\{\{([^{}]+)\}\}/g;
    const matches = content.match(variablePattern);
    
    if (matches) {
      for (const match of matches) {
        const variable = match.slice(2, -2).trim();
        
        if (!variable) {
          return { valid: false, message: '变量名不能为空' };
        }
        
        if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(variable)) {
          return { valid: false, message: `变量名 ${variable} 只能包含字母、数字、下划线和中文` };
        }
      }
    }
    
    return { valid: true };
  }

  /**
   * 搜索模板
   */
  public searchTemplates(query: string): PromptTemplate[] {
    if (!query) return this.templates;
    
    const lowerQuery = query.toLowerCase();
    return this.templates.filter(template => 
      template.name.toLowerCase().includes(lowerQuery) || 
      template.content.toLowerCase().includes(lowerQuery) ||
      template.description?.toLowerCase().includes(lowerQuery) ||
      template.variables.some(v => v.toLowerCase().includes(lowerQuery))
    );
  }
}

// 导出单例实例
export default TemplateManager.getInstance(); 