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
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { ipcService } from '../../../services/ipc.service';

interface QuoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: number | null;
  onSuccess?: () => void;
}

interface QuoteFormData {
  content: string;
  source?: string;
  tags?: string;
}

const QuoteForm: React.FC<QuoteFormProps> = ({ isOpen, onClose, profileId, onSuccess }) => {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<QuoteFormData>();
  const toast = useToast();

  const onSubmit = async (data: QuoteFormData) => {
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
      // 添加profileId到数据中
      const quoteData = {
        ...data,
        profile_id: profileId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await ipcService.invoke(DB_CHANNELS.QUOTE.CREATE, quoteData);
      
      reset();
      if (onSuccess) {
        onSuccess();
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
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>添加新语录</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.content}>
                <FormLabel>内容</FormLabel>
                <Textarea
                  {...register('content', { 
                    required: '请输入语录内容',
                    minLength: { value: 2, message: '内容至少需要2个字符' }
                  })}
                  placeholder="请输入语录内容"
                />
              </FormControl>

              <FormControl>
                <FormLabel>来源</FormLabel>
                <Input
                  {...register('source')}
                  placeholder="例如：书籍、电影、对话等"
                />
              </FormControl>

              <FormControl>
                <FormLabel>标签</FormLabel>
                <Input
                  {...register('tags')}
                  placeholder="例如：重要、励志、生活等"
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
              colorScheme="blue" 
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

export default QuoteForm; 