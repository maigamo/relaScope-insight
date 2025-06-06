# RelaScope Insight - 开发阶段指导书

![开发阶段](https://img.shields.io/badge/开发阶段-指导-blue)
![版本](https://img.shields.io/badge/版本-1.0-green)
![状态](https://img.shields.io/badge/状态-正式-orange)

> 本文档将项目的开发过程划分为10个有序的阶段，并定义了每个阶段的任务、目标和必须满足的额外要求。**开发必须严格按照阶段顺序进行，完成当前阶段目标并记录后，方可进入下一阶段。**

## 开发规范声明

本项目开发过程中必须严格遵循 [开发代码规范](./开发代码规范.md) 中定义的各项规范，包括但不限于：

- 代码风格采用 ESLint (Airbnb 配置)
- 变量/函数命名使用 camelCase，组件使用 PascalCase
- TypeScript 类型必须明确声明，避免使用 any
- 所有代码文件行数不得超过 400 行
- 前后端分离，通过 IPC 安全通信
- 添加清晰的文件、函数和重要逻辑注释
- 程序启动命令使用：npm run app:dev


**IPC响应格式规范：**

为确保整个应用中IPC通信的一致性和可靠性，**所有IPC处理器必须遵循统一的响应格式**。这不仅提高了代码的可维护性，也简化了前端对响应的处理逻辑。

1. **统一响应接口**：
   ```typescript
   interface IPCResponse<T = any> {
     success: boolean;   // 操作是否成功
     data?: T;           // 成功时返回的数据
     error?: string;     // 失败时的错误信息
   }
   ```

2. **成功响应示例**：
   ```typescript
   // 返回数据列表
   return { 
     success: true, 
     data: users 
   } as IPCResponse<User[]>;
   
   // 返回单个对象
   return { 
     success: true, 
     data: profile 
   } as IPCResponse<Profile>;
   
   // 返回操作结果（无需返回数据）
   return { 
     success: true 
   } as IPCResponse;
   ```

3. **错误响应示例**：
   ```typescript
   // 返回具体错误信息
   return { 
     success: false, 
     error: `创建个人信息失败: ${error.message}` 
   } as IPCResponse;
   
   // 返回通用错误
   return { 
     success: false, 
     error: '操作失败，请重试' 
   } as IPCResponse;
   ```

4. **IPC处理器实现规范**：
   ```typescript
   ipcMain.handle('channel:name', async (_, ...args) => {
     try {
       const result = await someOperation(...args);
       return { 
         success: true, 
         data: result 
       } as IPCResponse;
     } catch (error: any) {
       console.error(`操作失败: ${error.message}`);
       return { 
         success: false, 
         error: `操作失败: ${error.message}` 
       } as IPCResponse;
     }
   });
   ```

5. **前端调用与处理**：
   ```typescript
   const response = await ipcService.invoke('channel:name', params);
   
   if (response.success) {
     // 成功处理
     const data = response.data;
     // ...
   } else {
     // 错误处理
     console.error(response.error);
     // 显示错误消息
     toast({
       title: '操作失败',
       description: response.error || '未知错误',
       status: 'error',
       duration: 5000,
     });
   }
   ```

6. **禁止的返回格式**：
   - ❌ 直接返回数据对象：`return user;`
   - ❌ 直接返回布尔值：`return true;`
   - ❌ 直接返回数组：`return users;`
   - ❌ 使用不一致的响应结构：`return { ok: true, result: data };`

确保所有新开发的IPC处理器严格遵循上述规范，并在代码审查过程中检查IPC响应格式的一致性。现有不符合规范的处理器应在重构或维护时进行更新。

**IPC通信最佳实践：**
- **响应格式处理**：所有IPC响应处理必须使用以下健壮的判断方法:
  ```javascript
  // 更健壮的成功条件判断（三种响应格式）
  const isSuccess = 
    response === true || 
    (typeof response === 'object' && response !== null && 
      (response.success === true || response['success'] === true ||
       // 处理直接返回数据对象的情况（创建/更新）
       (response.id && !response.hasOwnProperty('success'))));
  
  // 删除操作特殊处理
  const isDeleteSuccess = 
    response === true || 
    (typeof response === 'object' && response !== null && 
      (response.success === true || response['success'] === true ||
       // 处理返回变更数据的情况
       (response.hasOwnProperty && !response.hasOwnProperty('success') && 
        (response === true || response.data === true || response.changes > 0))));
  
  if (isSuccess) {
    // 成功处理...
  } else {
    // 错误处理...
  }
  ```
- **错误处理**：使用可选链操作符安全访问可能不存在的属性
  ```javascript
  // 正确的错误信息提取
  const errorMessage = response?.error || defaultErrorMessage;
  ```
- **乐观UI更新**：对于删除等操作，应先更新UI再调用API，优化用户体验
  ```javascript
  // 立即更新UI
  setItems(prev => prev.filter(item => item.id !== id));
  // 然后调用API
  const result = await ipcService.invoke('delete', id);
  ```
- **数据类型验证**：总是验证返回的数据类型，不要假设返回值格式统一
  ```javascript
  // 安全地处理数组或对象包装的数组
  const data = Array.isArray(response) ? response : (response?.data || []);
  ```



## 视觉风格规范

项目UI应严格按照[RelaScopeInsight UI风格说明](./RelaScopeInsight%20UI风格说明.md) 中定义的视觉规范进行设计和实现，关键点包括：

### 1. 整体设计风格
- **设计理念**: 采用现代、简洁的扁平化设计风格，强调清晰的视觉层次和功能分区
- **设计原则**: 遵循"内容优先"原则，通过简约的界面元素突出用户核心关注的内容

### 2. 色彩方案
- **主色调**: 白色和浅灰色作为基础背景色
- **强调色**: 蓝色作为主要操作按钮的强调色

- **状态指示色**: 绿色作为导航项选中状态的指示色
- **暗色模式**: 提供深色背景和相应对比度的文本色
- **功能色分配**:
  - 绿色: 表示操作成功或添加语录
  - 蓝色: 表示主要操作、档案功能
  - 紫色: 表示经历记录功能

### 3. 布局结构
- **左侧导航**:
  - 宽度固定为60px的窄边栏
  - 仅显示图标，悬停时显示提示文本
  - 采用分组展示不同功能模块
  - 当前选中项有绿色竖条高亮指示
  - 系统功能（设置、暗模式）位于底部

- **顶部导航**:
  - 左侧显示当前页面标题
  - 中间是全局搜索框
  - 右侧是主要操作按钮（蓝色"创建"按钮）
  - 最右侧是窗口控制按钮（最小化、最大化、关闭）

- **主内容区**:
  - 占据除侧边栏和顶部导航外的所有空间
  - 背景色为浅灰，内容区为白色
  - 无内容时显示中央提示框

### 4. 图标使用
- **图标库**: 使用 Font Awesome 6 Free 作为基础UI图标库
- **图标风格**: 线条风格，扁平化设计
- **图标尺寸**: 统一使用18px大小
- **图标颜色**: 根据状态变化（选中/未选中）

### 5. 组件风格
- **按钮**:
  - 主要操作: 实心蓝色背景，白色文本
  - 次要操作: 轮廓线条，配色根据功能区分

- **输入框**:
  - 圆角搜索框
  - 左侧带有搜索图标

- **卡片**:
  - 圆角设计
  - 轻微阴影
  - 白色背景（深色模式下为深灰）

- **提示框**:
  - 居中显示
  - 图标+提示文本+操作按钮组合

### 6. 交互动效
- **导航项**: 点击切换页面，悬停时显示提示
- **按钮**: 悬停和点击时有适当的反馈动画
- **列表项**: 进出场时有流畅的过渡动画
- **暗模式切换**: 点击图标即时切换
- **空白状态**: 提供快速创建选项引导

**UI设计规范实现：**
- 列表页面：使用卡片组件，白底配置适当圆角，符合整体风格
- 表单控件：遵循字号规范（主标题20px中粗体，区域标题16px中等，正文14px常规）
- 搜索框：添加搜索图标前缀 `<i class="fas fa-search"></i>`
- 分页控件：使用官方组件，配色符合主色调
- 删除确认对话框：使用标准模态框，带有明确的警告颜色和图标
- 确保表单间距遵循8px基础网格系统

## 配置管理

所有配置项必须遵循 [配置定义](./配置定义.md) 文档中规定的参数定义。开发过程中：

- 使用 JSON 格式存储配置数据
- 敏感配置（如 API 密钥）必须加密存储
- 遵循文档中定义的配置目录结构和命名规范
- 配置文件修改需遵循模块化原则，避免改动影响其他配置项

关键配置类别：
- 应用基础配置（config.json）
- UI 配置（ui-config.json）
- 数据库配置（db-config.json）
- LLM 服务配置（llm-config.json，加密存储）
- 分析配置（analysis-config.json）
- 安全配置（security-config.json）
- 导出配置（export-config.json）
- 更新配置（update-config.json）

### 配置文件实现要点

1. **配置文件存储位置**
   - 开发时需根据不同操作系统实现正确的配置文件存储路径：
     - Windows: `%APPDATA%\RelaScope Insight\Config\`
     - macOS: `~/Library/Application Support/RelaScope Insight/Config/`
     - Linux: `~/.config/relascope-insight/`
   - 使用 `electron-store` 3.0.0 库管理配置存储，确保与 Electron 28.2.7 兼容

2. **敏感数据加密处理**
   - 使用 Node.js 内置 crypto 模块实现 AES-256-GCM 加密算法
   - 加密配置包括：API 密钥、数据库加密密钥（如启用）、本地密码保护哈希等
   - 遵循 `security-config.json` 中定义的加密参数：盐长度、IV长度、密钥派生迭代次数等
   - 确保加密密钥本身使用操作系统提供的安全存储机制

3. **配置架构验证**
   - 使用 `ajv` 8.12.0 实现配置文件的 JSON Schema 验证
   - 为每种配置文件定义明确的验证模式，确保格式正确
   - 启动时验证配置文件完整性，修复异常或恢复默认值

4. **配置自动更新**
   - 实现配置版本管理机制，支持旧版本配置文件平滑升级
   - 确保用户自定义配置在应用更新后不丢失
   - 新增配置项使用合理的默认值，避免影响现有功能

5. **配置依赖库兼容性**
   - `electron-store` 3.0.0 需与 Electron 28.2.7 兼容
   - 使用 `conf` 11.0.1 作为备选配置管理库，提供更丰富的验证功能
   - 避免使用依赖 Node.js 原生模块的配置库，减少跨平台编译问题
   - 配置监视机制应使用节流函数优化性能，避免频繁写入

## 技术栈兼容性说明

为确保项目各组件正常协同工作，**必须严格遵循架构文档中规定的版本要求**，特别注意以下几点：

1. **React 生态兼容性**
   - React 18.2.0 与 React DOM 18.2.0 版本必须匹配
    - 使用 @chakra-ui/react 2.8.2 版本，确保与 React 18 的 Concurrent Mode 兼容
   - 所有 React 组件库必须兼容 React 18 的特性和生命周期

2. **动画与可视化兼容性**
   - framer-motion 必须使用 7.10.3 版本，避免使用 9.x 及以上版本可能存在的不稳定性
   - recharts 使用 2.5.0 版本，确保与 React 18 和 TypeScript 4.9.5 兼容
   - 在实现 framer-motion 和 recharts 结合的动画效果时，注意避免性能问题

3. **Electron 与原生模块兼容性**
   - Electron 28.2.7 需与 sqlite3 5.1.7 搭配使用
   - 必须使用 electron-rebuild 确保原生模块在不同平台的正确构建
   - 注意 electron-builder 和 electron-forge 5.2.4 版本兼容性

4. **TypeScript 相关兼容性**
   - TypeScript 4.9.5 与所有依赖库类型定义必须兼容
   - 确保 ESLint 8.38.0 与 eslint-config-airbnb-typescript 17.0.0 配置正确

5. **构建工具链兼容性**
   - Webpack 5.91.0 与 Babel 7.24.0 版本必须兼容
   - 热重载功能需要 @pmmmwh/react-refresh-webpack-plugin 0.5.10 与 react-refresh 0.14.0 配合使用

## 开发阶段划分

### 阶段一：基础环境搭建与项目初始化

**开发任务：**
1. 创建 Electron + React + TypeScript 项目基础结构
2. 配置 webpack、babel、eslint 等开发工具链
3. 设置 electron-forge/electron-builder 打包环境
4. 实现主进程和渲染进程的基本框架
5. 配置 IPC 通信基础设施
6. 实现基础配置文件的读写功能
7. 设计并实现应用图标和启动页面

**目标：**
- 能够成功启动一个带有最小化 UI 的 Electron 应用
- 主进程和渲染进程能够正常通信
- 项目结构符合架构文档规范
- 配置文件能够正确读写

**额外目标：**
- 仔细检查前后端接口能否正确对应，确保数据传输和交互的准确性。
- 所有可以点击的地方都要设计并生成一个清晰可辨的图标，增强交互性。
- 确保本阶段完成后，程序能够正常运行且不出现明显的错误或异常。

**技术要点与依赖兼容性：**
- 确保 Electron 28.2.7 正确安装并支持目标平台
- 使用 electron-rebuild 解决原生模块（如 sqlite3）的兼容性问题
- 配置 React 18.2.0 开发环境，避免与旧版本 React 混用
- 实现符合 electron 安全最佳实践的 IPC 通信，确保上下文隔离
- 设置默认端口为 10018（如需网络功能）
- 确保 Node.js 版本与 Electron 28.2.7 内置 Node.js 兼容
- 实现基础配置读写功能，支持 8 种配置文件的读取、验证和更新
- 确保配置文件存储使用平台特定的路径，遵循操作系统的存储惯例
- 实现配置文件的 Schema 验证，确保格式正确性

### 阶段二：主界面框架与基础组件实现

**开发任务：**
1. 实现应用主界面布局，包括侧边栏、内容区域和顶部导航
2. 实现基础 UI 组件库，整合 Chakra UI 组件
3. 设计并实现主题系统，支持浅色/深色模式
4. 集成 framer-motion 实现基础动画系统
5. 实现多语言支持框架 (react-i18next)
6. 开发通用组件：按钮、卡片、对话框、表单控件等
7. 实现全局状态管理基础架构
8. 集成 Font Awesome 6 图标库并创建图标系统

**目标：**
- 完成主界面框架，具备基本导航能力
- 主题切换功能正常工作
- 支持英文、中文和日语的切换
- 基础组件库完成并可在应用内复用
- 动画系统可正常工作
- 图标系统实现统一

**额外目标：**
- 鼠标移入、点击元素比如模块、按钮，图标、链接等时，要设计动画效果，提升用户体验。
- 所有可以点击的地方都要设计并生成一个清晰可辨的图标，增强交互性。
- 确保本阶段完成后，程序能够正常运行且不出现明显的错误或异常。

**技术要点与依赖兼容性：**
- 使用 @chakra-ui/react 2.8.2 版本构建 UI 组件，确保与 React 18 兼容
- 使用 Chakra UI 内置的主题系统和 styled-components 6.x 实现主题支持
- framer-motion 7.10.3 配置动画系统，注意在 React 18 Strict Mode 下正确使用 AnimatePresence
- 使用 react-i18next 13.0 + i18next 23.1 实现国际化，确保支持中、英、日三种语言
- 使用 React Context API 和 Redux Toolkit 1.9.x 实现状态管理，注意两者边界和使用场景
- 实现 React Router 6.x 路由系统，确保 React 18 兼容性
- 集成 react-hot-toast 2.4.1 实现交互反馈，确保与主题系统兼容
- 主题系统需根据 `ui-config.json` 中的默认主题设置初始化，支持运行时切换
- UI配置需支持动态更新，主色调为默认值 "#22c55e"
- 导入 Font Awesome 6 Free，建立图标使用规范（Solid用于主要操作按钮，Regular用于次要操作和导航）

**UI元素设计规范：**
- **按钮**：
  - 主要操作：实心蓝色背景，白色文本
  - 次要操作：轮廓线条，配色根据功能区分（绿色用于成功/添加，蓝色用于档案，紫色用于经历）
  - 悬停状态：有明显视觉反馈（轻微缩放或颜色变化）

- **输入框**：
  - 圆角搜索框，边框色为浅灰
  - 搜索框左侧使用FontAwesome搜索图标 `<FontAwesomeIcon icon={faSearch} />`
  - 输入状态有明确的焦点指示

- **导航菜单**：
  - 左侧窄边栏固定宽度60px，仅显示图标
  - 使用FontAwesome图标，大小统一为18px
  - 当前选中项使用绿色竖条进行高亮指示
  - 悬停时显示Tooltip提示

- **卡片/区域**：
  - 白色背景（暗色模式下为深灰）
  - 轻微阴影效果
  - 圆角设计（8px）
  - 内边距保持16-20px

- **列表项**：
  - 悬停时使用浅灰色背景
  - 选中项可使用蓝色指示或绿色边框
  - 列表项进出场有流畅的动画效果

- **图标系统**：
  - 使用FontAwesome图标库
  - 图标大小统一：导航菜单(18px)，按钮内(16px)，独立图标(20px)
  - 图标颜色根据状态变化（选中/未选中）
  - 保持风格一致性，优先使用线性图标

### 阶段三：数据库设计与存储系统实现

**开发任务：**
1. 设计 SQLite 数据库模式（个人信息库、语录、经历、分析记录等表）
2. 实现数据库连接和初始化功能
3. 开发数据访问层 (DAO) 基础类和接口
4. 实现数据库迁移和版本管理系统
5. 开发数据备份和恢复功能
6. 实现配置数据的 JSON 存储管理
7. 设计并实现敏感数据加密机制

**目标：**
- 完成数据库结构设计，表结构完整
- 数据库连接、初始化、迁移功能可正常工作
- 基础 CRUD 操作接口完成
- 配置数据能够安全存储和读取
- 敏感数据加密机制正常工作

**额外目标：**
- 仔细检查前后端接口能否正确对应，确保数据传输和交互的准确性。
- 确保本阶段完成后，程序能够正常运行且不出现明显的错误或异常。

**技术要点与依赖兼容性：**
- 使用 SQLite 5.1.7 作为本地数据库，并通过 electron-rebuild 确保跨平台构建
- 实现数据库连接池优化，避免频繁的数据库连接操作
- 使用 Node.js crypto 模块实现 API 密钥等敏感信息的加密存储
- 配置数据存储使用 JSON 格式，确保序列化/反序列化的正确性
- 设计数据库模式时考虑分表策略，确保单表数据量不会过大
- 考虑使用 SQLCipher 增强 SQLite 数据库加密能力（可选功能）
- 实现数据库迁移机制，支持数据库结构的版本管理和平滑升级
- 根据 `db-config.json` 中的设置实现数据库连接、加密和备份功能
- 数据库路径默认设置为 "./data/db/relascope.db"，支持自定义
- 备份功能按配置默认每7天执行一次，保留5个最新备份

### 阶段四：个人信息库管理功能实现

**开发任务：**
1. 设计并实现个人信息库列表页面
2. 开发个人信息创建/编辑表单
3. 实现个人信息详情页面
4. 开发个人信息库删除功能（支持单个和批量）
5. 实现信息库搜索和过滤功能
6. 开发信息库数据持久化层与数据库交互
7. 实现个人信息库列表分页加载

**目标：**
- 完成个人信息库的增删改查功能
- 信息库列表能够正确显示和排序
- 表单验证功能正常工作
- 批量操作功能可用
- 搜索和过滤功能正常工作

**额外目标：**
- 鼠标移入、点击元素比如模块、按钮，图标、链接等时，要设计动画效果，提升用户体验。
- 所有可以点击的地方都要设计并生成一个清晰可辨的图标，增强交互性。
- 仔细检查前后端接口能否正确对应，确保数据传输和交互的准确性。
- 确保本阶段完成后，程序能够正常运行且不出现明显的错误或异常。

**技术要点与依赖兼容性：**
- 使用 React 函数式组件和 Hooks 实现表单，确保与 TypeScript 类型系统完全集成
- 使用 @chakra-ui/react 2.8.2 的表单组件，确保表单验证完整
- 实现分页加载机制，避免一次性加载过多数据，确保界面响应流畅
- 搜索和过滤功能应实现防抖处理，避免频繁数据库查询
- 确保主进程中的数据访问层与渲染进程的 UI 组件之间有明确的 IPC 通信边界
- 实现内存数据缓存策略，减少重复查询，提高响应速度
- 使用 framer-motion 为列表项添加进出场动画，增强用户体验
- 列表页面每页显示条目数应根据 `ui-config.json` 中的 listPageSize 设置（默认20条）
- 删除操作需根据 `ui-config.json` 中的 confirmDeletion 设置决定是否需要二次确认



### 阶段五：语录与经历管理功能实现

**开发任务：**
1. 设计并实现语录记录界面

2. 开发经历记录界面，参考语录界面设计
   - 左侧用户列表：固定宽度220px，显示可选择的用户档案，并提供与语录模块一致的用户搜索功能
   - 右侧内容区：展示选中用户的经历记录列表
   - 卡片布局：标题、日期范围、类型标签和操作按钮
   - 时间线视图：可选择时间线方式查看经历记录
   - 列表排序：默认按时间倒序排列，可切换排序方式
   - 详情查看：支持富文本格式的详细内容查看
   - 添加编辑：表单包含标题、日期范围、类型、详细内容等字段
   - 动画效果：列表项和模态框使用平滑过渡动画
   - 分类筛选：支持按经历类型筛选显示

3. 实现语录的增删改查功能
4. 实现经历的增删改查功能
5. 开发语录和经历的时间轴展示
6. 实现语录和经历的搜索和过滤
7. 集成富文本编辑器（用于详细记录）

**目标：**
- 完成语录和经历的数据管理功能
- 时间轴展示功能正常工作
- 搜索和过滤功能可用
- 富文本编辑和展示正常
- 数据与个人信息库正确关联

**额外目标：**
- 鼠标移入、点击元素比如模块、按钮，图标、链接等时，要设计动画效果，提升用户体验。
- 所有可以点击的地方都要设计并生成一个清晰可辨的图标，增强交互性。
- 仔细检查前后端接口能否正确对应，确保数据传输和交互的准确性。
- 确保本阶段完成后，程序能够正常运行且不出现明显的错误或异常。

**技术要点与依赖兼容性：**
- 使用 Marked 11.2.0 处理富文本的 Markdown 格式
- 时间轴组件应基于 framer-motion 实现流畅的滚动和展开效果
- 富文本编辑器需确保与 React 18 兼容，避免使用过时的编辑器库
- 搜索功能应实现全文搜索能力，优化数据库查询性能
- 数据关联查询使用高效的数据库索引，避免大量嵌套查询导致性能问题
- 确保富文本内容存储遵循数据清洗原则，存储前进行安全过滤
- 利用 React 18 的 Suspense 特性实现数据加载状态管理
- Markdown 渲染功能应根据 `analysis-config.json` 中的 markdownRenderEnabled 设置控制

### 阶段五补充：档案驱动的生活语录管理方案  
:bookmark_tabs: :busts_in_silhouette: :memo:


- 语录管理模块必须严格依托个人档案系统驱动。
- 左侧用户列表仅展示"档案管理"中真实创建的档案用户，禁止mock用户。
- 选中用户后，右侧仅展示和管理该档案下的生活语录（profileId强关联）。
- 所有语录操作（增删改）
都必须与真实档案关联，并通过IPC/API与数据库同步，禁止无主语录。
- 删除档案时，其所有语录也一并删除（数据库外键约束）。
- 用户列表和语录列表必须实时反映数据库真实状态，mock数据全部移除。


### 阶段六：可视化组件与六边形模型实现

**开发任务：**
1. 开发六边形模型界面，采用左右分栏布局设计
   - **左侧用户列表区域**：
     - 固定宽度220px，显示可选择的用户档案列表
     - 顶部配置带搜索图标的搜索框，支持实时档案搜索过滤
     - 用户卡片展示姓名、头像、简要信息，点击选中状态明显
     - 列表支持滚动加载，按姓名字母顺序或最近查看时间排序
     - 选中状态使用绿色边框或背景高亮指示
     - 列表底部显示用户总数统计信息
     - 列表为空状态显示提示信息和创建档案按钮
     - 鼠标悬停时展示档案简要数据统计（语录数量、分析状态等）
   
   - **右侧内容区域**：
     - 顶部显示选中用户的基本信息和模型生成时间
     - 中央区域展示六边形雷达图，大小根据配置自适应
     - 图表下方展示维度详细解释和数据来源说明
     - 右上角提供图表交互控件（缩放、导出、刷新、打印）
     - 底部区域提供标签页切换不同视图（图表视图、数据视图、历史对比）
     - 支持分析结果与语录/经历证据的关联展示
     - 未选择用户时展示引导提示和示例图表
     - 数据加载中状态显示精美的加载动画

2. 使用 recharts 设计并实现六边形人性模型雷达图
3. 开发图表数据转换和处理功能
4. 实现六边形模型各维度评分的显示与交互
5. 开发模型分析结果文字展示组件
6. 实现图表动画和交互效果
7. 开发图表配色方案和样式
8. 实现图表组件的响应式适配
9. 开发六边形模型六个维度的评估标准和解释系统
10. 实现图表导出和分享功能
11. 开发历史分析结果对比功能
12. 集成模型刷新和更新机制

**目标：**
- 完成六边形人性模型可视化组件和完整界面
- 支持档案选择和搜索功能
- 实现图表的动态数据更新和展示
- 图表填充区域根据强度渐变或分段上色
- 图表交互效果完善（悬停、点击、动画）
- 组件样式符合整体设计规范
- 支持不同屏幕尺寸适配
- 完成六边形模型的评估标准系统
- 实现图表截图和导出功能
- 历史分析结果可对比查看

**额外目标：**
- 鼠标移入、点击元素比如模块、按钮，图标、链接等时，要设计动画效果，提升用户体验。
- 所有可以点击的地方都要设计并生成一个清晰可辨的图标，增强交互性。
- 档案选择区域与经历/语录模块保持一致的操作体验。
- 视觉上强调六边形模型的直观理解，使用颜色、注释和图例辅助说明。
- 仔细检查前后端接口能否正确对应，确保数据传输和交互的准确性。
- 确保本阶段完成后，程序能够正常运行且不出现明显的错误或异常。

**技术要点与依赖兼容性：**
- 使用 recharts 2.5.0 构建雷达图，确保版本兼容性和类型定义完整
- 实现图表与 framer-motion 7.10.3 的集成，确保两者协同工作时不出现性能问题
- 控制图表重渲染频率，优化性能
- 图表配色方案应与应用主题系统集成，支持深色/浅色模式
- 实现图表数据的缓存策略，避免频繁数据转换
- 使用 React.memo 和 useCallback 优化图表组件性能
- 确保图表组件在不同分辨率下保持良好的可读性和交互性
- 实现图表数据的导出功能，支持PNG、JPEG、SVG等常见图片格式
- 六边形模型颜色应根据 `analysis-config.json` 中的 hexagonModelColors 配置
- 图表大小应根据 `ui-config.json` 中的 hexagonChartSize 设置（默认350px）
- 用户列表与语录/经历模块保持相同的数据获取和更新逻辑
- 实现图表导出功能使用 html2canvas 或 dom-to-image 库
- 确保左侧用户列表组件复用性，与语录/经历模块共享相同的组件基础

**六边形人性模型实现细节：**

1. **六个维度的定义与实现**
   - **安全感驱动(Security)**: 展示对确定性、稳定和保障的追求程度
   - **成就感驱动(Achievement)**: 展示对成功、地位和影响力的追求程度
   - **自由感驱动(Freedom)**: 展示对自主性和掌控自己人生的追求程度
   - **归属感驱动(Belonging)**: 展示对关系、认同和团体归属的追求程度
   - **新奇感驱动(Novelty)**: 展示对探索、体验和新鲜感的追求程度
   - **掌控感驱动(Control)**: 展示对掌控、主导和影响局势的追求程度

2. **评估标准实现**
   - 根据 `analysis-config.json` 中的 hexagonModelLevels 设置（默认为3）实现评分等级
   - 支持三级评分系统：低倾向(-1)、中性(0)、高倾向(+1)
   - 可选支持五级评分系统：极低(-2)、偏低(-1)、中性(0)、偏高(+1)、极高(+2)
   - 为每个维度添加详细的评估指标和线索提取规则

3. **交互功能实现**
   - 鼠标悬停在六边形各角时，显示该维度的详细信息和分析理由
   - 点击各维度可展开该维度的详细分析结果
   - 支持切换显示不同的评估来源（语录证据、经历证据、个人信息推断）
   - 实现维度权重自定义功能，允许用户调整各维度的权重
   - 图表支持动态放大、缩小和重置视图
   - 点击维度标签可单独高亮该维度数据
   - 支持图表旋转，便于从不同角度查看模型

4. **数据模型设计**
   - 为六边形模型设计合理的数据结构，确保与后端分析结果兼容
   - 实现基于JSON的标准化输出格式，便于存储和传输
   - 支持评估结果的版本控制，允许比较不同时间点的评估变化
   - 评分数据与证据材料关联，支持溯源查看
   - 设计合理的数据缓存策略，减少频繁查询

5. **视觉呈现优化**
   - 为不同评分等级设计不同的视觉反馈（颜色深浅、区域填充样式）
   - 实现从数据到可视化的平滑过渡动画
   - 支持图表的缩放、旋转和重置功能
   - 为待验证的评估结果添加视觉提示（如虚线或特殊标记）
   - 支持对比视图，可同时展示多个时间点的分析结果
   - 图表标签使用清晰易读的排版和间距
   - 为无数据状态设计引导式的空状态界面
   - 支持导出分析结果为图片或PDF报告

**用户列表与档案互动设计：**
- 用户列表项使用统一的卡片设计，突出显示姓名和基本信息
- 列表支持按字母顺序、最近查看时间或分析状态排序
- 搜索功能支持姓名、标签和备注的模糊匹配
- 选中状态使用绿色边框或背景色明确指示
- 列表项悬停效果展示更多信息，如分析完成度或更新时间
- 未选择用户时，右侧内容区展示引导信息和示例图表
- 列表为空状态应提供创建新档案的引导按钮
- 确保列表滚动性能流畅，实现虚拟列表优化
- 支持键盘导航和快捷键选择用户

**视觉设计规范：**
- 图表主色调使用品牌绿色 (#22c55e) 及其变体
- 图表悬停状态添加适当的放大或高亮效果
- 维度标签使用14px字体，清晰易读
- 图表说明文字使用16px中等粗细字体
- 确保图表在深色模式下同样美观可用
- 导出按钮使用 `<i class="fas fa-download"></i>` 图标
- 刷新按钮使用 `<i class="fas fa-sync-alt"></i>` 图标
- 图表缩放按钮使用 `<i class="fas fa-search-plus"></i>` 和 `<i class="fas fa-search-minus"></i>` 图标
- 历史对比按钮使用 `<i class="fas fa-history"></i>` 图标
- 维度详情展开按钮使用 `<i class="fas fa-chevron-down"></i>` 图标
- 图表区域使用轻微阴影和圆角设计，符合整体视觉风格

### 阶段七：LLM 服务集成与配置

**开发任务：**
1. 实现 LLM 服务配置界面
2. 开发 API 密钥管理和加密存储功能
3. 实现 LLM 服务连接测试功能
4. 开发模型和服务管理界面
5. 实现 API 调用基础设施（包括重试、超时等）
6. 开发 Prompt 模板管理系统
7. 实现 Token 计数和预算控制功能
8. 基于LangChain.js实现LLM服务抽象层

**目标：**
- 完成 LLM 服务配置和管理功能
- API 密钥能够安全存储和使用
- 服务连接测试功能可用
- Prompt 模板系统可以正常工作
- API 调用具备错误处理和重试机制
- 实现基于LangChain.js的统一LLM服务接口

**额外目标：**
- 鼠标移入、点击元素比如模块、按钮，图标、链接等时，要设计动画效果，提升用户体验。
- 所有可以点击的地方都要设计并生成一个清晰可辨的图标，增强交互性。
- 仔细检查前后端接口能否正确对应，确保数据传输和交互的准确性。
- 确保本阶段完成后，程序能够正常运行且不出现明显的错误或异常。

**技术要点与依赖兼容性：**
- 使用 Axios 1.6.7 实现 LLM API 调用，确保支持现代 Promise API
- 集成 LangChain.js 0.0.177 作为LLM服务集成框架，实现统一抽象层
- 利用 Node.js crypto 模块实现 API 密钥的安全存储
- 网络请求超时设置为 60 秒（可配置），符合大多数 LLM 服务响应时间
- 实现指数退避重试策略，避免请求失败后立即重试
- 配置并发限制，避免触发服务商的限流机制
- 实现代理支持，允许通过系统代理或自定义代理连接 LLM 服务
- Token 计数功能应基于准确的分词算法，支持多种 LLM 服务的计数差异
- 确保主进程中的 API 调用与渲染进程之间建立合理的状态同步机制
- 按照 `llm-config.json` 中的规范实现服务和模型管理
- API 密钥必须使用 `security-config.json` 中的加密配置进行存储
- 实现 `llm-config.json` 中定义的重试机制，最大重试次数默认为3

**LangChain.js实现细节：**

1. **LLM服务抽象与统一接口**
   - 利用LangChain的模型抽象，支持多种LLM提供商(OpenAI, Anthropic, Gemini等)
   - 实现模型切换策略，允许根据配置或性能需求动态切换服务提供商
   - 创建服务适配层，屏蔽不同LLM服务的API差异
   ```typescript
   // 模型服务抽象示例
   import { ChatOpenAI } from "langchain/chat_models/openai";
   import { ChatAnthropic } from "langchain/chat_models/anthropic";
   import { ChatGoogleGenerativeAI } from "langchain/chat_models/googleai";
   
   export class LLMServiceFactory {
     static createModel(provider: string, config: LLMConfig) {
       switch(provider) {
         case 'openai':
           return new ChatOpenAI({ 
             modelName: config.model, 
             temperature: config.temperature,
             apiKey: config.apiKey,
             maxTokens: config.maxTokens
           });
         case 'anthropic':
           return new ChatAnthropic({
             modelName: config.model,
             temperature: config.temperature,
             apiKey: config.apiKey
           });
         case 'google':
           return new ChatGoogleGenerativeAI({
             modelName: config.model,
             apiKey: config.apiKey
           });
         default:
           throw new Error(`不支持的LLM提供商: ${provider}`);
       }
     }
   }
   ```

2. **Prompt模板管理系统**
   - 利用LangChain的PromptTemplate系统实现模板管理
   - 开发模板编辑器UI，支持变量插入和格式预览
   - 实现模板版本控制和历史记录
   ```typescript
   // Prompt模板管理示例
   import { PromptTemplate } from "langchain/prompts";
   
   export class PromptManager {
     async loadTemplateFromDB(templateId: string): Promise<PromptTemplate> {
       const templateData = await db.getPromptTemplate(templateId);
       return new PromptTemplate({
         template: templateData.content,
         inputVariables: templateData.variables
       });
     }
     
     async renderTemplate(templateId: string, variables: Record<string, any>): Promise<string> {
       const template = await this.loadTemplateFromDB(templateId);
       return template.format(variables);
     }
     
     async saveTemplate(template: {id?: string, name: string, content: string, variables: string[]}): Promise<string> {
       // 验证模板格式
       try {
         new PromptTemplate({
           template: template.content,
           inputVariables: template.variables
         });
         // 保存到数据库
         return await db.savePromptTemplate(template);
       } catch (error) {
         throw new Error(`模板格式无效: ${error.message}`);
       }
     }
   }
   ```

3. **API密钥管理与安全存储**
   - 使用Node.js crypto模块加密API密钥
   - 实现密钥验证机制，确保密钥格式正确
   - 为不同服务提供商定制不同的密钥验证逻辑
   ```typescript
   // API密钥验证示例
   export class APIKeyValidator {
     static async validateOpenAIKey(apiKey: string): Promise<boolean> {
       try {
         const openai = new ChatOpenAI({ apiKey });
         // 发送最小测试请求验证密钥
         await openai.call([{role: "user", content: "测试"}]);
         return true;
       } catch (error) {
         return false;
       }
     }
     
     static async validateAnthropicKey(apiKey: string): Promise<boolean> {
       // Anthropic密钥验证逻辑
       // ...
     }
   }
   ```

4. **Token计数与预算控制**
   - 利用LangChain内置的分词工具实现精确计数
   - 开发预算控制面板，设置用量限制
   - 实现请求前Token估算，防止超出限制
   ```typescript
   // Token计数示例
   import { encodingForModel } from "langchain/utils/tiktoken";
   
   export class TokenCounter {
     static async countTokens(text: string, model: string): Promise<number> {
       const encoding = await encodingForModel(model);
       return encoding.encode(text).length;
     }
     
     static async estimateRequestCost(prompt: string, model: string): Promise<number> {
       const tokens = await this.countTokens(prompt, model);
       // 根据模型不同计算成本估算
       const costPerToken = MODEL_COSTS[model] || 0.002 / 1000;
       return tokens * costPerToken;
     }
   }
   ```

5. **请求重试与错误处理**
   - 实现基于LangChain中间件的自定义重试逻辑
   - 利用指数退避策略处理限流和临时错误
   - 实现详细的错误分类和日志记录
   ```typescript
   // 重试逻辑示例
   import { LLMChain } from "langchain/chains";
   
   export class RetryHandler {
     static async withRetry<T>(
       operation: () => Promise<T>, 
       maxRetries: number = 3, 
       initialDelay: number = 1000
     ): Promise<T> {
       let attempt = 0;
       while (true) {
         try {
           return await operation();
         } catch (error) {
           attempt++;
           if (attempt >= maxRetries || !this.isRetryableError(error)) {
             throw error;
           }
           
           const delay = initialDelay * Math.pow(2, attempt - 1);
           console.log(`尝试 ${attempt}/${maxRetries} 失败，${delay}ms后重试...`);
           await new Promise(resolve => setTimeout(resolve, delay));
         }
       }
     }
     
     static isRetryableError(error: any): boolean {
       // 判断是否是可重试的错误类型
       return error.status === 429 || error.status >= 500 || error.message.includes('timeout');
     }
   }
   ```

### 阶段八：分析功能实现

**开发任务：**
1. 实现分析类型选择界面
2. 开发六边形人性模型分析流程
3. 实现其他分析类型（如何打交道、如何销售、需求分析等）
4. 开发分析结果存储和管理功能
5. 实现分析历史记录展示和查询
6. 开发手动分析模式功能
7. 实现结果格式化和渲染
8. 基于LangChain.js实现分析引擎核心

**目标：**
- 完成所有分析类型的实现
- 分析流程能够顺利执行
- 分析结果能够正确存储和展示
- 历史记录管理功能正常
- 手动模式可以正常使用
- 实现基于LangChain.js的分析链和解析器

**额外目标：**
- 鼠标移入、点击元素比如模块、按钮，图标、链接等时，要设计动画效果，提升用户体验。
- 所有可以点击的地方都要设计并生成一个清晰可辨的图标，增强交互性。
- 仔细检查前后端接口能否正确对应，确保数据传输和交互的准确性。
- 确保本阶段完成后，程序能够正常运行且不出现明显的错误或异常。

**技术要点与依赖兼容性：**
- 使用LangChain.js 0.0.177实现分析流程的链式处理和结构化输出
- 分析功能依赖 LLM 服务、数据库和可视化服务，确保三者正确集成
- 分析过程应在后台线程中执行，避免阻塞 UI 线程
- 结果渲染使用 Marked 11.2.0
- 分析历史记录应实现分页和懒加载，处理大量历史数据
- 实现分析任务的状态管理，包括进行中、已完成、失败等状态
- 手动分析模式应提供良好的提示和引导，优化用户体验
- 确保分析结果能够正确关联到相应的个人信息库、语录和经历数据
- 分析过程应具备中断和恢复能力，避免长时间分析被意外中断后无法恢复
- 根据 `analysis-config.json` 中定义的分析类型和提示模板实现分析功能
- 六边形模型分析需支持 JSON 输出格式（取决于 hexagonModelJSONEnabled 配置）
- 实现自动分析功能，根据 autoAnalysisEnabled 和 autoAnalysisThreshold 配置触发

**LangChain.js分析引擎实现细节：**

1. **六边形人性模型分析链**
   - 利用LangChain的Chain抽象实现完整分析流程
   - 使用结构化输出解析器确保返回标准化JSON格式
   - 实现多轮分析策略，提升结果准确性
   ```typescript
   // 六边形模型分析链实现示例
   import { StructuredOutputParser } from "langchain/output_parsers";
   import { ChatOpenAI } from "langchain/chat_models/openai";
   import { PromptTemplate } from "langchain/prompts";
   import { RunnableSequence } from "langchain/schema/runnable";
   import { z } from "zod";
   
   // 六边形模型输出格式定义
   const hexagonModelSchema = z.object({
     security: z.object({
       score: z.number().min(0).max(10),
       analysis: z.string(),
       evidence: z.array(z.string())
     }),
     achievement: z.object({
       score: z.number().min(0).max(10),
       analysis: z.string(),
       evidence: z.array(z.string())
     }),
     freedom: z.object({
       score: z.number().min(0).max(10),
       analysis: z.string(),
       evidence: z.array(z.string())
     }),
     belonging: z.object({
       score: z.number().min(0).max(10),
       analysis: z.string(),
       evidence: z.array(z.string())
     }),
     novelty: z.object({
       score: z.number().min(0).max(10),
       analysis: z.string(),
       evidence: z.array(z.string())
     }),
     control: z.object({
       score: z.number().min(0).max(10),
       analysis: z.string(),
       evidence: z.array(z.string())
     }),
     overallAnalysis: z.string()
   });
   
   export class HexagonModelAnalyzer {
     async analyze(
       profile: ProfileData, 
       quotes: QuoteData[], 
       experiences: ExperienceData[]
     ) {
       // 1. 创建结构化输出解析器
       const outputParser = StructuredOutputParser.fromZodSchema(hexagonModelSchema);
       
       // 2. 加载分析提示模板
       const promptTemplate = await promptManager.getHexagonModelTemplate();
       
       // 3. 创建LLM实例
       const llm = await llmFactory.createModel('openai', {
         model: 'gpt-4-turbo',
         temperature: 0.2
       });
       
       // 4. 构建分析链
       const chain = RunnableSequence.from([
         {
           profile: (input) => JSON.stringify(input.profile),
           quotes: (input) => JSON.stringify(input.quotes),
           experiences: (input) => JSON.stringify(input.experiences),
           format_instructions: () => outputParser.getFormatInstructions()
         },
         promptTemplate,
         llm,
         outputParser
       ]);
       
       // 5. 执行分析
       try {
         const result = await chain.invoke({
           profile,
           quotes,
           experiences
         });
         
         // 保存分析结果
         await this.saveAnalysisResult(profile.id, result);
         
         return result;
       } catch (error) {
         console.error('六边形模型分析失败:', error);
         throw new Error(`分析失败: ${error.message}`);
       }
     }
     
     async generateCopyablePrompt(
       profile: ProfileData, 
       quotes: QuoteData[], 
       experiences: ExperienceData[]
     ): Promise<string> {
       // 生成可复制的提示文本，供手动分析使用
       const promptTemplate = await promptManager.getHexagonModelTemplate();
       return promptTemplate.format({
         profile: JSON.stringify(profile),
         quotes: JSON.stringify(quotes),
         experiences: JSON.stringify(experiences),
         format_instructions: "请以JSON格式返回分析结果，包含六边形模型的六个维度评分及分析。"
       });
     }
   }
   ```

2. **分析链式处理与优化**
   - 使用LangChain的Sequential Chain处理复杂分析任务
   - 实现多步骤分析，先提取关键点再进行综合评分
   - 利用中间结果缓存优化处理效率
   ```typescript
   // 多步骤分析链示例
   import { LLMChain } from "langchain/chains";
   import { SequentialChain } from "langchain/chains";
   
   export class AdvancedAnalysisChain {
     async createMultiStepAnalysis() {
       // 1. 提取语录关键点的Chain
       const extractChain = new LLMChain({
         llm,
         prompt: promptTemplates.extract,
         outputKey: "extractedPoints"
       });
       
       // 2. 提取经历关键点的Chain
       const experienceChain = new LLMChain({
         llm,
         prompt: promptTemplates.experience,
         outputKey: "experiencePoints"
       });
       
       // 3. 综合分析评分的Chain
       const scoringChain = new LLMChain({
         llm,
         prompt: promptTemplates.scoring,
         outputKey: "modelScores"
       });
       
       // 4. 生成详细分析报告的Chain
       const reportChain = new LLMChain({
         llm,
         prompt: promptTemplates.report,
         outputKey: "finalReport"
       });
       
       // 构建完整的顺序Chain
       const overallChain = new SequentialChain({
         chains: [extractChain, experienceChain, scoringChain, reportChain],
         inputVariables: ["profile", "quotes", "experiences"],
         outputVariables: ["extractedPoints", "experiencePoints", "modelScores", "finalReport"]
       });
       
       return overallChain;
     }
   }
   ```

3. **结构化输出解析与验证**
   - 使用LangChain的输出解析器确保结果格式一致
   - 实现结果验证和纠正机制，提高输出质量
   - 支持输出修复，处理格式不符合预期的情况
   ```typescript
   // 结构化输出解析与修复示例
   import { OutputFixingParser } from "langchain/output_parsers";
   
   export class RobustOutputParser {
     async createParser() {
       // 创建基础解析器
       const baseParser = StructuredOutputParser.fromZodSchema(hexagonModelSchema);
       
       // 创建带自动修复功能的解析器
       const robustParser = OutputFixingParser.fromLLM(
         new ChatOpenAI({ temperature: 0 }), // 低温度模型用于修复
         baseParser
       );
       
       return robustParser;
     }
     
     async safeParseResult(text: string) {
       const parser = await this.createParser();
       try {
         // 尝试解析输出
         return await parser.parse(text);
       } catch (error) {
         console.error("解析输出失败，尝试修复:", error);
         // 记录原始输出以便调试
         await logService.logParsingError(text, error);
         // 返回默认结果或抛出错误
         throw new Error(`无法解析分析结果: ${error.message}`);
       }
     }
   }
   ```

4. **手动分析模式实现**
   - 创建用户友好的提示模板生成器
   - 实现分析结果手动粘贴和解析功能
   - 开发复制提示到剪贴板功能，方便用户操作
   ```typescript
   // 手动分析模式界面服务
   export class ManualAnalysisService {
     // 生成可复制的提示
     async generatePromptText(profileId: string): Promise<string> {
       // 获取数据
       const profile = await profileService.getById(profileId);
       const quotes = await quoteService.getByProfileId(profileId);
       const experiences = await experienceService.getByProfileId(profileId);
       
       // 使用LangChain模板生成
       const analyzer = new HexagonModelAnalyzer();
       return analyzer.generateCopyablePrompt(profile, quotes, experiences);
     }
     
     // 解析用户粘贴的结果
     async parseManualResult(profileId: string, resultText: string): Promise<HexagonModel> {
       const parser = new RobustOutputParser();
       try {
         const parsedResult = await parser.safeParseResult(resultText);
         
         // 存储解析结果
         await analysisRepository.saveAnalysis({
           profileId,
           type: 'hexagon-model',
           data: parsedResult,
           source: 'manual',
           createdAt: new Date()
         });
         
         return parsedResult;
       } catch (error) {
         throw new Error(`无法解析手动分析结果: ${error.message}`);
       }
     }
   }
   ```

5. **分析状态管理与UI反馈**
   - 实现基于React Context的分析状态管理
   - 开发流式响应展示，提供实时反馈
   - 使用LangChain的事件回调系统展示进度
   ```typescript
   // 分析状态管理与进度反馈
   import { CallbackManager } from "langchain/callbacks";
   
   export class AnalysisStateManager {
     // 创建带进度回调的分析链
     createChainWithCallbacks(onProgress: (step: string, progress: number) => void) {
       const callbacks = CallbackManager.fromHandlers({
         handleLLMStart: (llm) => {
           onProgress("正在启动分析...", 0.1);
         },
         handleLLMEnd: () => {
           onProgress("分析计算完成", 0.6);
         },
         handleChainStart: (chain) => {
           onProgress(`正在执行${chain.name}...`, 0.3);
         },
         handleChainEnd: () => {
           onProgress("分析链执行完成", 0.8);
         },
         handleToolStart: (tool) => {
           onProgress(`正在使用${tool.name}...`, 0.4);
         },
         handleToolEnd: () => {
           onProgress("工具使用完成", 0.5);
         },
         handleText: (text) => {
           console.log("生成文本:", text);
         }
       });
       
       // 返回带回调的LLM和Chain对象...
     }
     
     // 实现分析任务监控
     async monitorAnalysisTask(taskId: string): Promise<AnalysisStatus> {
       // 检查任务状态，返回进度信息...
     }
   }
   ```

### 阶段九：数据导出与备份功能实现

**开发任务：**
1. 实现 Markdown 格式导出功能
2. 开发导出配置界面
3. 实现导出模板自定义
4. 开发文件保存对话框和路径选择
5. 实现数据库备份和恢复功能
6. 开发自动备份计划设置
7. 实现备份管理界面

**目标：**
- 完成个人信息库导出功能
- 支持自定义导出内容和格式
- 文件保存交互完善
- 备份和恢复功能可用
- 自动备份可以正常工作

**额外目标：**
- 鼠标移入、点击元素比如模块、按钮，图标、链接等时，要设计动画效果，提升用户体验。
- 所有可以点击的地方都要设计并生成一个清晰可辨的图标，增强交互性。
- 仔细检查前后端接口能否正确对应，确保数据传输和交互的准确性。
- 确保本阶段完成后，程序能够正常运行且不出现明显的错误或异常。

**技术要点与依赖兼容性：**
- 使用 Electron 的 dialog API 实现文件保存对话框，确保跨平台兼容性
- Markdown 导出功能使用 Marked 11.2.0 进行格式处理
- 数据库备份实现事务性操作，确保备份过程的一致性
- 自动备份功能应使用 Node.js 的 child_process 或相关 API，避免阻塞主进程
- 备份文件应实现压缩和可选加密功能，减小备份文件大小并保护数据安全
- 导出模板系统应支持变量替换和条件判断等基本功能
- 确保大型数据集导出时的内存使用优化，避免内存溢出
- 实现备份版本管理，支持回滚到特定版本的功能
- 根据 `export-config.json` 中的配置实现导出功能
- 确保导出文件名遵循 fileNameTemplate 设置，日期格式符合 dateFormat 配置
- 导出文件大小不得超过 maxExportSize 限制（默认10MB）

### 阶段十：优化与完善

**开发任务：**
1. 实现应用设置界面
2. 开发应用更新检查和安装功能
3. 优化应用性能，改进懒加载和缓存
4. 完善错误处理和日志记录
5. 优化 UI 交互体验和动画效果
6. 实现数据迁移工具
7. 安全加固（CSP 配置、代码签名等）
8. 全面优化交互动效和视觉细节

**目标：**
- 完善应用整体功能和体验
- 应用设置功能完备
- 更新机制可用
- 性能优化明显
- 错误处理机制健全
- 安全措施完备
- 视觉和交互体验细节打磨完善

**额外目标：**
- 鼠标移入、点击元素比如模块、按钮，图标、链接等时，要设计动画效果，提升用户体验。
- 所有可以点击的地方都要设计并生成一个清晰可辨的图标，增强交互性。
- 仔细检查前后端接口能否正确对应，确保数据传输和交互的准确性。
- 确保本阶段完成后，程序能够正常运行且不出现明显的错误或异常。

**技术要点与依赖兼容性：**
- 使用 electron-updater 实现应用自动更新功能
- 集成 electron-log 5.0.0 实现跨平台日志记录
- 实施内容安全策略 (CSP)，限制资源加载，提高安全性
- 使用 webpack-bundle-analyzer 4.9.0 分析并优化打包体积
- 实现 React.lazy 和 Suspense 的懒加载策略，减少初始加载时间
- 优化 recharts 和 framer-motion 的性能，避免不必要的重渲染
- 使用 electron-crash-reporter 收集崩溃报告，改进应用稳定性
- 完善错误边界和全局错误处理，提供友好的错误反馈
- 实现应用完整性校验，防止篡改
- 配置 macOS 应用公证和 Windows 代码签名，提升发布安全性
- 根据 `update-config.json` 实现自动更新功能，包括更新检查、下载和安装
- 使用 `security-config.json` 中的 CSP 配置实现内容安全策略
- 支持本地密码保护功能，根据 localPassCodeEnabled 设置启用

**视觉和交互优化要点：**
- **整体一致性**：
  - 统一检查所有交互元素的悬停、点击动画效果
  - 确保所有页面过渡动画流畅且统一
  - 确保所有组件风格符合UI风格说明文档规范

- **交互细节**：
  - 所有可点击元素有明确的悬停状态反馈
  - 导航项切换时有流畅的过渡效果
  - 按钮点击有适当的反馈动画
  - 优化表单反馈动画和验证提示效果

- **状态呈现**：
  - 完善加载状态的视觉呈现（使用统一的Spinner组件）
  - 优化空状态提示，提供明确的操作引导
  - 错误状态有明确的视觉反馈和修复建议

- **视觉元素**：
  - 统一检查图标使用，确保视觉语言一致性
  - 优化深色模式下的所有视觉元素对比度
  - 确保在各种分辨率和窗口尺寸下布局合理
  - 图标大小和颜色保持一致

- **响应式适配**：
  - 测试不同窗口尺寸下的UI表现
  - 确保主内容区域可以根据窗口大小自适应
  - 确保侧边栏在不同窗口尺寸下保持一致的体验

- **无障碍支持**：
  - 根据WCAG 2.1 AA标准检查无障碍功能实现
  - 确保键盘导航功能完整
  - 提供足够的颜色对比度
  - 所有交互元素有明确的焦点状态


## 开发记录与更新

1. **每完成一个开发阶段后，必须及时记录开发日志**：
   - 在 [程序开发日志](./程序开发日志.md) 中详细记录该阶段完成的工作、遇到的问题及解决方案
   - 记录格式应包含日期、阶段号、完成的任务列表、遇到的关键问题和解决方法

2. **更新项目开发进度**：
   - 在 [项目开发进度说明](./项目开发进度说明.md) 中更新当前完成的阶段和整体进度
   - 标明下一阶段的工作重点和计划时间

3. **遵循版本控制规范**：
   - 每个阶段完成后，应创建相应的版本标签
   - 提交信息应明确标注对应的开发阶段和具体任务

---

本文档为 RelaScope Insight 项目开发提供了清晰的阶段划分和任务定义，确保开发过程有序进行。开发团队必须严格遵循这一指导，以保证项目的质量和进度。 
