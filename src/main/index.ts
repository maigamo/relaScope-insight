import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { setupIPCHandlers } from './ipc/handlers';
import { DatabaseService } from './services/database/DatabaseService';

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

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(async () => {
  console.log('应用准备就绪，初始化数据库和设置IPC处理器');
  
  // 先初始化数据库
  await initializeDatabase();
  
  // 设置IPC处理器
  setupHandlers();
  
  // 创建主窗口
  createWindow();
});

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (mainWindow === null) {
    createWindow();
  }
});

// 在这个文件中，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。 