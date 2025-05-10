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

**LLM服务配置界面设计：**

LLM服务配置界面是应用程序与大语言模型服务集成的核心控制中心，应提供全面而灵活的配置选项，包括以下关键部分：

1. **服务提供商管理**
   - 支持多种LLM服务提供商的配置，包括但不限于：
     - OpenAI (GPT-3.5、o1-mini、o1-preview、gpt-4.5-preview、gpt-4o、gpt-4o-mini)
     - Anthropic Claude (claude-3-7-sonnet-20250219、claude-3-5-sonnet-20241022、)
     - Google Gemini (gemini-2.0-flash、gemini-1.5-pro、gemini-1.5-flash-8b、gemini-1.5-flash)
     - 本地模型支持 (Ollama)
     - 开源模型API (MistralAI)
     - deepseek 
     - 月之暗面 (moonshot-v1-auto)
     - OpenRouter（google/gemma-2-9b-it:free、meta-llama/llama-3-8b-instruct:free）
   - 提供服务提供商切换UI，通过标签页或下拉菜单实现
   - 每个提供商显示状态指示灯和版本信息
   - 支持添加自定义服务端点URL (如OpenAI兼容API)

2. **API密钥管理**
   - 安全的API密钥输入字段，带有显示/隐藏切换
   - 密钥验证状态指示器（有效/无效/未验证）
   - 密钥有效期显示和过期提醒
   - 密钥存储选项配置（本地加密存储/会话存储）
   - 密钥轮换政策设置
   - 紧急密钥清除选项

3. **模型选择和参数配置**
   - 按服务提供商分组的模型下拉选择框
   - 每个模型的详细信息面板：
     - 模型能力说明
     - 上下文窗口大小
     - 价格信息（输入/输出token单价）
     - 适用场景推荐
   - 模型参数调优界面：
     - Temperature滑块控制 (0.0-2.0)
     - Top-P滑块控制 (0.0-1.0)
     - 最大输出token数配置
     - 停止序列设置
     - 惩罚因子(Frequency/Presence Penalty)配置

4. **系统提示词管理**
   - 系统提示词编辑器，支持富文本编辑
   - 提示词模板库，提供常用模板选择
   - 变量插入功能，支持动态内容
   - 提示词效果预览
   - 提示词版本历史管理
   - 提示词分类和标签系统

5. **调用配置与性能设置**
   - 请求超时设置 (默认60秒)
   - 重试策略配置：
     - 最大重试次数 (默认3次)
     - 重试间隔设置 (指数退避)
     - 需重试的错误类型选择
   - 并发控制：
     - 最大并发请求数
     - 队列处理策略
   - 流式响应设置：
     - 启用/禁用流式响应
     - 流式响应缓冲大小
     - 刷新频率配置

6. **预算控制与使用统计**
   - 每日/每月Token使用限额设置
   - 成本上限警告配置
   - 使用量统计图表：
     - 按时间段统计
     - 按模型类型统计
     - 按功能分类统计
   - 导出使用报告功能
   - 预算耗尽行为设置（警告/停用/降级模型）

7. **代理与连接设置**
   - 代理服务器配置：
     - HTTP/SOCKS代理支持
     - 代理服务器地址和端口
     - 代理认证设置
   - 连接设置：
     - 自定义API基础URL
     - 连接超时配置
     - 自定义HTTP头部设置
     - SSL验证选项

8. **调试与日志设置**
   - 日志级别设置 (INFO/DEBUG/ERROR)
   - API请求/响应日志记录配置
   - 错误监控和报告设置
   - 诊断工具：
     - 连接测试功能
     - 延迟测试
     - Token计数工具

9. **备份与恢复**
   - 配置导出功能
   - 配置导入与恢复
   - 配置文件加密选项
   - 配置版本控制

10. **LangChain.js集成配置**
    - 链和代理类型选择
    - 记忆类型配置（文档内/会话内）
    - 工具集成设置
    - 向量存储选项配置
    - 文档加载器设置

**UI设计要点：**
- 组织结构清晰，使用标签页或手风琴面板分类展示配置组
- 关键配置项应提供上下文帮助信息，以问号图标显示
- 提供配置向导，引导新用户完成必要设置
- 保存/应用按钮始终可见，配置更改时高亮提示
- 高级设置应默认折叠，避免界面过于复杂
- 每个配置组添加重置为默认值的选项
- 搜索功能帮助快速定位特定配置项

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
