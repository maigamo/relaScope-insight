/**
 * LLM设置组件 - 入口文件
 * 这是其他组件引入的主入口点，保持向后兼容性
 */
import React from 'react';
import { LLMSettingsImpl } from './LLMSettingsImpl';

const LLMSettings: React.FC = () => {
  return <LLMSettingsImpl />;
};

export default LLMSettings; 