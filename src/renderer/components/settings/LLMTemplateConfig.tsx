import React, { useState } from 'react';
import { Button, Card, Form, Input, List, Modal, Popconfirm, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { PromptTemplate } from '../../../common/types/llm';
import { LLMService } from '../../services/ipc';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface TemplateConfigProps {
  templates: PromptTemplate[];
  setTemplates: (templates: PromptTemplate[]) => void;
  loadingTemplates: boolean;
}

/**
 * LLM提示词模板配置组件
 */
const LLMTemplateConfig: React.FC<TemplateConfigProps> = ({
  templates,
  setTemplates,
  loadingTemplates
}) => {
  const [templateForm] = Form.useForm();
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);

  // 打开添加/编辑模板对话框
  const openTemplateModal = (template?: PromptTemplate) => {
    setEditingTemplate(template || null);
    templateForm.resetFields();
    
    if (template) {
      templateForm.setFieldsValue({
        name: template.name,
        description: template.description,
        content: template.content,
        category: template.category || '',
        tags: template.tags ? template.tags.join(', ') : ''
      });
    }
    
    setIsTemplateModalVisible(true);
  };

  // 保存模板
  const handleSaveTemplate = async (values: any) => {
    try {
      const tagsArray = values.tags ? values.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [];
      
      // 自动识别变量
      const variableMatches = values.content.match(/\{\{([^}]+)\}\}/g) || [];
      const variables: string[] = variableMatches.map((match: string) => match.slice(2, -2).trim());
      
      const now = new Date().toISOString();
      
      if (editingTemplate) {
        // 更新现有模板
        const updatedTemplate: PromptTemplate = {
          ...editingTemplate,
          name: values.name,
          description: values.description,
          content: values.content,
          variables: [...new Set(variables)],
          updatedAt: now,
          category: values.category || undefined,
          tags: tagsArray.length > 0 ? tagsArray : undefined
        };
        
        // 调用后端保存
        const success = await LLMService.saveTemplate(updatedTemplate);
        if (success) {
          // 更新本地状态
          const updatedTemplates = templates.map(t => 
            t.id === updatedTemplate.id ? updatedTemplate : t
          );
          setTemplates(updatedTemplates);
          setIsTemplateModalVisible(false);
          setEditingTemplate(null);
          
          Modal.success({
            title: '成功',
            content: '提示词模板已更新',
          });
        } else {
          throw new Error('保存模板失败');
        }
      } else {
        // 创建新模板
        const newTemplate: Omit<PromptTemplate, 'id'> = {
          name: values.name,
          description: values.description,
          content: values.content,
          variables: [...new Set(variables)],
          createdAt: now,
          updatedAt: now,
          category: values.category || undefined,
          tags: tagsArray.length > 0 ? tagsArray : undefined
        };
        
        // 调用后端保存
        const result = await LLMService.saveTemplate(newTemplate);
        if (result) {
          // 更新本地状态
          const updatedTemplates = [...templates, {
            ...newTemplate,
            id: typeof result === 'string' ? result : `template-${Date.now()}`
          } as PromptTemplate];
          
          setTemplates(updatedTemplates);
          setIsTemplateModalVisible(false);
          
          Modal.success({
            title: '成功',
            content: '提示词模板已创建',
          });
        } else {
          throw new Error('创建模板失败');
        }
      }
    } catch (error) {
      console.error('保存模板错误:', error);
      Modal.error({
        title: '错误',
        content: `保存模板失败: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  };

  // 删除模板
  const handleDeleteTemplate = async (template: PromptTemplate) => {
    try {
      const success = await LLMService.deleteTemplate(template.id);
      if (success) {
        // 更新本地状态
        const updatedTemplates = templates.filter(t => t.id !== template.id);
        setTemplates(updatedTemplates);
        
        Modal.success({
          title: '成功',
          content: '提示词模板已删除',
        });
      } else {
        throw new Error('删除模板失败');
      }
    } catch (error) {
      console.error('删除模板错误:', error);
      Modal.error({
        title: '错误',
        content: `删除模板失败: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>提示词模板管理</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => openTemplateModal()}
        >
          添加模板
        </Button>
      </div>

      <List
        loading={loadingTemplates}
        itemLayout="vertical"
        dataSource={templates}
        renderItem={(template) => (
          <List.Item
            key={template.id}
            actions={[
              <Button 
                key="edit" 
                type="link" 
                icon={<EditOutlined />}
                onClick={() => openTemplateModal(template)}
              >
                编辑
              </Button>,
              <Popconfirm
                key="delete"
                title="确定要删除此模板吗？"
                description="此操作不可恢复"
                okText="删除"
                cancelText="取消"
                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                onConfirm={() => handleDeleteTemplate(template)}
              >
                <Button type="link" danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
            ]}
          >
            <List.Item.Meta
              title={template.name}
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">{template.description}</Text>
                  {template.category && <Text type="secondary">分类: {template.category}</Text>}
                  {template.tags && template.tags.length > 0 && (
                    <Text type="secondary">
                      标签: {template.tags.join(', ')}
                    </Text>
                  )}
                  {template.variables && template.variables.length > 0 && (
                    <Text type="secondary">
                      变量: {template.variables.join(', ')}
                    </Text>
                  )}
                </Space>
              }
            />
            <Paragraph
              ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}
              style={{ marginTop: 8 }}
            >
              {template.content}
            </Paragraph>
          </List.Item>
        )}
      />

      {/* 模板编辑对话框 */}
      <Modal
        title={editingTemplate ? "编辑提示词模板" : "添加提示词模板"}
        open={isTemplateModalVisible}
        onCancel={() => setIsTemplateModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={templateForm}
          layout="vertical"
          onFinish={handleSaveTemplate}
        >
          <Form.Item
            label="模板名称"
            name="name"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="输入模板名称" />
          </Form.Item>
          
          <Form.Item
            label="模板描述"
            name="description"
            rules={[{ required: true, message: '请输入模板描述' }]}
          >
            <Input.TextArea 
              placeholder="输入模板描述" 
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>
          
          <Form.Item
            label="模板内容"
            name="content"
            rules={[{ required: true, message: '请输入模板内容' }]}
            extra="使用 {{变量名}} 定义变量"
          >
            <TextArea 
              placeholder="输入模板内容" 
              autoSize={{ minRows: 6, maxRows: 12 }}
            />
          </Form.Item>
          
          <Form.Item
            label="分类"
            name="category"
          >
            <Input placeholder="输入模板分类" />
          </Form.Item>
          
          <Form.Item
            label="标签"
            name="tags"
            extra="使用逗号分隔多个标签"
          >
            <Input placeholder="输入标签，用逗号分隔" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              保存
            </Button>
            <Button onClick={() => setIsTemplateModalVisible(false)}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default LLMTemplateConfig; 