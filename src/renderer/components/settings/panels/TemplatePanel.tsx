/**
 * 模板面板
 * 用于管理提示词模板
 */
import React, { useEffect, useState } from 'react';
import { Card, Typography, List, Button, Empty, Space, Divider, Input, Modal, Form, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { PromptTemplate } from '../../../../common/types/llm';
import { useLLMContext } from '../context/LLMContext';
import * as templateIPC from '../utils/ipc/template';
import { validateTemplateContent } from '../utils/validators';
import { DEFAULT_TEMPLATE_CONTENT } from '../utils/constants';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { confirm } = Modal;

/**
 * 模板设置面板组件
 */
const TemplatePanel: React.FC = () => {
  const { templates } = useLLMContext();
  const [loading, setLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<PromptTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [form] = Form.useForm();

  // 过滤模板
  const filteredTemplates = React.useMemo(() => {
    if (!searchQuery) {
      return templates;
    }
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    return templates.filter(template => 
      template.name.toLowerCase().includes(lowerCaseQuery) || 
      template.content.toLowerCase().includes(lowerCaseQuery)
    );
  }, [templates, searchQuery]);

  // 从模板内容中提取变量
  const extractVariables = (content: string): string[] => {
    if (!content) return [];
    const variablePattern = /\{\{([^{}]+)\}\}/g;
    const matches = content.match(variablePattern) || [];
    return matches.map(match => match.slice(2, -2).trim());
  };

  // 显示新建模板对话框
  const showCreateModal = () => {
    setCurrentTemplate(null);
    form.resetFields();
    form.setFieldsValue({
      name: '新模板',
      content: DEFAULT_TEMPLATE_CONTENT,
      description: '模板描述'
    });
    setIsEditModalVisible(true);
  };

  // 显示编辑模板对话框
  const showEditModal = (template: PromptTemplate) => {
    setCurrentTemplate(template);
    form.resetFields();
    form.setFieldsValue({
      name: template.name,
      content: template.content,
      description: template.description || ''
    });
    setIsEditModalVisible(true);
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 验证模板内容
      const contentValidation = validateTemplateContent(values.content);
      if (!contentValidation.valid) {
        throw new Error(contentValidation.message);
      }
      
      // 准备保存的模板数据
      const templateData: PromptTemplate = {
        id: currentTemplate?.id || `template_${Date.now()}`,
        name: values.name,
        content: values.content,
        description: values.description || '',
        variables: extractVariables(values.content),
        createdAt: currentTemplate?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 保存模板
      const savedTemplate = await templateIPC.saveTemplate(templateData);
      
      if (savedTemplate) {
        message.success(currentTemplate ? '模板更新成功' : '模板创建成功');
        setIsEditModalVisible(false);
      } else {
        throw new Error('保存模板失败');
      }
    } catch (error) {
      console.error('保存模板失败:', error);
      message.error(`保存模板失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 删除模板确认
  const showDeleteConfirm = (template: PromptTemplate) => {
    confirm({
      title: '确定要删除这个模板吗?',
      icon: <ExclamationCircleOutlined />,
      content: `删除 "${template.name}" 模板后将无法恢复`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          setLoading(true);
          const success = await templateIPC.deleteTemplate(template.id);
          
          if (success) {
            message.success('模板删除成功');
          } else {
            throw new Error('删除模板失败');
          }
        } catch (error) {
          console.error('删除模板失败:', error);
          message.error(`删除模板失败: ${error instanceof Error ? error.message : '未知错误'}`);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // 变量预览渲染
  const renderVariablePreview = () => {
    const content = form.getFieldValue('content');
    if (!content) {
      return <Text type="secondary">输入模板内容后将显示提取的变量</Text>;
    }
    
    const variables = extractVariables(content);
    if (variables.length === 0) {
      return <Text type="secondary">未找到变量</Text>;
    }
    
    return (
      <div>
        {variables.map((variable, index) => (
          <Text key={index} code style={{ marginRight: '8px' }}>
            {variable}
          </Text>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={4}>提示模板</Title>
        <Text type="secondary">
          创建和管理LLM提示模板，使用变量占位符（如 {'{{'} 变量名 {'}}'}）以实现模板复用。
        </Text>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
          <Input.Search 
            placeholder="搜索模板..." 
            style={{ width: 300 }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            allowClear
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={showCreateModal}
          >
            新建模板
          </Button>
        </div>
        
        <Divider />
        
        {filteredTemplates.length > 0 ? (
          <List
            dataSource={filteredTemplates}
            renderItem={template => (
              <List.Item
                key={template.id}
                actions={[
                  <Button 
                    key="edit" 
                    icon={<EditOutlined />} 
                    onClick={() => showEditModal(template)}
                  >
                    编辑
                  </Button>,
                  <Button 
                    key="delete" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => showDeleteConfirm(template)}
                  >
                    删除
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={template.name}
                  description={
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text type="secondary">{template.description}</Text>
                      <Paragraph ellipsis={{ rows: 2 }}>
                        {template.content}
                      </Paragraph>
                      <div>
                        <Text type="secondary">变量: </Text>
                        {template.variables.length > 0 ? (
                          template.variables.map((variable, index) => (
                            <Text key={index} code style={{ marginRight: '8px' }}>
                              {variable}
                            </Text>
                          ))
                        ) : (
                          <Text type="secondary">无变量</Text>
                        )}
                      </div>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty 
            description={
              searchQuery 
                ? "没有找到匹配的模板" 
                : "暂无模板，点击新建模板按钮创建"
            }
          />
        )}
      </Space>
      
      {/* 编辑模板对话框 */}
      <Modal
        title={currentTemplate ? '编辑模板' : '创建模板'}
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={loading}
        width={700}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="输入模板名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="模板描述"
          >
            <Input placeholder="输入模板描述（可选）" />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="模板内容"
            rules={[{ required: true, message: '请输入模板内容' }]}
            extra="使用 {{变量名}} 格式定义变量，变量名只能包含字母、数字和下划线"
          >
            <TextArea 
              placeholder="输入模板内容，使用 {{变量名}} 格式定义变量" 
              autoSize={{ minRows: 6, maxRows: 12 }}
            />
          </Form.Item>
          
          <Form.Item label="变量预览">
            {renderVariablePreview()}
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default TemplatePanel; 