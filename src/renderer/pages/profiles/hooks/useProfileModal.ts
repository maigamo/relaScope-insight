import { useState } from 'react';
import { useDisclosure } from '@chakra-ui/react';
import { Profile } from '../../../../common/types/Profile';

export const useProfileModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  
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

  return {
    isOpen, 
    onOpen, 
    onClose,
    selectedProfile,
    setSelectedProfile,
    isViewMode,
    setIsViewMode,
    openCreateForm,
    openEditForm,
    openProfileDetail
  };
}; 