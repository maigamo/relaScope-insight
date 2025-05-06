import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入翻译文件
import zhTranslation from './locales/zh/translation.json';
import enTranslation from './locales/en/translation.json';
import jaTranslation from './locales/ja/translation.json';

// 初始化i18next
i18n
  // 检测用户语言
  .use(LanguageDetector)
  // 将i18n实例传递给react-i18next
  .use(initReactI18next)
  // 初始化i18next
  .init({
    debug: process.env.NODE_ENV === 'development',
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false, // 不需要React中的转义
    },
    resources: {
      zh: {
        translation: zhTranslation,
      },
      en: {
        translation: enTranslation,
      },
      ja: {
        translation: jaTranslation,
      },
    },
  });

// 手动刷新翻译的方法
export const refreshTranslations = () => {
  // 重新加载资源
  i18n.reloadResources().then(() => {
    console.log('翻译资源已重新加载');
  });
};

export default i18n; 