import React, { useState } from 'react';
import { Box, Heading, Button, Flex, useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import QuotesList from './components/QuotesList';
import ProfileSidebar from './components/ProfileSidebar';
import QuoteForm from './components/QuoteForm';

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

// 语录页面组件
const QuotesPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [quotesMap, setQuotesMap] = useState<Record<number, any[]>>({});
  const toast = useToast();

  // 处理新建语录
  const handleCreateQuote = (data: any) => {
    if (!selectedProfileId) return;
    setQuotesMap(prev => {
      const prevList = prev[selectedProfileId] || [];
      return {
        ...prev,
        [selectedProfileId]: [
          { id: Date.now(), ...data },
          ...prevList
        ]
      };
    });
    toast({ title: '语录创建成功', status: 'success' });
  };

  // QuotesList数据适配
  const quotesForCurrent = selectedProfileId ? (quotesMap[selectedProfileId] || []) : [];

  return (
    <Flex as={motion.div} variants={container} initial="hidden" animate="show" p={4} h="calc(100vh - 60px)">
      {/* 左侧用户列表 */}
      <Box w="220px" minW="180px" borderRight="1px solid #eee" pr={2}>
        <ProfileSidebar selectedProfileId={selectedProfileId} onSelect={setSelectedProfileId} />
      </Box>
      {/* 右侧内容区 */}
      <Box flex={1} pl={8}>
        <Flex align="center" justify="space-between" mb={6}>
          <Heading as="h1" size="lg">
            {t('navigation.quotes')}
          </Heading>
          <Button colorScheme="blue" size="sm" onClick={() => setFormOpen(true)}>
            {t('quotes.create')}
          </Button>
        </Flex>
        {/* 语录列表，传递选中profileId和数据 */}
        <QuotesList profileId={selectedProfileId} quotes={quotesForCurrent} />
      </Box>
      {/* 创建语录弹窗 */}
      <QuoteForm
        isOpen={isFormOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreateQuote}
        profileId={selectedProfileId}
      />
    </Flex>
  );
};

export default QuotesPage; 