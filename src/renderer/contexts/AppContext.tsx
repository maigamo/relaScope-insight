import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorMode, useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

// ConfigService界面
export interface ConfigService {
  getConfig: <T>(key: string, defaultValue?: T) => Promise<T>;
  setConfig: <T>(key: string, value: T) => Promise<boolean>;
  getAllConfigs: () => Promise<Record<string, any>>;
}

// 应用状态接口
interface AppState {
  isLoading: boolean;
  language: string;
  sidebarCollapsed: boolean;
  // 可以根据需要添加更多状态
}

// 应用上下文接口
interface AppContextType {
  // 应用状态
  state: AppState;
  // 加载状态控制
  setIsLoading: (isLoading: boolean) => void;
  // 语言控制
  setLanguage: (language: string) => void;
  // 侧边栏控制
  setSidebarCollapsed: (collapsed: boolean) => void;
  // 配置服务
  configService: ConfigService | null;
  // 显示通知
  showNotification: (title: string, description: string, status?: 'info' | 'warning' | 'success' | 'error') => void;
}

// 创建Context
export const AppContext = createContext<AppContextType>({
  state: {
    isLoading: true,
    language: 'zh',
    sidebarCollapsed: false
  },
  setIsLoading: () => {},
  setLanguage: () => {},
  setSidebarCollapsed: () => {},
  configService: null,
  showNotification: () => {}
});

// 使用自定义Hook访问Context
export const useAppContext = () => useContext(AppContext);

// Context Provider组件
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 状态
  const [state, setState] = useState<AppState>({
    isLoading: true,
    language: 'zh',
    sidebarCollapsed: false
  });
  
  const { i18n } = useTranslation();
  const { setColorMode } = useColorMode();
  const toast = useToast();
  
  // 从window全局对象获取电子配置服务
  const configService: ConfigService | null = (window as any).electron?.configService || null;
  
  // 初始化
  useEffect(() => {
    // 加载配置
    const loadConfigs = async () => {
      try {
        if (configService) {
          try {
            // 获取语言设置
            const language = await configService.getConfig<string>('app.language', 'zh');
            // 获取主题设置
            const theme = await configService.getConfig<string>('app.theme', 'light');
            
            // 更新状态
            setState(prev => ({
              ...prev,
              language,
              isLoading: false
            }));
            
            // 设置语言
            i18n.changeLanguage(language);
            
            // 设置颜色模式
            if (theme !== 'system') {
              setColorMode(theme as 'light' | 'dark');
            }
            
            console.log('配置加载完成:', { language, theme });
          } catch (error) {
            console.error('加载配置失败:', error);
            setState(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          console.warn('配置服务不可用，使用默认设置');
          // 使用默认设置
          i18n.changeLanguage('zh');
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('初始化过程中发生错误:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    // 短暂延迟确保渲染过程完成
    setTimeout(loadConfigs, 500);
  }, [configService, i18n, setColorMode]);
  
  // 设置加载状态
  const setIsLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };
  
  // 设置语言
  const setLanguage = async (language: string) => {
    setState(prev => ({ ...prev, language }));
    i18n.changeLanguage(language);
    
    // 保存到配置
    if (configService) {
      await configService.setConfig('app.language', language);
    }
  };
  
  // 设置侧边栏状态
  const setSidebarCollapsed = (sidebarCollapsed: boolean) => {
    setState(prev => ({ ...prev, sidebarCollapsed }));
  };
  
  // 显示通知
  const showNotification = (
    title: string, 
    description: string, 
    status: 'info' | 'warning' | 'success' | 'error' = 'info'
  ) => {
    toast({
      title,
      description,
      status,
      duration: 5000,
      isClosable: true,
      position: 'top-right'
    });
  };
  
  // Context值
  const contextValue: AppContextType = {
    state,
    setIsLoading,
    setLanguage,
    setSidebarCollapsed,
    configService,
    showNotification
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}; 