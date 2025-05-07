import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Box,
  Badge,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import { ipcService } from '../../../services/ipc.service';

interface QuoteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: number;
}

const QuoteDetailModal: React.FC<QuoteDetailModalProps> = ({ isOpen, onClose, quoteId }) => {
  const [quote, setQuote] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuoteDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const { DB_CHANNELS } = window.IPC_CONSTANTS;
        const response = await ipcService.invoke(DB_CHANNELS.QUOTE.GET_BY_ID, quoteId);
        setQuote(response);
      } catch (err: any) {
        setError(err?.message || '加载语录详情失败');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && quoteId) {
      fetchQuoteDetail();
    }
  }, [isOpen, quoteId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>语录详情</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading && (
            <Box textAlign="center" py={8}>
              <Spinner size="lg" />
            </Box>
          )}

          {error && (
            <Box textAlign="center" py={8} color="red.500">
              {error}
            </Box>
          )}

          {!loading && !error && quote && (
            <Box>
              <Box mb={4}>
                <Text fontSize="lg" fontWeight="bold" mb={2}>
                  内容
                </Text>
                <Text whiteSpace="pre-wrap">{quote.content}</Text>
              </Box>

              <Divider my={4} />

              {quote.source && (
                <Box mb={4}>
                  <Text fontSize="sm" fontWeight="bold" mb={1}>
                    来源
                  </Text>
                  <Text color="gray.600">{quote.source}</Text>
                </Box>
              )}

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                {quote.tags && (
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={1}>
                      标签
                    </Text>
                    <Badge colorScheme={quote.tags.includes('重要') ? 'red' : 'blue'}>
                      {quote.tags}
                    </Badge>
                  </Box>
                )}

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1}>
                    创建日期
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(quote.created_at).toLocaleString()}
                  </Text>
                </Box>
              </Box>
            </Box>
          )}
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default QuoteDetailModal; 