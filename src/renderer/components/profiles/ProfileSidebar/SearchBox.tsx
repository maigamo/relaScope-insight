import React from 'react';
import { 
  Box, 
  InputGroup, 
  Input, 
  InputLeftElement,
  InputRightElement,
  CloseButton,
  useColorModeValue
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';

interface SearchBoxProps {
  searchQuery: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onEnterPress: () => void;
}

const SearchBox: React.FC<SearchBoxProps> = React.memo(({ searchQuery, onChange, onClear, onEnterPress }) => {
  const { t } = useTranslation();
  const inputBg = useColorModeValue('white', 'gray.800');
  const iconColor = useColorModeValue('gray.500', 'gray.400');
  
  // 添加回车键处理函数
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onEnterPress();
    }
  };
  
  return (
    <Box position="sticky" top={0} zIndex={10} bg={useColorModeValue('white', 'gray.800')} pt={2} pb={2}>
      <InputGroup size="sm">
        <InputLeftElement pointerEvents="none">
          <SearchIcon color={iconColor} />
        </InputLeftElement>
        <Input
          placeholder={t('common.search')}
          value={searchQuery}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          bg={inputBg}
          borderRadius="md"
        />
        {searchQuery && (
          <InputRightElement>
            <CloseButton size="sm" onClick={onClear} />
          </InputRightElement>
        )}
      </InputGroup>
    </Box>
  );
});

export default SearchBox; 