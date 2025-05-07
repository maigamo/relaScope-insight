import { useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
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

interface UseProfileActionsProps {
  setProfiles: React.Dispatch<React.SetStateAction<Profile[]>>;
  setFilteredProfiles: React.Dispatch<React.SetStateAction<Profile[]>>;
  setSelectedProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  selectedProfile: Profile | null;
  onClose: () => void;
  isOpen: boolean;
  isViewMode: boolean;
  loadProfiles: () => Promise<void>;
}

export const useProfileActions = ({
  setProfiles,
  setFilteredProfiles,
  setSelectedProfile,
  selectedProfile,
  onClose,
  isOpen,
  isViewMode,
  loadProfiles
}: UseProfileActionsProps) => {
  const { t } = useTranslation();
  const toast = useToast();

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

  return {
    handleCreateProfile,
    handleUpdateProfile,
    handleDeleteProfile
  };
}; 