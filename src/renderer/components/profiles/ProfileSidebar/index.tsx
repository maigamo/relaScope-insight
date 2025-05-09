import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  VStack, 
  Box, 
  Text, 
  Spinner, 
  useColorModeValue, 
  Button,
  Flex,
  Center
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { ipcService } from '../../../services/ipc';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { DB_CHANNELS } from '../../../services/ipc/channels';
import i18n from '../../../i18n';
import SearchBox from './SearchBox';
import ProfileCard from './ProfileCard';
import { Profile } from './types';

interface ProfileSidebarProps {
  selectedProfileId: number | null;
  onSelect: (profileId: number) => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ selectedProfileId, onSelect }) => {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // 监听语言变化
  useEffect(() => {
    const handleLanguageChange = () => {
      setForceUpdate(prev => prev + 1);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);
  
  // 获取档案数据的函数
  const fetchProfiles = async (pageNum: number, search: string, isLoadMore: boolean = false) => {
    try {
      const loadingState = isLoadMore ? setLoadingMore : setLoading;
      loadingState(true);
      setError(null);
      
      const response = await ipcService.invoke(DB_CHANNELS.PROFILE.GET_ALL);
      
      // 支持多种响应格式 - 直接返回数组或者{success,data}格式
      let profileData: Profile[] = [];
      
      if (Array.isArray(response)) {
        profileData = response;
      } else if (response && response.data) {
        profileData = response.data;
      } else if (response && response.success && !response.data) {
        profileData = [];
      } else {
        throw new Error(t('profiles.unknownResponseFormat'));
      }
      
      const filteredData = search 
        ? profileData.filter((profile: Profile) => 
            profile.name.toLowerCase().includes(search.toLowerCase()) ||
            (profile.tags && profile.tags.toLowerCase().includes(search.toLowerCase())))
        : profileData;
        
      // 计算总数和分页
      const total = filteredData.length;
      const limit = 20;
      const startIdx = (pageNum - 1) * limit;
      const endIdx = Math.min(startIdx + limit, total);
      const pagedData = filteredData.slice(startIdx, endIdx);
      
      // 处理加载更多的情况
      if (isLoadMore && pageNum > 1) {
        setProfiles(prev => [...prev, ...pagedData]);
      } else {
        setProfiles(pagedData);
      }
      
      setTotal(total);
      setHasMore(endIdx < total);
    } catch (err: any) {
      console.error(`${t('profiles.loadError')}:`, err);
      setError(err?.message || t('profiles.loadError'));
    } finally {
      const loadingState = isLoadMore ? setLoadingMore : setLoading;
      loadingState(false);
    }
  };

  // 使用useEffect初始加载
  useEffect(() => {
    fetchProfiles(1, '');
  }, []);

  // 搜索函数(防抖处理)
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setPage(1); // 重置页码
      fetchProfiles(1, value);
    }, 500),
    []
  );

  // 搜索输入变化处理
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // 清除搜索
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setPage(1);
    fetchProfiles(1, '');
  }, []);

  // 回车键立即搜索功能
  const handleEnterSearch = useCallback(() => {
    debouncedSearch.cancel();
    setPage(1);
    fetchProfiles(1, searchQuery);
  }, [searchQuery, debouncedSearch]);

  // 加载更多
  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProfiles(nextPage, searchQuery, true);
    }
  }, [hasMore, loadingMore, page, searchQuery]);

  // 滚动到底部自动加载更多
  const handleScroll = useCallback(() => {
    if (sidebarRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = sidebarRef.current;
      
      // 当距离底部不到50px时触发加载更多
      if (scrollHeight - scrollTop - clientHeight < 50 && hasMore && !loadingMore) {
        loadMore();
      }
    }
  }, [hasMore, loadingMore, loadMore]);

  // 添加滚动监听
  useEffect(() => {
    const sidebarElement = sidebarRef.current;
    if (sidebarElement) {
      sidebarElement.addEventListener('scroll', handleScroll);
      return () => {
        sidebarElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  // 渲染加载状态
  if (loading) {
    return (
      <VStack spacing={4} align="center" justify="center" height="100%">
        <Spinner color="green.500" size="lg" thickness="3px" />
        <Text>{t('common.loading')}</Text>
      </VStack>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <VStack spacing={4} align="center" justify="center" height="100%">
        <Text color="red.500">{t('common.error')}</Text>
        <Text>{error}</Text>
        <Button 
          colorScheme="green" 
          leftIcon={<FontAwesomeIcon icon={faSyncAlt} />}
          onClick={() => fetchProfiles(1, searchQuery)}
        >
          {t('common.retry')}
        </Button>
      </VStack>
    );
  }

  // 渲染空状态
  if (profiles.length === 0) {
    return (
      <Box height="100%">
        <SearchBox 
          searchQuery={searchQuery}
          onChange={handleSearchChange}
          onClear={clearSearch}
          onEnterPress={handleEnterSearch}
        />
        <VStack spacing={4} align="center" justify="center" height="calc(100% - 50px)">
          <Text>{t('common.noResults')}</Text>
          {searchQuery && (
            <Button colorScheme="green" size="sm" onClick={clearSearch}>
              {t('profiles.clearSearch')}
            </Button>
          )}
        </VStack>
      </Box>
    );
  }

  // 渲染档案列表
  return (
    <Box height="100%" position="relative" key={`profile-sidebar-${forceUpdate}`}>
      <SearchBox 
        searchQuery={searchQuery}
        onChange={handleSearchChange}
        onClear={clearSearch}
        onEnterPress={handleEnterSearch}
      />
      
      <Box 
        ref={sidebarRef} 
        overflowY="auto" 
        maxH="calc(100% - 50px)"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#CBD5E0',
            borderRadius: '2px',
          },
        }}
        as={motion.div}
        initial="hidden"
        animate="visible"
        variants={{
          visible: { 
            transition: {
              staggerChildren: 0.05
            } 
          }
        }}
      >
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isSelected={profile.id === selectedProfileId}
            onClick={() => onSelect(profile.id)}
          />
        ))}
        
        {loadingMore && (
          <Center py={4}>
            <Spinner size="sm" color="green.500" mr={2} />
            <Text fontSize="sm">{t('profiles.loadingMore')}</Text>
          </Center>
        )}
        
        {/* 显示总数据量 */}
        <Text fontSize="xs" color="gray.500" textAlign="center" mt={2} mb={2}>
          {t('profiles.totalCount', { count: total })}
        </Text>
      </Box>
    </Box>
  );
};

export default ProfileSidebar; 