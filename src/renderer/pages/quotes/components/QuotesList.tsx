import React, { useEffect, useState } from 'react';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';
import QuoteCard from './QuoteCard';
import { ipcService } from '../../../services/ipc.service';

// 语录类型定义（可根据实际类型调整）
interface Quote {
  id: number;
  content: string;
  source?: string;
  tags?: string;
  importance?: number;
  date?: string;
}

interface QuotesListProps {
  profileId: number | null;
}

const QuotesList: React.FC<QuotesListProps> = ({ profileId }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof profileId !== 'number' || profileId <= 0) {
      setQuotes([]);
      setLoading(false);
      setError(null);
      return;
    }
    
    const { DB_CHANNELS } = window.IPC_CONSTANTS;
    if (!DB_CHANNELS.QUOTE.GET_BY_PROFILE) {
      setError('通道名未定义，请联系开发人员');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    const fetchQuotes = async () => {
      try {
        const response = await ipcService.invoke(DB_CHANNELS.QUOTE.GET_BY_PROFILE, profileId);
        setQuotes(response || []);
      } catch (err: any) {
        setError(err?.message || '加载语录失败');
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, [profileId]);

  if (!profileId) {
    return <Text color="gray.400" textAlign="center" py={10}>请选择左侧用户以查看语录</Text>;
  }

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="lg" />
      </Box>
    );
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  if (quotes.length === 0) {
    return <Text color="gray.500" textAlign="center" py={10}>暂无语录</Text>;
  }

  return (
    <VStack spacing={4} align="stretch">
      {quotes.map(quote => (
        <QuoteCard key={quote.id} quote={quote} />
      ))}
    </VStack>
  );
};

export default QuotesList; 