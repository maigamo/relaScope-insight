# RelaScope Insight IPC通道命名规范

![版本](https://img.shields.io/badge/版本-1.0-blue)
![状态](https://img.shields.io/badge/状态-正式-green)

## 1. 概述

本文档定义了RelaScope Insight项目中所有IPC（进程间通信）通道的命名规范。遵循这些规范可以确保代码一致性，减少通信错误，并提高整体代码质量。

## 2. 命名结构

### 2.1 通道名称格式

所有IPC通道名称采用三段式结构：

```
域名:实体:操作
```

- **域名**：表示功能域或模块，例如`db`、`app`、`config`
- **实体**：表示操作的对象，例如`profile`、`quote`、`experience`
- **操作**：表示具体的操作行为，例如`getAll`、`create`、`update`

### 2.2 命名风格

- 所有部分均使用**camelCase**（驼峰命名法）
- 禁止使用kebab-case（中划线命名）风格，如`get-all`
- 禁止使用snake_case（下划线命名）风格，如`get_all`

### 2.3 标准操作命名

为确保一致性，以下是标准操作命名：

| 操作 | 描述 |
| ---- | ---- |
| `getAll` | 获取所有记录 |
| `getById` | 根据ID获取单条记录 |
| `getByProfile` | 根据profile获取相关记录 |
| `create` | 创建新记录 |
| `update` | 更新记录 |
| `delete` | 删除记录 |
| `search` | 搜索记录 |
| `getRecent` | 获取最近记录 |
| `getTimeline` | 获取时间线 |
| `findByTag` | 根据标签查找 |

## 3. 标准域和实体

### 3.1 标准域

| 域名 | 描述 |
| ---- | ---- |
| `db` | 数据库相关操作 |
| `app` | 应用程序控制 |
| `config` | 配置管理 |
| `analysis` | 分析功能 |

### 3.2 标准实体

| 实体 | 描述 |
| ---- | ---- |
| `profile` | 个人档案 |
| `quote` | 语录 |
| `experience` | 经历 |
| `hexagon` | 六边形模型 |
| `analysis` | 分析 |
| `backup` | 备份 |

## 4. 常量定义与使用

### 4.1 常量文件路径

所有IPC通道常量统一定义在：

```
src/common/constants/ipcChannels.ts
```

### 4.2 常量结构

常量采用嵌套对象结构：

```typescript
export const IPC_CHANNELS = {
  DB: {
    PROFILE: {
      GET_ALL: 'db:profile:getAll',
      // ...
    },
    // ...
  },
  // ...
};
```

### 4.3 导入与使用

在代码中使用IPC通道时，应导入常量而非硬编码字符串：

```typescript
// 正确方式
import { IPC_CHANNELS } from '../../../common/constants/ipcChannels';
ipcMain.handle(IPC_CHANNELS.DB.PROFILE.GET_ALL, async () => { /* ... */ });

// 错误方式
ipcMain.handle('db:profile:getAll', async () => { /* ... */ });
```

## 5. 服务层封装

### 5.1 服务文件组织

IPC调用应通过服务层封装，文件位于：

```
src/renderer/services/ipc/*.service.ts
```

### 5.2 服务调用示例

```typescript
// 定义服务
export const ProfileService = {
  async getAllProfiles(): Promise<Profile[]> {
    try {
      const response = await ipcService.invoke<IPCResponse<Profile[]>>(
        IPC_CHANNELS.DB.PROFILE.GET_ALL
      );
      return response.success && response.data ? response.data : [];
    } catch (error) {
      console.error('获取所有档案失败:', error);
      return [];
    }
  }
  // ...
};

// 组件中使用
const profiles = await ProfileService.getAllProfiles();
```

## 6. 响应格式

所有IPC响应应遵循统一的响应格式：

```typescript
interface IPCResponse<T = any> {
  success: boolean;  // 操作是否成功
  data?: T;          // 成功时返回的数据
  error?: string;    // 失败时的错误信息
}
```

## 7. 参数传递

通道参数应使用对象结构传递，即使只有一个参数：

```typescript
// 正确方式
ipcService.invoke(IPC_CHANNELS.DB.PROFILE.GET_BY_ID, { id: 1 });

// 错误方式
ipcService.invoke(IPC_CHANNELS.DB.PROFILE.GET_BY_ID, 1);
```

## 8. 注册处理器

在主进程中注册IPC处理器时，应使用与渲染进程相同的通道常量：

```typescript
// 主进程
import { IPC_CHANNELS } from '../common/constants/ipcChannels';

ipcMain.handle(IPC_CHANNELS.DB.PROFILE.GET_ALL, async () => {
  try {
    const profiles = await profileDAO.findAll();
    return { success: true, data: profiles } as IPCResponse<Profile[]>;
  } catch (error: any) {
    return { 
      success: false, 
      error: `获取档案列表失败: ${error.message}` 
    } as IPCResponse;
  }
});
```

## 9. 错误处理

### 9.1 主进程错误处理

```typescript
try {
  // 操作
  return { success: true, data: result };
} catch (error: any) {
  console.error(`操作失败: ${error.message}`);
  return { success: false, error: `操作失败: ${error.message}` };
}
```

### 9.2 渲染进程错误处理

```typescript
try {
  const response = await ipcService.invoke(CHANNEL);
  if (response && response.success) {
    // 处理成功
  } else {
    // 处理失败
    console.error(response?.error || '未知错误');
  }
} catch (error) {
  // 通信错误
  console.error('通信错误:', error);
}
```

## 10. 过渡与兼容

为平滑迁移旧代码，可以先保留旧命名并重定向：

```typescript
// 在channels.ts中创建兼容映射
export const PROFILE_CHANNELS = {
  GET_ALL: 'profile:getAll',  // 新格式
  // ...
};

// 在主进程中同时注册新旧通道
ipcMain.handle(IPC_CHANNELS.DB.PROFILE.GET_ALL, handler);
ipcMain.handle(PROFILE_CHANNELS.GET_ALL, handler); // 兼容
```

## 11. 总结

遵循本文档定义的IPC通道命名规范，可以显著提高代码质量和可维护性，减少通信错误，并使开发过程更加高效。所有团队成员在开发过程中都应严格遵守这些规范，并在代码审查中进行检查。 