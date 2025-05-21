/**
 * 模型服务设置页面
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Spin, Modal, Input, Form, message } from 'antd';
import * as providerIPC from './utils/ipc/provider';
import ProviderList from './components/ProviderList';
import ProviderDetailPanel from './components/ProviderDetailPanel';
import { updateAppTitle } from './utils/domUtils';

// 样式
const containerStyle: React.CSSProperties = {
  height: '100%',
  display: 'flex',
  overflow: 'hidden'
};

const leftPanelStyle: React.CSSProperties = {
  width: '280px',
  borderRight: '1px solid #f0f0f0',
  height: '100%'
};

const rightPanelStyle: React.CSSProperties = {
  flex: 1,
  height: '100%',
  overflow: 'auto'
};

// 新增提供商表单接口
interface AddProviderFormValues {
  id: string;
  name: string;
}

/**
 * LLM设置组件
 */
const LLMSettings: React.FC = () => {
  // 状态
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [addProviderVisible, setAddProviderVisible] = useState<boolean>(false);
  const [addProviderForm] = Form.useForm<AddProviderFormValues>();
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
  // 确保标题正确设置
  useEffect(() => {
    // 仅在标题未设置时设置标题，避免覆盖设置页面的主标题
    if (!window.currentAppTitle) {
      updateAppTitle('模型服务');
    }
  }, []);

  // 加载提供商列表
  const loadProviders = useCallback(async () => {
    setLoading(true);
    try {
      // 尝试从IPC获取提供商列表
      const providerList = await providerIPC.getProviders();
      
      if (providerList && providerList.length > 0) {
        setProviders(providerList);
        
        // 如果未选中任何提供商，或之前选中的提供商不在列表中，则选择第一个
        if (!selectedProviderId || !providerList.find(p => p.id === selectedProviderId)) {
          setSelectedProviderId(providerList[0].id);
        }
      } else {
        setProviders([]);
        setSelectedProviderId('');
      }
    } catch (error) {
      console.error('加载提供商列表失败:', error);
      message.error('加载提供商列表失败');
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, [selectedProviderId]);

  // 首次加载和刷新触发器变化时重新加载
  useEffect(() => {
    loadProviders();
  }, [loadProviders, refreshTrigger]);

  // 处理提供商选择
  const handleProviderSelect = useCallback((providerId: string) => {
    setSelectedProviderId(providerId);
  }, []);

  // 处理删除提供商
  const handleDeleteProvider = useCallback(async (providerId: string) => {
    if (!providerId) return;

    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个提供商吗？此操作无法撤销。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const success = await providerIPC.deleteProvider(providerId);
          if (success) {
            // 刷新列表
            setRefreshTrigger(prev => prev + 1);
            
            // 如果删除的是当前选中的提供商，则清空选择
            if (providerId === selectedProviderId) {
              setSelectedProviderId('');
            }
          }
        } catch (error) {
          console.error('删除提供商失败:', error);
          message.error('删除提供商失败');
        }
      }
    });
  }, [selectedProviderId]);

  // 添加提供商弹窗
  const showAddProviderModal = useCallback(() => {
    setAddProviderVisible(true);
    addProviderForm.resetFields();
  }, [addProviderForm]);

  // 处理添加提供商
  const handleAddProvider = useCallback(async (values: AddProviderFormValues) => {
    try {
      const { id, name } = values;
      
      if (!id || !name) {
        message.error('提供商ID和名称不能为空');
        return;
      }
      
      // 检查ID是否重复
      if (providers.some(p => p.id === id)) {
        message.error('提供商ID已存在');
        return;
      }
      
      const newProvider = {
        id,
        name,
        enabled: true,
        models: []
      };
      
      const success = await providerIPC.createProvider(newProvider);
      
      if (success) {
        setAddProviderVisible(false);
        // 刷新列表并选中新添加的提供商
        setRefreshTrigger(prev => prev + 1);
        setSelectedProviderId(id);
      }
    } catch (error) {
      console.error('添加提供商失败:', error);
      message.error('添加提供商失败');
    }
  }, [providers, addProviderForm]);

  return (
    <div style={containerStyle}>
      {/* 左侧提供商列表 */}
      <div style={leftPanelStyle}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Spin tip="加载中..." />
          </div>
        ) : (
          <ProviderList 
            providers={providers}
            selectedProviderId={selectedProviderId}
            onProviderSelect={handleProviderSelect}
            onProviderDelete={handleDeleteProvider}
            onAddProvider={showAddProviderModal}
          />
        )}
      </div>
      
      {/* 右侧提供商详情 */}
      <div style={rightPanelStyle}>
        {selectedProviderId ? (
          <ProviderDetailPanel 
            providerId={selectedProviderId} 
          />
        ) : (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            color: '#999'
          }}>
            {providers.length > 0 ? '请选择一个提供商' : '没有可用的提供商，请点击添加'}
          </div>
        )}
      </div>
      
      {/* 添加提供商弹窗 */}
      <Modal
        title="添加提供商"
        open={addProviderVisible}
        onOk={() => addProviderForm.submit()}
        onCancel={() => setAddProviderVisible(false)}
        okText="添加"
        cancelText="取消"
      >
        <Form
          form={addProviderForm}
          layout="vertical"
          onFinish={handleAddProvider}
        >
          <Form.Item 
            name="id" 
            label="提供商ID"
            rules={[{ required: true, message: '请输入提供商ID' }]}
          >
            <Input placeholder="例如: openai, anthropic, custom等" />
          </Form.Item>
          <Form.Item 
            name="name" 
            label="提供商名称"
            rules={[{ required: true, message: '请输入提供商名称' }]}
          >
            <Input placeholder="例如: OpenAI, Anthropic, 自定义服务商等" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LLMSettings; 