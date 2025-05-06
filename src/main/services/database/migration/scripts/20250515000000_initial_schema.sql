-- 创建个人档案表
CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  birthday TEXT,
  gender TEXT,
  occupation TEXT,
  education TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  socialMedia TEXT,
  notes TEXT,
  tags TEXT,
  avatar TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- 创建引用表
CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profileId INTEGER NOT NULL,
  content TEXT NOT NULL,
  source TEXT,
  date TEXT,
  context TEXT,
  tags TEXT,
  importance INTEGER,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
);

-- 创建经历表
CREATE TABLE IF NOT EXISTS experiences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profileId INTEGER NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  organization TEXT,
  startDate TEXT,
  endDate TEXT,
  description TEXT,
  location TEXT,
  impact INTEGER,
  tags TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
);

-- 创建分析表
CREATE TABLE IF NOT EXISTS analyses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profileId INTEGER NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  resultSummary TEXT,
  tags TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
);

-- 创建六边形模型表
CREATE TABLE IF NOT EXISTS hexagon_models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profileId INTEGER NOT NULL,
  title TEXT NOT NULL,
  security REAL NOT NULL,
  achievement REAL NOT NULL,
  pleasure REAL NOT NULL,
  autonomy REAL NOT NULL,
  connection REAL NOT NULL,
  meaning REAL NOT NULL,
  notes TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
);

-- 创建标签表（用于聚合和管理标签）
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- 创建配置表（用于存储应用配置）
CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  updatedAt TEXT NOT NULL
);

-- 创建搜索索引（用于全文搜索）
CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
  id,
  type,
  title,
  content,
  tags,
  profileId UNINDEXED
);

-- 创建数据库版本表
CREATE TABLE IF NOT EXISTS db_version (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- 插入初始版本
INSERT INTO db_version (version, updatedAt) VALUES ('1.0.0', datetime('now')); 