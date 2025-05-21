/**
 * 模板管理钩子
 * 用于LLM提示词模板的管理和操作
 */
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PromptTemplate } from '../../../../../common/types/llm';
import * as templateIPC from '../../utils/ipc/template';
import { message } from 'antd';

/**
 * 使用模板管理功能
 * 提供对提示词模板的增删改查操作
 */
export const useTemplates = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<PromptTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * 加载所有模板
   */
  const loadAllTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const loadedTemplates = await templateIPC.getAllTemplates();
      setTemplates(loadedTemplates || []);
      return loadedTemplates;
    } catch (error) {
      console.error('加载模板失败:', error);
      message.error('加载模板失败');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 通过ID选择模板
   */
  const selectTemplateById = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCurrentTemplate(template);
    }
  }, [templates]);

  /**
   * 通过ID加载模板
   */
  const getTemplateById = useCallback(async (templateId: string): Promise<PromptTemplate | null> => {
    try {
      setLoading(true);
      const template = await templateIPC.getTemplate(templateId);
      return template;
    } catch (error) {
      console.error('获取模板失败:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 创建新模板
   */
  const createTemplate = useCallback(async (templateData: Partial<PromptTemplate>): Promise<PromptTemplate | null> => {
    try {
      setLoading(true);
      
      // 提取内容中的变量
      const content = templateData.content || '';
      const extractedVariables = templateIPC.extractTemplateVariables(content);
      
      // 创建模板对象
      const newTemplate: PromptTemplate = {
        id: uuidv4(),
        name: templateData.name || '新模板',
        description: templateData.description || '',
        content: content,
        variables: extractedVariables,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...templateData,
      };
      
      const success = await templateIPC.saveTemplate(newTemplate);
      
      if (success) {
        // 更新状态
        setTemplates(prev => [...prev, newTemplate]);
        setCurrentTemplate(newTemplate);
        
        message.success('成功创建模板');
        return newTemplate;
      }
      
      return null;
    } catch (error) {
      console.error('创建模板失败:', error);
      message.error('创建模板失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 更新模板
   */
  const updateTemplate = useCallback(async (
    templateId: string, 
    templateData: Partial<PromptTemplate>
  ): Promise<PromptTemplate | null> => {
    try {
      setLoading(true);
      
      // 查找现有模板
      const existingTemplate = templates.find(t => t.id === templateId);
      if (!existingTemplate) {
        message.error('找不到要更新的模板');
        return null;
      }
      
      // 如果内容有变化，提取变量
      let variables = existingTemplate.variables;
      if (templateData.content && templateData.content !== existingTemplate.content) {
        variables = templateIPC.extractTemplateVariables(templateData.content);
      }
      
      // 合并模板数据
      const updatedTemplate: PromptTemplate = {
        ...existingTemplate,
        ...templateData,
        variables,
        updatedAt: new Date().toISOString()
      };
      
      const success = await templateIPC.saveTemplate(updatedTemplate);
      
      if (success) {
        // 更新状态
        setTemplates(prev => 
          prev.map(t => t.id === templateId ? updatedTemplate : t)
        );
        
        if (currentTemplate?.id === templateId) {
          setCurrentTemplate(updatedTemplate);
        }
        
        message.success('成功更新模板');
        return updatedTemplate;
      }
      
      return null;
    } catch (error) {
      console.error('更新模板失败:', error);
      message.error('更新模板失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, [templates, currentTemplate]);

  /**
   * 删除模板
   */
  const deleteTemplate = useCallback(async (templateId: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const success = await templateIPC.deleteTemplate(templateId);
      
      if (success) {
        // 更新状态
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        
        // 如果删除的是当前选中的模板，则清空选择
        if (currentTemplate?.id === templateId) {
          setCurrentTemplate(null);
        }
        
        message.success('成功删除模板');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('删除模板失败:', error);
      message.error('删除模板失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentTemplate]);

  /**
   * 提取模板变量
   */
  const extractVariables = useCallback((content: string): string[] => {
    return templateIPC.extractTemplateVariables(content);
  }, []);

  return {
    templates,
    currentTemplate,
    loading,
    loadAllTemplates,
    selectTemplateById,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    extractVariables
  };
}; 