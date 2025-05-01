import React from 'react';
import { Box, BoxProps } from '@chakra-ui/react';
import { motion, MotionProps } from 'framer-motion';

// 创建一个动画Box组件
export const MotionBox = motion(Box);

// 常用动画变体
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export const slideInFromLeft = {
  hidden: { x: -100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: 'spring', 
      stiffness: 100,
      damping: 15
    }
  }
};

export const slideInFromRight = {
  hidden: { x: 100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: 'spring', 
      stiffness: 100,
      damping: 15
    }
  }
};

export const slideInFromTop = {
  hidden: { y: -100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: 'spring', 
      stiffness: 100,
      damping: 15
    }
  }
};

export const slideInFromBottom = {
  hidden: { y: 100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: 'spring', 
      stiffness: 100,
      damping: 15
    }
  }
};

export const scaleIn = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: 'spring', 
      stiffness: 100,
      damping: 15
    }
  }
};

// 创建一个简单的动画组件
interface FadeInProps extends BoxProps, MotionProps {
  delay?: number;
  children: React.ReactNode;
}

export const FadeIn: React.FC<FadeInProps> = ({ 
  delay = 0, 
  children, 
  ...rest 
}) => {
  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: { 
            duration: 0.5,
            delay 
          }
        }
      }}
      {...rest}
    >
      {children}
    </MotionBox>
  );
}; 