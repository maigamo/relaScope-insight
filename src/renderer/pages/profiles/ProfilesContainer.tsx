import React from 'react';
import { motion } from 'framer-motion';

import ProfilesHeader from './ProfilesHeader';
import ProfilesSearch from './ProfilesSearch';
import ProfilesLoading from './ProfilesLoading';
import ProfilesEmptyState from './ProfilesEmptyState';
import ProfilesErrorState from './ProfilesErrorState';
import ProfileList from './components/ProfileList';
import ProfileForm from './components/ProfileForm';
import ProfileDetail from './components/ProfileDetail';

// 导入自定义hooks
import { useProfileData } from './hooks/useProfileData';
import { useProfileActions } from './hooks/useProfileActions';
import { useProfileModal } from './hooks/useProfileModal';

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
  // 使用自定义hooks管理组件各部分逻辑
  const {
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
  } = useProfileData();
  
  // 使用模态框状态管理hook
  const {
    isOpen,
    onClose,
    selectedProfile,
    setSelectedProfile,
    isViewMode,
    openCreateForm,
    openEditForm,
    openProfileDetail
  } = useProfileModal();
  
  // 使用操作处理hook
  const {
    handleCreateProfile,
    handleUpdateProfile,
    handleDeleteProfile
  } = useProfileActions({
    setProfiles,
    setFilteredProfiles,
    setSelectedProfile,
    selectedProfile,
    onClose,
    isOpen,
    isViewMode,
    loadProfiles
  });

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
      
      {/* 创建/编辑表单模态框 */}
      {isOpen && !isViewMode && (
        <ProfileForm
          isOpen={isOpen}
          onClose={onClose}
          profile={selectedProfile}
          onSubmit={selectedProfile ? handleUpdateProfile : handleCreateProfile}
        />
      )}
      
      {/* 详情查看模态框 */}
      {isOpen && isViewMode && selectedProfile && (
        <ProfileDetail
          isOpen={isOpen}
          onClose={onClose}
          profile={selectedProfile}
          onEdit={() => {
            // 切换到编辑模式
            setSelectedProfile(selectedProfile);
            openEditForm(selectedProfile);
          }}
          onDelete={handleDeleteProfile}
        />
      )}
    </motion.div>
  );
};

export default ProfilesContainer; 