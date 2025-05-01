import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

// 配置资源
const resources = {
  en: {
    translation: {
      "app": {
        "title": "RelaScope Insight",
        "subtitle": "Personal Information Management and Analysis Tool",
        "loading": "Loading...",
        "welcome": "Welcome to RelaScope Insight"
      },
      "common": {
        "save": "Save",
        "cancel": "Cancel",
        "delete": "Delete",
        "edit": "Edit",
        "create": "Create",
        "search": "Search",
        "filter": "Filter",
        "sort": "Sort"
      },
      "navigation": {
        "dashboard": "Dashboard",
        "profiles": "Profiles",
        "quotes": "Quotes",
        "experiences": "Experiences",
        "analysis": "Analysis",
        "settings": "Settings",
        "help": "Help"
      }
    }
  },
  zh: {
    translation: {
      "app": {
        "title": "RelaScope Insight",
        "subtitle": "个人信息管理与分析工具",
        "loading": "加载中...",
        "welcome": "欢迎使用 RelaScope Insight"
      },
      "common": {
        "save": "保存",
        "cancel": "取消",
        "delete": "删除",
        "edit": "编辑",
        "create": "创建",
        "search": "搜索",
        "filter": "筛选",
        "sort": "排序"
      },
      "navigation": {
        "dashboard": "仪表盘",
        "profiles": "个人信息库",
        "quotes": "语录",
        "experiences": "经历",
        "analysis": "分析",
        "settings": "设置",
        "help": "帮助"
      }
    }
  },
  ja: {
    translation: {
      "app": {
        "title": "RelaScope Insight",
        "subtitle": "個人情報管理・分析ツール",
        "loading": "読み込み中...",
        "welcome": "RelaScope Insightへようこそ"
      },
      "common": {
        "save": "保存",
        "cancel": "キャンセル",
        "delete": "削除",
        "edit": "編集",
        "create": "作成",
        "search": "検索",
        "filter": "フィルター",
        "sort": "並べ替え"
      },
      "navigation": {
        "dashboard": "ダッシュボード",
        "profiles": "個人情報",
        "quotes": "引用",
        "experiences": "経験",
        "analysis": "分析",
        "settings": "設定",
        "help": "ヘルプ"
      }
    }
  }
};

i18n
  // 使用 i18next-http-backend 加载翻译文件
  .use(Backend)
  // 将 i18next 传递给 react-i18next
  .use(initReactI18next)
  // 初始化 i18next
  .init({
    resources,
    fallbackLng: 'zh',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // 不需要HTML转义，React已经处理了
    },
    react: {
      useSuspense: true, // 使用React Suspense
    }
  });

export default i18n; 