import React from 'react';
import { ChakraProvider, CSSReset, ColorModeProvider } from '@chakra-ui/react';
import LLMSettings from './LLMSettings';
import { theme } from '../../theme';

/**
 * LLM设置页面主入口组件
 * 用于整合所有拆分出来的组件
 */
const LLMSettingsMain: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeProvider>
        <CSSReset />
        <LLMSettings />
      </ColorModeProvider>
    </ChakraProvider>
  );
};

export default LLMSettingsMain; 