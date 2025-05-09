-- 创建企业表
CREATE TABLE IF NOT EXISTS enterprises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  email TEXT,
  logo_path TEXT,
  website TEXT,
  description TEXT,
  license_code TEXT,
  license_image TEXT,
  established_time TEXT,
  status INTEGER DEFAULT 1,
  created_time TEXT NOT NULL,
  updated_time TEXT NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_enterprises_name ON enterprises (name);
CREATE INDEX IF NOT EXISTS idx_enterprises_created_time ON enterprises (created_time);

-- 创建个人信息表
CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  gender TEXT,
  age INTEGER,
  occupation TEXT,
  interests TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建个人信息表索引
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles (name);
CREATE INDEX IF NOT EXISTS idx_profiles_occupation ON profiles (occupation);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles (created_at);

-- 创建引用表
CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  source TEXT,
  date TEXT,
  context TEXT,
  tags TEXT,
  importance INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE
);

-- 创建引用表索引
CREATE INDEX IF NOT EXISTS idx_quotes_profile_id ON quotes (profile_id);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes (created_at);

-- 创建经历表
CREATE TABLE IF NOT EXISTS experiences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT,
  location TEXT,
  tags TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE
);

-- 创建经历表索引
CREATE INDEX IF NOT EXISTS idx_experiences_profile_id ON experiences (profile_id);
CREATE INDEX IF NOT EXISTS idx_experiences_date ON experiences (date);
CREATE INDEX IF NOT EXISTS idx_experiences_created_at ON experiences (created_at);

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  salt TEXT NOT NULL,
  real_name TEXT,
  avatar TEXT,
  email TEXT,
  phone TEXT,
  role INTEGER DEFAULT 1, -- 1: 普通用户, 2: 管理员, 3: 超级管理员
  enterprise_id INTEGER,
  department TEXT,
  position TEXT,
  status INTEGER DEFAULT 1, -- 0: 禁用, 1: 正常
  last_login_time TEXT,
  created_time TEXT NOT NULL,
  updated_time TEXT NOT NULL,
  FOREIGN KEY (enterprise_id) REFERENCES enterprises(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_enterprise_id ON users (enterprise_id);

-- 创建项目表
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  logo_path TEXT,
  enterprise_id INTEGER NOT NULL,
  owner_id INTEGER NOT NULL,
  status INTEGER DEFAULT 1, -- 0: 禁用, 1: 活跃, 2: 已归档
  created_time TEXT NOT NULL,
  updated_time TEXT NOT NULL,
  FOREIGN KEY (enterprise_id) REFERENCES enterprises(id),
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_projects_enterprise_id ON projects (enterprise_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects (owner_id);

-- 创建项目成员表
CREATE TABLE IF NOT EXISTS project_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role INTEGER DEFAULT 1, -- 1: 成员, 2: 管理员, 3: 所有者
  created_time TEXT NOT NULL,
  updated_time TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_members_project_user ON project_members (project_id, user_id);

-- 创建文件表
CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  path TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  extension TEXT,
  project_id INTEGER,
  uploader_id INTEGER NOT NULL,
  created_time TEXT NOT NULL,
  updated_time TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (uploader_id) REFERENCES users(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_files_project_id ON files (project_id);
CREATE INDEX IF NOT EXISTS idx_files_uploader_id ON files (uploader_id);

-- 创建标签表
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  color TEXT,
  enterprise_id INTEGER,
  created_time TEXT NOT NULL,
  updated_time TEXT NOT NULL,
  FOREIGN KEY (enterprise_id) REFERENCES enterprises(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_tags_enterprise_id ON tags (enterprise_id);

-- 创建日志表
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id INTEGER,
  description TEXT,
  ip_address TEXT,
  created_time TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_time ON activity_logs (created_time);

-- 创建六边形模型表
CREATE TABLE IF NOT EXISTS hexagon_models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER NOT NULL,
  title TEXT DEFAULT '六边形人性模型分析',
  security REAL NOT NULL DEFAULT 5,
  achievement REAL NOT NULL DEFAULT 5,
  freedom REAL NOT NULL DEFAULT 5,
  belonging REAL NOT NULL DEFAULT 5,
  novelty REAL NOT NULL DEFAULT 5,
  control REAL NOT NULL DEFAULT 5,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE
);

-- 创建六边形模型表索引
CREATE INDEX IF NOT EXISTS idx_hexagon_models_profile_id ON hexagon_models (profile_id);
CREATE INDEX IF NOT EXISTS idx_hexagon_models_created_at ON hexagon_models (created_at); 