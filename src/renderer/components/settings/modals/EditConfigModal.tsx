/**
 * 编辑配置对话框
 * 用于创建或编辑LLM配置
 */
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Slider, Button, Space, Tabs, Typography } from 'antd';
import { LLMConfig, LLMProvider } from '../../../../common/types/llm';
import { useLLMContext } from '../context/LLMContext';
import { getProviderName } from '../utils/formatters';
import ModelSelector from '../components/ModelSelector';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

interface EditConfigModalProps {
  visible: boolean;
  config: LLMConfig | null;
  isCreate: boolean;
  onSave: (config: LLMConfig) => Promise<void>;
  onCancel: () => void;
}

/**
 * 编辑配置对话框组件
 */
const EditConfigModal: React.FC<EditConfigModalProps> = ({
  visible,
  config,
  isCreate,
  onSave,
  onCancel
}) => {
  const { providers } = useLLMContext();
  const [form] = Form.useForm();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [submitting, setSubmitting] = useState(false);

  // 表单初始化
  useEffect(() => {
    if (visible) {
      if (config) {
        // 编辑模式：设置表单值
        form.setFieldsValue({
          name: config.name,
          provider: config.provider,
          systemMessage: config.systemMessage,
          temperature: config.temperature,
          topP: config.topP,
          frequencyPenalty: config.frequencyPenalty,
          presencePenalty: config.presencePenalty,
          maxTokens: config.maxTokens,
          modelId: config.modelId,
          modelName: config.modelName
        });
        setSelectedProvider(config.provider);
      } else {
        // 创建模式：清空表单
        form.resetFields();
        const defaultProvider = providers.find(p => p.isDefault)?.id || providers[0]?.id;
        form.setFieldsValue({
          provider: defaultProvider,
          temperature: 0.7,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0,
          maxTokens: 2048
        });
        setSelectedProvider(defaultProvider);
      }
    }
  }, [visible, config, form, providers]);

  // 提交表单
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      
      // 准备配置数据
      const configData: LLMConfig = {
        id: config?.id || '',
        isDefault: config?.isDefault || false,
        createdAt: config?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...values
      };
      
      // 保存配置
      await onSave(configData);
      form.resetFields();
    } catch (error) {
      console.error('表单提交错误:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // 提供商选择变更
  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    // 当提供商变更时，清空模型相关字段
    form.setFieldsValue({
      modelId: '',
      modelName: ''
    });
  };

  // 模型选择回调
  const handleModelSelect = (modelId: string, modelName: string) => {
    form.setFieldsValue({
      modelId,
      modelName
    });
  };

  return (
    <Modal
      title={isCreate ? '创建新配置' : '编辑配置'}
      open={visible}
      width={700}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={submitting}
          onClick={handleSubmit}
        >
          保存
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="基本设置" key="basic">
            <Form.Item
              name="name"
              label="配置名称"
              rules={[{ required: true, message: '请输入配置名称' }]}
            >
              <Input placeholder="输入配置名称" />
            </Form.Item>

            <Form.Item
              name="provider"
              label="提供商"
              rules={[{ required: true, message: '请选择提供商' }]}
            >
              <Select 
                placeholder="选择提供商" 
                onChange={handleProviderChange}
              >
                {providers.map(provider => (
                  <Option key={provider.id} value={provider.id}>
                    {getProviderName(provider.provider)}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {selectedProvider && (
              <Form.Item label="模型">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item
                    name="modelId"
                    noStyle
                    rules={[{ required: true, message: '请选择模型' }]}
                  >
                    <Input type="hidden" />
                  </Form.Item>
                  <Form.Item
                    name="modelName"
                    noStyle
                  >
                    <Input type="hidden" />
                  </Form.Item>
                  <ModelSelector 
                    providerId={selectedProvider}
                    onModelSelect={handleModelSelect}
                    initialModelId={form.getFieldValue('modelId')}
                  />
                </Space>
              </Form.Item>
            )}

            <Form.Item
              name="systemMessage"
              label="系统提示词"
            >
              <TextArea
                placeholder="输入系统提示词，定义AI的行为和限制"
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            </Form.Item>
          </TabPane>

          <TabPane tab="高级选项" key="advanced">
            <Form.Item
              name="temperature"
              label={
                <Space>
                  <span>温度</span>
                  <span style={{ color: '#999' }}>
                    ({form.getFieldValue('temperature') || 0.7})
                  </span>
                </Space>
              }
            >
              <Slider
                min={0}
                max={2}
                step={0.01}
                defaultValue={0.7}
                onChange={() => form.setFields([{
                  name: 'temperature',
                  touched: true
                }])}
              />
            </Form.Item>

            <Form.Item
              name="topP"
              label={
                <Space>
                  <span>Top P</span>
                  <span style={{ color: '#999' }}>
                    ({form.getFieldValue('topP') || 1})
                  </span>
                </Space>
              }
            >
              <Slider
                min={0}
                max={1}
                step={0.01}
                defaultValue={1}
                onChange={() => form.setFields([{
                  name: 'topP',
                  touched: true
                }])}
              />
            </Form.Item>

            <Form.Item
              name="frequencyPenalty"
              label={
                <Space>
                  <span>频率惩罚</span>
                  <span style={{ color: '#999' }}>
                    ({form.getFieldValue('frequencyPenalty') || 0})
                  </span>
                </Space>
              }
            >
              <Slider
                min={-2}
                max={2}
                step={0.01}
                defaultValue={0}
                onChange={() => form.setFields([{
                  name: 'frequencyPenalty',
                  touched: true
                }])}
              />
            </Form.Item>

            <Form.Item
              name="presencePenalty"
              label={
                <Space>
                  <span>存在惩罚</span>
                  <span style={{ color: '#999' }}>
                    ({form.getFieldValue('presencePenalty') || 0})
                  </span>
                </Space>
              }
            >
              <Slider
                min={-2}
                max={2}
                step={0.01}
                defaultValue={0}
                onChange={() => form.setFields([{
                  name: 'presencePenalty',
                  touched: true
                }])}
              />
            </Form.Item>

            <Form.Item
              name="maxTokens"
              label="最大Token数"
            >
              <InputNumber
                min={1}
                max={32000}
                defaultValue={2048}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

export default EditConfigModal; 