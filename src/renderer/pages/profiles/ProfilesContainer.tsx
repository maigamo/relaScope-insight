import React, { useState, useEffect } from 'react';
import { useDisclosure, useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import { ipcService } from '../../services/ipc.service';
import ProfilesHeader from './ProfilesHeader';
import ProfilesSearch from './ProfilesSearch';
import ProfilesLoading from './ProfilesLoading';
import ProfilesEmptyState from './ProfilesEmptyState';
import ProfilesErrorState from './ProfilesErrorState';
import ProfileList from './components/ProfileList';
import ProfileForm from './components/ProfileForm';
import ProfileDetail from './components/ProfileDetail';
import { Profile } from '../../../common/types/Profile';

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

// 动画配置
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const ProfilesContainer: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // 状态管理
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
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

  // 创建个人信息
  const handleCreateProfile = async (profileData: any) => {
    try {
      // 日志记录输入的数据
      console.log('准备创建个人信息，提交数据:', JSON.stringify(profileData, null, 2));
      
      // 确保interests字段有效，即使是空数组也转换为空字符串
      const dataToSubmit = {
        ...profileData,
        interests: profileData.interests || ''
      };
      
      // 发送创建请求
      const response = await ipcService.invoke(DB_CHANNELS.PROFILE.CREATE, dataToSubmit);
      console.log('创建个人信息响应:', JSON.stringify(response, null, 2));
      
      // 更详细的响应分析
      console.log('响应类型:', typeof response);
      if (typeof response === 'object' && response !== null) {
        console.log('响应对象属性:', Object.keys(response));
        console.log('success属性值:', response.success);
        console.log('success属性类型:', typeof response.success);
        // 尝试使用hasOwnProperty判断
        console.log('响应对象是否含有success属性:', response.hasOwnProperty('success'));
        // 尝试直接获取属性
        console.log('响应对象success属性值:', response['success']);
      }
      console.log('判断条件1 (response === true):', response === true);
      console.log('判断条件2 (response && response.success):', Boolean(response && response.success));
      
      // 修复的条件判断
      const isSuccess = 
        response === true || 
        (typeof response === 'object' && response !== null && 
          (response.success === true || response['success'] === true ||
           // 处理直接返回数据对象的情况
           (response.id && !response.hasOwnProperty('success'))));
      
      console.log('最终成功判断结果:', isSuccess);
      
      if (isSuccess) {
        // 成功处理
        toast({
          title: t('common.success'),
          description: t('profiles.createSuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // 重新加载数据并关闭表单
        await loadProfiles();
        onClose();
      } else {
        // 错误处理
        console.error('创建个人信息失败:', response?.error || '未知错误');
        toast({
          title: t('common.error'),
          description: response?.error || t('profiles.createError'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      // 异常处理
      console.error('创建个人信息异常:', error);
      toast({
        title: t('common.error'),
        description: t('profiles.createError'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // 更新个人信息
  const handleUpdateProfile = async (profileData: any) => {
    try {
      console.log('准备更新个人信息，提交数据:', JSON.stringify(profileData, null, 2));
      
      // 确保interests字段有效，即使是空数组也转换为空字符串
      const dataToSubmit = {
        id: selectedProfile?.id,
        ...profileData,
        interests: profileData.interests || ''
      };
      
      // 发送更新请求
      const response = await ipcService.invoke(DB_CHANNELS.PROFILE.UPDATE, dataToSubmit);
      console.log('更新个人信息响应:', JSON.stringify(response, null, 2));
      
      // 详细响应分析
      console.log('响应类型:', typeof response);
      if (typeof response === 'object' && response !== null) {
        console.log('响应对象属性:', Object.keys(response));
        console.log('success属性值:', response.success);
        console.log('success属性类型:', typeof response.success);
      }
      
      // 使用相同的修复条件判断
      const isSuccess = 
        response === true || 
        (typeof response === 'object' && response !== null && 
          (response.success === true || response['success'] === true ||
           // 处理直接返回数据对象的情况
           (response.id && !response.hasOwnProperty('success'))));
      
      console.log('最终成功判断结果:', isSuccess);
      
      if (isSuccess) {
        // 成功处理
        toast({
          title: t('common.success'),
          description: t('profiles.updateSuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        await loadProfiles();
        onClose();
      } else {
        // 错误处理
        console.error('更新个人信息失败:', response?.error || '未知错误');
        toast({
          title: t('common.error'),
          description: response?.error || t('profiles.updateError'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('更新个人信息异常:', error);
      toast({
        title: t('common.error'),
        description: t('profiles.updateError'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // 删除个人信息
  const handleDeleteProfile = async (id: number) => {
    try {
      console.log('准备删除个人信息:', id);
      
      // 1. 立即更新UI（不等待API响应）
      // 使用函数式更新确保使用最新状态
      setProfiles(prevProfiles => {
        const updated = prevProfiles.filter(profile => profile.id !== id);
        // 2. 同步更新过滤后的列表
        setFilteredProfiles(updated);
        return updated;
      });

      // 3. 处理选中状态
      if (selectedProfile && selectedProfile.id === id) {
        setSelectedProfile(null);
        if (isOpen && isViewMode) {
          onClose();
        }
      }

      // 4. 然后再发送删除请求
      const response = await ipcService.invoke(DB_CHANNELS.PROFILE.DELETE, id);
      
      // 详细调试信息
      console.log('----------调试信息开始----------');
      console.log('删除响应对象:', response);
      console.log('删除响应类型:', typeof response);
      console.log('响应是否为null:', response === null);
      console.log('响应是否为undefined:', response === undefined);
      
      if (typeof response === 'object' && response !== null) {
        console.log('响应对象的键:', Object.keys(response));
        console.log('响应对象的JSON字符串:', JSON.stringify(response, null, 2));
        console.log('success字段值:', response.success);
        console.log('success字段类型:', typeof response.success);
        console.log('data字段值:', response.data);
        console.log('data字段类型:', typeof response.data);
      }
      console.log('----------调试信息结束----------');
      
      // 测试不同条件判断
      console.log('条件1 (response):', Boolean(response));
      console.log('条件2 (response.success):', Boolean(response?.success));
      console.log('条件3 (response && response.success):', Boolean(response && response.success));
      
      // 使用相同的修复条件判断
      const isSuccess = 
        response === true || 
        (typeof response === 'object' && response !== null && 
          (response.success === true || response['success'] === true ||
           // 处理直接返回数据对象的情况
           (typeof response === 'object' && response.hasOwnProperty && !response.hasOwnProperty('success') && 
            (response === true || response.data === true || response.changes > 0))));
      
      console.log('最终删除成功判断结果:', isSuccess);
      
      // 修改条件判断，同时处理布尔型响应和对象型响应
      if (isSuccess) {
        // 显示成功消息
        toast({
          title: t('common.success'),
          description: t('profiles.deleteSuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // 5. 静默重新加载数据（不影响当前UI）
        setTimeout(() => {
          loadProfiles().catch(err => {
            console.error('后台刷新数据失败:', err);
          });
        }, 300);
      } else {
        console.error('删除个人信息失败:', response?.error);
        
        // 6. 删除失败，恢复原始数据
        loadProfiles();
        
        toast({
          title: t('common.error'),
          description: response?.error || t('profiles.deleteError'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('删除个人信息时发生异常:', error);
      
      // 7. 发生异常，恢复原始数据
      loadProfiles();
      
      toast({
        title: t('common.error'),
        description: t('profiles.deleteError'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // 打开创建表单
  const openCreateForm = () => {
    setSelectedProfile(null);
    setIsViewMode(false);
    onOpen();
  };

  // 打开编辑表单
  const openEditForm = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsViewMode(false);
    onOpen();
  };

  // 查看个人信息详情
  const openProfileDetail = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsViewMode(true);
    onOpen();
  };

  // 搜索处理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
    >
      {/* 头部区域 */}
      <ProfilesHeader 
        onCreateClick={openCreateForm} 
        isDisabled={loadingState === 'loading'} 
      />
      
      {/* 搜索区域 */}
      <ProfilesSearch 
        value={searchQuery} 
        onChange={handleSearchChange} 
        disabled={loadingState === 'loading'} 
      />
      
      {/* 加载状态 */}
      {isLoading && <ProfilesLoading />}
      
      {/* IPC错误显示 */}
      {!isLoading && ipcError && (
        <ProfilesErrorState
          errorType="connection"
          message={ipcError}
          onRetry={loadProfiles}
        />
      )}
      
      {/* 空数据状态 */}
      {!isLoading && !ipcError && filteredProfiles.length === 0 && loadingState === 'success' && (
        <ProfilesEmptyState 
          onCreateClick={openCreateForm}
          isFiltered={searchQuery.length > 0}
        />
      )}
      
      {/* 数据列表 */}
      {!isLoading && !ipcError && filteredProfiles.length > 0 && (
        <motion.div variants={item}>
          <ProfileList 
            profiles={filteredProfiles} 
            onEdit={openEditForm} 
            onDelete={handleDeleteProfile}
            onView={openProfileDetail}
          />
        </motion.div>
      )}
      
      {/* 样例/后备数据 - 当加载失败但没有错误显示时 */}
      {!isLoading && loadingState === 'error' && !ipcError && (
        <ProfilesErrorState
          errorType="data"
          title={t('profiles.loadIssue')}
          message={t('profiles.showingSampleData')}
          onRetry={loadProfiles}
          retryText={t('common.retry')}
        />
      )}

      {/* 创建/编辑表单模态框 */}
      {isOpen && !isViewMode && (
        <ProfileForm 
          isOpen={isOpen} 
          onClose={onClose} 
          profile={selectedProfile} 
          onSubmit={selectedProfile ? handleUpdateProfile : handleCreateProfile}
        />
      )}
      
      {/* 档案详情模态框 */}
      {isOpen && isViewMode && selectedProfile && (
        <ProfileDetail 
          isOpen={true} 
          onClose={onClose} 
          profile={selectedProfile}
          onEdit={() => {
            setIsViewMode(false);
          }}
          onDelete={handleDeleteProfile}
        />
      )}
    </motion.div>
  );
};

export default ProfilesContainer; 