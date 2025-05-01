# 管理端与移动端启动模板 (Admin-Mobile Starter)

## 项目概述

这是一个基于 Deno 和 Hono 框架开发的管理系统与移动端应用启动模板，提供了完整的用户认证、权限管理、系统设置、文件上传、地图组件、图表组件等功能，可以快速构建企业级应用。

## 技术栈

- **后端框架**：Deno + Hono
- **前端框架**：React 19 + Ant Design 5
- **状态管理**：TanStack Query
- **认证系统**：@d8d-appcontainer/auth
- **API客户端**：@d8d-appcontainer/api
- **地图组件**：高德地图（支持在线/离线模式）
- **图表组件**：Ant Design Charts
- **日期处理**：Day.js
- **网络请求**：Axios

## 功能模块

- **用户认证与管理** - 登录、注册、用户信息管理
- **系统设置** - 站点信息、主题配置、全局参数设置
- **文件管理** - 文件上传、分类管理
- **地图组件** - 在线/离线地图、位置标记、地图交互
- **图表组件** - 数据可视化图表
- **移动端适配** - 响应式设计，支持移动端访问

## 目录结构

- `asset/` - 前端资源文件
  - `admin/` - 管理端资源
  - `mobile/` - 移动端资源
  - `share/` - 共享资源和类型定义
- `routes_*.ts` - 各模块路由定义文件
- `app.tsx` - 应用主入口
- `migrations.ts` - 数据库迁移
- `deno.json` - Deno配置文件

## 在D8D(多八多)平台运行

本应用在 [D8D(多八多)开发者平台](https://www.d8d.fun) 上可以直接运行，无需复杂部署：

1. 访问 [www.d8d.fun](https://www.d8d.fun) 网站并注册账号
2. 登录后进入开发者控制台
3. 点击"创建应用"按钮创建新应用
4. 选择"管理端与移动端启动模板"作为应用模板
5. 配置应用基本信息（名称、描述等）
6. 完成创建后，直接点击"预览"按钮即可运行应用，无需额外部署步骤
7. 系统会自动初始化并启动应用，可直接在浏览器中访问和使用

### D8D(多八多)平台专属配置

在D8D(多八多)平台运行时，可以通过平台的"应用配置"面板设置以下内容：

- 应用资源限制（CPU、内存等）
- 公网访问设置
- 域名绑定
- 自动备份
- 日志记录级别

## 本地开发指南

### 环境要求

- Deno 2.2.8 或更高版本
- 数据库（由 @d8d-appcontainer/api 支持的数据库）

### 环境变量配置

在启动应用前，可配置以下环境变量：

```
# 应用配置
APP_NAME=应用名称
ENV=development
JWT_SECRET=your-jwt-secret-key

# OSS配置
OSS_TYPE=aliyun  # 可选值: aliyun, minio
OSS_BASE_URL=https://your-oss-url.com

# 地图配置
MAP_MODE=online  # 可选值: online, offline
AMAP_KEY=您的地图API密钥

# API客户端配置
SERVER_URL=https://app-server.d8d.fun
WORKSPACE_KEY=您的工作空间密钥  # 在多八多(www.d8d.fun)平台注册开通工作空间后获取
```

### 本地启动应用

要在本地运行此应用，需要创建一个启动文件：

1. 创建一个名为`run_app.ts`的新文件（文件名可自定义）
2. 将下面的代码复制到该文件中：

```typescript
// 导入所需模块
import { Hono } from 'hono'
import { APIClient } from '@d8d-appcontainer/api'
import debug from "debug"
import { cors } from 'hono/cors'

// 初始化debug实例
const log = {
  app: debug('app:server'),
  auth: debug('auth:server'),
  api: debug('api:server'),
  debug: debug('debug:server')
}

// 启用所有日志
Object.values(log).forEach(logger => logger.enabled = true)

// 初始化 API Client
const getApiClient = async (workspaceKey: string, serverUrl?: string) => {
  try {
    log.api('正在初始化API Client实例')
    
    const apiClient = await APIClient.getInstance({
      scope: 'user',
      config: {
        serverUrl: serverUrl || Deno.env.get('SERVER_URL') || 'https://app-server.d8d.fun',
        workspaceKey: workspaceKey,
        type: 'http',
      }
    })
    
    log.api('API Client初始化成功')
    return apiClient
  } catch (error) {
    log.api('API Client初始化失败:', error)
    throw error
  }
}

// 创建Hono应用实例
const app = new Hono()

// 注册CORS中间件
app.use('/*', cors())

// 动态加载并运行模板
const runTemplate = async () => {
  try {
    // 创建基础app实例
    const moduleApp = new Hono()
    
    // 初始化API Client
    // 注意：WORKSPACE_KEY 需要在 多八多(www.d8d.fun) 平台注册并开通工作空间后获取
    const workspaceKey = Deno.env.get('WORKSPACE_KEY') || ''
    if (!workspaceKey) {
      console.warn('未设置WORKSPACE_KEY，请前往 多八多(www.d8d.fun) 注册并开通工作空间以获取密钥')
    }
    const apiClient = await getApiClient(workspaceKey)
    
    // 导入模板主模块
    const templateModule = await import('./app.tsx')
    
    if (templateModule.default) {
      // 传入必要参数并初始化应用
      const appInstance = templateModule.default({
        apiClient: apiClient,
        app: moduleApp,
        moduleDir: './admin-mobile-starter'
      })
      
      // 启动服务器
      Deno.serve({ port: 8080 }, appInstance.fetch)
      console.log('应用已启动，监听端口: 8080')
    }
  } catch (error) {
    console.error('模板加载失败:', error)
  }
}

// 执行模板
runTemplate()
```

3. 运行该文件：

```bash
deno run -A run_app.ts
```

> **注意**：上述代码用于本地运行app.tsx。SERVER_URL默认值为`app-server.d8d.fun`，WORKSPACE_KEY需要在 [多八多(www.d8d.fun)](https://www.d8d.fun) 平台注册并开通工作空间后获取。

## 系统配置说明

系统配置可通过环境变量或数据库中的系统设置进行管理，支持以下配置项：

- 站点名称、图标、Logo
- 主题设置（明/暗模式）
- 地图模式（在线/离线）
- 图表主题
- API 基础路径
- 文件存储方式

## 数据库迁移

系统首次启动时会自动执行数据库迁移，创建必要的表结构和初始数据。

## 开发者扩展指南

### 添加新路由

在 `routes_*.ts` 文件中定义新的路由处理函数，然后在 `app.tsx` 中引入并注册。

### 前端开发

前端资源位于 `asset/` 目录下，区分为管理端和移动端，可根据需要进行修改和扩展。

## 许可证

[License] - 请参阅LICENSE文件了解详情

---

© 2025 多八多(D8D). 保留所有权利。 