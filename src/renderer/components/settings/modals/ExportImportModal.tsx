/**
 * 导入/导出LLM配置对话框
 * 用于将LLM配置、模板等导入导出为JSON文件
 */
import React, { useState, useRef } from 'react';
import { Modal, Tabs, Button, Upload, Space, Alert, Typography, Checkbox, Spin, Divider, message } from 'antd';
import { 
  ImportOutlined, 
  ExportOutlined, 
  FileTextOutlined, 
  UploadOutlined, 
  CloseOutlined, 
  DownloadOutlined,
  SettingOutlined,
  RobotOutlined,
  FileOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import * as configIPC from '../utils/ipc/config';
import * as providerIPC from '../utils/ipc/provider';
import * as templateIPC from '../utils/ipc/template';
import * as proxyIPC from '../utils/ipc/proxy';
import { LLMConfig, PromptTemplate, ProxyConfig, LLMProvider } from '../../../../common/types/llm';

// 提供商接口定义
interface Provider {
  id: string;
  provider: LLMProvider;
  name?: string;
  isDefault?: boolean;
}

const { Paragraph, Text, Title } = Typography;
const { TabPane } = Tabs;
const { Dragger } = Upload;

interface ExportImportModalProps {
  visible: boolean;
  onCancel: () => void;
  onImportComplete: () => void;
}

/**
 * 导入/导出对话框组件
 */
const ExportImportModal: React.FC<ExportImportModalProps> = ({
  visible,
  onCancel,
  onImportComplete
}) => {
  const [activeTab, setActiveTab] = useState<string>('export');
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [importLoading, setImportLoading] = useState<boolean>(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<{
    configs?: LLMConfig[];
    templates?: PromptTemplate[];
    providers?: Provider[];
    proxy?: ProxyConfig;
  } | null>(null);

  // 导出选项
  const [exportOptions, setExportOptions] = useState({
    configs: true,
    templates: true,
    providers: true,
    proxy: true
  });

  // 导入选项
  const [importOptions, setImportOptions] = useState({
    configs: true,
    templates: true,
    providers: true,
    proxy: true,
    overwrite: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理导出逻辑
  const handleExport = async () => {
    try {
      setExportLoading(true);
      
      const exportData: any = {};
      
      // 根据选项导出数据
      if (exportOptions.configs) {
        const configs = await configIPC.getAllConfigs();
        exportData.configs = configs;
      }
      
      if (exportOptions.templates) {
        const templates = await templateIPC.getAllTemplates();
        exportData.templates = templates;
      }
      
      if (exportOptions.providers) {
        // 这里只能导出已知的提供商列表，实际应用中可能需要实现具体的获取逻辑
        const providers = Object.values(LLMProvider).map(providerId => ({
          id: providerId,
          provider: providerId,
          name: providerIPC.getProviderName(providerId as LLMProvider)
        }));
        exportData.providers = providers;
      }
      
      if (exportOptions.proxy) {
        const proxy = await proxyIPC.getGlobalProxy();
        exportData.proxy = proxy;
      }
      
      // 如果没有选择任何导出选项，显示错误
      if (Object.keys(exportData).length === 0) {
        message.error('请至少选择一项导出内容');
        return;
      }
      
      // 触发文件下载
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `llm-settings-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      message.success('导出成功');
    } catch (error) {
      console.error('导出数据失败:', error);
      message.error('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setExportLoading(false);
    }
  };

  // 处理导入文件选择
  const handleImportFileChange = (info: any) => {
    // 重置导入状态
    setImportError(null);
    setImportPreview(null);
    
    const file = info.file || info.fileList[0]?.originFileObj;
    
    if (!file) {
      return;
    }
    
    setImportFile(file);
    
    // 读取文件内容
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // 验证导入数据格式
        if (!data || typeof data !== 'object') {
          throw new Error('无效的导入数据格式');
        }
        
        // 设置导入预览
        setImportPreview({
          configs: Array.isArray(data.configs) ? data.configs : undefined,
          templates: Array.isArray(data.templates) ? data.templates : undefined,
          providers: Array.isArray(data.providers) ? data.providers : undefined,
          proxy: data.proxy ? data.proxy : undefined
        });
        
        // 更新导入选项，仅启用文件中包含的数据类型
        setImportOptions({
          ...importOptions,
          configs: !!data.configs,
          templates: !!data.templates,
          providers: !!data.providers,
          proxy: !!data.proxy
        });
      } catch (error) {
        console.error('解析导入文件失败:', error);
        setImportError('无法解析导入文件，请确保格式正确的JSON文件');
      }
    };
    
    reader.readAsText(file);
  };

  // 处理导入操作
  const handleImport = async () => {
    if (!importFile || !importPreview) {
      message.error('请先选择要导入的文件');
      return;
    }
    
    try {
      setImportLoading(true);
      
      // 读取文件内容
      const reader = new FileReader();
      
      const importPromise = new Promise<void>((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            const content = e.target?.result as string;
            const data = JSON.parse(content);
            
            // 导入配置
            if (importOptions.configs && Array.isArray(data.configs)) {
              // 逐个保存配置
              for (const config of data.configs) {
                try {
                  await configIPC.saveConfig(config);
                } catch (err) {
                  console.error('导入配置项失败:', err);
                }
              }
            }
            
            // 导入模板
            if (importOptions.templates && Array.isArray(data.templates)) {
              // 逐个保存模板
              for (const template of data.templates) {
                try {
                  await templateIPC.saveTemplate(template);
                } catch (err) {
                  console.error('导入模板项失败:', err);
                }
              }
            }
            
            // 导入提供商 - 目前只能设置默认提供商
            if (importOptions.providers && Array.isArray(data.providers)) {
              // 查找默认提供商
              const defaultProvider = data.providers.find((p: Provider) => p.isDefault);
              if (defaultProvider) {
                try {
                  await providerIPC.setDefaultProvider(defaultProvider.id);
                } catch (err) {
                  console.error('设置默认提供商失败:', err);
                }
              }
            }
            
            // 导入代理设置
            if (importOptions.proxy && data.proxy) {
              try {
                await proxyIPC.setGlobalProxy(data.proxy);
              } catch (err) {
                console.error('导入代理设置失败:', err);
              }
            }
            
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = () => reject(new Error('读取文件失败'));
        
        reader.readAsText(importFile);
      });
      
      await importPromise;
      
      message.success('导入成功');
      onImportComplete();
      
    } catch (error) {
      console.error('导入数据失败:', error);
      message.error('导入失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setImportLoading(false);
    }
  };

  // 导入预览信息
  const renderImportPreview = () => {
    if (!importPreview) return null;
    
    return (
      <div style={{ marginTop: 16 }}>
        <Title level={5}>导入文件包含以下内容：</Title>
        <ul>
          {importPreview.configs && (
            <li>
              <RobotOutlined /> LLM配置: {importPreview.configs.length} 个
            </li>
          )}
          {importPreview.templates && (
            <li>
              <FileTextOutlined /> 提示词模板: {importPreview.templates.length} 个
            </li>
          )}
          {importPreview.providers && (
            <li>
              <SettingOutlined /> 提供商: {importPreview.providers.length} 个
            </li>
          )}
          {importPreview.proxy && (
            <li>
              <GlobalOutlined /> 代理设置
            </li>
          )}
        </ul>
      </div>
    );
  };

  return (
    <Modal
      title="导入/导出设置"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      maskClosable={false}
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        tabBarStyle={{ marginBottom: 24 }}
      >
        <TabPane 
          tab={<span><ExportOutlined />导出</span>} 
          key="export"
        >
          <Alert
            message="导出设置"
            description="将LLM配置、模板和其他设置导出到JSON文件，以便备份或在其他设备上使用。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <div style={{ marginBottom: 16 }}>
            <Paragraph>选择要导出的内容：</Paragraph>
            
            <Checkbox
              checked={exportOptions.configs}
              onChange={e => setExportOptions({ ...exportOptions, configs: e.target.checked })}
            >
              <Space>
                <RobotOutlined />
                <Text>LLM配置</Text>
              </Space>
            </Checkbox>
            <br />
            
            <Checkbox
              checked={exportOptions.templates}
              onChange={e => setExportOptions({ ...exportOptions, templates: e.target.checked })}
            >
              <Space>
                <FileTextOutlined />
                <Text>提示词模板</Text>
              </Space>
            </Checkbox>
            <br />
            
            <Checkbox
              checked={exportOptions.providers}
              onChange={e => setExportOptions({ ...exportOptions, providers: e.target.checked })}
            >
              <Space>
                <SettingOutlined />
                <Text>提供商配置</Text>
              </Space>
            </Checkbox>
            <br />
            
            <Checkbox
              checked={exportOptions.proxy}
              onChange={e => setExportOptions({ ...exportOptions, proxy: e.target.checked })}
            >
              <Space>
                <GlobalOutlined />
                <Text>代理设置</Text>
              </Space>
            </Checkbox>
          </div>
          
          <Divider />
          
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={exportLoading}
            disabled={!Object.values(exportOptions).some(v => v)}
            block
          >
            导出到文件
          </Button>
        </TabPane>
        
        <TabPane 
          tab={<span><ImportOutlined />导入</span>} 
          key="import"
        >
          <Alert
            message="导入设置"
            description="从之前导出的JSON文件中导入LLM配置、模板和其他设置。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          {importError && (
            <Alert
              message="导入错误"
              description={importError}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          
          <Dragger
            name="file"
            accept=".json"
            multiple={false}
            maxCount={1}
            beforeUpload={() => false}
            onChange={handleImportFileChange}
            disabled={importLoading}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <FileOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域</p>
            <p className="ant-upload-hint">
              支持单个JSON文件导入
            </p>
          </Dragger>
          
          {importPreview && (
            <>
              {renderImportPreview()}
              
              <Divider />
              
              <div style={{ marginBottom: 16 }}>
                <Paragraph>选择要导入的内容：</Paragraph>
                
                <Checkbox
                  checked={importOptions.configs}
                  onChange={e => setImportOptions({ ...importOptions, configs: e.target.checked })}
                  disabled={!importPreview.configs}
                >
                  <Space>
                    <RobotOutlined />
                    <Text>LLM配置</Text>
                  </Space>
                </Checkbox>
                <br />
                
                <Checkbox
                  checked={importOptions.templates}
                  onChange={e => setImportOptions({ ...importOptions, templates: e.target.checked })}
                  disabled={!importPreview.templates}
                >
                  <Space>
                    <FileTextOutlined />
                    <Text>提示词模板</Text>
                  </Space>
                </Checkbox>
                <br />
                
                <Checkbox
                  checked={importOptions.providers}
                  onChange={e => setImportOptions({ ...importOptions, providers: e.target.checked })}
                  disabled={!importPreview.providers}
                >
                  <Space>
                    <SettingOutlined />
                    <Text>提供商配置</Text>
                  </Space>
                </Checkbox>
                <br />
                
                <Checkbox
                  checked={importOptions.proxy}
                  onChange={e => setImportOptions({ ...importOptions, proxy: e.target.checked })}
                  disabled={!importPreview.proxy}
                >
                  <Space>
                    <GlobalOutlined />
                    <Text>代理设置</Text>
                  </Space>
                </Checkbox>
                
                <Divider dashed />
                
                <Checkbox
                  checked={importOptions.overwrite}
                  onChange={e => setImportOptions({ ...importOptions, overwrite: e.target.checked })}
                >
                  <Space>
                    <Text>覆盖现有项目（如果存在同名或相同ID的项目）</Text>
                  </Space>
                </Checkbox>
              </div>
              
              <Divider />
              
              <Button
                type="primary"
                icon={<ImportOutlined />}
                onClick={handleImport}
                loading={importLoading}
                disabled={!Object.values(importOptions).some(v => v && v !== importOptions.overwrite)}
                block
              >
                开始导入
              </Button>
            </>
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default ExportImportModal; 