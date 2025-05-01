import React, { useState, useEffect } from 'react';
import { 
  ChakraProvider, 
  Flex, 
  Spinner, 
  Text, 
  extendTheme,
  ColorModeScript
} from '@chakra-ui/react';
import { ConfigService } from './services/ConfigService';
import { Layout } from './components/common/Layout';
import { useTranslation } from 'react-i18next';
import './i18n';

// 定义主题
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f6ff',
      100: '#b3e0ff',
      200: '#80cbff',
      300: '#4db5ff',
      400: '#1a9fff',
      500: '#0088e6',
      600: '#006bb3',
      700: '#004d80',
      800: '#00344d',
      900: '#001a26',
    },
    blue: {
      50: '#e6f1ff',
      100: '#b3d2ff',
      200: '#80b3ff',
      300: '#4d94ff',
      400: '#1a75ff',
      500: '#0055cc',
      600: '#004299',
      700: '#002e66',
      800: '#001a33',
      900: '#000d19',
    },
    green: {
      50: '#e6f9f0',
      100: '#b3eed6',
      200: '#80e3bc',
      300: '#4dd8a1',
      400: '#1acd87',
      500: '#00b36b',
      600: '#008c54',
      700: '#00663d',
      800: '#003f26',
      900: '#001f13',
    }
  },
  fonts: {
    body: "'Source Sans Pro', sans-serif",
    heading: "'Source Sans Pro', sans-serif",
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
});

// 定义配置类型
interface AppConfig {
  language?: string;
  theme?: string;
  fontSize?: number;
  [key: string]: any;
}

// 应用组件
export const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // 加载配置
    const loadConfig = async () => {
      try {
        const config = await ConfigService.getConfig();
        console.log('配置加载成功:', config);
        
        // 设置语言
        if (config.language) {
          i18n.changeLanguage(config.language);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('配置加载失败:', error);
        setIsLoading(false);
      }
    };
    
    loadConfig();
  }, [i18n]);

  if (isLoading) {
    return (
      <ChakraProvider theme={theme}>
        <Flex height="100vh" alignItems="center" justifyContent="center">
          <Spinner size="xl" color="blue.500" />
          <Text ml={4}>{t('common.loading')}</Text>
        </Flex>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Layout pageTitle={t('nav.dashboard')} />
    </ChakraProvider>
  );
}; 