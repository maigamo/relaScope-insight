import React from 'react';
import {
  Box,
  BoxProps,
  useStyleConfig,
  useColorModeValue
} from '@chakra-ui/react';

export interface CardProps extends BoxProps {
  variant?: string;
  isHoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  variant, 
  isHoverable = false,
  children, 
  ...rest 
}) => {
  const styles = useStyleConfig('Card', { variant });
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  return (
    <Box
      __css={styles}
      bg={useColorModeValue('white', 'gray.800')}
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.2s"
      _hover={isHoverable ? {
        transform: 'translateY(-4px)',
        boxShadow: 'md',
        bg: hoverBg
      } : undefined}
      {...rest}
    >
      {children}
    </Box>
  );
}; 