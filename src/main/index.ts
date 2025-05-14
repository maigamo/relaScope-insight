import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { setupIPCHandlers } from './ipc/handlers';
import { DatabaseService } from './services/database/DatabaseService';
import { LLMService } from './services/llm/llm-service';

// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let mainWindow: BrowserWindow | null = null;

// 判断是否为开发环境
const isDev = process.env.NODE_ENV === 'development';
console.log('当前环境:', isDev ? '开发环境' : '生产环境');

const createWindow = () => {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    // 隐藏默认菜单栏
    autoHideMenuBar: true,
    // 设置无边框窗口
    frame: false,
    // 设置应用图标
    icon: path.join(__dirname, '../renderer/assets/icons/icon.png'),
  });

  // 彻底隐藏菜单栏
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setMenu(null);

  // 全局CSS优化滚动条样式
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.insertCSS(`
      ::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.12);
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.25);
      }
      
      /* Firefox滚动条样式 */
      * {
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 0, 0, 0.12) transparent;
      }
    `);
    console.log('已应用全局滚动条样式');
  });

  // 加载应用的 index.html
  if (isDev) {
    console.log('正在加载开发服务器URL: http://localhost:8085');
    // 开发环境下，加载开发服务器地址
    mainWindow.loadURL('http://localhost:8085');
  } else {
    console.log('正在加载生产环境文件');
    // 生产环境下，加载本地文件
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../renderer/index.html'),
        protocol: 'file:',
        slashes: true,
      }),
    );
  }

  // 始终打开开发者工具
  mainWindow.webContents.openDevTools();
  console.log('已打开开发者工具');

  // 当 window 被关闭，这个事件会被触发
  mainWindow.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    mainWindow = null;
  });
  
  // 设置窗口控制监听器
  setupWindowControlListeners();
};

// 设置应用图标（针对不同平台）
const setAppIcon = () => {
  if (process.platform === 'win32') {
    app.setAppUserModelId(app.getName()); // Windows 任务栏图标
  }
};

// 设置窗口控制IPC监听器
const setupWindowControlListeners = () => {
  ipcMain.on('window-control', (event, command) => {
    if (!mainWindow) return;
    
    console.log(`接收到窗口控制命令: ${command}`);
    
    switch (command) {
      case 'minimize':
        mainWindow.minimize();
        break;
      case 'maximize':
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        } else {
          mainWindow.maximize();
        }
        break;
      case 'close':
        mainWindow.close();
        break;
      default:
        console.warn(`未知的窗口控制命令: ${command}`);
    }
  });
};

// 设置IPC处理器
const setupHandlers = () => {
  setupIPCHandlers();
};

// 初始化数据库
const initializeDatabase = async () => {
  try {
    console.log('正在初始化数据库...');
    const dbService = DatabaseService.getInstance();
    await dbService.initialize();
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
};

// 初始化主进程
async function initMain() {
  try {
    // 设置应用图标
    setAppIcon();
    
    // 初始化数据库服务
    await DatabaseService.getInstance().initialize();
    console.log('数据库服务初始化成功');
    
    // 初始化LLM服务
    await LLMService.getInstance().initialize();
    console.log('LLM服务初始化成功');
    
    // 注册IPC处理程序
    setupIPCHandlers();
  } catch (error) {
    console.error('主进程初始化失败:', error);
    throw error; // 重新抛出错误，让上层捕获处理
  }
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  // 初始化主进程
  initMain().then(() => {
    createWindow();
    
    app.on('activate', function () {
      // macOS中点击Dock图标重新创建窗口
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  }).catch(error => {
    console.error('主进程初始化失败:', error);
  });
});

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 在这个文件中，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。 