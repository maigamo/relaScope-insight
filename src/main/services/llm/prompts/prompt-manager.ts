import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { PromptTemplate, TemplateRenderResult } from '../types';
import { defaultPromptTemplates } from './default-templates';

/**
 * 提示词模板管理器
 * 负责加载、保存和渲染提示词模板
 */
export class PromptManager {
  private static instance: PromptManager;
  private templates: Map<string, PromptTemplate> = new Map();
  private templateDir: string = '';
  private isInitialized = false;

  private constructor() {
    // 私有构造函数
  }

  /**
   * 获取PromptManager单例
   */
  public static getInstance(): PromptManager {
    if (!PromptManager.instance) {
      PromptManager.instance = new PromptManager();
    }
    return PromptManager.instance;
  }

  /**
   * 初始化模板管理器
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // 设置模板目录
    this.templateDir = path.join(app.getPath('userData'), 'prompt-templates');
    
    // 确保模板目录存在
    await this.ensureTemplateDirExists();
    
    // 加载所有模板
    await this.loadTemplates();
    
    // 如果没有模板，加载默认模板
    if (this.templates.size === 0) {
      this.loadDefaultTemplates();
    }
    
    this.isInitialized = true;
  }

  /**
   * 确保模板目录存在
   */
  private async ensureTemplateDirExists(): Promise<void> {
    if (!fs.existsSync(this.templateDir)) {
      fs.mkdirSync(this.templateDir, { recursive: true });
    }
  }

  /**
   * 加载所有模板
   */
  private async loadTemplates(): Promise<void> {
    try {
      const files = fs.readdirSync(this.templateDir);
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        try {
          const filePath = path.join(this.templateDir, file);
          const templateData = fs.readFileSync(filePath, 'utf8');
          const template = JSON.parse(templateData) as PromptTemplate;
          
          this.templates.set(template.id, template);
        } catch (err) {
          console.error(`加载模板文件 ${file} 失败:`, err);
        }
      }
    } catch (err) {
      console.error('加载模板文件失败:', err);
    }
  }

  /**
   * 加载默认模板
   */
  private loadDefaultTemplates(): void {
    for (const template of defaultPromptTemplates) {
      this.templates.set(template.id, { ...template });
      this.saveTemplateToFile(template).catch(err => {
        console.error(`保存默认模板 ${template.id} 失败:`, err);
      });
    }
  }

  /**
   * 将模板保存到文件
   */
  private async saveTemplateToFile(template: PromptTemplate): Promise<void> {
    try {
      const filePath = path.join(this.templateDir, `${template.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(template, null, 2), 'utf8');
    } catch (err) {
      console.error(`保存模板 ${template.id} 失败:`, err);
      throw err;
    }
  }

  /**
   * 获取所有模板
   */
  public getAllTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * 获取指定模板
   */
  public getTemplate(id: string): PromptTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * 保存模板
   */
  public async saveTemplate(template: PromptTemplate): Promise<void> {
    // 如果是新模板，生成ID
    if (!template.id) {
      template.id = this.generateTemplateId();
    }
    
    // 更新时间戳
    const now = new Date().toISOString();
    if (!template.createdAt) {
      template.createdAt = now;
    }
    template.updatedAt = now;
    
    // 保存到内存和文件
    this.templates.set(template.id, { ...template });
    await this.saveTemplateToFile(template);
  }

  /**
   * 删除模板
   */
  public async deleteTemplate(id: string): Promise<void> {
    // 删除内存中的模板
    this.templates.delete(id);
    
    // 删除文件
    try {
      const filePath = path.join(this.templateDir, `${id}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(`删除模板文件 ${id} 失败:`, err);
      throw err;
    }
  }

  /**
   * 渲染模板
   * @param templateId 模板ID
   * @param variables 变量值
   * @returns 渲染结果
   */
  public renderTemplate(templateId: string, variables: Record<string, string>): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`模板不存在: ${templateId}`);
    }
    
    let renderedTemplate = template.template;
    
    // 替换变量
    const varRegex = /{{([^{}]+)}}/g;
    renderedTemplate = renderedTemplate.replace(varRegex, (match, varName) => {
      const trimmedVarName = varName.trim();
      return variables[trimmedVarName] || match; // 如果变量不存在，保留原始模板变量
    });
    
    return renderedTemplate;
  }

  /**
   * 渲染模板并返回详细结果
   * @param templateId 模板ID
   * @param variables 变量值
   * @returns 渲染结果和缺失变量列表
   */
  public renderTemplateWithDetails(templateId: string, variables: Record<string, string>): TemplateRenderResult {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`模板不存在: ${templateId}`);
    }
    
    let renderedTemplate = template.template;
    const missingVariables: string[] = [];
    
    // 检查所有必需的变量
    if (template.variables && template.variables.length > 0) {
      for (const varName of template.variables) {
        if (!variables[varName]) {
          missingVariables.push(varName);
        }
      }
    }
    
    // 替换变量并检查模板中实际使用的变量
    const varRegex = /{{([^{}]+)}}/g;
    renderedTemplate = renderedTemplate.replace(varRegex, (match, varName) => {
      const trimmedVarName = varName.trim();
      
      // 如果变量不存在，加入到缺失变量列表
      if (!variables[trimmedVarName] && !missingVariables.includes(trimmedVarName)) {
        missingVariables.push(trimmedVarName);
      }
      
      return variables[trimmedVarName] || match; // 如果变量不存在，保留原始模板变量
    });
    
    return {
      renderedTemplate,
      missingVariables
    };
  }

  /**
   * 验证模板
   * @param template 模板文本
   * @param variables 预期的变量列表
   * @returns 缺失的变量列表
   */
  public validateTemplate(template: string, variables: string[]): string[] {
    const missingVariables: string[] = [];
    const templateVars = new Set<string>();
    
    // 提取模板中的所有变量
    const varRegex = /{{([^{}]+)}}/g;
    let match;
    while ((match = varRegex.exec(template)) !== null) {
      const varName = match[1].trim();
      templateVars.add(varName);
      
      // 检查变量是否在预期列表中
      if (!variables.includes(varName)) {
        missingVariables.push(varName);
      }
    }
    
    return missingVariables;
  }
  
  /**
   * 使用示例值验证模板
   * @param template 模板文本
   * @param sampleValues 示例变量值
   * @returns 包含渲染结果和缺失变量的结果对象
   */
  public validateTemplateWithSample(template: string, sampleValues: Record<string, string>): TemplateRenderResult {
    const missingVariables: string[] = [];
    let renderedTemplate = template;
    
    // 提取模板中的所有变量并替换
    const varRegex = /{{([^{}]+)}}/g;
    let match;
    
    // 首先收集所有变量
    const allVars = new Set<string>();
    let templateCopy = template;
    while ((match = varRegex.exec(templateCopy)) !== null) {
      const varName = match[1].trim();
      allVars.add(varName);
    }
    
    // 检查哪些变量缺失
    for (const varName of allVars) {
      if (!sampleValues[varName]) {
        missingVariables.push(varName);
      }
    }
    
    // 替换变量
    renderedTemplate = template.replace(varRegex, (match, varName) => {
      const trimmedVarName = varName.trim();
      return sampleValues[trimmedVarName] || match; // 如果变量不存在，保留原始模板变量
    });
    
    return {
      renderedTemplate,
      missingVariables
    };
  }
  
  /**
   * 从模板中提取变量
   * @param template 模板文本
   * @returns 提取的变量列表
   */
  public extractVariables(template: string): string[] {
    const variables: string[] = [];
    const varRegex = /{{([^{}]+)}}/g;
    let match;
    
    while ((match = varRegex.exec(template)) !== null) {
      const varName = match[1].trim();
      if (!variables.includes(varName)) {
        variables.push(varName);
      }
    }
    
    return variables;
  }

  /**
   * 生成模板ID
   */
  private generateTemplateId(): string {
    return `template-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
} 