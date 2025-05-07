import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { 
  Box, VStack, Text, Spinner, Button, useColorModeValue, Badge, IconButton, Flex, useToast,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent,
  AlertDialogOverlay
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ipcService } from '../../../services/ipc.service';
import { DeleteIcon } from '@chakra-ui/icons';

interface QuotesListProps {
  profileId: number | null;
  onAddClick: () => void;
  onViewDetail: (quoteId: number) => void;
}

// 定义组件暴露的ref类型
export interface QuotesListRef {
  refreshQuotes: () => Promise<void>;
}

const QuotesList = forwardRef<QuotesListRef, QuotesListProps>(({ profileId, onAddClick, onViewDetail }, ref) => {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bgHover = useColorModeValue('gray.50', 'gray.700');
  const toast = useToast();
  
  // 删除确认对话框
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<number | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // 加载引用列表
  const fetchQuotes = async () => {
    if (profileId === null) {
      setQuotes([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { DB_CHANNELS } = window.IPC_CONSTANTS;
      const response = await ipcService.invoke(DB_CHANNELS.QUOTE.GET_BY_PROFILE, profileId);
      setQuotes(response || []);
    } catch (err: any) {
      setError(err?.message || '加载语录失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 使用useImperativeHandle暴露方法给父组件
  useImperativeHandle(ref, () => ({
    refreshQuotes: fetchQuotes
  }));

  useEffect(() => {
    fetchQuotes();
  }, [profileId]);

  // 打开删除确认对话框
  const openDeleteConfirm = (e: React.MouseEvent, quoteId: number) => {
    e.stopPropagation(); // 阻止冒泡，避免触发点击查看详情
    setQuoteToDelete(quoteId);
    setIsDeleteAlertOpen(true);
  };

  // 删除语录
  const handleDeleteQuote = async () => {
    if (!quoteToDelete) return;
    
    try {
      const { DB_CHANNELS } = window.IPC_CONSTANTS;
      await ipcService.invoke(DB_CHANNELS.QUOTE.DELETE, quoteToDelete);
      // 删除成功后刷新列表
      await fetchQuotes();
      toast({
        title: '删除成功',
        status: 'success',
        duration: 2000,
      });
    } catch (err: any) {
      toast({
        title: '删除失败',
        description: err?.message || '出现错误，请重试',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsDeleteAlertOpen(false);
      setQuoteToDelete(null);
    }
  };

  // 未选择档案
  if (profileId === null) {
    return (
      <Box textAlign="center" p={4}>
        <Text color="gray.500">请选择一个档案以查看语录</Text>
      </Box>
    );
  }

  // 加载中
  if (loading) {
    return (
      <Box textAlign="center" p={4}>
        <Spinner size="md" />
      </Box>
    );
  }

  // 加载出错
  if (error) {
    return (
      <Box textAlign="center" p={4} color="red.500">
        {error}
      </Box>
    );
  }

  // 暂无数据
  if (quotes.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <Text mb={4}>该档案还没有语录</Text>
        <Button colorScheme="blue" onClick={onAddClick}>添加语录</Button>
      </Box>
    );
  }

  return (
    <Box w="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontWeight="bold" fontSize="lg">语录列表</Text>
        <Button size="sm" colorScheme="blue" onClick={onAddClick}>添加语录</Button>
      </Box>

      <VStack align="stretch" spacing={2}>
        {quotes.map((quote) => (
          <Box
            as={motion.div}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            key={quote.id}
            p={3}
            borderWidth="1px"
            borderRadius="md"
            _hover={{ bg: bgHover, cursor: 'pointer' }}
            onClick={() => onViewDetail(quote.id)}
          >
            <Text fontWeight="medium" noOfLines={2}>{quote.content}</Text>
            <Flex justifyContent="space-between" mt={2} alignItems="center">
              <Text fontSize="sm" color="gray.500">{new Date(quote.created_at).toLocaleDateString()}</Text>
              <Flex alignItems="center">
                <Badge colorScheme={quote.tags?.includes('重要') ? 'red' : 'blue'}>
                  {quote.tags || '未分类'}
                </Badge>
                <IconButton
                  aria-label="删除语录"
                  icon={<DeleteIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  ml={2}
                  onClick={(e) => openDeleteConfirm(e, quote.id)}
                />
              </Flex>
            </Flex>
          </Box>
        ))}
      </VStack>

      {/* 删除确认对话框 */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              删除语录
            </AlertDialogHeader>

            <AlertDialogBody>
              确定要删除这条语录吗？此操作无法撤销。
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
                取消
              </Button>
              <Button colorScheme="red" onClick={handleDeleteQuote} ml={3}>
                删除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
});

export default QuotesList; 