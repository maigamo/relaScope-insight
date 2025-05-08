import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  HStack,
  InputGroup,
  InputLeftAddon,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { ipcService } from '../../../services/ipc';

interface ExperienceFormProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: number | null;
  experienceId?: number | null;
  onComplete?: () => void;
}

interface ExperienceFormData {
  title: string;
  description?: string;
  date?: string;
  location?: string;
  tags?: string;
}

const ExperienceForm: React.FC<ExperienceFormProps> = ({ 
  isOpen, 
  onClose, 
  profileId, 
  experienceId, 
  onComplete 
}) => {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<ExperienceFormData>();
  const toast = useToast();
  const isEditMode = !!experienceId;

  React.useEffect(() => {
    if (isEditMode && experienceId && isOpen) {
      // 如果是编辑模式，加载已有数据
      const fetchExperience = async () => {
        try {
          const { DB_CHANNELS } = window.IPC_CONSTANTS;
          const response = await ipcService.invoke(DB_CHANNELS.EXPERIENCE.GET_BY_ID, experienceId);
          
          if (response && response.data) {
            const { title, description, date, location, tags } = response.data;
            
            // 设置表单默认值
            reset({
              title,
              description,
              date: date ? new Date(date).toISOString().split('T')[0] : undefined,
              location,
              tags
            });
          }
        } catch (error: any) {
          toast({
            title: '加载数据失败',
            description: error.message || '无法加载经历详情',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      };
      
      fetchExperience();
    }
  }, [isOpen, experienceId, isEditMode, reset, toast]);

  const onSubmit = async (data: ExperienceFormData) => {
    if (!profileId) {
      toast({
        title: '请先选择一个档案',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const { DB_CHANNELS } = window.IPC_CONSTANTS;
      
      if (isEditMode && experienceId) {
        // 更新已有经历
        await ipcService.invoke(DB_CHANNELS.EXPERIENCE.UPDATE, {
          id: experienceId,
          experience: {
            ...data,
            updated_at: new Date().toISOString()
          }
        });
        
        toast({
          title: '更新成功',
          status: 'success',
          duration: 2000,
        });
      } else if (profileId) {
        // 创建新经历
        const experienceData = {
          ...data,
          profile_id: profileId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await ipcService.invoke(DB_CHANNELS.EXPERIENCE.CREATE, experienceData);
        
        toast({
          title: '添加成功',
          status: 'success',
          duration: 2000,
        });
      }
      
      reset();
      if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      toast({
        title: '保存失败',
        description: error.message || '出现错误，请重试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isEditMode ? '编辑经历' : '添加新经历'}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.title}>
                <FormLabel>标题</FormLabel>
                <Input
                  {...register('title', { 
                    required: '请输入经历标题',
                    minLength: { value: 2, message: '标题至少需要2个字符' }
                  })}
                  placeholder="请输入经历标题"
                />
              </FormControl>

              <FormControl>
                <FormLabel>日期</FormLabel>
                <Input
                  {...register('date')}
                  type="date"
                  placeholder="选择日期"
                />
              </FormControl>

              <FormControl>
                <FormLabel>地点</FormLabel>
                <Input
                  {...register('location')}
                  placeholder="发生地点（如：上海、公司等）"
                />
              </FormControl>

              <FormControl>
                <FormLabel>标签</FormLabel>
                <Input
                  {...register('tags')}
                  placeholder="例如：工作、学习、旅行等"
                />
              </FormControl>

              <FormControl>
                <FormLabel>详细描述</FormLabel>
                <Textarea
                  {...register('description')}
                  placeholder="请描述经历的详细内容"
                  minH="150px"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              取消
            </Button>
            <Button 
              type="submit" 
              colorScheme="purple" 
              isLoading={isSubmitting}
            >
              保存
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ExperienceForm; 