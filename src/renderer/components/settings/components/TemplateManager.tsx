import React, { useCallback, useEffect, useState } from 'react';
import { Typography, Button, List, Space, Modal, Form, Input, message } from 'antd';
import { PromptTemplate } from '../../../../common/types/llm';
import * as templateIPC from '../utils/ipc/template';
import { v4 as uuidv4 } from 'uuid';

/**
 * 模板管理器组件
 * 用于管理LLM提示词模板
 */
const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<PromptTemplate | null>(null);
  const [form] = Form.useForm();

  // 加载模板列表
  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const loadedTemplates = await templateIPC.getAllTemplates();
      setTemplates(loadedTemplates || []);
    } catch (error) {
      console.error('加载模板失败:', error);
      message.error('无法加载模板列表');
    } finally {
      setLoading(false);
    }
  }, []);

  // 首次加载
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // 打开创建模板对话框
  const showCreateModal = useCallback(() => {
    setIsCreating(true);
    setCurrentTemplate(null);
    setIsModalVisible(true);
    form.resetFields();
  }, [form]);

  // 打开编辑模板对话框
  const showEditModal = useCallback((template: PromptTemplate) => {
    setIsCreating(false);
    setCurrentTemplate(template);
    setIsModalVisible(true);
    
    form.setFieldsValue({
      name: template.name,
      description: template.description,
      content: template.content
    });
  }, [form]);

  // 关闭对话框
  const handleCancel = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  // 提交表单
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      
      if (isCreating) {
        // 创建新模板
        const newTemplate: PromptTemplate = {
          id: uuidv4(),
          name: values.name,
          description: values.description,
          content: values.content,
          variables: extractVariables(values.content),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const success = await templateIPC.saveTemplate(newTemplate);
        
        if (success) {
          message.success('成功创建模板');
          loadTemplates();
        } else {
          message.error('创建模板失败');
        }
      } else if (currentTemplate) {
        // 更新已有模板
        const updatedTemplate: PromptTemplate = {
          ...currentTemplate,
          name: values.name,
          description: values.description,
          content: values.content,
          variables: extractVariables(values.content),
          updatedAt: new Date().toISOString()
        };
        
        const success = await templateIPC.saveTemplate(updatedTemplate);
        
        if (success) {
          message.success('成功更新模板');
          loadTemplates();
        } else {
          message.error('更新模板失败');
        }
      }
      
      setIsModalVisible(false);
    } catch (error) {
      console.error('表单提交错误:', error);
    }
  }, [isCreating, currentTemplate, form, loadTemplates]);

  // 删除模板
  const handleDeleteTemplate = useCallback((templateId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个模板吗？此操作不可恢复。',
      onOk: async () => {
        try {
          const success = await templateIPC.deleteTemplate(templateId);
          
          if (success) {
            message.success('成功删除模板');
            loadTemplates();
          } else {
            message.error('删除模板失败');
          }
        } catch (error) {
          console.error('删除模板错误:', error);
          message.error('删除模板时发生错误');
        }
      }
    });
  }, [loadTemplates]);

  // 从内容中提取变量
  const extractVariables = (content: string): string[] => {
    const pattern = /\{\{(.*?)\}\}/g;
    const matches = content.match(pattern) || [];
    
    return matches
      .map(match => match.replace(/^\{\{|\}\}$/g, '').trim())
      .filter((value, index, self) => self.indexOf(value) === index);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={showCreateModal}>
          新建模板
        </Button>
      </Space>
      
      <List
        loading={loading}
        bordered
        dataSource={templates}
        renderItem={template => (
          <List.Item
            actions={[
              <Button key="edit" onClick={() => showEditModal(template)}>编辑</Button>,
              <Button key="delete" danger onClick={() => handleDeleteTemplate(template.id)}>删除</Button>
            ]}
          >
            <List.Item.Meta
              title={template.name}
              description={template.description}
            />
          </List.Item>
        )}
      />
      
      <Modal
        title={isCreating ? '创建模板' : '编辑模板'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="模板描述"
          >
            <Input.TextArea rows={2} placeholder="请输入模板描述" />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="模板内容"
            rules={[{ required: true, message: '请输入模板内容' }]}
          >
            <Input.TextArea 
              rows={6} 
              placeholder="请输入模板内容，使用 {{变量名}} 表示变量" 
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default TemplateManager; 