/**
 * 提供商列表组件
 * 用于显示并管理LLM提供商列表
 */
import React, { useState, useEffect, useRef } from 'react';
import { 
  Input, 
  Button, 
  Empty, 
  message, 
  Tooltip,
  Space
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  DeleteOutlined,
  StarFilled
} from '@ant-design/icons';
import * as providerIPC from '../utils/ipc/provider';
import { LLMProvider } from '../../../../common/types/llm';
import './ProviderList.css';

const { Search } = Input;

interface ProviderListProps {
  providers: any[]; // 提供商列表数据
  selectedProviderId?: string; // 当前选中的提供商ID
  activeProviderId?: string; // 兼容旧接口
  onProviderSelect: (providerId: string) => void;
  onProviderDelete?: (providerId: string) => void;
  onProviderAdd?: () => void;
  onAddProvider?: () => void; // 兼容新接口
}

interface ProviderItem {
  id: string;
  name: string;
  isDefault?: boolean;
  enabled?: boolean;
  icon?: React.ReactNode;
}

/**
 * 提供商菜单项组件
 */
const ProviderMenuItem: React.FC<{
  provider: ProviderItem;
  isActive: boolean;
  onSelect: (providerId: string) => void;
  onDelete?: (providerId: string) => void;
}> = ({ provider, isActive, onSelect, onDelete }) => {
  
  // 处理删除
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      // 这里可以添加删除前的确认
      onDelete(provider.id);
    }
  };
  
  return (
    <div 
      className={`provider-menu-item ${isActive ? 'provider-menu-item-active' : ''}`}
      onClick={() => onSelect(provider.id)}
    >
      <div className="provider-menu-item-content">
        <div className="provider-name">
          {provider.name}
          {provider.isDefault && <span className="default-badge">默认</span>}
        </div>
      </div>
      
      <div className="provider-actions">
        <Tooltip title="删除提供商">
          <Button 
            type="text" 
            size="small" 
            className="delete-button"
            icon={<DeleteOutlined />} 
            onClick={handleDelete}
          />
        </Tooltip>
      </div>
    </div>
  );
};

/**
 * 提供商列表组件
 */
const ProviderList: React.FC<ProviderListProps> = ({ 
  providers: propProviders,
  selectedProviderId,
  activeProviderId,
  onProviderSelect,
  onProviderDelete,
  onProviderAdd,
  onAddProvider
}) => {
  const [filteredProviders, setFilteredProviders] = useState<ProviderItem[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // 检查使用哪个ID作为当前选中项
  const currentSelectedId = selectedProviderId || activeProviderId;
  
  // 当传入的providers发生变化时，更新过滤后的列表
  useEffect(() => {
    if (propProviders && propProviders.length > 0) {
      if (!searchValue.trim()) {
        setFilteredProviders(propProviders);
      } else {
        const filtered = propProviders.filter(provider => 
          provider.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          provider.id.toLowerCase().includes(searchValue.toLowerCase())
        );
        setFilteredProviders(filtered);
      }
    } else {
      setFilteredProviders([]);
    }
  }, [propProviders, searchValue]);
  
  // 自定义滚动条样式
  useEffect(() => {
    const applyCustomScrollbar = () => {
      if (contentRef.current) {
        // 自定义滚动条样式已在CSS中实现
      }
    };
    
    applyCustomScrollbar();
  }, []);
  
  // 处理提供商选择
  const handleProviderSelect = (providerId: string) => {
    onProviderSelect(providerId);
  };
  
  // 处理提供商删除
  const handleProviderDelete = (providerId: string) => {
    // 这里应该有确认对话框，先简化处理
    if (onProviderDelete) {
      onProviderDelete(providerId);
    } else {
      message.info('删除提供商功能将在后续版本提供');
    }
  };
  
  // 处理添加提供商
  const handleProviderAdd = () => {
    // 优先使用新接口
    if (onAddProvider) {
      onAddProvider();
    } else if (onProviderAdd) {
      onProviderAdd();
    } else {
      message.info('添加提供商功能将在后续版本提供');
    }
  };
  
  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };
  
  return (
    <div className="provider-list-container">
      {/* 头部搜索区域 */}
      <div className="provider-list-header">
        <Search
          className="provider-search-input"
          placeholder="搜索提供商"
          allowClear
          value={searchValue}
          onChange={handleSearchChange}
        />
      </div>
      
      {/* 提供商列表内容区域 */}
      <div className="provider-list-content" ref={contentRef}>
        {loading ? (
          <div className="provider-loading-tip">加载中...</div>
        ) : filteredProviders.length > 0 ? (
          filteredProviders.map(provider => (
            <ProviderMenuItem
              key={provider.id}
              provider={provider}
              isActive={provider.id === currentSelectedId}
              onSelect={handleProviderSelect}
              onDelete={handleProviderDelete}
            />
          ))
        ) : (
          <Empty 
            className="provider-empty-tip"
            description="没有找到匹配的提供商"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>
      
      {/* 底部添加按钮区域 */}
      <div className="provider-list-footer">
        <Button 
          block 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleProviderAdd}
        >
          添加提供商
        </Button>
      </div>
    </div>
  );
};

export default ProviderList; 