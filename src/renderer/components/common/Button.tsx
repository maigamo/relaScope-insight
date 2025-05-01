import React from 'react';
import {
  Button as ChakraButton,
  ButtonProps as ChakraButtonProps,
  forwardRef,
  useStyleConfig
} from '@chakra-ui/react';

export interface ButtonProps extends ChakraButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<ButtonProps, 'button'>((props, ref) => {
  const { variant = 'primary', size = 'md', ...rest } = props;
  const styles = useStyleConfig('Button', { variant, size });

  return (
    <ChakraButton
      ref={ref}
      variant={variant}
      size={size}
      __css={styles}
      {...rest}
    />
  );
});

Button.displayName = 'Button'; 