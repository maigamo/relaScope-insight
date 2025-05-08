import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Button,
  IconButton,
  Tag,
  VStack,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useColorModeValue,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Flex,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon, CalendarIcon, TimeIcon, SettingsIcon, ViewIcon, TriangleDownIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import { ExperienceService } from '../../../services/ipc';
import { Experience } from '../../../../common/types/database';

interface ExperiencesListProps {
  profileId: number | null;
  onAddClick: () => void;
  onViewDetail: (experienceId: number) => void;
}

export interface ExperiencesListRef {
  refreshExperiences: () => Promise<void>;
}

// 使用forwardRef结合useImperativeHandle向父组件暴露方法
const ExperiencesList = forwardRef<ExperiencesListRef, ExperiencesListProps>(({ profileId, onAddClick, onViewDetail }, ref) => {
  const { t } = useTranslation();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedExperienceId, setSelectedExperienceId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [timeline, setTimeline] = useState<any>({});
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  
  const bgCard = useColorModeValue('white', 'gray.700');
  const bgHover = useColorModeValue('gray.50', 'gray.600');
  
  // 向父组件暴露刷新经历列表的方法
  useImperativeHandle(ref, () => ({
    refreshExperiences: fetchExperiences
  }));
  
  const fetchExperiences = async () => {
    if (!profileId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔍 获取个人档案经历，profileId: ${profileId}`);
      
      // 使用ExperienceService获取数据
      const experiencesData = await ExperienceService.getExperiencesByProfileId(profileId);
      console.log(`✅ 成功获取${experiencesData.length}条经历数据`);
      
      setExperiences(experiencesData);
      
      // 如果当前为时间轴视图，也获取时间轴数据
      if (viewMode === 'timeline') {
        await fetchTimeline();
      }
    } catch (err: any) {
      console.error('❌ 获取经历列表失败:', err);
      setError('获取经历列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTimeline = async () => {
    if (!profileId) return;
    
    try {
      console.log(`🔍 获取经历时间轴数据，profileId: ${profileId}`);
      
      // 使用ExperienceService获取时间轴数据
      const timelineData = await ExperienceService.getExperienceTimeline(profileId);
      console.log('📅 时间轴数据:', timelineData);
      
      setTimeline(timelineData || {});
    } catch (err: any) {
      console.error('❌ 获取时间轴数据失败:', err);
    }
  };
  
  useEffect(() => {
    if (profileId) {
      fetchExperiences();
    }
  }, [profileId]);
  
  useEffect(() => {
    if (viewMode === 'timeline' && profileId && Object.keys(timeline).length === 0) {
      fetchTimeline();
    }
  }, [viewMode, profileId]);
  
  const openDeleteConfirm = (e: React.MouseEvent, experienceId: number) => {
    e.stopPropagation();
    setSelectedExperienceId(experienceId);
    onDeleteAlertOpen();
  };
  
  const handleDeleteExperience = async () => {
    if (!selectedExperienceId) return;
    
    try {
      console.log(`🗑️ 删除经历，ID: ${selectedExperienceId}`);
      
      // 使用ExperienceService删除数据
      const success = await ExperienceService.deleteExperience(selectedExperienceId);
      
      if (success) {
        console.log('✅ 删除经历成功');
        // 从列表中移除已删除的项
        setExperiences(prev => prev.filter(exp => exp.id !== selectedExperienceId));
        
        // 如果需要，也从时间轴中移除
        if (viewMode === 'timeline') {
          await fetchTimeline();
        }
      } else {
        console.error('❌ 删除经历失败');
        throw new Error('删除经历失败');
      }
    } catch (err: any) {
      console.error('❌ 删除经历错误:', err);
    } finally {
      setSelectedExperienceId(null);
      onDeleteAlertClose();
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="xl" fontWeight="bold">{t('experiences.title')}</Text>
        <HStack>
          <IconButton
            aria-label={t('experiences.cardView')}
            icon={<ViewIcon />}
            size="sm"
            colorScheme={viewMode === 'list' ? 'purple' : 'gray'}
            onClick={() => setViewMode('list')}
          />
          <IconButton
            aria-label={t('experiences.timelineView')}
            icon={<TimeIcon />}
            size="sm"
            colorScheme={viewMode === 'timeline' ? 'purple' : 'gray'}
            onClick={() => setViewMode('timeline')}
          />
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="purple" 
            size="sm"
            onClick={onAddClick}
          >
            {t('experiences.add')}
          </Button>
        </HStack>
      </HStack>
      
      {loading && (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="purple.500" />
        </Box>
      )}
      
      {error && (
        <Box textAlign="center" p={4} color="red.500">
          {error}
        </Box>
      )}
      
      {!loading && !error && experiences.length === 0 && (
        <Box 
          textAlign="center" 
          p={10} 
          borderWidth="1px" 
          borderRadius="lg" 
          borderStyle="dashed"
        >
          <Text color="gray.500" mb={3}>{t('experiences.empty')}</Text>
          <Button size="sm" leftIcon={<AddIcon />} colorScheme="purple" onClick={onAddClick}>
            {t('experiences.add')}
          </Button>
        </Box>
      )}
      
      {!loading && !error && experiences.length > 0 && viewMode === 'list' && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {experiences.map(exp => (
            <Box
              key={exp.id || exp.id}
              borderWidth="1px"
              borderRadius="lg"
              p={4}
              bg={bgCard}
              boxShadow="sm"
              cursor="pointer"
              _hover={{ boxShadow: "md", bg: bgHover }}
              onClick={() => onViewDetail(exp.id || exp.id!)}
            >
              <Flex alignItems="baseline" justifyContent="space-between">
                <Text fontWeight="semibold" fontSize="lg" noOfLines={1}>
                  {exp.title}
                </Text>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label='Options'
                    icon={<SettingsIcon />}
                    variant='ghost'
                    size='sm'
                    onClick={(e) => e.stopPropagation()}
                  />
                  <MenuList onClick={(e) => e.stopPropagation()}>
                    <MenuItem icon={<DeleteIcon />} onClick={(e) => openDeleteConfirm(e, exp.id || exp.id!)}>
                      {t('common.delete')}
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
              
              {(exp.startDate || exp.date) && (
                <Text fontSize="sm" color="gray.500" mt={1}>
                  <CalendarIcon mr={1} />
                  {formatDate(exp.startDate || exp.date)}
                  {exp.endDate && ` - ${formatDate(exp.endDate)}`}
                </Text>
              )}
              
              {exp.location && (
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {exp.location}
                </Text>
              )}
              
              {exp.description && (
                <Text mt={2} fontSize="sm" noOfLines={2} color="gray.600">
                  {exp.description}
                </Text>
              )}
              
              {exp.tags && (
                <HStack mt={3} spacing={2}>
                  {exp.tags.split(',').map((tag, idx) => (
                    <Tag key={idx} size="sm" colorScheme="purple" variant="outline">
                      {tag.trim()}
                    </Tag>
                  ))}
                </HStack>
              )}
            </Box>
          ))}
        </SimpleGrid>
      )}
      
      {!loading && !error && viewMode === 'timeline' && (
        <Box p={4} borderWidth="1px" borderRadius="lg" bg={bgCard}>
          {Object.keys(timeline).length > 0 ? (
            <VStack align="stretch" spacing={4} pl={4}>
              {Object.keys(timeline).sort((a, b) => parseInt(b) - parseInt(a)).map(year => (
                <Box key={year}>
                  <Text fontWeight="bold" fontSize="lg" mb={2}>{year}{t('profiles.yearsOld').replace(/\d+/, '')}</Text>
                  
                  <VStack align="stretch" spacing={2} pl={4} borderLeftWidth="2px" borderColor="purple.200">
                    {timeline[year].map((exp: any) => (
                      <Box
                        key={exp.id}
                        pl={4}
                        py={2}
                        position="relative"
                        _before={{
                          content: '""',
                          position: 'absolute',
                          left: '-5px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          bg: 'purple.500'
                        }}
                        _hover={{ bg: bgHover, cursor: 'pointer' }}
                        onClick={() => onViewDetail(exp.id)}
                      >
                        <Text fontWeight="medium">{exp.title}</Text>
                        {exp.location && (
                          <Text fontSize="sm" color="gray.500">
                            @ {exp.location}
                          </Text>
                        )}
                        {exp.description && (
                          <Text fontSize="sm" noOfLines={2} color="gray.600" mt={1}>
                            {exp.description}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </VStack>
                </Box>
              ))}
            </VStack>
          ) : (
            <Text textAlign="center" color="gray.500">{t('experiences.empty')}</Text>
          )}
        </Box>
      )}

      {/* 删除确认对话框 */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('experiences.delete')}
            </AlertDialogHeader>
            <AlertDialogBody>
              {t('experiences.confirmDelete')}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteAlertClose}>
                {t('common.cancel')}
              </Button>
              <Button colorScheme="red" onClick={handleDeleteExperience} ml={3}>
                {t('common.delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
});

export default ExperiencesList; 