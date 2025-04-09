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

## 目录结构

- `asset/` - 前端资源文件
  - `admin/` - 管理端资源
  - `mobile/` - 移动端资源
  - `share/` - 共享资源和类型定义
- `routes_*.ts` - 各模块路由定义文件
- `app.tsx` - 应用主入口
- `migrations.ts` - 数据库迁移
- `deno.json` - Deno配置文件

## 功能模块

- **用户认证与管理** - 登录、注册、用户信息管理
- **系统设置** - 站点信息、主题配置、全局参数设置
- **文件管理** - 文件上传、分类管理
- **地图组件** - 在线/离线地图、位置标记、地图交互
- **图表组件** - 数据可视化图表
- **移动端适配** - 响应式设计，支持移动端访问

## 快速开始

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
```

### 启动应用

```bash
# 开发模式启动
deno run -A app.tsx

# 或使用配置文件启动
deno run -A --config=deno.json app.tsx
```

## 配置说明

系统配置可通过环境变量或数据库中的系统设置进行管理，支持以下配置项：

- 站点名称、图标、Logo
- 主题设置（明/暗模式）
- 地图模式（在线/离线）
- 图表主题
- API 基础路径
- 文件存储方式

## 数据库迁移

系统首次启动时会自动执行数据库迁移，创建必要的表结构和初始数据。

## 自定义开发

### 添加新路由

在 `routes_*.ts` 文件中定义新的路由处理函数，然后在 `app.tsx` 中引入并注册。

### 前端开发

前端资源位于 `asset/` 目录下，区分为管理端和移动端，可根据需要进行修改和扩展。

## 许可证

[License] - 请参阅LICENSE文件了解详情

---

© 2023 D8D. 保留所有权利。 