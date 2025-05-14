import React from 'react';
import { 
  Box, Flex, Heading, Text, Switch, useColorMode
} from '@chakra-ui/react';
import { Button as AntButton, Form, Input, InputNumber, Select } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown, faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';
import { GlobalProxyConfig, StyleConfig } from '../types/LLMSettingsTypes';

interface LLMGlobalSettingsProps {
  globalProxy: GlobalProxyConfig;
  proxyForm: any; // Form实例
  enhancedStyleConfig: StyleConfig;
  isGlobalProxyExpanded: boolean;
  setIsGlobalProxyExpanded: (expanded: boolean) => void;
  isAdvancedSettingsOpen: boolean;
  setIsAdvancedSettingsOpen: (open: boolean) => void;
  saveGlobalProxy: (values: GlobalProxyConfig) => Promise<void>;
}

/**
 * 全局设置组件
 */
const LLMGlobalSettings: React.FC<LLMGlobalSettingsProps> = ({
  globalProxy,
  proxyForm,
  enhancedStyleConfig,
  isGlobalProxyExpanded,
  setIsGlobalProxyExpanded,
  isAdvancedSettingsOpen,
  setIsAdvancedSettingsOpen,
  saveGlobalProxy
}) => {
  const { colorMode } = useColorMode();
  
  // 定义滚动条样式
  const scrollbarStyle = {
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
  };
  
  // 确保全局代理设置显示正确的启用状态
  const formValues = proxyForm.getFieldsValue();
  
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
        {/* 标题区域 */}
        <Flex 
          justifyContent="space-between" 
          alignItems="center" 
          cursor="pointer"
          onClick={() => setIsGlobalProxyExpanded(!isGlobalProxyExpanded)}
          p="4"
          bg={colorMode === 'dark' ? 'gray.700' : '#f5f5f5'}
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
        
        {/* 内容区域 */}
        {isGlobalProxyExpanded && (
          <Box p="6" bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
            <Text mb="4" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
              全局代理将应用于所有未设置特定代理的LLM配置。您可以随时启用或禁用全局代理。
            </Text>
            
            {/* 表单部分 */}
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
                  bg={colorMode === 'dark' ? 'gray.700' : '#fafafa'}
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

export default LLMGlobalSettings; 