/**
 * LLM设置面板
 * 用于配置LLM的生成参数，如温度、Token限制等
 */
import React, { useState, useEffect } from 'react';
import { Card, Typography, Form, InputNumber, Slider, Button, Space, Divider, Tooltip, Switch, message, Alert, Input } from 'antd';
import { InfoCircleOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons';
import { useForm } from 'antd/es/form/Form';
import { useLLMContext } from '../context/LLMContext';
import { 
  DEFAULT_TEMPERATURE, DEFAULT_TOP_P, DEFAULT_FREQUENCY_PENALTY, 
  DEFAULT_PRESENCE_PENALTY, DEFAULT_MAX_TOKENS, DEFAULT_SYSTEM_MESSAGE,
  TEMPERATURE_RANGE, TOP_P_RANGE, FREQUENCY_PENALTY_RANGE,
  PRESENCE_PENALTY_RANGE, MAX_TOKENS_RANGE
} from '../utils/constants';
import { cardContainerStyle, flexContainerStyle } from '../utils/styles';
import { LLMConfig } from '../../../../common/types/llm';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface LLMSettingsFormValues {
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  maxTokens: number;
  systemMessage: string;
  streamingEnabled: boolean;
}

/**
 * LLM设置面板组件
 */
const LLMSettingsPanel: React.FC = () => {
  const { activeConfig, handleSaveConfig } = useLLMContext();
  const [form] = useForm<LLMSettingsFormValues>();
  const [loading, setLoading] = useState(false);

  // 当活跃配置变化时更新表单
  useEffect(() => {
    if (activeConfig) {
      form.setFieldsValue({
        temperature: (activeConfig as any).temperature ?? DEFAULT_TEMPERATURE,
        topP: (activeConfig as any).topP ?? DEFAULT_TOP_P,
        frequencyPenalty: (activeConfig as any).frequencyPenalty ?? DEFAULT_FREQUENCY_PENALTY,
        presencePenalty: (activeConfig as any).presencePenalty ?? DEFAULT_PRESENCE_PENALTY,
        maxTokens: (activeConfig as any).maxTokens ?? DEFAULT_MAX_TOKENS,
        systemMessage: (activeConfig as any).systemMessage ?? DEFAULT_SYSTEM_MESSAGE,
        streamingEnabled: (activeConfig as any).streamingEnabled ?? true
      });
    } else {
      resetToDefaults();
    }
  }, [activeConfig, form]);

  // 处理表单提交
  const handleSubmit = async (values: LLMSettingsFormValues) => {
    if (!activeConfig) {
      message.error('未选择配置，无法保存设置');
      return;
    }

    try {
      setLoading(true);
      
      // 合并更新的值与现有配置
      const updatedConfig = {
        ...(activeConfig as any),
        temperature: values.temperature,
        topP: values.topP,
        frequencyPenalty: values.frequencyPenalty,
        presencePenalty: values.presencePenalty,
        maxTokens: values.maxTokens,
        systemMessage: values.systemMessage,
        streamingEnabled: values.streamingEnabled,
        updatedAt: new Date().toISOString()
      };
      
      // 保存配置
      await handleSaveConfig(updatedConfig);
      message.success('LLM设置已保存');
    } catch (error) {
      console.error('保存LLM设置失败:', error);
      message.error(`保存LLM设置失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 重置为默认值
  const resetToDefaults = () => {
    form.setFieldsValue({
      temperature: DEFAULT_TEMPERATURE,
      topP: DEFAULT_TOP_P,
      frequencyPenalty: DEFAULT_FREQUENCY_PENALTY,
      presencePenalty: DEFAULT_PRESENCE_PENALTY,
      maxTokens: DEFAULT_MAX_TOKENS,
      systemMessage: DEFAULT_SYSTEM_MESSAGE,
      streamingEnabled: true
    });
  };

  return (
    <Card style={cardContainerStyle}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={flexContainerStyle}>
          <Title level={4}>LLM参数设置</Title>
          <Space>
            <Button 
              icon={<UndoOutlined />} 
              onClick={resetToDefaults}
            >
              重置为默认值
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={form.submit}
              loading={loading}
              disabled={!activeConfig}
            >
              保存设置
            </Button>
          </Space>
        </div>
        
        <Text type="secondary">
          配置大型语言模型的生成参数，影响输出结果的创造性、多样性和长度。
        </Text>
        
        {!activeConfig && (
          <Alert
            message="未选择配置"
            description="请先选择或创建一个配置，然后再进行LLM参数设置。"
            type="warning"
            showIcon
            style={{ marginTop: '16px' }}
          />
        )}
        
        <Divider />
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={!activeConfig}
        >
          <Form.Item
            name="temperature"
            label={
              <Space>
                <span>温度</span>
                <Tooltip title="控制输出的随机性。较高的值会使输出更加随机和创造性，较低的值使输出更加确定和可预测。">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Slider
                min={TEMPERATURE_RANGE.min}
                max={TEMPERATURE_RANGE.max}
                step={TEMPERATURE_RANGE.step}
                tooltip={{ formatter: value => `${value?.toFixed(2)}` }}
              />
              <InputNumber
                min={TEMPERATURE_RANGE.min}
                max={TEMPERATURE_RANGE.max}
                step={TEMPERATURE_RANGE.step}
                style={{ width: '100px' }}
              />
            </Space>
          </Form.Item>
          
          <Form.Item
            name="topP"
            label={
              <Space>
                <span>Top P</span>
                <Tooltip title="控制输出的多样性。值越低，模型会考虑概率较低的tokens，从而产生更多样化的输出。">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Slider
                min={TOP_P_RANGE.min}
                max={TOP_P_RANGE.max}
                step={TOP_P_RANGE.step}
                tooltip={{ formatter: value => `${value?.toFixed(2)}` }}
              />
              <InputNumber
                min={TOP_P_RANGE.min}
                max={TOP_P_RANGE.max}
                step={TOP_P_RANGE.step}
                style={{ width: '100px' }}
              />
            </Space>
          </Form.Item>
          
          <Form.Item
            name="frequencyPenalty"
            label={
              <Space>
                <span>频率惩罚</span>
                <Tooltip title="减少模型重复使用同一词语的倾向。值越高，越不容易重复使用相同的词语。">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Slider
                min={FREQUENCY_PENALTY_RANGE.min}
                max={FREQUENCY_PENALTY_RANGE.max}
                step={FREQUENCY_PENALTY_RANGE.step}
                tooltip={{ formatter: value => `${value?.toFixed(2)}` }}
              />
              <InputNumber
                min={FREQUENCY_PENALTY_RANGE.min}
                max={FREQUENCY_PENALTY_RANGE.max}
                step={FREQUENCY_PENALTY_RANGE.step}
                style={{ width: '100px' }}
              />
            </Space>
          </Form.Item>
          
          <Form.Item
            name="presencePenalty"
            label={
              <Space>
                <span>存在惩罚</span>
                <Tooltip title="减少模型讨论相同话题的倾向。值越高，越倾向于讨论新话题。">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Slider
                min={PRESENCE_PENALTY_RANGE.min}
                max={PRESENCE_PENALTY_RANGE.max}
                step={PRESENCE_PENALTY_RANGE.step}
                tooltip={{ formatter: value => `${value?.toFixed(2)}` }}
              />
              <InputNumber
                min={PRESENCE_PENALTY_RANGE.min}
                max={PRESENCE_PENALTY_RANGE.max}
                step={PRESENCE_PENALTY_RANGE.step}
                style={{ width: '100px' }}
              />
            </Space>
          </Form.Item>
          
          <Form.Item
            name="maxTokens"
            label={
              <Space>
                <span>最大标记数</span>
                <Tooltip title="控制模型生成的最大标记（token）数量。较高的值允许更长的回复。">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Slider
                min={MAX_TOKENS_RANGE.min}
                max={MAX_TOKENS_RANGE.max}
                step={MAX_TOKENS_RANGE.step}
                tooltip={{ formatter: value => `${value}` }}
              />
              <InputNumber
                min={MAX_TOKENS_RANGE.min}
                max={MAX_TOKENS_RANGE.max}
                step={MAX_TOKENS_RANGE.step}
                style={{ width: '100px' }}
              />
            </Space>
          </Form.Item>
          
          <Form.Item
            name="systemMessage"
            label={
              <Space>
                <span>系统消息</span>
                <Tooltip title="设置发送给模型的系统指令，用于定义模型的行为和角色。">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <TextArea 
              rows={4} 
              placeholder="输入系统消息，定义AI助手的角色和行为..." 
            />
          </Form.Item>
          
          <Form.Item
            name="streamingEnabled"
            label={
              <Space>
                <span>启用流式响应</span>
                <Tooltip title="启用后，AI响应将实时流式显示；禁用后，将等待完整响应后一次性显示。">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Divider />
          
          <Paragraph type="secondary">
            提示：不同的参数组合会影响模型的输出风格。高温度和低Top P值会产生更有创意但可能不太相关的回复，
            而低温度和高Top P值则会产生更保守、更可预测的回复。
          </Paragraph>
        </Form>
      </Space>
    </Card>
  );
};

export default LLMSettingsPanel; 