import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Flex,
  Text,
  Spinner,
  Divider,
  Badge,
  useColorModeValue,
  IconButton,
} from '@chakra-ui/react';
import { CalendarIcon, EditIcon, TimeIcon, InfoIcon } from '@chakra-ui/icons';
import { ExperienceService } from '../../../services/ipc';
import { Experience } from '../../../../common/types/database';

interface ExperienceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  experienceId: number;
  onEdit?: (experienceId: number) => void;
}

const ExperienceDetailModal: React.FC<ExperienceDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  experienceId,
  onEdit 
}) => {
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperienceDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('🔍 开始获取经历详情，ID:', experienceId);
        
        // 使用经历服务获取详情
        const experienceData = await ExperienceService.getExperienceById(experienceId);
        console.log('📦 获取到经历数据:', experienceData);
        
        if (experienceData) {
          setExperience(experienceData);
        } else {
          throw new Error('无法获取经历详情数据');
        }
      } catch (err: any) {
        console.error('❌ 获取经历详情失败:', err);
        setError(err?.message || '加载经历详情失败');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && experienceId) {
      fetchExperienceDetail();
    }
  }, [isOpen, experienceId]);

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  const handleEditClick = () => {
    if (onEdit && experience) {
      onEdit(experience.id!);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>经历详情</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading && (
            <Box textAlign="center" py={8}>
              <Spinner size="lg" color="purple.500" />
            </Box>
          )}

          {error && (
            <Box textAlign="center" py={8} color="red.500">
              {error}
            </Box>
          )}

          {!loading && !error && experience && (
            <Box>
              <Box mb={4}>
                <Text fontSize="xl" fontWeight="bold" mb={2}>
                  {experience.title}
                </Text>
              </Box>

              <Flex wrap="wrap" mb={6} gap={4}>
                {(experience.startDate || experience.date) && (
                  <Flex align="center" fontSize="sm" color="gray.600">
                    <CalendarIcon mr={1} />
                    <Text>{formatDate(experience.startDate || experience.date)}</Text>
                    {experience.endDate && (
                      <Text ml={1}>- {formatDate(experience.endDate)}</Text>
                    )}
                  </Flex>
                )}
                
                {experience.location && (
                  <Flex align="center" fontSize="sm" color="gray.600">
                    <InfoIcon mr={1} color="gray.500" />
                    <Text>{experience.location}</Text>
                  </Flex>
                )}
                
                {experience.tags && (
                  <Badge colorScheme="purple" alignSelf="center">
                    {experience.tags}
                  </Badge>
                )}
              </Flex>

              <Divider my={4} />

              <Box mb={6}>
                <Text fontSize="md" fontWeight="bold" mb={2}>
                  详细描述
                </Text>
                {experience.description ? (
                  <Text whiteSpace="pre-wrap">{experience.description}</Text>
                ) : (
                  <Text color="gray.500" fontStyle="italic">
                    暂无详细描述
                  </Text>
                )}
              </Box>

              {experience.organization && (
                <Box mb={4}>
                  <Text fontSize="md" fontWeight="bold" mb={1}>
                    所属组织
                  </Text>
                  <Text>{experience.organization}</Text>
                </Box>
              )}

              <Divider my={4} />

              <Flex justifyContent="space-between" fontSize="sm" color="gray.500">
                <Flex align="center">
                  <TimeIcon mr={1} />
                  <Text>创建于: {formatDate(experience.createdAt || experience.created_at)}</Text>
                </Flex>
                {(experience.updatedAt || experience.updated_at) && 
                 (experience.createdAt || experience.created_at) !== (experience.updatedAt || experience.updated_at) && (
                  <Text>上次更新: {formatDate(experience.updatedAt || experience.updated_at)}</Text>
                )}
              </Flex>
            </Box>
          )}
        </ModalBody>

        <ModalFooter>
          {onEdit && experience && (
            <Button 
              leftIcon={<EditIcon />} 
              colorScheme="purple" 
              variant="outline" 
              mr={3} 
              onClick={handleEditClick}
            >
              编辑
            </Button>
          )}
          <Button colorScheme="blue" onClick={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ExperienceDetailModal; 