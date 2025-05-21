/**
 * template.ts
 * 封装与LLM模板相关的IPC操作
 */
import { LLMService } from '../../../../../renderer/services/ipc.service';
import { PromptTemplate } from '../../../../../common/types/llm';

/**
 * 获取所有模板
 * @returns 所有可用的提示词模板
 */
export const getAllTemplates = async (): Promise<PromptTemplate[]> => {
  try {
    return await LLMService.getAllTemplates();
  } catch (error) {
    console.error('获取所有模板失败:', error);
    throw error;
  }
};

/**
 * 获取特定模板
 * @param templateId 模板ID
 * @returns 指定ID的模板信息
 */
export const getTemplate = async (templateId: string): Promise<PromptTemplate | null> => {
  try {
    return await LLMService.getTemplate(templateId);
  } catch (error) {
    console.error('获取模板失败:', error);
    throw error;
  }
};

/**
 * 保存模板
 * @param template 要保存的模板
 * @returns 保存结果
 */
export const saveTemplate = async (template: PromptTemplate): Promise<boolean> => {
  try {
    return await LLMService.saveTemplate(template);
  } catch (error) {
    console.error('保存模板失败:', error);
    throw error;
  }
};

/**
 * 删除模板
 * @param templateId 要删除的模板ID
 * @returns 删除结果
 */
export const deleteTemplate = async (templateId: string): Promise<boolean> => {
  try {
    return await LLMService.deleteTemplate(templateId);
  } catch (error) {
    console.error('删除模板失败:', error);
    throw error;
  }
};

/**
 * 提取模板变量
 * 从模板内容中提取所有变量标记
 * @param content 模板内容
 * @returns 变量列表
 */
export const extractTemplateVariables = (content: string): string[] => {
  if (!content) return [];
  
  const variablePattern = /\{\{([^{}]+)\}\}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = variablePattern.exec(content)) !== null) {
    variables.push(match[1].trim());
  }
  
  return [...new Set(variables)]; // 去重
}; 