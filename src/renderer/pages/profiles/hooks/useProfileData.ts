import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@chakra-ui/react';
import { ipcService } from '../../../services/ipc.service';
import { Profile } from '../../../../common/types/Profile';

// 使用预加载脚本暴露的IPC常量
const { DB_CHANNELS } = window.IPC_CONSTANTS || {
  DB_CHANNELS: {
    PROFILE: {
      GET_ALL: 'db:profile:getAll',
      GET_BY_ID: 'db:profile:getById',
      CREATE: 'db:profile:create',
      UPDATE: 'db:profile:update',
      DELETE: 'db:profile:delete',
      SEARCH: 'db:profile:search',
      GET_RECENT: 'db:profile:getRecent'
    }
  }
};

export interface ProfileDataState {
  profiles: Profile[];
  filteredProfiles: Profile[];
  isLoading: boolean;
  searchQuery: string;
  ipcError: string | null;
  loadingState: 'idle' | 'loading' | 'success' | 'error';
}

export const useProfileData = () => {
  const { t } = useTranslation();
  const toast = useToast();
  
  // 状态管理
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ipcError, setIpcError] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // 加载个人信息数据
  const loadProfiles = async () => {
    console.log('开始加载个人信息数据');
    setIsLoading(true);
    setLoadingState('loading');
    let finalState = 'loading';
    
    try {
      // 检查IPC是否可用
      if (!ipcService || !DB_CHANNELS) {
        console.error('IPC服务或IPC频道不可用');
        setIpcError('IPC通信服务不可用，请检查预加载脚本');
        setLoadingState('error');
        finalState = 'error';
        
        // 添加测试数据以验证UI组件
        const testData = [
          { 
            id: 1, 
            name: '测试用户', 
            gender: 'male', 
            age: 30, 
            occupation: '软件工程师', 
            interests: '编程, 旅行, 音乐', 
            notes: '这是一个测试用户，用于验证UI组件。',
            created_at: new Date().toISOString(), 
            updated_at: new Date().toISOString() 
          },
          { 
            id: 2, 
            name: '张三', 
            gender: 'male', 
            age: 28, 
            occupation: '产品经理', 
            interests: '阅读, 游泳', 
            notes: '热爱产品设计和用户体验优化。',
            created_at: new Date().toISOString(), 
            updated_at: new Date().toISOString() 
          }
        ];
        setProfiles(testData);
        setFilteredProfiles(testData);
        return;
      }

      console.log('准备调用IPC: ', DB_CHANNELS.PROFILE.GET_ALL);
      const response = await ipcService.invoke(DB_CHANNELS.PROFILE.GET_ALL);
      console.log('IPC响应:', response);
      
      if (response && (response.success === true || Array.isArray(response))) {
        // 处理两种可能的响应格式
        const responseData = Array.isArray(response) ? response : response.data;
        console.log('获取数据成功，数据条数:', responseData?.length);
        
        // 即使数据为空数组也视为成功
        setProfiles(responseData || []);
        setFilteredProfiles(responseData || []);
        setLoadingState('success');
        finalState = 'success';
        // 确保清除之前可能存在的错误
        setIpcError(null);
      } else {
        console.error('获取数据失败:', response?.error);
        setLoadingState('error');
        finalState = 'error';
        setIpcError(response?.error || '获取数据失败，请重试');
        
        // 显示错误通知
        toast({
          title: t('common.error'),
          description: response?.error || t('profiles.loadError'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      console.error('获取数据失败:', error);
      setIpcError(`IPC通信错误: ${error?.message || '未知错误'}`);
      setLoadingState('error');
      finalState = 'error';
      
      // 显示错误通知
      toast({
        title: t('common.error'),
        description: t('profiles.loadError'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      console.log('数据加载完成, 状态:', finalState);
    }
  };

  // 初始加载
  useEffect(() => {
    loadProfiles();
  }, []);

  // 搜索过滤
  useEffect(() => {
    if (searchQuery) {
      const filtered = profiles.filter(profile => 
        profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (profile.occupation && profile.occupation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (profile.interests && profile.interests.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredProfiles(filtered);
    } else {
      setFilteredProfiles(profiles);
    }
  }, [searchQuery, profiles]);
  
  // 搜索处理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return {
    profileDataState: {
      profiles,
      filteredProfiles,
      searchQuery,
      isLoading,
      ipcError,
      loadingState
    },
    setProfiles,
    setFilteredProfiles,
    loadProfiles,
    handleSearchChange
  };
}; 