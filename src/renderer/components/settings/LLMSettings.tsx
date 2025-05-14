/**
 * LLM设置组件 - 入口文件
 * 这是其他组件引入的主入口点，保持向后兼容性
 */
import React, { useEffect, useState, FC, ReactElement } from 'react';
import { Box, Flex, Text, Input as ChakraInput, IconButton, VStack, Heading, Divider as ChakraDivider, Button, Switch, useColorMode } from '@chakra-ui/react';
import { Button as AntButton, Card, Form, Modal, message, Divider, Input, InputNumber, Slider, Typography, Select } from 'antd';
import { PlusOutlined, SettingOutlined, DeleteOutlined, EditOutlined, GlobalOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faPlus, 
  faCheckCircle, 
  faArrowLeft, 
  faChevronUp, 
  faChevronDown,
  faCircle
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { LLMConfig, LLMProvider, PromptTemplate, ApiKeyTestResult, ProxyConfig, LLMModelConfig } from '../../../common/types/llm';
import { LLMService } from '../../services/ipc';
import LLMModelConfigComponent from './LLMModelConfig';
import LLMTemplateConfig from './LLMTemplateConfig';
import LLMProxyConfig from './LLMProxyConfig';
import LLMApiKeyConfig from './LLMApiKeyConfig';
import { v4 as uuid } from 'uuid';

// 引入新的工具函数
import { getProviderName, filterProviders, useStyleConfig } from './llm/utils';
import { ProviderItem, itemAnim } from './llm/types';

// 注册FontAwesome图标
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(faSearch, faPlus, faCheckCircle, faArrowLeft, faChevronUp, faChevronDown, faCircle);

const { Title, Text: AntText } = Typography;
const { TextArea } = Input;

// 定义Provider接口以避免类型错误
interface Provider {
  id: string;
  provider: LLMProvider;
  name?: string;
  isDefault?: boolean;
}

// 添加全局代理配置类型
interface GlobalProxyConfig extends ProxyConfig {
  isGlobal: boolean;
}

// 修复LLMConfigCard组件的类型
interface LLMConfigCardProps {
  config: LLMConfig;
  onEdit: (config: LLMConfig) => void;
  onDelete: (config: LLMConfig) => void;
  onSetDefault: (config: LLMConfig) => void;
  onSetProxy: (config: LLMConfig) => void;
}

const LLMSettings: FC = (): ReactElement => {
  // 添加useColorMode调用
  const { colorMode } = useColorMode();
  
  // 状态定义 - 添加全局代理配置
  const [configs, setConfigs] = useState<LLMConfig[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<LLMConfig | null>(null);
  const [activeConfig, setActiveConfig] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isProxyVisible, setIsProxyVisible] = useState<boolean>(false);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState<boolean>(false);
  const [isCreateConfig, setIsCreateConfig] = useState<boolean>(false);
  const [currentProxy, setCurrentProxy] = useState<ProxyConfig | null>(null);
  const [globalProxy, setGlobalProxy] = useState<GlobalProxyConfig>({
    enabled: false,
    host: '',
    port: 1080,
    protocol: 'http',
    isGlobal: true
  });
  const [availableModels, setAvailableModels] = useState<LLMModelConfig[]>([]);
  const [isEditTemplateVisible, setIsEditTemplateVisible] = useState<boolean>(false);
  const [currentTemplate, setCurrentTemplate] = useState<PromptTemplate | null>(null);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSection, setActiveSection] = useState<'config' | 'template' | 'global'>('config');
  const [activeProviderId, setActiveProviderId] = useState<string | null>(null);
  const [loadingModels, setLoadingModels] = useState<boolean>(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const [providerForm] = Form.useForm();
  const [proxyForm] = Form.useForm();
  const [isCustomModelModalVisible, setIsCustomModelModalVisible] = useState<boolean>(false);
  const [customModelForm] = Form.useForm();
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState<boolean>(false);
  const [modelId, setModelId] = useState<string>('');
  const [isGlobalProxyExpanded, setIsGlobalProxyExpanded] = useState<boolean>(false);
  const [isAdvancedParamsOpen, setIsAdvancedParamsOpen] = useState<boolean>(false);
  
  // 样式配置
  const styleConfig = useStyleConfig();
  // 添加navRadius属性
  const enhancedStyleConfig = {
    ...styleConfig,
    navRadius: "md", // 添加导航按钮的圆角样式
  };

  // 滚动条样式，优化为更小更精致的样式，并添加浏览器兼容性支持
  const scrollbarStyle = React.useMemo(() => ({
    '&::-webkit-scrollbar': {
      width: '4px',
      height: '4px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.25)',
    },
    // Firefox样式通过内联方式添加，避免类型错误
  }), []);

  // 加载数据 - 添加加载全局代理配置
  const loadData = async () => {
    try {
      // 获取所有配置
      const response = await LLMService.getAllConfigs<LLMConfig>();
      console.log('加载配置返回:', response);
      
      // 确保我们处理了不同格式的响应
      let loadedConfigs: LLMConfig[] = [];
      if (Array.isArray(response)) {
        loadedConfigs = response;
      } else if (response && typeof response === 'object') {
        // 使用类型断言确保TypeScript不会报错
        const typedResponse = response as any;
        if (typedResponse.data && Array.isArray(typedResponse.data)) {
          loadedConfigs = typedResponse.data as LLMConfig[];
        } else if (typedResponse.success && typedResponse.data && Array.isArray(typedResponse.data)) {
          loadedConfigs = typedResponse.data as LLMConfig[];
        }
      }
      
      setConfigs(loadedConfigs || []);
      
      // 获取所有模板
      const templatesResponse = await LLMService.getAllTemplates<PromptTemplate>();
      let loadedTemplates: PromptTemplate[] = [];
      
      if (Array.isArray(templatesResponse)) {
        loadedTemplates = templatesResponse;
      } else if (templatesResponse && typeof templatesResponse === 'object') {
        // 使用类型断言确保TypeScript不会报错
        const typedTemplatesResponse = templatesResponse as any;
        if (typedTemplatesResponse.data && Array.isArray(typedTemplatesResponse.data)) {
          loadedTemplates = typedTemplatesResponse.data as PromptTemplate[];
        }
      }
      
      setTemplates(loadedTemplates || []);
      
      // 加载全局代理配置
      try {
        const globalProxyConfig = await LLMService.getGlobalProxy();
        if (globalProxyConfig) {
          console.log('加载全局代理配置:', globalProxyConfig);
          
          // 确保enabled字段是布尔值
          const configWithCorrectTypes = {
            ...globalProxyConfig,
            isGlobal: true,
            enabled: !!globalProxyConfig.enabled
          };
          
          // 更新状态
          setGlobalProxy(configWithCorrectTypes);
          
          // 立即更新表单值，确保UI正确显示
          proxyForm.setFieldsValue(configWithCorrectTypes);
          
          console.log('表单已设置全局代理值:', proxyForm.getFieldsValue());
        }
      } catch (error) {
        console.error('加载全局代理配置失败:', error);
      }
      
      // 提取所有提供商并去重
      const allProviders = loadedConfigs?.map(config => config.provider) || [];
      const uniqueProviders = Array.from(new Set(allProviders));
      
      // 初始化提供商列表
      const initialProviders: Provider[] = uniqueProviders.map(provider => ({
        id: provider, // 使用provider作为id
        provider: provider as LLMProvider,
        name: getProviderName(provider as LLMProvider),
        isDefault: provider === LLMProvider.OPENAI
      }));
      
      // 添加可能没有配置但需要显示的提供商
      const mustHaveProviders = Object.values(LLMProvider);
      mustHaveProviders.forEach(provider => {
        if (!initialProviders.some(p => p.provider === provider)) {
          initialProviders.push({
            id: provider,
            provider: provider as LLMProvider,
            name: getProviderName(provider as LLMProvider),
            isDefault: false
          });
        }
      });
      
      setProviders(initialProviders);
      
      // 选中默认配置
      const defaultConfig = loadedConfigs?.find(config => config.isDefault);
      if (defaultConfig) {
        setSelectedConfig(defaultConfig);
        setActiveConfig(defaultConfig.id);
        setActiveProviderId(defaultConfig.provider);
      } else if (initialProviders.length > 0) {
        // 如果没有默认配置，选择第一个提供商
        setActiveProviderId(initialProviders[0].id);
      }
    } catch (error) {
      console.error('Failed to load configs:', error);
      message.error('加载配置失败');
    }
  };

  // 初始化
  useEffect(() => {
    loadData();
    // 初始化时设置全局设置为折叠状态
    setIsGlobalProxyExpanded(false);
  }, []);

  // 按提供商对配置进行分组
  const groupedConfigs = React.useMemo(() => {
    const groups: Record<string, ProviderItem[]> = {};
    
    // 找出所有有效的提供商
    const validProviders = providers.filter(p => 
      p && p.id && p.id !== 'undefined' && 
      p.provider && 
      typeof p.provider === 'string'
    );
    
    // 先为每个有效的提供商创建一个空数组
    validProviders.forEach(p => {
      groups[p.id] = [];
    });
    
    // 然后将配置分配到相应的提供商下
    configs.forEach(config => {
      if (!config || !config.provider) return;
      
      // 查找对应的提供商ID
      const providerId = validProviders.find(p => p.provider === config.provider)?.id;
      
      // 如果找到对应的提供商ID，则添加配置
      if (providerId && groups[providerId]) {
        groups[providerId].push({
          id: config.id,
          provider: config.provider,
          name: config.name,
          isDefault: config.isDefault
        });
      }
    });
    
    return groups;
  }, [configs, providers]);

  /**
   * 过滤提供商配置并清除无效数据
   * @param query 搜索关键词
   * @returns 过滤后的配置组
   */
  const filterProviderConfigs = (query: string): Record<string, ProviderItem[]> => {
    // 空查询返回所有配置，同时过滤掉undefined键
    if (!query || !query.trim()) {
      // 确保没有undefined键
      const cleanedGroups: Record<string, ProviderItem[]> = {};
      Object.entries(groupedConfigs).forEach(([provider, items]) => {
        if (provider !== 'undefined' && provider !== undefined && provider !== null) {
          cleanedGroups[provider] = items.filter(item => item !== undefined && item !== null);
        }
      });
      return cleanedGroups;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const filteredGroups: Record<string, ProviderItem[]> = {};
    
    // 遍历所有提供商组，跳过undefined键
    Object.entries(groupedConfigs).forEach(([provider, items]) => {
      // 跳过undefined或无效键
      if (provider === 'undefined' || provider === undefined || provider === null) {
        return;
      }
      
      // 1. 检查提供商名称是否匹配
      const providerName = getProviderName(provider as unknown as LLMProvider).toLowerCase();
      if (providerName.includes(lowercaseQuery)) {
        // 如果提供商名称匹配，包含该提供商的所有配置（过滤掉undefined项）
        filteredGroups[provider] = [...items].filter(item => item !== undefined && item !== null);
        return;
      }
      
      // 2. 否则，检查该提供商下的各个配置名称是否匹配
      const matchedItems = items.filter(item => {
        // 跳过undefined项
        if (!item) return false;
        
        // 安全地检查name属性
        if (item.name && typeof item.name === 'string') {
          return item.name.toLowerCase().includes(lowercaseQuery);
        }
        return false;
      });
      
      // 如果有匹配的配置，添加到结果中
      if (matchedItems && matchedItems.length > 0) {
        filteredGroups[provider] = matchedItems;
      }
    });
    
    return filteredGroups;
  };

  // 更新过滤配置列表的实现
  const filteredConfigs = React.useMemo(() => {
    return filterProviderConfigs(searchQuery);
  }, [groupedConfigs, searchQuery]);

  // 提交配置表单
  const handleConfigSubmit = async (values: any) => {
    try {
      // 保存当前选中的提供商ID
      const currentProviderId = activeProviderId;
      
      const { name, modelConfig, temperature, topP, frequencyPenalty, presencePenalty, maxTokens, systemMessage } = values;
      
      // 获取选中的模型信息
      const selectedModel = availableModels.find(m => m.id === modelConfig.modelId);
      const modelName = selectedModel ? selectedModel.name : modelConfig.modelId;
      
      // 检查是否是自定义模型
      const isCustomModel = selectedModel?.isCustom || false;
      
      // 准备配置数据
      let configData: LLMConfig = {
        id: isCreateConfig ? uuid() : selectedConfig!.id,
        name,
        provider: modelConfig.provider, // 来自隐藏表单字段
        modelId: modelConfig.modelId,
        modelName: modelName,
        temperature: parseFloat(temperature),
        topP: parseFloat(topP),
        frequencyPenalty: parseFloat(frequencyPenalty),
        presencePenalty: parseFloat(presencePenalty),
        maxTokens: parseInt(maxTokens),
        systemMessage,
        isDefault: selectedConfig?.isDefault || false,
        createdAt: isCreateConfig ? new Date().toISOString() : selectedConfig!.createdAt,
        updatedAt: new Date().toISOString(),
        apiKey: values.apiKey,
        options: {
          customModels: selectedConfig?.options?.customModels || []
        }
      };
      
      // 添加providerId关联
      (configData as any).providerId = modelConfig.providerId || activeProviderId;
      
      // 如果是自定义模型，将其添加到配置的自定义模型列表中
      if (isCustomModel) {
        if (!configData.options) configData.options = {};
        if (!configData.options.customModels) configData.options.customModels = [];
        
        // 检查是否已存在该模型
        const existingModelIndex = configData.options.customModels.findIndex((m: LLMModelConfig) => m.id === selectedModel!.id);
        
        if (existingModelIndex >= 0) {
          // 更新现有模型
          configData.options.customModels[existingModelIndex] = selectedModel!;
      } else {
          // 添加新模型
          configData.options.customModels.push(selectedModel!);
        }
      }
      
      // 保存配置
      const response = await LLMService.saveConfig(configData);
      
      // 检查响应格式并处理
      let savedConfig: LLMConfig | null = null;
      if (response && typeof response === 'object') {
        // 使用类型断言确保TypeScript不会报错
        const typedResponse = response as any;
        if ('data' in typedResponse && typedResponse.data) {
          savedConfig = typedResponse.data as LLMConfig;
        } else if ('id' in typedResponse) {
          savedConfig = typedResponse as LLMConfig;
        }
      }
      
      // 如果保存成功并返回了有效的配置
      if (savedConfig) {
        message.success(isCreateConfig ? '创建配置成功' : '更新配置成功');
        setIsModalVisible(false);
        
        // 重新加载数据
        await loadData();
        
        // 恢复当前选中的提供商
        if (currentProviderId) {
          setActiveProviderId(currentProviderId);
        }
        
        // 如果是新创建的配置，选中它
        if (isCreateConfig) {
          // 通过定时器异步执行，以确保loadData已完成
          setTimeout(() => {
            const newConfig = configs.find(c => c.id === savedConfig!.id);
            if (newConfig) {
              setSelectedConfig(newConfig);
              setActiveConfig(newConfig.id);
            }
          }, 500);
        }
      } else {
        // 保存失败或返回的数据无效
        message.error(isCreateConfig ? '创建配置失败' : '更新配置失败');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      message.error(isCreateConfig ? '创建配置失败' : '更新配置失败');
    }
  };

  // 处理提供商变更
  const handleProviderChange = async (provider: string) => {
    try {
      const models = await LLMService.getAvailableModels(provider as LLMProvider);
      setAvailableModels(models || getDefaultModels(provider as LLMProvider));
    } catch (error) {
      console.error('获取模型列表失败:', error);
      // 使用默认模型列表替代
      setAvailableModels(getDefaultModels(provider as LLMProvider));
      message.warning('无法获取在线模型列表，将使用默认模型配置');
    }
  };
  
  // 设置代理
  const handleSetProxy = async (values: ProxyConfig) => {
    try {
      // 保存当前选中的提供商ID
      const currentProviderId = activeProviderId;
      
      // 确保我们有选中的配置
      if (selectedConfig) {
        const updatedConfig = { 
          ...selectedConfig,
          proxy: values,
          updatedAt: new Date().toISOString()
        };
        await LLMService.saveConfig(updatedConfig);
        message.success('保存代理设置成功');
        setIsProxyVisible(false);
        await loadData();
        
        // 恢复当前选中的提供商
        if (currentProviderId) {
          setActiveProviderId(currentProviderId);
        }
      } else {
        message.error('未选中配置，无法保存代理设置');
      }
    } catch (error) {
      console.error('Failed to save proxy:', error);
      message.error('保存代理设置失败');
    }
  };

  // 修改全局代理配置函数，确保正确保存和更新UI状态
  const saveGlobalProxy = async (values: GlobalProxyConfig) => {
    try {
      // 处理checkbox状态
      console.log('保存全局代理配置，传入值:', values);
      
      // 添加isGlobal标识，确保保存的是全局配置
      const configToSave = { 
        ...values, 
        isGlobal: true,
        // 确保enabled字段是布尔值
        enabled: !!values.enabled 
      };
      
      console.log('即将保存的全局代理配置:', configToSave);
      
      // 保存到服务端
      await LLMService.setGlobalProxy(configToSave);
      
      // 更新本地状态
      setGlobalProxy(configToSave);
      
      // 立即更新表单值，确保保存后的值正确显示
      proxyForm.setFieldsValue({
        ...configToSave,
        enabled: configToSave.enabled  // 特别确保enabled字段被正确设置
      });
      
      console.log('全局代理配置保存后状态:', {
        savedConfig: configToSave,
        formValues: proxyForm.getFieldsValue(),
        globalProxyState: configToSave.enabled
      });
      
      // 刷新Switch组件状态
      setTimeout(() => {
        const current = proxyForm.getFieldValue('enabled');
        console.log('延迟检查表单状态:', current);
        proxyForm.setFieldsValue({ enabled: configToSave.enabled });
      }, 100);
      
      message.success('全局代理配置已保存');
    } catch (error) {
      console.error('保存全局代理配置失败:', error);
      message.error('保存全局代理配置失败');
    }
  };

  // 打开代理设置 - 修改以支持全局代理
  const openProxySettings = async (config: LLMConfig) => {
    // 如果未传入config，则给出错误提示
    if (!config) {
      message.error('无法获取配置信息');
      return;
    }
    
    // 使用Modal直接打开
      Modal.confirm({
      title: '代理设置',
      content: (
        <Form form={proxyForm} layout="vertical">
          <div style={{ marginBottom: '16px' }}>
            <Text>您可以为此配置设置特定代理，或使用全局代理配置。</Text>
          </div>
          
          <Form.Item
            name="useGlobalProxy"
            valuePropName="checked"
            initialValue={!config.proxy?.enabled}
            label="使用全局代理设置"
          >
            <Switch />
          </Form.Item>
          
          <div style={{ marginTop: '8px', marginBottom: '16px' }}>
            <Text fontSize="sm" color="gray.500">
              {globalProxy.enabled ? 
                `全局代理已启用 (${globalProxy.protocol}://${globalProxy.host}:${globalProxy.port})` : 
                '全局代理当前已禁用'}
            </Text>
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <Text fontWeight="bold">特定代理设置:</Text>
          </div>
          
          <LLMProxyConfig
            initialValues={config.proxy || {
              enabled: false,
              host: '',
              port: 1080,
              protocol: 'http'
            }}
          />
        </Form>
      ),
        onOk: async () => {
          try {
          const values = await proxyForm.validateFields();
          
          // 更新当前处理的配置
          const updatedConfig = { ...config };
          
          // 如果选择使用全局代理，则禁用特定代理
          if (values.useGlobalProxy) {
            updatedConfig.proxy = {
              ...values.proxy,
              enabled: false
            };
            } else {
            updatedConfig.proxy = values.proxy;
          }
          
          // 更新配置
          updatedConfig.updatedAt = new Date().toISOString();
          await LLMService.saveConfig(updatedConfig);
          message.success('保存代理设置成功');
          
          // 重新加载数据
          loadData();
          } catch (error) {
          console.error('表单验证失败', error);
        }
      },
      width: 600
    });
  };

  // 确认删除配置
  const confirmDeleteConfig = async (config: LLMConfig) => {
    try {
      // 保存当前选中的提供商ID
      const currentProviderId = activeProviderId;
      
      // 确认删除对话框
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除配置 "${config.name}" 吗？此操作不可撤销。`,
        onOk: async () => {
          try {
            const result = await LLMService.deleteConfig(config.id);
            // 修复类型检查问题
            const success = result === true || (result && typeof result === 'object' && 'success' in result && (result as any).success);
            if (success) {
              message.success('删除配置成功');
              setSelectedConfig(null);
              setActiveConfig(null);
              await loadData();
              
              // 恢复当前选中的提供商
              if (currentProviderId) {
                setActiveProviderId(currentProviderId);
              }
            } else {
              message.error('删除配置失败');
            }
          } catch (error) {
            console.error('Failed to delete config:', error);
            message.error('删除配置失败');
          }
        }
      });
    } catch (error) {
      console.error('Failed to delete config:', error);
      message.error('删除配置失败');
    }
  };

  // 设置配置为默认
  const setAsDefault = async (config: LLMConfig) => {
    if (!config) return;
    
    try {
      await LLMService.setDefaultConfig(config.id);
      message.success('设置默认配置成功');
      loadData();
    } catch (error) {
      console.error('Failed to set default config:', error);
      message.error('设置默认配置失败');
    }
  };

  // 编辑配置
  const editConfig = async (config: LLMConfig) => {
    if (!config) return;
    
    setIsCreateConfig(false);
    
    try {
      // 获取提供商对应的模型列表
      let models;
      try {
        models = await LLMService.getAvailableModels(config.provider as LLMProvider);
      } catch (error) {
        console.error('获取模型列表失败', error);
        models = null;
      }
      
      // 如果获取失败，使用默认模型列表
      const modelsToUse = models && models.length > 0 ? 
        models : getDefaultModels(config.provider as LLMProvider);
      
      // 合并自定义模型
      if (config.options?.customModels && config.options.customModels.length > 0) {
        // 过滤掉已经存在于默认模型中的自定义模型（避免重复）
        const customModels = config.options.customModels.filter(
          (cm: LLMModelConfig) => !modelsToUse.some(m => m.id === cm.id)
        );
        setAvailableModels([...modelsToUse, ...customModels]);
      } else {
        setAvailableModels(modelsToUse);
      }
      
      // 设置表单值
      form.setFieldsValue({
        name: config.name,
        modelConfig: {
          provider: config.provider,
          modelId: config.modelId,
          modelName: config.modelName
        },
        temperature: config.temperature,
        topP: config.topP,
        frequencyPenalty: config.frequencyPenalty,
        presencePenalty: config.presencePenalty,
        maxTokens: config.maxTokens,
        systemMessage: config.systemMessage,
      });
      
      setIsModalVisible(true);
    } catch (error) {
      console.error('Failed to prepare edit:', error);
      message.error('准备编辑配置失败');
    }
  };

  // 创建新配置
  const createConfig = async () => {
    // 确保已选择服务商
    if (!activeConfig && !activeProviderId) {
      message.error('请先选择一个服务商');
      return;
    }
    
    setIsCreateConfig(true);
    form.resetFields();
    
    // 获取当前选中的服务商
    const currentSelectedProvider = activeProviderId ? 
      providers.find(p => p.id === activeProviderId)?.provider :
      selectedConfig?.provider;
    
    if (!currentSelectedProvider) {
      message.error('未能确定服务商类型');
      return;
    }
    
    // 初始化表单默认值
    form.setFieldsValue({
      temperature: 0.7,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      maxTokens: 2000,
      // 预设模型配置，使用当前选中的服务商
      modelConfig: {
        provider: currentSelectedProvider,
        providerId: activeProviderId, // 添加providerId，关联到当前选中的提供商
      }
    });
    
    setLoadingModels(true);
    // 获取该服务商的可用模型
    try {
      const models = await LLMService.getAvailableModels(currentSelectedProvider);
      const modelsToUse = models && models.length > 0 ? 
        models : getDefaultModels(currentSelectedProvider);
      
      setAvailableModels(modelsToUse);
      
      // 如果有默认模型，自动选择
      const defaultModel = modelsToUse.find(m => m.isDefault);
      if (defaultModel) {
        form.setFieldsValue({
          modelConfig: {
            provider: currentSelectedProvider,
            modelId: defaultModel.id,
            modelName: defaultModel.name
          }
        });
      }
      setLoadingModels(false);
    } catch (error) {
      console.error('获取模型列表失败', error);
      // 使用默认模型列表
      const defaultModels = getDefaultModels(currentSelectedProvider);
      setAvailableModels(defaultModels);
      
      // 自动选择默认模型
      const defaultModel = defaultModels.find(m => m.isDefault);
      if (defaultModel) {
        form.setFieldsValue({
          modelConfig: {
            provider: currentSelectedProvider,
            modelId: defaultModel.id,
            modelName: defaultModel.name
          }
        });
      }
      
      setLoadingModels(false);
      message.warning('无法获取在线模型列表，将使用默认模型配置');
    }
    
    setIsModalVisible(true);
  };

  // 添加自定义模型处理函数
  const handleAddCustomModel = () => {
    const values = customModelForm.getFieldsValue();
    
    // 处理自定义上下文长度
    let maxTokens = values.maxTokens;
    if (maxTokens === -1 && values.customMaxTokens) {
      maxTokens = values.customMaxTokens;
    }
    
    // 验证ID是否已存在
    if (availableModels.some((m: LLMModelConfig) => m.id === values.id)) {
      message.error(`模型ID "${values.id}" 已存在，请使用不同的ID`);
      return;
    }
    
    // 获取当前选中的服务商
    const currentProvider = activeProviderId ? 
      providers.find(p => p.id === activeProviderId)?.provider :
      selectedConfig?.provider;
    
    if (!currentProvider) {
      message.error('未能确定服务商类型');
      return;
    }
    
    // 创建新的自定义模型，确保字段与LLMModelConfig接口一致
    const newModel: LLMModelConfig = {
      id: values.id,
      name: values.name,
      maxTokens: maxTokens,
      isCustom: true,
      provider: currentProvider, // 关联到当前提供商
    };
    
    // 添加到可用模型列表
    setAvailableModels([...availableModels, newModel]);
    
    // 关闭模态框并重置表单
    setIsCustomModelModalVisible(false);
    customModelForm.resetFields();
    
    // 自动选择新创建的模型
    form.setFieldsValue({
      modelConfig: {
        ...form.getFieldValue('modelConfig'),
        modelId: values.id
      }
    });
    
    message.success(`自定义模型 "${values.name}" 已添加`);
  };

  // 打开添加自定义模型对话框
  const openAddCustomModelModal = () => {
    customModelForm.resetFields();
    setIsCustomModelModalVisible(true);
  };

  // 打开API密钥设置 - 修复参数处理并增强日志记录
  const openApiKeySettings = async (providerType?: string, providerName?: string): Promise<void> => {
    console.log('打开API密钥设置, 入参:', {
      providerType,
      providerName,
      activeProviderId
    });

    // 确保选择了服务商
    const providerValue = providerType || (activeProviderId ? 
      providers.find(p => p.id === activeProviderId)?.provider : 
      undefined);
    
    if (!providerValue) {
      message.info('请先选择一个服务商');
      return;
    }
    
    // 确保provider是字符串类型
    const providerString = typeof providerValue === 'object' ? JSON.stringify(providerValue) : String(providerValue);
    const trimmedProvider = providerString.trim();
    
    console.log('处理后的提供商信息:', {
      provider: trimmedProvider,
      type: typeof trimmedProvider
    });
    
    // 获取显示名称
    const displayName = providerName || getProviderName(providerValue as LLMProvider);
    
    // 尝试获取已有的API密钥状态
    let currentApiKeyStatus = '';
    try {
      console.log('正在获取API密钥状态:', trimmedProvider, typeof trimmedProvider);
      currentApiKeyStatus = await LLMService.getApiKey(trimmedProvider);
      console.log('获取API密钥状态成功:', currentApiKeyStatus);
    } catch (error) {
      console.error('获取API密钥状态失败:', error);
    }
    
    // 创建一个状态变量来跟踪API密钥
    let apiKeyValue = '';
    
    Modal.confirm({
      title: `${displayName} API密钥设置`,
      content: (
        <div style={{ padding: '10px 0' }}>
          <p style={{ marginBottom: '16px' }}>
            请输入您的API密钥，用于访问{displayName}的服务。
            {currentApiKeyStatus && (
              <span style={{ color: 'green', marginLeft: '10px' }}>
                (当前状态: {currentApiKeyStatus})
              </span>
            )}
          </p>
          <LLMApiKeyConfig
            provider={providerValue as LLMProvider}
            apiKey=""
            onApiKeyChange={(newKey) => {
              console.log('API密钥变更:', {
                length: newKey ? newKey.length : 0,
                isEmpty: !newKey || newKey.trim() === ''
              });
              apiKeyValue = newKey;
            }}
            onApiKeyTestSuccess={() => {
              message.success('API密钥测试成功');
            }}
          />
        </div>
      ),
      onOk: async () => {
        try {
          // 验证API密钥不为空
          const trimmedKey = apiKeyValue ? apiKeyValue.trim() : '';
          
          if (!trimmedKey) {
            console.error('API密钥保存失败: 密钥为空');
            message.error('API密钥不能为空');
            return Promise.reject('API密钥不能为空');
          }
          
          console.log('准备保存API密钥:', {
            provider: trimmedProvider,
            providerType: typeof trimmedProvider,
            apiKeyLength: trimmedKey.length
          });
          
          // 调用API保存密钥
          const saveResult = await LLMService.setApiKey(trimmedProvider, trimmedKey);
          console.log('API密钥保存结果:', saveResult);
          
          message.success('API密钥保存成功');
          
          // 重新加载数据
          await loadData();
          return Promise.resolve();
    } catch (error) {
          console.error('保存API密钥失败:', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          message.error('保存API密钥失败: ' + errorMessage);
          return Promise.reject(error);
        }
      },
      width: 600
    });
  };

  // 测试API密钥
  const testApiKey = async (provider: LLMProvider, key: string): Promise<ApiKeyTestResult> => {
    try {
      return await LLMService.testApiKey(provider, key);
    } catch (error) {
      console.error('Failed to test API key:', error);
      return { success: false, error: '测试API密钥失败' };
    }
  };

  // 使用类型接口
  const LLMConfigCard: React.FC<LLMConfigCardProps> = ({ config, onEdit, onDelete, onSetDefault, onSetProxy }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
      <Box 
        mb="4" 
        borderRadius="md" 
        border={`1px solid ${enhancedStyleConfig.borderColor}`}
        overflow="hidden"
        boxShadow="sm"
        transition="all 0.2s ease"
        _hover={{
          boxShadow: "md",
          borderColor: enhancedStyleConfig.activeBg
        }}
      >
        {/* 标题栏 - 灰色背景 */}
        <Flex 
          justifyContent="space-between" 
          alignItems="center" 
          p="3"
          bg="#f5f5f5"
          cursor="pointer"
          borderTopLeftRadius="md"
          borderTopRightRadius="md"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Flex alignItems="center">
            <Text fontWeight="bold" color="gray.700">{config.name}</Text>
                {config.isDefault && (
              <FontAwesomeIcon
                icon={faCheckCircle}
                style={{ 
                  color: '#52c41a', 
                  fontSize: '14px',
                  marginLeft: '8px'
                }}
              />
            )}
          </Flex>
          <Flex>
            <IconButton
              aria-label="编辑"
                icon={<EditOutlined />}
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                // 立即设置选中的配置为当前卡片的配置
                setSelectedConfig(config);
                setActiveConfig(config.id);
                // 然后调用编辑函数
                editConfig(config);
              }}
              mr="1"
            />
            <IconButton
              aria-label="代理设置"
                icon={<GlobalOutlined />}
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                // 立即设置选中的配置为当前卡片的配置
                setSelectedConfig(config);
                setActiveConfig(config.id);
                // 直接调用代理设置函数，传入当前配置
                openProxySettings(config);
              }}
              mr="1"
            />
            <IconButton
              aria-label="删除"
              icon={<DeleteOutlined />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={(e) => {
                e.stopPropagation();
                // 立即设置选中的配置为当前卡片的配置
                setSelectedConfig(config);
                setActiveConfig(config.id);
                // 然后调用删除函数，传入当前配置
                confirmDeleteConfig(config);
              }}
              mr="1"
            />
            <FontAwesomeIcon 
              icon={isExpanded ? faChevronUp : faChevronDown} 
              style={{ 
                fontSize: '16px',
                transition: 'transform 0.3s',
                color: 'gray'
              }}
            />
          </Flex>
        </Flex>
        
        {/* 展开内容 - 适配暗色模式的背景 */}
        {isExpanded && (
          <Box p="4" bg="white">
            {/* 基本信息 */}
            <Box mb="3">
              <Heading as="h4" size="sm" mb="2" color="gray.700">基本信息</Heading>
              <Flex mb="2">
                <Text fontWeight="bold" width="120px" color="gray.600">提供商：</Text>
                <Text color="gray.800">{getProviderName(config.provider as LLMProvider)}</Text>
              </Flex>
              <Flex mb="2">
                <Text fontWeight="bold" width="120px" color="gray.600">模型：</Text>
                <Text color="gray.800">{config.modelName}</Text>
              </Flex>
              <Flex mb="2">
                <Text fontWeight="bold" width="120px" color="gray.600">API密钥：</Text>
                <Text color="gray.800">{config.apiKey ? "已设置特定API密钥" : "使用全局API密钥"}</Text>
              </Flex>
              <Flex mb="2">
                <Text fontWeight="bold" width="120px" color="gray.600">代理设置：</Text>
                <Text color="gray.800">{config.proxy?.enabled ? "已启用" : "未启用"}</Text>
              </Flex>
            </Box>

            {/* 参数配置 */}
            <Box mb="3">
              <Heading as="h4" size="sm" mb="2" color="gray.700">参数配置</Heading>
              <Flex mb="2">
                <Text fontWeight="bold" width="120px" color="gray.600">Temperature：</Text>
                <Text color="gray.800">{config.temperature}</Text>
              </Flex>
              <Flex mb="2">
                <Text fontWeight="bold" width="120px" color="gray.600">Top P：</Text>
                <Text color="gray.800">{config.topP}</Text>
              </Flex>
              <Flex mb="2">
                <Text fontWeight="bold" width="120px" color="gray.600">Max Tokens：</Text>
                <Text color="gray.800">{config.maxTokens}</Text>
              </Flex>
            </Box>

            {/* 系统消息预览 */}
            {config.systemMessage && (
              <Box>
                <Heading as="h4" size="sm" mb="2" color="gray.700">系统消息</Heading>
                <Box 
                  p="3" 
                  bg="gray.50"
                  color="gray.800"
                  borderRadius="md" 
                  maxHeight="100px" 
                  overflowY="auto"
                  css={scrollbarStyle}
                  sx={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0, 0, 0, 0.12) transparent' }}
                >
                  <Text noOfLines={3} color="gray.800">{config.systemMessage}</Text>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  };

  // 修改配置详情渲染，使用卡片布局
  const renderConfigDetail = () => {
    // 如果没有选中服务商
    if (!activeProviderId) {
      return (
        <Flex
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          padding="20px"
        >
          <Text fontSize="lg" mb="4">请先选择左侧的服务商类型</Text>
          <Text fontSize="md" mb="6" color="gray.500" maxWidth="600px" textAlign="center">
            选择服务商后，您可以创建该服务商下的LLM配置，管理模型参数和API密钥。
          </Text>
        </Flex>
      );
    }

    // 获取当前选中提供商下的所有配置
    const providerType = providers.find(p => p.id === activeProviderId)?.provider;
    if (!providerType) return null;
    
    const currentProviderConfigs = configs.filter(c => c.provider === providerType);
    const providerName = getProviderName(providerType);
    
    // 如果没有配置，显示添加引导
    if (currentProviderConfigs.length === 0) {
      return (
        <Flex
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          padding="20px"
        >
          <Text fontSize="lg" mb="4">{providerName}服务商下还没有配置</Text>
          <Text fontSize="md" mb="6" color="gray.500" maxWidth="600px" textAlign="center">
            请先设置API密钥，然后创建配置来使用{providerName}的大语言模型服务。
          </Text>
          <Flex gap="3">
              <Button
              leftIcon={<SettingOutlined />}
              colorScheme="teal"
              variant="outline"
              onClick={() => openApiKeySettings()}
            >
              设置API密钥
            </Button>
              <Button
              leftIcon={<FontAwesomeIcon icon="plus" />}
              colorScheme="blue"
              onClick={createConfig}
            >
              创建新配置
              </Button>
          </Flex>
        </Flex>
      );
    }
    
    // 显示配置卡片列表
    return (
      <Box width="100%" padding="20px" overflowY="auto">
        <Flex justifyContent="space-between" alignItems="center" mb="4">
          <Heading as="h2" size="lg">{providerName}配置</Heading>
          <Flex>
            <Button
              leftIcon={<SettingOutlined />}
              colorScheme="teal"
              variant="outline"
              mr="2"
              onClick={() => openApiKeySettings()}
            >
              设置API密钥
            </Button>
          <Button 
              leftIcon={<FontAwesomeIcon icon="plus" />}
              colorScheme="blue"
              onClick={createConfig}
            >
              创建新配置
          </Button>
          </Flex>
        </Flex>
        
        <ChakraDivider mb="4" />
        
        {/* 配置卡片列表 */}
        {currentProviderConfigs.map(config => (
          <LLMConfigCard 
            key={config.id}
            config={config}
            onEdit={() => {
              editConfig(config);
            }}
            onDelete={() => {
              confirmDeleteConfig(config);
            }}
            onSetDefault={() => {
              setAsDefault(config);
            }}
            onSetProxy={() => {
              openProxySettings(config);
            }}
          />
        ))}
      </Box>
    );
  };

  // 渲染模板配置
  const renderTemplateConfig = () => {
    return (
      <Box 
        p={4} 
        overflowY="auto" 
        css={scrollbarStyle}
        sx={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0, 0, 0, 0.12) transparent' }}
      >
        <LLMTemplateConfig
          templates={templates}
          setTemplates={setTemplates}
          loadingTemplates={false}
        />
      </Box>
    );
  };

  // 渲染全局代理配置
  const renderGlobalSettings = () => {
    // 确保全局代理设置显示正确的启用状态
    const formValues = proxyForm.getFieldsValue();
    console.log('渲染全局设置 - 当前状态:', {
      globalProxyEnabled: globalProxy.enabled,
      formValueEnabled: formValues.enabled
    });
    
    return (
      <Box 
        width="100%" 
        padding="20px" 
        overflowY="auto" 
        css={scrollbarStyle}
        sx={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0, 0, 0, 0.12) transparent' }}
      >
        <Box 
          borderRadius="md" 
          border={`1px solid ${enhancedStyleConfig.borderColor}`}
          maxWidth="100%"
          overflow="hidden"
        >
          {/* 可点击的标题区域 - 使用与当前主题相符的背景色 */}
          <Flex 
            justifyContent="space-between" 
            alignItems="center" 
            cursor="pointer"
            onClick={() => setIsGlobalProxyExpanded(!isGlobalProxyExpanded)}
            p="4"
            bg={colorMode === 'dark' ? 'gray.700' : '#f5f5f5'} // 根据主题设置背景色
          >
            <Heading as="h2" size="lg" color={colorMode === 'dark' ? 'white' : 'inherit'}>全局代理设置</Heading>
            <FontAwesomeIcon 
              icon={isGlobalProxyExpanded ? faChevronUp : faChevronDown} 
              style={{ 
                fontSize: '16px',
                transition: 'transform 0.3s',
                color: colorMode === 'dark' ? 'white' : 'inherit'
              }}
            />
          </Flex>
          
          {/* 展开时显示的内容 - 使用当前主题的背景色 */}
          {isGlobalProxyExpanded && (
            <Box p="6" bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
              <Text mb="4" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                全局代理将应用于所有未设置特定代理的LLM配置。您可以随时启用或禁用全局代理。
              </Text>
              
      <Form 
        form={proxyForm} 
        layout="vertical" 
                initialValues={globalProxy}
                onFinish={(values) => saveGlobalProxy({...values, isGlobal: true})}
              >
                <Form.Item
                  name="enabled"
                  valuePropName="checked"
                  label="启用全局代理"
                >
                  <Switch 
                    checked={globalProxy.enabled} 
                    onChange={(checked) => {
                      console.log('Switch 状态变更:', checked);
                      // 更新表单值，确保UI与状态一致
                      proxyForm.setFieldsValue({ enabled: checked });
                    }}
                  />
                </Form.Item>
                
                <Form.Item
                  name="protocol"
                  label="代理协议"
                  rules={[{ required: true, message: '请选择代理协议' }]}
                >
                  <Select>
                    <Select.Option value="http">HTTP</Select.Option>
                    <Select.Option value="https">HTTPS</Select.Option>
                    <Select.Option value="socks4">SOCKS4</Select.Option>
                    <Select.Option value="socks5">SOCKS5</Select.Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="host"
                  label="代理主机"
                  rules={[{ required: true, message: '请输入代理主机地址' }]}
                >
                  <Input placeholder="例如: 127.0.0.1" />
                </Form.Item>
                
                <Form.Item
                  name="port"
                  label="代理端口"
                  rules={[{ required: true, message: '请输入代理端口' }]}
                >
                  <InputNumber min={1} max={65535} style={{ width: '100%' }} />
                </Form.Item>
                
                {/* 高级选项折叠面板 */}
                <Box mt={4} mb={4}>
                  <Flex 
                    alignItems="center" 
                    cursor="pointer" 
                    onClick={() => setIsAdvancedSettingsOpen(!isAdvancedSettingsOpen)}
                  >
                    <Text fontWeight="bold" mr={2} color={colorMode === 'dark' ? 'white' : 'inherit'}>高级选项</Text>
                    <FontAwesomeIcon 
                      icon={isAdvancedSettingsOpen ? faArrowLeft : faPlus} 
                      style={{ 
                        transform: isAdvancedSettingsOpen ? 'rotate(-90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s',
                        color: colorMode === 'dark' ? 'white' : 'inherit'
                      }} 
                    />
                  </Flex>
                </Box>
                
                {/* 高级选项折叠内容 */}
                {isAdvancedSettingsOpen && (
                  <Box 
                    mt={2} 
                    p={4} 
                    borderLeft="2px solid" 
                    borderColor="blue.400"
                    bg="#fafafa" // 比白色稍深一点的背景
                  >
                    <Form.Item
                      name="auth.username"
                      label="认证用户名"
                    >
                      <Input placeholder="代理认证用户名（若需要）" />
                    </Form.Item>
                    
                    <Form.Item
                      name="auth.password"
                      label="认证密码"
                    >
                      <Input.Password placeholder="代理认证密码（若需要）" />
                    </Form.Item>
                    
                    <Form.Item
                      name="timeout"
                      label="连接超时"
                      initialValue={30000}
                    >
                      <InputNumber 
                        min={1000} 
                        max={120000} 
                        step={1000} 
                        style={{ width: '100%' }} 
                        formatter={value => `${value}ms`}
                        parser={(value: string | undefined) => {
                          const parsedValue = value ? parseInt(value.replace('ms', '')) : 30000;
                          return parsedValue;
                        }}
                      />
                    </Form.Item>
                    
                    <Form.Item
                      name="retries"
                      label="重试次数"
                      initialValue={3}
                    >
                      <InputNumber min={0} max={10} style={{ width: '100%' }} />
                    </Form.Item>
                  </Box>
                )}
                
                <Form.Item>
                  <AntButton htmlType="submit" type="primary">
                    保存配置
                  </AntButton>
                </Form.Item>
      </Form>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  // 渲染切换区域
  const renderSectionTabs = () => {
    return (
      <Flex borderBottom={`1px solid ${enhancedStyleConfig.borderColor}`} padding="10px 15px">
        <Button
          variant={activeSection === 'config' ? 'solid' : 'ghost'}
          colorScheme={activeSection === 'config' ? 'blue' : 'gray'}
          mr="2"
          onClick={() => setActiveSection('config')}
          size="sm"
        >
          配置管理
        </Button>
        <Button
          variant={activeSection === 'template' ? 'solid' : 'ghost'}
          colorScheme={activeSection === 'template' ? 'blue' : 'gray'}
          mr="2"
          onClick={() => setActiveSection('template')}
          size="sm"
        >
          提示词模板
        </Button>
        <Button
          variant={activeSection === 'global' ? 'solid' : 'ghost'}
          colorScheme={activeSection === 'global' ? 'blue' : 'gray'}
          onClick={() => setActiveSection('global')}
          size="sm"
        >
          全局设置
        </Button>
      </Flex>
    );
  };

  // 添加服务商
  const addProvider = (): void => {
    providerForm.resetFields();
    
    Modal.confirm({
      title: '添加提供商',
      content: (
        <Form form={providerForm} layout="vertical" style={{ marginTop: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '4px', 
              backgroundColor: '#f0f0f0', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              fontSize: '32px',
              fontWeight: 'bold'
            }}>
              P
            </div>
          </div>
          
          <Form.Item
            name="name"
            label="提供商名称"
            rules={[{ required: true, message: '请输入提供商名称' }]}
          >
            <Input placeholder="例如 OpenAI" />
          </Form.Item>

          <Form.Item
            name="provider"
            label="提供商类型"
            rules={[{ required: true, message: '请选择提供商类型' }]}
          >
            <Select placeholder="选择提供商类型">
              {Object.values(LLMProvider).map((value) => (
                <Select.Option key={value} value={value}>
                  {getProviderName(value)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        try {
          const values = await providerForm.validateFields();
          
          // 生成唯一ID
          const newProviderId = uuid();
          
          // 直接添加提供商，不弹出API设置
          const newProvider: Provider = {
            id: newProviderId, // 使用生成的uuid作为id而不是provider类型
            provider: values.provider as LLMProvider,
            name: values.name,
            isDefault: false
          };
          
          // 添加到providers列表
          setProviders(prev => {
            // 检查是否已存在相同name的提供商（名称不能重复）
            if (prev.some(p => p.name === newProvider.name)) {
              message.info('已存在同名提供商，请使用不同名称');
              return prev;
            }
            return [...prev, newProvider];
          });
          
          // 选中新添加的提供商
          setActiveProviderId(newProviderId);
          setSelectedConfig(null);
          setActiveConfig(null);
          
          message.success('提供商添加成功');
          return Promise.resolve();
        } catch (error) {
          console.error('表单验证失败', error);
          return Promise.reject(error);
        }
      },
      okText: "确定",
      cancelText: "取消",
      width: 400
    });
  };

  // 删除提供商
  const deleteProvider = (providerId: string): void => {
    // 确认用户是否真的要删除
    Modal.confirm({
      title: '删除提供商',
      content: '确定要删除此提供商吗？这将删除该提供商下的所有配置。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 根据ID找到对应的提供商
          const providerToDelete = providers.find(p => p.id === providerId);
          if (!providerToDelete) {
            message.error('找不到要删除的提供商');
            return;
          }
          
          console.log('删除提供商:', {
            id: providerId,
            provider: providerToDelete.provider,
            name: providerToDelete.name
          });
          
          // 查找与当前要删除的提供商ID关联的配置
          const configsToDelete = configs.filter(c => {
            // 检查配置的providerId是否与要删除的提供商ID匹配
            const configProviderId = (c as any).providerId;
            
            // 精确匹配providerId，确保只删除该提供商的配置
            if (configProviderId && configProviderId === providerId) {
              return true;
            }
            
            // 对于系统内置提供商，如果没有providerId，则通过provider类型匹配
            const isSystemProvider = Object.values(LLMProvider).includes(providerId as LLMProvider);
            if (isSystemProvider && c.provider === providerId && !configProviderId) {
              return true;
            }
            
            return false;
          });
          
          console.log('要删除的配置数量:', configsToDelete.length, '配置列表:', configsToDelete.map(c => ({ id: c.id, name: c.name })));
          
          // 删除该提供商下的所有配置
          let hasErrors = false;
          for (const config of configsToDelete) {
            try {
              console.log('正在删除配置:', config.id, config.name);
              const result = await LLMService.deleteConfig(config.id);
              // 修复类型检查问题
              const success = result === true || (result && typeof result === 'object' && 'success' in result && (result as any).success);
              if (!success) {
                console.error('删除配置失败:', config.id);
                hasErrors = true;
              }
            } catch (error) {
              console.error(`删除配置 ${config.id} 失败:`, error);
              hasErrors = true;
            }
          }
          
          // 只从providers列表中移除指定ID的提供商
          setProviders(prev => {
            const newProviders = prev.filter(p => p.id !== providerId);
            console.log('删除后的提供商列表:', newProviders.map(p => ({ id: p.id, name: p.name })));
            return newProviders;
          });
          
          // 如果当前选中的提供商被删除，则清除选择
          if (activeProviderId === providerId) {
            setActiveProviderId(null);
            setSelectedConfig(null);
            setActiveConfig(null);
          }
          
          // 重新加载数据
          await loadData();
          
          if (hasErrors) {
            message.warning('提供商已删除，但部分配置删除失败');
          } else {
            message.success('提供商已成功删除');
          }
        } catch (error) {
          console.error('删除提供商失败:', error);
          message.error('删除提供商失败');
        }
      },
    });
  };

  // 在合适的位置初始化proxyForm的值
  useEffect(() => {
    if (activeSection === 'global') {
      // 加载全局代理配置
      try {
        LLMService.getGlobalProxy().then(config => {
          if (config) {
            console.log('切换到全局设置，加载全局代理配置:', config);
            
            // 确保enabled字段是布尔值
            const configWithCorrectTypes = {
              ...config,
              isGlobal: true,
              enabled: !!config.enabled
            };
            
            // 更新状态
            setGlobalProxy(configWithCorrectTypes);
            
            // 立即更新表单值，确保UI正确显示
            proxyForm.setFieldsValue({
              ...configWithCorrectTypes,
              enabled: configWithCorrectTypes.enabled // 特别确保enabled字段被正确设置
            });
            
            console.log('切换tab后表单设置全局代理值:', proxyForm.getFieldsValue());
            
            // 默认保持折叠状态
            setIsGlobalProxyExpanded(false);
          }
        });
      } catch (error) {
        console.error('加载全局代理配置失败:', error);
      }
    }
  }, [activeSection]);

  // 添加删除自定义模型的功能
  const deleteCustomModel = (modelId: string) => {
    Modal.confirm({
      title: '删除自定义模型',
      content: '确定要删除此自定义模型吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        // 从可用模型列表中移除
        const updatedModels = availableModels.filter(m => m.id !== modelId);
        setAvailableModels(updatedModels);
        
        // 如果当前表单中选择了该模型，清除选择
        const currentModelId = form.getFieldValue(['modelConfig', 'modelId']);
        if (currentModelId === modelId) {
          form.setFieldsValue({
            modelConfig: {
              ...form.getFieldValue('modelConfig'),
              modelId: undefined
            }
          });
        }
        
        message.success('模型已删除');
      }
    });
  };

  // 添加标记模型为默认的功能
  const setModelAsDefault = (modelId: string) => {
    // 更新模型列表，将该模型设置为默认
    const updatedModels = availableModels.map(model => ({
      ...model,
      isDefault: model.id === modelId
    }));
    
    setAvailableModels(updatedModels);
    message.success('已设置为默认模型');
  };

  // 过滤可用模型列表，只显示当前提供商的模型
  const filteredModels = React.useMemo(() => {
    const currentProvider = activeProviderId ? 
      providers.find(p => p.id === activeProviderId)?.provider :
      selectedConfig?.provider;
    
    if (!currentProvider) return availableModels;
    
    return availableModels.filter(model => 
      !model.provider || model.provider === currentProvider
    );
  }, [availableModels, activeProviderId, selectedConfig, providers]);

  // 重新添加renderProviderNav函数
  const renderProviderNav = () => {
    return (
      <Box
        width="280px"
        height="100%"
        borderRight={`1px solid ${enhancedStyleConfig.borderColor}`}
        bg={enhancedStyleConfig.bgColor}
        overflowY="auto"
        css={scrollbarStyle}
        display="flex"
        flexDirection="column"
        padding="0" // 移除padding
      >
        {/* 搜索框 */}
        <Box padding="15px">
          <Flex alignItems="center" position="relative">
            <ChakraInput
              placeholder="搜索提供商..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              paddingLeft="30px"
              bg={enhancedStyleConfig.bgColor}
              border={`1px solid ${enhancedStyleConfig.borderColor}`}
              _focus={{ borderColor: 'blue.400' }}
            />
            <FontAwesomeIcon
              icon="search"
              style={{
                position: 'absolute',
                left: '10px',
                color: 'gray',
                fontSize: '14px',
              }}
            />
          </Flex>
        </Box>

        {/* 提供商列表 - 调整高度和紧凑性，设置padding为0 */}
        <Box flex="1" overflowY="auto" sx={scrollbarStyle} maxHeight="calc(100vh - 200px)" padding="0">
          <VStack align="stretch" spacing={0} width="100%" padding="0">
            {Object.entries(filteredConfigs).length > 0 ? (
              Object.entries(filteredConfigs).map(([providerId, items]) => {
                // 查找提供商对象
                const providerObj = providers.find(p => p.id === providerId);
                if (!providerObj) return null;
                
                return (
                  <Box key={providerId} width="100%" mb="1px">
                    <Flex
                      padding="8px 12px"
                      bg={activeProviderId === providerId ? enhancedStyleConfig.activeBg : enhancedStyleConfig.bgColor}
                      fontWeight="bold"
                      borderRadius={enhancedStyleConfig.navRadius}
                      justifyContent="space-between"
                      alignItems="center"
                      onClick={() => {
                        setActiveProviderId(providerId);
                        setSelectedConfig(null);
                        setActiveConfig(null);
                      }}
                      cursor="pointer"
                      color={activeProviderId === providerId ? enhancedStyleConfig.activeColor : 'inherit'}
                      _hover={{ 
                        bg: activeProviderId !== providerId ? enhancedStyleConfig.hoverBg : undefined,
                        borderRadius: enhancedStyleConfig.navRadius
                      }}
                      width="100%"
                    >
                      <Text fontSize="sm">{providerObj.name || getProviderName(providerObj.provider)}</Text>
                      <Flex>
                        <Button
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          leftIcon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProvider(providerId);
                          }}
                        >
                          删除
                        </Button>
                      </Flex>
                    </Flex>
                  </Box>
                );
              })
            ) : (
              <Box padding="15px" textAlign="center">
                <Text color="gray.500">没有找到匹配的提供商</Text>
              </Box>
            )}
          </VStack>
        </Box>

        {/* 添加服务商按钮 */}
        <Box borderTop={`1px solid ${enhancedStyleConfig.borderColor}`} padding="15px">
          <Button
            leftIcon={<FontAwesomeIcon icon="plus" />}
            colorScheme="blue"
            variant="outline"
            onClick={() => addProvider()}
            width="100%"
          >
            添加服务商
          </Button>
        </Box>
      </Box>
    );
  };

  // 添加获取默认模型列表的函数
  const getDefaultModels = (provider: LLMProvider): LLMModelConfig[] => {
    switch (provider) {
      case LLMProvider.OPENAI:
        return [
          { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 4096, isDefault: true, provider },
          { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo (16K)', maxTokens: 16384, provider },
          { id: 'gpt-4', name: 'GPT-4', maxTokens: 8192, provider },
          { id: 'gpt-4-32k', name: 'GPT-4 (32K)', maxTokens: 32768, provider },
          { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 128000, provider },
        ];
      case LLMProvider.ANTHROPIC:
        return [
          { id: 'claude-2', name: 'Claude 2', maxTokens: 100000, isDefault: true, provider },
          { id: 'claude-instant-1', name: 'Claude Instant', maxTokens: 100000, provider },
          { id: 'claude-3-opus', name: 'Claude 3 Opus', maxTokens: 200000, provider },
          { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', maxTokens: 180000, provider },
          { id: 'claude-3-haiku', name: 'Claude 3 Haiku', maxTokens: 150000, provider },
        ];
      case LLMProvider.GEMINI:
        return [
          { id: 'gemini-pro', name: 'Gemini Pro', maxTokens: 32000, isDefault: true, provider },
          { id: 'gemini-ultra', name: 'Gemini Ultra', maxTokens: 32000, provider },
        ];
      case LLMProvider.BAIDU:
        return [
          { id: 'ernie-bot', name: 'ERNIE Bot', maxTokens: 4096, isDefault: true, provider },
          { id: 'ernie-bot-4', name: 'ERNIE Bot 4.0', maxTokens: 8192, provider },
        ];
      case LLMProvider.AZURE:
        return [
          { id: 'gpt-35-turbo', name: 'Azure GPT-3.5 Turbo', maxTokens: 4096, isDefault: true, provider },
          { id: 'gpt-4', name: 'Azure GPT-4', maxTokens: 8192, provider },
        ];
      case LLMProvider.DEEPSEEK:
        return [
          { id: 'deepseek-chat', name: 'DeepSeek Chat', maxTokens: 32000, isDefault: true, provider },
          { id: 'deepseek-coder', name: 'DeepSeek Coder', maxTokens: 32000, provider },
        ];
      case LLMProvider.SILICON_FLOW:
        return [
          { id: 'silicon-flow-1', name: '硅基流动 Pro', maxTokens: 8192, isDefault: true, provider },
          { id: 'silicon-flow-2', name: '硅基流动 Ultra', maxTokens: 16384, provider },
          { id: 'silicon-flow-code', name: '硅基流动 Code', maxTokens: 12000, provider },
        ];
      case LLMProvider.OPENROUTER:
        return [
          { id: 'openai/gpt-3.5-turbo', name: 'OpenAI GPT-3.5', maxTokens: 4096, isDefault: true, provider },
          { id: 'openai/gpt-4', name: 'OpenAI GPT-4', maxTokens: 8192, provider },
          { id: 'anthropic/claude-2', name: 'Anthropic Claude 2', maxTokens: 100000, provider },
          { id: 'anthropic/claude-3-opus', name: 'Anthropic Claude 3 Opus', maxTokens: 200000, provider },
          { id: 'google/gemini-pro', name: 'Google Gemini Pro', maxTokens: 32000, provider },
          { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B', maxTokens: 32000, provider },
        ];
      default:
        return [
          { id: 'default-model', name: '默认模型', maxTokens: 4096, isDefault: true, provider },
        ];
    }
  };

  // 自定义Modal样式
  const customModalStyles = {
    content: {
      ...scrollbarStyle,
      maxHeight: '90vh',
      overflowY: 'auto',
    },
    body: {
      ...scrollbarStyle,
      maxHeight: 'calc(90vh - 180px)',
      overflowY: 'auto',
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {/* 顶部标题 */}
      <Flex 
        padding="10px 15px" 
        justifyContent="space-between" 
        alignItems="center" 
        borderBottom={`1px solid ${enhancedStyleConfig.borderColor}`}
        height="auto"
        paddingTop="0"
      >
        <Heading as="h2" size="md">LLM服务配置</Heading>
      </Flex>

      {/* 切换区域标签 */}
      {renderSectionTabs()}

      {/* 主要内容区 */}
      <Flex 
        flex="1" 
        overflow="hidden"
        direction={["column", "column", "row", "row"]} 
        height="100%"
      >
        {/* 左侧导航区 - 只在config模式下显示 */}
        {activeSection === 'config' && (
          <Box 
            minWidth="280px" 
            width={["100%", "100%", "280px", "280px"]} 
            p="0" // 移除padding
            borderRightWidth="1px" 
            borderColor={enhancedStyleConfig.borderColor}
            background={enhancedStyleConfig.bgColor}
            overflowY="auto"
            css={scrollbarStyle}
            maxHeight={["300px", "300px", "calc(100vh - 165px)", "calc(100vh - 165px)"]}
            sx={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0, 0, 0, 0.12) transparent' }}
            className="css-1wchd6x"
          >
            {renderProviderNav()}
          </Box>
        )}
        
        {/* 内容区 */}
        <Box 
          flex="1" 
          overflowY="auto" 
          css={scrollbarStyle} 
          maxHeight="calc(100vh - 165px)"
          sx={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0, 0, 0, 0.12) transparent' }}
        >
          {activeSection === 'config' && renderConfigDetail()}
          {activeSection === 'template' && renderTemplateConfig()}
          {activeSection === 'global' && renderGlobalSettings()}
        </Box>
      </Flex>

      {/* 配置表单模态框 */}
    <Modal
        title={isCreateConfig ? "创建配置" : "编辑配置"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
      width={700}
        footer={null}
    >
      <Form 
          form={form}
        onFinish={handleConfigSubmit}
          layout="vertical"
          initialValues={{
            temperature: 0.7,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0,
            maxTokens: 2000
          }}
      >
        <Form.Item
          name="name"
            label="配置名称"
          rules={[{ required: true, message: '请输入配置名称' }]}
        >
            <Input placeholder="请输入配置名称" />
        </Form.Item>
        
          {/* 使用自动设置的服务商，仅显示模型选择 */}
          <Form.Item
            name={['modelConfig', 'modelId']}
            label="选择模型"
            rules={[{ required: true, message: '请选择模型' }]}
          >
            <Select 
              placeholder="选择模型" 
              loading={loadingModels}
              style={{ width: '100%' }}
              dropdownStyle={{ 
                maxHeight: '300px',
                overflowY: 'auto'
              }}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Box padding="0 8px 4px" display="flex" justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm">没有找到合适的模型？</Text>
                    <AntButton 
                      type="link" 
                      icon={<PlusOutlined />} 
                      onClick={(e) => {
                        e.preventDefault();
                        openAddCustomModelModal();
                      }}
                      size="small"
                    >
                      添加自定义模型
                    </AntButton>
                  </Box>
                </>
              )}
            >
              {filteredModels.map(model => (
                <Select.Option key={model.id} value={model.id}>
                  <Flex justifyContent="space-between" alignItems="center" width="100%">
                    <Text>{model.name} {model.isCustom ? '(自定义)' : ''}</Text>
                    <Flex onClick={(e) => e.stopPropagation()}>
                      {model.isCustom && (
                        <>
                          <IconButton
                            aria-label="设为默认"
                            icon={<FontAwesomeIcon icon={model.isDefault ? faCheckCircle : faCircle} />}
                            size="xs"
                            variant="ghost"
                            colorScheme={model.isDefault ? 'green' : 'gray'}
                            onClick={(e) => {
                              e.stopPropagation();
                              setModelAsDefault(model.id);
                            }}
                            mr={1}
                          />
                          <IconButton
                            aria-label="删除模型"
                            icon={<DeleteOutlined />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCustomModel(model.id);
                            }}
                          />
                        </>
                      )}
                      {model.isDefault && !model.isCustom && (
                        <Text color="green.500" fontSize="xs" fontWeight="bold">默认</Text>
                      )}
                    </Flex>
                  </Flex>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* 隐藏的provider字段 */}
        <Form.Item
            name={['modelConfig', 'provider']}
            hidden
          >
            <Input type="hidden" />
        </Form.Item>
        
          {/* 隐藏的providerId字段 */}
        <Form.Item
            name={['modelConfig', 'providerId']}
            hidden
          >
            <Input type="hidden" />
        </Form.Item>
        
          {/* 移除了参数配置分隔线 */}
        
        <Form.Item
            name="maxTokens"
            label="Max Tokens"
            rules={[{ required: true, message: '请设置Max Tokens值' }]}
            tooltip="生成文本的最大长度"
          >
            <InputNumber min={1} max={32000} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="systemMessage"
            label="系统消息"
            tooltip="设置给模型的系统指令，定义其行为和角色"
          >
            <TextArea rows={4} placeholder="请输入系统消息" />
          </Form.Item>

          {/* 高级参数折叠面板 */}
          <Box mt={4} mb={4}>
            <Flex 
              alignItems="center" 
              cursor="pointer" 
              onClick={() => setIsAdvancedParamsOpen(!isAdvancedParamsOpen)}
              padding="8px"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ bg: 'gray.50' }}
            >
              <Text fontWeight="bold" mr={2}>高级参数设置</Text>
              <FontAwesomeIcon 
                icon={isAdvancedParamsOpen ? faChevronUp : faChevronDown} 
                style={{ 
                  fontSize: '14px',
                  transition: 'transform 0.3s'
                }} 
              />
            </Flex>
          </Box>

          {/* 高级参数内容 */}
          {isAdvancedParamsOpen && (
            <Box 
              mt={2} 
              p={4} 
              borderLeft="2px solid" 
              borderColor="blue.400"
              bg="gray.50"
            >
              <Form.Item
          name="temperature"
                label="Temperature"
                rules={[{ required: true, message: '请设置Temperature值' }]}
                tooltip="控制生成文本的随机性，值越高越随机"
        >
          <Slider
            min={0}
            max={2}
                  step={0.01}
            marks={{
                    0: '0',
                    1: '1',
                    2: '2'
            }}
          />
        </Form.Item>
        
        <Form.Item
          name="topP"
                label="Top P"
          rules={[{ required: true, message: '请设置Top P值' }]}
                tooltip="控制生成文本的多样性，值越低越保守"
        >
          <Slider
            min={0}
            max={1}
            step={0.01}
            marks={{
                    0: '0',
                    0.5: '0.5',
                    1: '1'
            }}
          />
        </Form.Item>
        
        <Form.Item
          name="frequencyPenalty"
                label="Frequency Penalty"
                rules={[{ required: true, message: '请设置Frequency Penalty值' }]}
                tooltip="控制模型重复使用相同词语的倾向，值越高越避免重复"
        >
          <Slider
            min={0}
            max={2}
                  step={0.01}
            marks={{
                    0: '0',
                    1: '1',
                    2: '2'
            }}
          />
        </Form.Item>
        
        <Form.Item
          name="presencePenalty"
                label="Presence Penalty"
                rules={[{ required: true, message: '请设置Presence Penalty值' }]}
                tooltip="控制模型讨论新话题的倾向，值越高越倾向于新话题"
        >
          <Slider
            min={0}
            max={2}
                  step={0.01}
            marks={{
                    0: '0',
                    1: '1',
                    2: '2'
            }}
          />
        </Form.Item>
            </Box>
          )}

          <Form.Item>
            <Flex justifyContent="flex-end">
              <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8 }}>
                取消
              </Button>
              <AntButton type="primary" htmlType="submit">
                保存
              </AntButton>
            </Flex>
          </Form.Item>
      </Form>
    </Modal>

      {/* 自定义模型模态框 */}
      <Modal
        title="添加自定义模型"
        open={isCustomModelModalVisible}
        onCancel={() => setIsCustomModelModalVisible(false)}
        footer={null}
      >
        <Form
          form={customModelForm}
          layout="vertical"
          onFinish={handleAddCustomModel}
        >
        <Form.Item
            label="模型ID"
            name="id"
            rules={[{ required: true, message: '请输入模型ID' }]}
          >
            <Input placeholder="输入模型ID，例如 gpt-3.5-turbo" />
        </Form.Item>
        
        <Form.Item
            label="模型名称"
            name="name"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="输入显示名称，例如 GPT-3.5" />
        </Form.Item>
          
          <Form.Item
            label="上下文长度"
            name="maxTokens"
            initialValue={4096}
            rules={[{ required: true, message: '请选择上下文长度' }]}
          >
            <Select placeholder="选择上下文长度">
              <Select.Option value={4096}>4K (4,096 tokens)</Select.Option>
              <Select.Option value={8192}>8K (8,192 tokens)</Select.Option>
              <Select.Option value={16384}>16K (16,384 tokens)</Select.Option>
              <Select.Option value={32768}>32K (32,768 tokens)</Select.Option>
              <Select.Option value={65536}>64K (65,536 tokens)</Select.Option>
              <Select.Option value={128000}>128K (128,000 tokens)</Select.Option>
              <Select.Option value={200000}>200K (200,000 tokens)</Select.Option>
              <Select.Option value={-1}>自定义</Select.Option>
            </Select>
          </Form.Item>
          
          {customModelForm.getFieldValue('maxTokens') === -1 && (
            <Form.Item
              label="自定义上下文长度"
              name="customMaxTokens"
              rules={[{ required: true, message: '请输入自定义上下文长度' }]}
            >
              <InputNumber min={1024} max={1000000} step={1024} style={{ width: '100%' }} />
            </Form.Item>
          )}
          
          <Form.Item>
            <Flex justifyContent="flex-end">
              <Button onClick={() => setIsCustomModelModalVisible(false)} style={{ marginRight: 8 }}>
                取消
              </Button>
              <AntButton type="primary" htmlType="submit">
                添加
              </AntButton>
            </Flex>
          </Form.Item>
        </Form>
      </Modal>
    </Box>
  );
};

export default LLMSettings; 