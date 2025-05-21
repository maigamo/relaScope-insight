/**
 * 样式工具函数
 * 定义常用的样式配置和主题相关样式
 */
import { CSSProperties } from 'react';
import { theme } from 'antd';

/**
 * 获取颜色变量
 * @returns 颜色变量对象
 */
export const useThemeColors = () => {
  const { token } = theme.useToken();
  
  return {
    primary: token.colorPrimary,
    success: token.colorSuccess,
    warning: token.colorWarning,
    error: token.colorError,
    info: token.colorInfo,
    border: token.colorBorder,
    background: token.colorBgContainer,
    text: token.colorText,
    textSecondary: token.colorTextSecondary,
    disabled: token.colorTextDisabled,
  };
};

/**
 * 获取常用的边框圆角
 * @returns 圆角配置对象
 */
export const getBorderRadius = () => {
  const { token } = theme.useToken();
  
  return {
    small: token.borderRadiusSM,
    medium: token.borderRadius,
    large: token.borderRadiusLG,
    extraLarge: `${Math.round(parseFloat(token.borderRadiusLG.toString()) * 2)}px`,
  };
};

/**
 * 卡片样式
 */
export const cardStyle: CSSProperties = {
  width: '100%',
  marginBottom: '16px',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
};

/**
 * 卡片内容区域样式
 */
export const cardBodyStyle: CSSProperties = {
  padding: '16px',
};

/**
 * 卡片内容布局样式
 */
export const cardContentStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

/**
 * 卡片容器样式
 */
export const cardContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  padding: '16px',
  marginBottom: '16px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
};

/**
 * 表单容器样式
 */
export const formContainerStyle: CSSProperties = {
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
  padding: '16px',
};

/**
 * 弹性布局容器样式
 */
export const flexContainerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  marginBottom: '16px',
};

/**
 * 弹性列布局容器样式
 */
export const flexColumnStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
};

/**
 * 居中容器样式
 */
export const centerContainerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
};

/**
 * 边距配置
 */
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

/**
 * 阴影配置
 */
export const shadows = {
  small: '0 2px 4px rgba(0, 0, 0, 0.1)',
  medium: '0 4px 8px rgba(0, 0, 0, 0.1)',
  large: '0 8px 16px rgba(0, 0, 0, 0.1)',
  extraLarge: '0 12px 24px rgba(0, 0, 0, 0.1)',
};

/**
 * 获取阴影样式
 * @param level 阴影级别
 * @returns 阴影样式
 */
export const getShadow = (level: 'small' | 'medium' | 'large' | 'extraLarge' = 'medium'): string => {
  return shadows[level];
};

/**
 * 文本截断样式
 * @param lines 最大行数
 * @returns 样式对象
 */
export const textEllipsisStyle = (lines: number = 1): CSSProperties => {
  if (lines === 1) {
    return {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };
  }
  
  return {
    display: '-webkit-box',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
  };
};

/**
 * 响应式栅格配置
 */
export const gridBreakpoints = {
  xs: '480px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1600px',
};

/**
 * 创建媒体查询字符串
 * @param breakpoint 断点名称
 * @returns 媒体查询字符串
 */
export const mediaQuery = (breakpoint: keyof typeof gridBreakpoints): string => {
  return `@media (min-width: ${gridBreakpoints[breakpoint]})`;
};

/**
 * 创建带悬停效果的样式
 * @param style 基础样式
 * @param hoverStyle 悬停样式
 * @returns 合并后的样式对象
 */
export const withHoverStyle = (style: CSSProperties, hoverStyle: CSSProperties): any => {
  return {
    ...style,
    transition: 'all 0.3s ease',
    '&:hover': {
      ...hoverStyle,
    },
  };
};

/**
 * 获取亮度调整后的颜色
 * @param color 基础颜色（十六进制）
 * @param amount 调整量（-1到1，负数变暗，正数变亮）
 * @returns 调整后的颜色
 */
export const adjustBrightness = (color: string, amount: number): string => {
  // 移除#前缀
  const hex = color.replace('#', '');
  
  // 解析RGB值
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // 调整亮度
  const adjustColor = (c: number) => {
    return Math.max(0, Math.min(255, Math.round(c + (amount * 255))));
  };
  
  // 转换回十六进制
  const rr = adjustColor(r).toString(16).padStart(2, '0');
  const gg = adjustColor(g).toString(16).padStart(2, '0');
  const bb = adjustColor(b).toString(16).padStart(2, '0');
  
  return `#${rr}${gg}${bb}`;
};

/**
 * 内容容器样式
 */
export const containerStyle: CSSProperties = {
  width: '100%',
  padding: '16px',
  marginBottom: '24px',
};

/**
 * 表单布局配置
 */
export const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
}; 