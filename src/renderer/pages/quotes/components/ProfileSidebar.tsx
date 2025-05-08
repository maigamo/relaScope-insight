import React, { useEffect, useState, useCallback, useRef, memo } from 'react';
import { 
  VStack, 
  Box, 
  Text, 
  Avatar, 
  Spinner, 
  useColorModeValue, 
  InputGroup, 
  Input, 
  InputLeftElement,
  InputRightElement,
  CloseButton,
  Center,
  Button,
  Flex
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { ipcService } from '../../../services/ipc.service';
import { debounce } from 'lodash';

// 声明全局接口扩展
declare global {
  interface Window {
    IPC_CONSTANTS: {
      DB_CHANNELS: {
        PROFILE: {
          GET_ALL: string;
          GET_PAGED: string;
          [key: string]: string;
        };
        [key: string]: any;
      };
      [key: string]: any;
    };
    electronAPI: any;
  }
}

interface Profile {
  id: number;
  name: string;
  avatar?: string;
}

interface ProfileSidebarProps {
  selectedProfileId: number | null;
  onSelect: (profileId: number) => void;
}

// 提取SearchBox为独立组件，使用memo防止不必要的重新渲染
interface SearchBoxProps {
  searchQuery: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onEnterPress: () => void;
}

const SearchBox = memo(({ searchQuery, onChange, onClear, onEnterPress }: SearchBoxProps) => {
  const inputBg = useColorModeValue('white', 'gray.800');
  const iconColor = useColorModeValue('gray.500', 'gray.400');
  
  // 添加回车键处理函数
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onEnterPress();
    }
  };
  
  return (
    <Box position="sticky" top={0} zIndex={10} bg={useColorModeValue('white', 'gray.800')} pt={2} pb={2}>
      <InputGroup size="sm">
        <InputLeftElement pointerEvents="none">
          <SearchIcon color={iconColor} />
        </InputLeftElement>
        <Input
          placeholder="搜索档案..."
          value={searchQuery}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          bg={inputBg}
          borderRadius="md"
        />
        {searchQuery && (
          <InputRightElement>
            <CloseButton size="sm" onClick={onClear} />
          </InputRightElement>
        )}
      </InputGroup>
    </Box>
  );
});

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ selectedProfileId, onSelect }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // 使用useColorModeValue为暗模式和亮模式设置不同的颜色
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const selectedBorder = useColorModeValue('4px solid #3182ce', '4px solid #90cdf4');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const selectedTextColor = useColorModeValue('black', 'white');

  // 获取档案数据的函数
  const fetchProfiles = async (pageNum: number, search: string, isLoadMore: boolean = false) => {
    try {
      const loadingState = isLoadMore ? setLoadingMore : setLoading;
      loadingState(true);
      setError(null);
      
      // 日志：开始获取用户列表
      console.log(`ProfileSidebar: 获取用户列表 - 页码=${pageNum}, 搜索="${search}", 加载更多=${isLoadMore}`);
      
      const { DB_CHANNELS } = window.IPC_CONSTANTS;
      
      // 目前后端接口不支持分页和搜索，先使用前端方式实现
      const response = await ipcService.invoke(DB_CHANNELS.PROFILE.GET_ALL);
      
      // 新增：输出完整响应以便调试
      console.log('ProfileSidebar: 原始响应', response);
      
      // 修复：支持多种响应格式 - 直接返回数组或者{success,data}格式
      let profileData: Profile[] = [];
      
      if (Array.isArray(response)) {
        // 直接返回数组的情况
        console.log('ProfileSidebar: 响应是数组格式');
        profileData = response;
      } else if (response && response.data) {
        // 标准 {success, data} 响应格式
        console.log('ProfileSidebar: 响应是标准对象格式');
        profileData = response.data;
      } else if (response && response.success && !response.data) {
        // 成功但没有data的情况
        console.log('ProfileSidebar: 响应成功但无数据');
        profileData = [];
      } else {
        // 未知响应格式
        throw new Error('未知的响应格式');
      }
      
      console.log(`ProfileSidebar: 获取档案成功，数量=${profileData.length}`);
      
      const filteredData = search 
        ? profileData.filter((profile: Profile) => 
            profile.name.toLowerCase().includes(search.toLowerCase()))
        : profileData;
        
      // 计算总数和分页
      const total = filteredData.length;
      const limit = 20;
      const startIdx = (pageNum - 1) * limit;
      const endIdx = Math.min(startIdx + limit, total);
      const pagedData = filteredData.slice(startIdx, endIdx);
      
      if (search) {
        console.log(`ProfileSidebar: 过滤后数据 - 总数=${filteredData.length}, 当前页=${pagedData.length}`);
      }
      
      // 处理加载更多的情况
      if (isLoadMore && pageNum > 1) {
        setProfiles(prev => [...prev, ...pagedData]);
      } else {
        setProfiles(pagedData);
      }
      
      setTotal(total);
      setHasMore(endIdx < total);
      console.log(`ProfileSidebar: 数据加载完成 - 总数=${total}, 更多=${endIdx < total}`);
    } catch (err: any) {
      console.error(`ProfileSidebar: 加载出现异常:`, err);
      setError(err?.message || '加载档案失败');
    } finally {
      const loadingState = isLoadMore ? setLoadingMore : setLoading;
      loadingState(false);
    }
  };

  // 使用useEffect初始加载
  useEffect(() => {
    console.log('ProfileSidebar: 组件挂载，初始化加载');
    fetchProfiles(1, '');
    
    return () => {
      console.log('ProfileSidebar: 组件卸载');
    };
  }, []);

  // 搜索函数(防抖处理) - 增加防抖时间到500毫秒
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      console.log(`ProfileSidebar: 执行搜索 - "${value}"`);
      setPage(1); // 重置页码
      fetchProfiles(1, value);
    }, 1500), // 从500ms改为1500ms
    []
  );

  // 搜索输入变化处理 - 使用useCallback避免每次渲染都创建新函数
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // 清除搜索 - 使用useCallback避免每次渲染都创建新函数
  const clearSearch = useCallback(() => {
    console.log('ProfileSidebar: 清除搜索');
    setSearchQuery('');
    setPage(1);
    fetchProfiles(1, '');
  }, []);

  // 回车键立即搜索功能
  const handleEnterSearch = useCallback(() => {
    console.log(`ProfileSidebar: 按回车立即搜索 - "${searchQuery}"`);
    // 取消可能正在等待的防抖搜索
    debouncedSearch.cancel();
    // 立即执行搜索
    setPage(1);
    fetchProfiles(1, searchQuery);
  }, [searchQuery, debouncedSearch]);

  // 加载更多
  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    
    const nextPage = page + 1;
    console.log(`ProfileSidebar: 加载更多 - 页码=${nextPage}`);
    setPage(nextPage);
    fetchProfiles(nextPage, searchQuery, true);
  };

  // 渲染加载状态
  if (loading && !loadingMore) {
    return (
      <VStack align="stretch" spacing={0} h="100%">
        {/* 搜索框始终显示 */}
        <SearchBox 
          searchQuery={searchQuery} 
          onChange={handleSearchChange} 
          onClear={clearSearch}
          onEnterPress={handleEnterSearch}
        />
        <Center flex="1">
          <Spinner size="md" my={8} />
        </Center>
      </VStack>
    );
  }

  // 渲染错误状态
  if (error && !loadingMore) {
    console.log(`ProfileSidebar: 渲染错误状态 - ${error}`);
    return (
      <VStack align="stretch" spacing={0} h="100%">
        {/* 搜索框始终显示 */}
        <SearchBox 
          searchQuery={searchQuery} 
          onChange={handleSearchChange} 
          onClear={clearSearch}
          onEnterPress={handleEnterSearch}
        />
        <Box color="red.500" my={8} textAlign="center" flex="1">
          {error}
          <Button mt={2} size="sm" onClick={() => fetchProfiles(1, searchQuery)}>
            重试
          </Button>
        </Box>
      </VStack>
    );
  }

  // 渲染搜索结果为空的状态
  if (profiles.length === 0) {
    return (
      <VStack align="stretch" spacing={0} h="100%">
        {/* 搜索框始终显示 */}
        <SearchBox 
          searchQuery={searchQuery} 
          onChange={handleSearchChange} 
          onClear={clearSearch}
          onEnterPress={handleEnterSearch}
        />
        <Center p={6} borderRadius="md" flex="1" flexDirection="column">
          <Text mb={3} color="gray.500">
            {searchQuery ? `未找到匹配"${searchQuery}"的档案` : '无档案数据'}
          </Text>
          {searchQuery && (
            <Button size="sm" onClick={clearSearch}>
              清除搜索
            </Button>
          )}
        </Center>
      </VStack>
    );
  }

  return (
    <Box ref={sidebarRef} h="100%" overflowY="auto">
      <VStack align="stretch" spacing={0} w="100%">
        {/* 搜索框 */}
        <SearchBox 
          searchQuery={searchQuery} 
          onChange={handleSearchChange} 
          onClear={clearSearch}
          onEnterPress={handleEnterSearch}
        />
        
        {/* 用户列表 */}
        {profiles.map(profile => {
          const isNumber = typeof profile.id === 'number';
          return (
            <Box
              key={profile.id}
              px={4}
              py={3}
              bg={selectedProfileId === profile.id ? selectedBg : 'transparent'}
              borderLeft={selectedProfileId === profile.id ? selectedBorder : '4px solid transparent'}
              cursor="pointer"
              _hover={{ bg: hoverBg }}
              onClick={() => {
                if (isNumber) {
                  onSelect(profile.id);
                }
              }}
              display="flex"
              alignItems="center"
            >
              <Avatar size="sm" name={profile.name} src={profile.avatar} mr={2} />
              <Text 
                fontWeight={selectedProfileId === profile.id ? 'bold' : 'normal'}
                color={selectedProfileId === profile.id ? selectedTextColor : undefined}
              >
                {profile.name}
              </Text>
            </Box>
          );
        })}
        
        {/* 加载更多按钮 */}
        {hasMore && (
          <Flex justify="center" py={2}>
            <Button 
              size="sm" 
              isLoading={loadingMore} 
              onClick={loadMore}
              variant="ghost"
              width="90%"
            >
              加载更多
            </Button>
          </Flex>
        )}
        
        {/* 显示档案总数 */}
        {total > 0 && (
          <Text fontSize="xs" color="gray.500" textAlign="center" py={2}>
            共 {total} 个档案
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default ProfileSidebar; 