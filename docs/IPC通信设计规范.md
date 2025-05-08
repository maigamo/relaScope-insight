# RelaScope Insight IPC通信设计规范

![IPC通信](https://img.shields.io/badge/IPC通信-规范-blue)
![版本](https://img.shields.io/badge/版本-1.0-green)
![状态](https://img.shields.io/badge/状态-正式-orange)

> 本文档定义了RelaScope Insight项目中Electron主进程与渲染进程之间的IPC通信规范，包括通信架构、接口定义、数据格式标准和最佳实践。所有IPC通信相关的开发必须严格遵循本规范。

## 1. 通信架构

RelaScope Insight采用了模块化、分层的IPC通信架构，确保主进程和渲染进程之间的通信安全、可靠和可维护。

### 1.1 架构概览

请参考[IPC通信架构图](../assets/ipc-architecture.md)查看完整架构示意图。

1. **渲染进程层**
   - **IPC服务模块**：提供统一的通信接口，对底层通信细节进行封装
   - **业务服务模块**：基于IPC服务实现特定业务领域的功能
   
2. **预加载脚本层**
   - 通过`contextBridge`提供安全的IPC通信API
   - 实现通道名称常量和通信方法的注入
   
3. **主进程层**
   - **IPC处理器**：接收渲染进程的请求并处理
   - **业务逻辑层**：执行数据库操作、配置管理等核心功能

### 1.2 IPC服务组织结构

```
src/renderer/services/
├── ipc/
│   ├── core.ts             // IPC核心服务和工具函数
│   ├── channels.ts         // 统一的通道常量定义
│   ├── config.service.ts   // 配置相关服务
│   ├── app.service.ts      // 应用窗口相关服务
│   ├── database.service.ts // 数据库基础服务
│   ├── profile.service.ts  // 档案相关服务
│   ├── quote.service.ts    // 语录相关服务
│   ├── experience.service.ts // 经历相关服务
│   ├── analysis.service.ts // 分析相关服务
│   ├── hexagon.service.ts  // 六边形模型相关服务
│   └── index.ts            // 统一导出所有服务
└── ipc.service.ts          // 向后兼容层，保持旧接口可用
```

## 2. 通信规范

### 2.1 IPC通道命名规范

IPC通道名称必须遵循以下命名规范：

1. **格式**：`[模块]:[操作]`或`[模块]:[子模块]:[操作]`
2. **示例**：
   - `config:get` - 获取配置
   - `db:profile:getAll` - 获取所有档案
   - `profile:create` - 创建档案

3. **命名规则**：
   - 使用小写字母和冒号分隔符
   - 模块名应明确表示功能领域（config、app、db等）
   - 操作名应使用动词+名词形式表示行为（get、create、update等）
   - 子模块名应表示具体的数据实体（profile、quote、experience等）

4. **通道常量管理**：
   - 所有通道名称必须在`channels.ts`中集中定义为常量
   - 禁止在代码中使用字符串字面量定义通道名称

### 2.2 统一响应格式

为确保整个应用中IPC通信的一致性和可靠性，**所有IPC处理器必须遵循统一的响应格式**。

1. **标准响应接口**：
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

4. **禁止的返回格式**：
   - ❌ 直接返回数据对象：`return user;`
   - ❌ 直接返回布尔值：`return true;`
   - ❌ 直接返回数组：`return users;`
   - ❌ 使用不一致的响应结构：`return { ok: true, result: data };`

### 2.3 错误处理

所有IPC通信必须实现健壮的错误处理机制：

1. **主进程错误处理**：
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

2. **渲染进程错误处理**：
   ```typescript
   try {
     const response = await ipcService.invoke('channel:name', params);
     
     if (!response.success) {
       throw new Error(response.error || '操作失败');
     }
     
     return response.data;
   } catch (error) {
     console.error('操作失败:', error);
     // 显示错误消息
     showErrorToast(error.message);
     throw error; // 可选：向上传递错误
   }
   ```

## 3. 预加载脚本规范

预加载脚本作为主进程和渲染进程之间的桥梁，必须遵循以下规范：

1. **安全通信**：
   - 使用`contextBridge.exposeInMainWorld`暴露安全的API
   - 禁止直接暴露`ipcRenderer`对象
   - 提供受控的API接口（invoke, send, on, once等）

2. **标准API接口**：
   ```typescript
   contextBridge.exposeInMainWorld('electronAPI', {
     invoke: async <T = any>(channel: string, data?: any): Promise<IPCResponse<T>> => {
       return invokeIPC<T>(channel, data);
     },
     send: (channel: string, data?: any) => {
       ipcRenderer.send(channel, data);
     },
     receive: (channel: string, func: (...args: any[]) => void) => {
       ipcRenderer.on(channel, (event, ...args) => func(...args));
       return () => ipcRenderer.removeListener(channel, func);
     },
     removeListener: (channel: string, listener?: Function) => {
       if (listener) {
         ipcRenderer.removeListener(channel, listener as any);
       }
     },
     removeAllListeners: (channel: string) => {
       ipcRenderer.removeAllListeners(channel);
     }
   });
   ```

3. **通道常量暴露**：
   ```typescript
   contextBridge.exposeInMainWorld('IPC_CONSTANTS', {
     CONFIG_CHANNELS,
     APP_CHANNELS,
     DB_CHANNELS
   });
   ```

## 4. 渲染进程IPC服务规范

渲染进程中的IPC服务必须遵循以下规范：

1. **单例模式**：IPC核心服务必须采用单例模式，确保整个应用中只有一个实例：
   ```typescript
   class IpcService {
     // ...实现细节
   }
   
   // 单例模式
   export const ipcService = new IpcService();
   ```

2. **响应标准化**：所有从主进程返回的响应必须经过标准化处理：
   ```typescript
   private normalizeResponse<T>(response: any): IPCResponse<T> {
     // 如果已经是标准格式
     if (response && typeof response === 'object' && 'success' in response) {
       return response as IPCResponse<T>;
     }
     
     // 处理布尔值
     if (typeof response === 'boolean') {
       return {
         success: response,
         data: null as any
       };
     }
     
     // 处理直接返回的数据对象或数组
     if (response !== null && response !== undefined) {
       return {
         success: true,
         data: response as T
       };
     }
     
     // 处理null或undefined
     return {
       success: false,
       error: '接收到空响应'
     };
   }
   ```

3. **业务服务隔离**：不同业务领域的IPC调用应该在独立的服务模块中实现，例如：
   ```typescript
   // profile.service.ts
   export const ProfileService = {
     async getAllProfiles(): Promise<Profile[]> {
       try {
         return await ipcService.invoke<Profile[]>(PROFILE_CHANNELS.GET_ALL);
       } catch (error) {
         console.error('获取所有档案失败:', error);
         return [];
       }
     },
     
     // 其他方法...
   };
   ```

## 5. 最佳实践

### 5.1 响应格式处理

所有IPC响应处理必须使用以下健壮的判断方法：

```javascript
// 更健壮的成功条件判断（三种响应格式）
const isSuccess = 
  response === true || 
  (typeof response === 'object' && response !== null && 
    (response.success === true || response['success'] === true ||
      // 处理直接返回数据对象的情况（创建/更新）
      (response.id && !response.hasOwnProperty('success'))));

if (isSuccess) {
  // 成功处理...
} else {
  // 错误处理...
}
```

### 5.2 乐观UI更新

对于操作UI状态的操作，应采用乐观更新策略，优化用户体验：

```javascript
// 立即更新UI
setItems(prev => prev.filter(item => item.id !== id));
// 然后调用API
try {
  const result = await ipcService.invoke('profile:delete', id);
  if (!result.success) {
    // 恢复UI状态
    setItems(originalItems);
    throw new Error(result.error);
  }
} catch (error) {
  // 错误处理...
}
```

### 5.3 参数传递

1. **单一参数传递**：当传递单个对象时，直接传递对象；当传递多个参数时，使用数组：
   ```typescript
   // 单个参数
   ipcService.invoke('profile:create', profile);
   
   // 多个参数
   ipcService.invoke('hexagon:compare', [id1, id2]);
   ```

2. **复杂查询参数**：对于复杂查询，使用结构化对象：
   ```typescript
   ipcService.invoke('profile:search', {
     keyword: 'John',
     filters: {
       age: { min: 20, max: 30 },
       location: 'New York'
     },
     sort: { field: 'name', order: 'asc' }
   });
   ```

### 5.4 通道分组

IPC通道应按功能领域分组，便于管理：

```typescript
// 配置相关通道
export const CONFIG_CHANNELS = {
  GET_CONFIG: 'config:get',
  SET_CONFIG: 'config:set',
  GET_ALL_CONFIGS: 'config:getAll'
};

// 档案相关通道
export const PROFILE_CHANNELS = {
  CREATE: 'profile:create',
  UPDATE: 'profile:update',
  GET_ALL: 'profile:get-all',
  // ...其他操作
};
```

### 5.5 性能优化

1. **批量操作**：对于批量操作，使用单个IPC调用而非多次调用：
   ```typescript
   // 好的做法
   ipcService.invoke('profiles:createBatch', profiles);
   
   // 避免的做法
   for (const profile of profiles) {
     ipcService.invoke('profile:create', profile);
   }
   ```

2. **数据分页**：获取大量数据时使用分页：
   ```typescript
   ipcService.invoke('profiles:getAll', { page: 1, limit: 20 });
   ```

## 6. 安全考虑

1. **输入验证**：
   - 主进程中必须对所有来自渲染进程的输入进行验证
   - 使用TypeScript类型系统进行静态类型检查
   - 对关键参数进行运行时类型和范围检查

2. **权限控制**：
   - 限制敏感操作的IPC通道访问
   - 实现权限检查机制，确保只有授权操作才能执行

3. **数据安全**：
   - 敏感数据传输前应进行加密
   - 不在IPC通信中传递明文密码等敏感信息

## 7. 调试与监控

1. **日志记录**：
   ```typescript
   console.log(`IPC请求 [${channel}]:`, args);
   console.log(`IPC响应 [${channel}]:`, response);
   ```

2. **性能监控**：
   ```typescript
   const startTime = performance.now();
   const response = await ipcService.invoke(channel, args);
   const endTime = performance.now();
   console.log(`IPC调用 [${channel}] 耗时: ${endTime - startTime}ms`);
   ```

## 8. 版本控制与兼容性

1. **通道版本控制**：
   - 对于重大更改，使用版本号标识：`profile:v2:create`
   - 保留旧版本通道一段时间以保证兼容性

2. **接口演进**：
   - 添加新参数时使用可选参数，保持向后兼容
   - 在弃用旧接口前提供充分的过渡期

---

本文档定义了RelaScope Insight项目中IPC通信的规范和最佳实践。所有开发人员必须严格遵循这些规范，确保应用的可靠性、安全性和可维护性。对规范的任何更改需经过团队审核和批准。 