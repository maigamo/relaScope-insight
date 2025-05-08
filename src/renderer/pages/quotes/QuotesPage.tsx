import React, { useState, useRef } from 'react';
import { Box, Flex, useDisclosure, useToast } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ProfileSidebar from './components/ProfileSidebar';
import QuotesList from './components/QuotesList';
import QuoteForm from './components/QuoteForm';
import QuoteDetailModal from './components/QuoteDetailModal';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const QuotesPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const toast = useToast();
  
  // 创建一个引用，用于获取QuotesList组件的刷新方法
  const quotesListRef = useRef<{refreshQuotes: () => Promise<void>}>(null);

  // 处理新建语录
  const handleAddQuote = () => {
    if (!selectedProfileId) {
      toast({
        title: t('quotes.selectProfile'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    onFormOpen();
  };

  // 处理查看详情
  const handleViewDetail = (quoteId: number) => {
    setSelectedQuoteId(quoteId);
    onDetailOpen();
  };
  
  // 刷新引用列表
  const refreshQuotes = async () => {
    if (quotesListRef.current) {
      await quotesListRef.current.refreshQuotes();
    }
  };

  return (
    <Flex as={motion.div} variants={container} initial="hidden" animate="show" p={4} h="calc(100vh - 60px)">
      {/* 左侧用户列表 */}
      <Box w="220px" minW="180px" borderRight="1px solid #eee" pr={2}>
        <ProfileSidebar selectedProfileId={selectedProfileId} onSelect={id => setSelectedProfileId(id)} />
      </Box>

      {/* 右侧内容区 */}
      <Box flex={1} pl={4}>
        <QuotesList 
          ref={quotesListRef}
          profileId={selectedProfileId} 
          onAddClick={handleAddQuote} 
          onViewDetail={handleViewDetail} 
        />
      </Box>

      {/* 添加/编辑语录表单 */}
      {isFormOpen && (
        <QuoteForm 
          isOpen={isFormOpen} 
          onClose={onFormClose} 
          profileId={selectedProfileId} 
          onSuccess={() => {
            onFormClose();
            refreshQuotes();
            toast({
              title: t('quotes.createSuccess'),
              status: 'success',
              duration: 2000,
            });
          }} 
        />
      )}

      {/* 语录详情弹窗 */}
      {isDetailOpen && selectedQuoteId && (
        <QuoteDetailModal
          isOpen={isDetailOpen}
          onClose={onDetailClose}
          quoteId={selectedQuoteId}
        />
      )}
    </Flex>
  );
};

export default QuotesPage; 