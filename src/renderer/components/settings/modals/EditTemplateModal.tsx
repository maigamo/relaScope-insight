/**
 * 编辑模板对话框
 * 用于创建或编辑提示词模板
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Divider, Typography, Tag } from 'antd';
import { PlusOutlined, SaveOutlined, CloseOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { PromptTemplate } from '../../../../common/types/llm';
import { validateTemplate } from '../utils/validators';
import { extractTemplateVariables } from '../utils/ipc/template';
import { v4 as uuidv4 } from 'uuid';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface EditTemplateModalProps {
  visible: boolean;
  template?: PromptTemplate | null;
  isCreate?: boolean;
  onSave: (template: PromptTemplate) => Promise<void>;
  onCancel: () => void;
}

/**
 * 编辑模板对话框组件
 */
const EditTemplateModal: React.FC<EditTemplateModalProps> = ({
  visible,
  template,
  isCreate = false,
  onSave,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState<string[]>([]);
  const [content, setContent] = useState('');

  // 初始化表单数据
  useEffect(() => {
    if (visible) {
      if (isCreate) {
        // 创建时使用默认值
        form.setFieldsValue({
          name: '',
          description: '',
          content: '',
          category: '',
          tags: ''
        });
        setContent('');
        setVariables([]);
      } else if (template) {
        // 编辑时使用现有模板
        form.setFieldsValue({
          name: template.name,
          description: template.description,
          content: template.content,
          category: template.category || '',
          tags: template.tags ? template.tags.join(', ') : ''
        });
        setContent(template.content);
        setVariables(template.variables || []);
      }
    }
  }, [visible, template, isCreate, form]);

  // 处理内容变更，提取变量
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // 提取变量
    if (newContent) {
      const extractedVars = extractTemplateVariables(newContent);
      setVariables(extractedVars);
    } else {
      setVariables([]);
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 验证模板
      const validation = validateTemplate(values);
      if (!validation.valid) {
        form.setFields([
          {
            name: validation.error?.includes('模板名称') ? 'name' : 
                  validation.error?.includes('模板内容') ? 'content' : 'name',
            errors: [validation.error || '模板无效']
          }
        ]);
        return;
      }
      
      setLoading(true);
      
      // 处理标签
      let tags: string[] = [];
      if (values.tags) {
        tags = values.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
      }
      
      // 创建完整的模板对象
      const updatedTemplate: PromptTemplate = {
        id: template?.id || uuidv4(),
        name: values.name,
        description: values.description || '',
        content: values.content,
        variables: variables,
        category: values.category || undefined,
        tags: tags.length > 0 ? tags : undefined,
        createdAt: template?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await onSave(updatedTemplate);
    } catch (error) {
      console.error('表单提交失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isCreate ? "创建新模板" : "编辑模板"}
      open={visible}
      onCancel={onCancel}
      maskClosable={false}
      footer={[
        <Button key="cancel" onClick={onCancel} icon={<CloseOutlined />}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          icon={isCreate ? <PlusOutlined /> : <SaveOutlined />}
        >
          {isCreate ? "创建" : "保存"}
        </Button>
      ]}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
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
          label="描述"
        >
          <Input placeholder="输入模板描述" />
        </Form.Item>

        <Form.Item
          name="content"
          label="模板内容"
          rules={[{ required: true, message: '请输入模板内容' }]}
          tooltip="使用 {{变量名}} 语法插入变量，例如：{{name}}"
        >
          <TextArea
            placeholder="输入模板内容，使用 {{变量名}} 语法定义变量"
            autoSize={{ minRows: 5, maxRows: 15 }}
            onChange={handleContentChange}
          />
        </Form.Item>

        {variables.length > 0 && (
          <Form.Item label="检测到的变量">
            <Space wrap>
              {variables.map(variable => (
                <Tag key={variable} color="blue">{variable}</Tag>
              ))}
            </Space>
          </Form.Item>
        )}

        <Divider>分类和标签</Divider>

        <Form.Item
          name="category"
          label="分类"
        >
          <Input placeholder="输入模板分类（可选）" />
        </Form.Item>

        <Form.Item
          name="tags"
          label="标签"
          tooltip="多个标签请用逗号分隔"
        >
          <Input placeholder="输入标签，多个标签用逗号分隔（可选）" />
        </Form.Item>

        <Divider dashed />
        
        <Paragraph type="secondary">
          <InfoCircleOutlined /> 提示：在模板中使用 <Text code>{'{{变量名}}'}</Text> 语法可以定义变量，这些变量可以在使用模板时被替换。
        </Paragraph>
      </Form>
    </Modal>
  );
};

export default EditTemplateModal; 