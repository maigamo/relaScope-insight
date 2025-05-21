/**
 * 动画工具函数
 * 定义通用的动画效果
 */
import { CSSProperties } from 'react';
import { Variants } from 'framer-motion';

/**
 * 淡入动画样式
 */
export const fadeIn: CSSProperties = {
  animation: 'fadeIn 0.5s ease',
  transition: 'all 0.3s ease',
  opacity: 1
};

/**
 * 列表项动画变体
 */
export const itemAnim: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * 容器动画变体
 */
export const containerAnim: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0 },
};

/**
 * 渐变动画
 */
export const fadeAnimation = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * 缩放动画
 */
export const scaleAnimation = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    scale: 0.95, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * 滑动动画
 */
export const slideAnimation = {
  initial: { y: 20, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    y: 20, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * 折叠动画
 */
export const collapseAnimation = {
  open: { 
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.3 }
  },
  closed: { 
    height: 0,
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

/**
 * 弹跳动画
 */
export const bounceAnimation = {
  initial: { y: -10, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 15
    }
  },
  exit: { 
    y: 10, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
}; 