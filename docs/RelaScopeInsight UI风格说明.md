# RelaScopeInsight UI风格说明

## 1. 整体设计风格

RelaScopeInsight采用现代、简洁的扁平化设计风格，强调清晰的视觉层次和功能分区。UI设计遵循"内容优先"的原则，通过简约的界面元素突出用户核心关注的内容。

## 2. 色彩方案

- **主色调**：白色和浅灰色作为基础背景色
- **强调色**：蓝色作为主要操作按钮的强调色
- **状态指示色**：绿色作为导航项选中状态的指示色
- **暗色模式**：提供深色背景和相应对比度的文本色
- **功能色**：
  - 绿色：表示操作成功或添加语录
  - 蓝色：表示主要操作、档案功能
  - 紫色：表示经历记录功能

## 3. 布局结构

- **左侧导航**：
  - 宽度固定为60px的窄边栏
  - 仅显示图标，悬停时显示提示文本
  - 采用分组展示不同功能模块
  - 当前选中项有绿色竖条高亮指示
  - 系统功能（设置、暗模式）位于底部

- **顶部导航**：
  - 左侧显示当前页面标题
  - 中间是全局搜索框
  - 右侧是主要操作按钮（蓝色"创建"按钮）
  - 最右侧是窗口控制按钮（最小化、最大化、关闭）

- **主内容区**：
  - 占据除侧边栏和顶部导航外的所有空间
  - 背景色为浅灰，内容区为白色
  - 无内容时显示中央提示框

## 4. 导航结构

- **主要功能区**：
  - 首页（HomePage）
  - 档案管理（Profiles）
  - 语录（Quotes）
  - 经历（Experiences）

- **分析功能区**：
  - 分析（Analysis）
  - 六边形模型（Hexagon）
  - 洞察（Insights）
  - 关系网络（Network）

- **系统功能区**：
  - 设置（Settings）
  - 主题切换（Theme）

## 5. 组件风格

- **按钮**：
  - 主要操作：实心蓝色背景，白色文本
  - 次要操作：轮廓线条，配色根据功能区分

- **输入框**：
  - 圆角搜索框
  - 左侧带有搜索图标

- **卡片**：
  - 圆角设计
  - 轻微阴影
  - 白色背景（深色模式下为深灰）

- **提示框**：
  - 居中显示
  - 图标+提示文本+操作按钮组合

## 6. 图标使用

- 采用FontAwesome图标库
- 线条风格，扁平化设计
- 大小保持一致（18px）
- 颜色根据状态变化（选中/未选中）

## 7. 响应式设计

- 主内容区根据窗口大小自适应
- 侧边栏固定宽度，始终显示
- 按钮和卡片采用弹性布局，适应不同屏幕尺寸

## 8. 交互模式

- 侧边栏项目：点击切换页面，悬停时显示提示
- 创建按钮：点击呼出相应创建功能
- 暗模式切换：点击图标即时切换
- 空白状态：提供快速创建选项，引导用户操作

## 9. 最新UI优化说明  
:art: :sparkles: :rocket:

### ENGLISH
- The **top navigation bar** and **sidebar** now use a unified background color: `#F0F0F0` in light mode, and `gray.800` in dark mode. :art:
- All **borders and shadows** between the sidebar and top navigation bar have been removed for a seamless, flat look. :scissors:
- The **language switch button** only displays the 🌐 icon, without any text, for a cleaner appearance. :globe_with_meridians:
- All dividing lines between navigation and content are removed, making the interface more minimalistic. :wastebasket:

### 中文
- 顶部导航栏与侧边栏在亮色模式下统一为 `#F0F0F0` 背景，暗色模式下为 `gray.800`，风格一致。:art:
- 侧边栏与顶部导航栏之间的所有边框和阴影已去除，界面更平滑。:scissors:
- 语言切换按钮仅显示🌐图标，不再显示文字，界面更简洁。:globe_with_meridians:
- 所有分割线已去除，整体风格更极简。:wastebasket:

### 日本語
- トップナビゲーションバーとサイドバーはライトモードで `#F0F0F0`、ダークモードで `gray.800` の背景色で統一されています。:art:
- サイドバーとトップバーの間のすべての境界線と影が削除され、フラットな外観になりました。:scissors:
- 言語切替ボタンは🌐アイコンのみを表示し、テキストは表示しません。:globe_with_meridians:
- すべての区切り線が削除され、よりミニマルなUIになっています。:wastebasket:

此设计风格遵循现代桌面应用的设计趋势，为用户提供清晰、直观的操作体验，同时保持界面的简洁美观。 