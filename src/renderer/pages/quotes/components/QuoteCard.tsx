import React from 'react';
import { Box, Text, Tag, HStack, Badge, VStack } from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';

interface QuoteCardProps {
  quote: {
    id: number;
    content: string;
    source?: string;
    tags?: string;
    importance?: number;
    date?: string;
  };
}

const importanceColors = ['gray', 'green', 'blue', 'purple', 'orange', 'red'];

const QuoteCard: React.FC<QuoteCardProps> = ({ quote }) => {
  return (
    <Box
      borderRadius="md"
      boxShadow="sm"
      bg="white"
      p={4}
      _hover={{ boxShadow: 'md', bg: 'gray.50' }}
      transition="all 0.2s"
    >
      <VStack align="start" spacing={2}>
        <Text fontSize="md" fontWeight="medium" noOfLines={3}>
          {quote.content}
        </Text>
        <HStack spacing={2}>
          {quote.source && (
            <Tag colorScheme="blue" size="sm">{quote.source}</Tag>
          )}
          {quote.tags && quote.tags.split(',').map(tag => (
            <Tag key={tag.trim()} colorScheme="gray" size="sm">{tag.trim()}</Tag>
          ))}
        </HStack>
        <HStack spacing={2}>
          {typeof quote.importance === 'number' && (
            <Badge colorScheme={importanceColors[quote.importance] || 'gray'}>
              <StarIcon mr={1} />重要性: {quote.importance}
            </Badge>
          )}
          {quote.date && (
            <Badge colorScheme="gray" variant="subtle">{quote.date}</Badge>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

export default QuoteCard; 