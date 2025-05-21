/**
 * 通用设置对话框
 * 用于展示和编辑各种系统设置
 */
import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Tabs, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Button, 
  Space, 
  Divider, 
  Typography, 
  InputNumber, 
  message,
  Alert
} from 'antd';
import { 
  SaveOutlined, 
  CloseOutlined, 
  SettingOutlined, 
  ThunderboltOutlined, 
  SecurityScanOutlined,
  LayoutOutlined,
  TranslationOutlined,
  FileSearchOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import ProxyModal from './ProxyModal';
import { ProxyConfig } from '../../../../common/types/llm';
import * as proxyIPC from '../utils/ipc/proxy';

// 临时实现设置IPC接口，实际项目中应该引入正确的模块
const settingsIPC = {
  getSettings: async (): Promise<any> => {
    // 在实际应用中，这应该从主进程获取存储的设置
    return null;
  },
  saveSettings: async (settings: any): Promise<boolean> => {
    // 在实际应用中，这应该将设置保存到主进程的存储中
    console.log('保存设置:', settings);
    return true;
  }
};

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

/**
 * 通用应用设置接口
 */
interface AppSettings {
  general: {
    language: string;
    theme: 'light' | 'dark' | 'system';
    fontSize: number;
    autoUpdate: boolean;
    telemetry: boolean;
  };
  appearance: {
    fontFamily: string;
    primaryColor: string;
    codeBlockTheme: string;
    uiDensity: 'compact' | 'comfortable' | 'spacious';
  };
  performance: {
    maxSimultaneousRequests: number;
    saveResponsesToDisk: boolean;
    enableHistoryCompression: boolean;
  };
  security: {
    encryptApiKeys: boolean;
    encryptConversations: boolean;
    idleTimeout: number;
  };
  advanced: {
    debugMode: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    customCssPath: string;
  };
}

/**
 * 默认设置
 */
const defaultSettings: AppSettings = {
  general: {
    language: 'zh-CN',
    theme: 'system',
    fontSize: 14,
    autoUpdate: true,
    telemetry: true,
  },
  appearance: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    primaryColor: '#1890ff',
    codeBlockTheme: 'vs-dark',
    uiDensity: 'comfortable',
  },
  performance: {
    maxSimultaneousRequests: 3,
    saveResponsesToDisk: true,
    enableHistoryCompression: false,
  },
  security: {
    encryptApiKeys: true,
    encryptConversations: false,
    idleTimeout: 30,
  },
  advanced: {
    debugMode: false,
    logLevel: 'info',
    customCssPath: '',
  },
};

interface SettingsModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: () => void;
}

/**
 * 设置对话框组件
 */
const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onCancel,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<string>('general');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [proxyModalVisible, setProxyModalVisible] = useState<boolean>(false);
  const [proxyConfig, setProxyConfig] = useState<ProxyConfig | null>(null);

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      if (visible) {
        try {
          setLoading(true);
          // 加载应用设置
          const appSettings = await settingsIPC.getSettings();
          
          if (appSettings) {
            setSettings(appSettings);
            form.setFieldsValue(appSettings);
          } else {
            // 如果没有保存的设置，使用默认值
            setSettings(defaultSettings);
            form.setFieldsValue(defaultSettings);
          }
          
          // 加载代理设置
          const proxy = await proxyIPC.getGlobalProxy();
          setProxyConfig(proxy);
        } catch (error) {
          console.error('加载设置失败:', error);
          message.error('无法加载应用设置');
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadSettings();
  }, [visible, form]);

  // 保存设置
  const handleSaveSettings = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 合并设置
      const newSettings = {
        ...settings,
        ...values
      };
      
      // 保存设置
      await settingsIPC.saveSettings(newSettings);
      
      message.success('设置保存成功');
      onSave();
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('保存设置失败');
    } finally {
      setLoading(false);
    }
  };

  // 打开代理设置对话框
  const handleOpenProxyModal = () => {
    setProxyModalVisible(true);
  };

  // 保存代理设置
  const handleSaveProxy = async (config: ProxyConfig) => {
    try {
      await proxyIPC.setGlobalProxy(config);
      setProxyConfig(config);
      setProxyModalVisible(false);
      message.success('代理设置已保存');
    } catch (error) {
      console.error('保存代理设置失败:', error);
      message.error('保存代理设置失败');
    }
  };

  return (
    <>
      <Modal
        title={<Space><SettingOutlined /> 应用设置</Space>}
        open={visible}
        onCancel={onCancel}
        width={700}
        footer={[
          <Button key="cancel" onClick={onCancel} icon={<CloseOutlined />}>
            取消
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={loading}
            onClick={handleSaveSettings}
            icon={<SaveOutlined />}
          >
            保存
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={settings}
          requiredMark={false}
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            {/* 通用设置 */}
            <TabPane 
              tab={<span><SettingOutlined /> 通用</span>} 
              key="general"
            >
              <Form.Item
                name={['general', 'language']}
                label="语言"
              >
                <Select>
                  <Option value="zh-CN">简体中文</Option>
                  <Option value="en-US">English</Option>
                  <Option value="ja-JP">日本語</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name={['general', 'theme']}
                label="主题"
              >
                <Select>
                  <Option value="light">浅色</Option>
                  <Option value="dark">深色</Option>
                  <Option value="system">跟随系统</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name={['general', 'fontSize']}
                label="字体大小"
              >
                <InputNumber min={12} max={20} step={1} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name={['general', 'autoUpdate']}
                valuePropName="checked"
                label="自动检查更新"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name={['general', 'telemetry']}
                valuePropName="checked"
                label="发送匿名使用数据"
                extra="帮助我们改进应用体验"
              >
                <Switch />
              </Form.Item>
              
              <Divider />
              
              <Button 
                type="default" 
                icon={<GlobalOutlined />} 
                onClick={handleOpenProxyModal}
              >
                设置全局代理
              </Button>
              
              {proxyConfig && proxyConfig.enabled && (
                <Paragraph style={{ marginTop: 8 }}>
                  当前代理: {proxyConfig.protocol}://{proxyConfig.host}:{proxyConfig.port}
                </Paragraph>
              )}
            </TabPane>
            
            {/* 外观设置 */}
            <TabPane 
              tab={<span><LayoutOutlined /> 外观</span>} 
              key="appearance"
            >
              <Form.Item
                name={['appearance', 'fontFamily']}
                label="字体"
              >
                <Select>
                  <Option value="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial">系统默认</Option>
                  <Option value="'Noto Sans SC', sans-serif">思源黑体</Option>
                  <Option value="'Noto Serif SC', serif">思源宋体</Option>
                  <Option value="'JetBrains Mono', monospace">JetBrains Mono</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name={['appearance', 'primaryColor']}
                label="主色调"
              >
                <Select>
                  <Option value="#1890ff">默认蓝</Option>
                  <Option value="#52c41a">青葱绿</Option>
                  <Option value="#722ed1">优雅紫</Option>
                  <Option value="#eb2f96">玫瑰粉</Option>
                  <Option value="#fa8c16">活力橙</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name={['appearance', 'codeBlockTheme']}
                label="代码块主题"
              >
                <Select>
                  <Option value="vs-dark">VS Dark</Option>
                  <Option value="github">GitHub</Option>
                  <Option value="monokai">Monokai</Option>
                  <Option value="solarized-light">Solarized Light</Option>
                  <Option value="solarized-dark">Solarized Dark</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name={['appearance', 'uiDensity']}
                label="界面密度"
              >
                <Select>
                  <Option value="compact">紧凑</Option>
                  <Option value="comfortable">舒适</Option>
                  <Option value="spacious">宽松</Option>
                </Select>
              </Form.Item>
            </TabPane>
            
            {/* 性能设置 */}
            <TabPane 
              tab={<span><ThunderboltOutlined /> 性能</span>} 
              key="performance"
            >
              <Form.Item
                name={['performance', 'maxSimultaneousRequests']}
                label="最大并发请求数"
                extra="同时允许发送的LLM请求数"
              >
                <InputNumber min={1} max={10} step={1} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name={['performance', 'saveResponsesToDisk']}
                valuePropName="checked"
                label="将响应保存到磁盘"
                extra="将LLM响应保存到本地以便快速访问"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name={['performance', 'enableHistoryCompression']}
                valuePropName="checked"
                label="启用历史压缩"
                extra="压缩旧的对话历史记录以节省空间"
              >
                <Switch />
              </Form.Item>
            </TabPane>
            
            {/* 安全设置 */}
            <TabPane 
              tab={<span><SecurityScanOutlined /> 安全</span>} 
              key="security"
            >
              <Form.Item
                name={['security', 'encryptApiKeys']}
                valuePropName="checked"
                label="加密API密钥"
                extra="使用系统密钥存储加密API密钥"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name={['security', 'encryptConversations']}
                valuePropName="checked"
                label="加密对话内容"
                extra="加密保存在磁盘上的对话内容"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name={['security', 'idleTimeout']}
                label="空闲超时时间（分钟）"
                extra="长时间不活动后锁定应用（0表示禁用）"
              >
                <InputNumber min={0} max={240} step={5} style={{ width: '100%' }} />
              </Form.Item>
            </TabPane>
            
            {/* 高级设置 */}
            <TabPane 
              tab={<span><FileSearchOutlined /> 高级</span>} 
              key="advanced"
            >
              <Alert
                message="警告：这些设置可能会影响应用稳定性"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Form.Item
                name={['advanced', 'debugMode']}
                valuePropName="checked"
                label="调试模式"
                extra="启用详细日志记录和调试信息"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name={['advanced', 'logLevel']}
                label="日志级别"
              >
                <Select>
                  <Option value="error">错误</Option>
                  <Option value="warn">警告</Option>
                  <Option value="info">信息</Option>
                  <Option value="debug">调试</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name={['advanced', 'customCssPath']}
                label="自定义CSS路径"
                extra="指定自定义CSS文件的路径以覆盖应用样式"
              >
                <Input placeholder="例如：C:\path\to\custom.css" />
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
      
      {/* 代理设置对话框 */}
      <ProxyModal
        visible={proxyModalVisible}
        isGlobal={true}
        proxyConfig={proxyConfig}
        onSave={handleSaveProxy}
        onCancel={() => setProxyModalVisible(false)}
      />
    </>
  );
};

export default SettingsModal; 