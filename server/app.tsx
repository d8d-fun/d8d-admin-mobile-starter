/** @jsxImportSource https://esm.d8d.fun/hono@4.7.4/jsx */
import { Hono } from 'hono'
import { Auth } from '@d8d-appcontainer/auth'
import type { User as AuthUser } from '@d8d-appcontainer/auth'
import React from 'hono/jsx'
import type { FC } from 'hono/jsx'
import { cors } from 'hono/cors'
import type { Context as HonoContext } from 'hono'
import { serveStatic } from 'hono/deno'
import { APIClient } from '@d8d-appcontainer/api'
import debug from "debug"
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import type { SystemSettingRecord, GlobalConfig } from '../client/share/types.ts';
import { SystemSettingKey, OssType, MapMode } from '../client/share/types.ts';

import {
  createKnowInfoRoutes,
  createFileCategoryRoutes,
  createFileUploadRoutes,
  createThemeRoutes,
  createSystemSettingsRoutes,
} from "./routes_sys.ts";

import {
  createMapRoutes,
} from "./routes_maps.ts";

import {
  createChartRoutes,
} from "./routes_charts.ts";

import { migrations } from './migrations.ts';
// 导入基础路由
import { createAuthRoutes } from "./routes_auth.ts";
import { createUserRoutes } from "./routes_users.ts";
import { createMessagesRoutes } from "./routes_messages.ts";

dayjs.extend(utc)
// 初始化debug实例
const log = {
  app: debug('app:server'),
  auth: debug('auth:server'),
  api: debug('api:server'),
  debug: debug('debug:server')
}

const GLOBAL_CONFIG: GlobalConfig = {
  OSS_BASE_URL: Deno.env.get('OSS_BASE_URL') || 'https://d8d-appcontainer-user.oss-cn-beijing.aliyuncs.com',
  OSS_TYPE: Deno.env.get('OSS_TYPE') === OssType.MINIO ? OssType.MINIO : OssType.ALIYUN,
  API_BASE_URL: '/api',
  APP_NAME: Deno.env.get('APP_NAME') || '应用Starter',
  ENV: Deno.env.get('ENV') || 'development',
  DEFAULT_THEME: 'light', // 默认主题
  MAP_CONFIG: {
    KEY: Deno.env.get('AMAP_KEY') || '您的地图API密钥',
    VERSION: '2.0',
    PLUGINS: ['AMap.ToolBar', 'AMap.Scale', 'AMap.HawkEye', 'AMap.MapType', 'AMap.Geolocation'],
    MAP_MODE: Deno.env.get('MAP_MODE') === MapMode.OFFLINE ? MapMode.OFFLINE : MapMode.ONLINE,
  },
  CHART_THEME: 'default', // 图表主题
  ENABLE_THEME_CONFIG: false, // 主题配置开关
  THEME: null
};

log.app.enabled = true
log.auth.enabled = true
log.api.enabled = true
log.debug.enabled = true

// 定义自定义上下文类型
export interface Variables {
  auth: Auth
  user?: AuthUser
  apiClient: APIClient
  moduleDir: string
  systemSettings?: SystemSettingRecord
}

// 定义登录历史类型
interface LoginHistory {
  id: number
  user_id: number
  login_time: string
  ip_address?: string
  user_agent?: string
}

// 定义仪表盘数据类型
interface DashboardData {
  lastLogin: string
  loginCount: number
  fileCount: number
  userCount: number
  systemInfo: {
    version: string
    lastUpdate: string
  }
}

interface EsmScriptConfig {
  src: string
  href: string
  denoJson: string
  refresh: boolean
  prodPath?: string
  prodSrc?: string
}

// Auth实例
let authInstance: Auth | null = null

// 初始化Auth实例
const initAuth = async (apiClient: APIClient) => {
  try {
    if (authInstance) {
      return authInstance
    }

    log.auth('正在初始化Auth实例')
    
    authInstance = new Auth(apiClient as any, {
      jwtSecret: Deno.env.get("JWT_SECRET") || 'your-jwt-secret-key',
      initialUsers: [],
      storagePrefix: '',
      userTable: 'users',
      fieldNames: {
        id: 'id',
        username: 'username',
        password: 'password',
        phone: 'phone',
        email: 'email',
        is_disabled: 'is_disabled',
        is_deleted: 'is_deleted'
      },
      tokenExpiry: 24 * 60 * 60,
      refreshTokenExpiry: 7 * 24 * 60 * 60
    })
    
    log.auth('Auth实例初始化完成')
    
    return authInstance
  } catch (error) {
    log.auth('Auth初始化失败:', error)
    throw error
  }
}

// 初始化系统设置
const initSystemSettings = async (apiClient: APIClient) => {
  try {
    const systemSettings = await apiClient.database.table('system_settings')
      .select()
    
    // 将系统设置转换为键值对形式
    const settings = systemSettings.reduce((acc: Record<string, any>, setting: any) => {
      acc[setting.key] = setting.value
      return acc
    }, {}) as SystemSettingRecord
    
    // 更新全局配置
    if (settings[SystemSettingKey.SITE_NAME]) {
      GLOBAL_CONFIG.APP_NAME = String(settings[SystemSettingKey.SITE_NAME])
    }
    
    // 设置其他全局配置项
    if (settings[SystemSettingKey.SITE_FAVICON]) {
      GLOBAL_CONFIG.DEFAULT_THEME = String(settings[SystemSettingKey.SITE_FAVICON])
    }
    
    if (settings[SystemSettingKey.SITE_LOGO]) {
      GLOBAL_CONFIG.MAP_CONFIG.KEY = String(settings[SystemSettingKey.SITE_LOGO])
    }
    
    if (settings[SystemSettingKey.SITE_DESCRIPTION]) {
      GLOBAL_CONFIG.CHART_THEME = String(settings[SystemSettingKey.SITE_DESCRIPTION])
    }

    // 设置主题配置开关
    if (settings[SystemSettingKey.ENABLE_THEME_CONFIG]) {
      GLOBAL_CONFIG.ENABLE_THEME_CONFIG = settings[SystemSettingKey.ENABLE_THEME_CONFIG] === 'true'
    }

    // 查询ID1管理员的主题配置
    const adminTheme = await apiClient.database.table('theme_settings')
      .where('user_id', 1)
      .first()
    
    if (adminTheme) {
      GLOBAL_CONFIG.THEME = adminTheme.settings
    }
    
    return settings
    
  } catch (error) {
    log.app('获取系统设置失败:', error)
    return {} as SystemSettingRecord
  }
}

// 初始化数据库
const initDatabase = async (apiClient: APIClient) => {
  try {
    log.app('正在执行数据库迁移...')
    
    const migrationsResult = await apiClient.database.executeLiveMigrations(migrations)
    // log.app('数据库迁移完成 %O',migrationsResult)
    log.app('数据库迁移完成')
    
  } catch (error) {
    log.app('数据库迁移失败:', error)
  }
}

// 中间件：数据库初始化
const withDatabase = async (c: HonoContext<{ Variables: Variables }>, next: () => Promise<void>) => {
  try {
    const apiClient = c.get('apiClient')
    await initDatabase(apiClient)
    await next()
  } catch (error) {
    log.api('数据库操作失败:', error)
    return c.json({ error: '数据库操作失败' }, 500)
  }
}

// 中间件：验证认证
const withAuth = async (c: HonoContext<{ Variables: Variables }>, next: () => Promise<void>) => {
  try {
    const auth = c.get('auth')
    
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (token) {
      const userData = await auth.verifyToken(token)
      if (userData) {
        c.set('user', userData)
        await next()
        return
      }
    }
    
    return c.json({ error: '未授权' }, 401)
  } catch (error) {
    log.auth('认证失败:', error)
    return c.json({ error: '无效凭证' }, 401)
  }
}

// 导出withAuth类型定义
export type WithAuth = typeof withAuth;

// 定义模块参数接口
interface ModuleParams {
  apiClient: APIClient
  app: Hono<{ Variables: Variables }>
  moduleDir: string
}

export default function({ apiClient, app, moduleDir }: ModuleParams) {
  const honoApp = app
  // 添加CORS中间件
  honoApp.use('/*', cors())
  
  // 创建API路由
  const api = new Hono<{ Variables: Variables }>()

  // 设置环境变量
  api.use('*', async (c, next) => {
    c.set('apiClient', apiClient)
    c.set('moduleDir', moduleDir)
    c.set('auth', await initAuth(apiClient))
    c.set('systemSettings', await initSystemSettings(apiClient))
    await next()
  })

  // 使用数据库中间件
  api.use('/', withDatabase)

  // 查询仪表盘数据
  api.get('/dashboard', withAuth, async (c) => {
    try {
      const user = c.get('user')!
      const apiClient = c.get('apiClient')
      const lastLogin = await apiClient.database.table('login_history')
        .where('user_id', user.id)
        .orderBy('login_time', 'desc')
        .limit(1)
        .first()
      
      // 获取登录总次数
      const loginCount = await apiClient.database.table('login_history')
        .where('user_id', user.id)
        .count()
      
      // 获取系统数据统计
      const fileCount = await apiClient.database.table('file_library')
        .where('is_deleted', 0)
        .count()
        
      const userCount = await apiClient.database.table('users')
        .where('is_deleted', 0)
        .count()
        
      // 返回仪表盘数据
      const dashboardData: DashboardData = {
        lastLogin: lastLogin ? lastLogin.login_time : new Date().toISOString(),
        loginCount: loginCount,
        fileCount: Number(fileCount),
        userCount: Number(userCount),
        systemInfo: {
          version: '1.0.0',
          lastUpdate: new Date().toISOString()
        }
      }
      
      return c.json(dashboardData)
    } catch (error) {
      log.api('获取仪表盘数据失败:', error)
      return c.json({ error: '获取仪表盘数据失败' }, 500)
    }
  })
  // 注册基础路由
  api.route('/auth', createAuthRoutes(withAuth))
  api.route('/users', createUserRoutes(withAuth))
  api.route('/know-info', createKnowInfoRoutes(withAuth))
  api.route('/upload', createFileUploadRoutes(withAuth)) // 添加文件上传路由
  api.route('/file-categories', createFileCategoryRoutes(withAuth)) // 添加文件分类管理路由
  api.route('/theme', createThemeRoutes(withAuth)) // 添加主题设置路由
  api.route('/charts', createChartRoutes(withAuth)) // 添加图表数据路由
  api.route('/map', createMapRoutes(withAuth)) // 添加地图数据路由
  api.route('/settings', createSystemSettingsRoutes(withAuth)) // 添加系统设置路由
  api.route('/messages', createMessagesRoutes(withAuth)) // 添加消息路由

  // 注册API路由
  honoApp.route('/api', api)
 
  // 首页路由 - SSR
  honoApp.get('/', async (c: HonoContext) => {
    const systemName = GLOBAL_CONFIG.APP_NAME
    return c.html(
      <html>
        <head>
          <title>{systemName}</title>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
              {/* 系统介绍区域 */}
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {systemName}
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  全功能应用Starter
                </p>
                <p className="text-base text-gray-500 mb-8">
                  这是一个基于Hono和React的应用Starter，提供了用户认证、文件管理、图表分析、地图集成和主题切换等常用功能。
                </p>
              </div>

              {/* 管理入口按钮 */}
              <div className="space-y-4">
                <a
                  href="/admin"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  进入管理后台
                </a>
                
                {/* 移动端入口按钮 */}
                <a
                  href="/mobile"
                  className="w-full flex justify-center py-3 px-4 border border-blue-600 rounded-md shadow-sm text-lg font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  进入移动端
                </a>
              </div>
            </div>
          </div>
         </body>
      </html>
    )
  })
  
  // 创建一个函数，用于生成包含全局配置的HTML页面
  const createHtmlWithConfig = (scriptConfig: EsmScriptConfig, title = '应用Starter') => {
    return (c: HonoContext) => {
      const isProd = GLOBAL_CONFIG.ENV === 'production';
      
      return c.html(
        <html lang="zh-CN">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>{title}</title>
            
            {isProd ? (
              <script type="module" src={scriptConfig.prodSrc || `/client_dist/${scriptConfig.prodPath}`}></script>
            ) : (
              <script src={scriptConfig.src} href={scriptConfig.href} deno-json={scriptConfig.denoJson} refresh={scriptConfig.refresh}></script>
            )}
            
            {isProd ? (<script src="/tailwindcss@3.4.16/index.js"></script>) : (<script src="https://cdn.tailwindcss.com"></script>)}

            <script dangerouslySetInnerHTML={{ __html: `window.CONFIG = ${JSON.stringify(GLOBAL_CONFIG)};` }} />
            
            {!isProd && (
              <>
                <script src="https://ai-oss.d8d.fun/umd/vconsole.3.15.1.min.js"></script>
                <script dangerouslySetInnerHTML={{ __html: `
                  const urlParams = new URLSearchParams(window.location.search);
                  if (urlParams.has('vconsole')) {
                    var vConsole = new VConsole({
                      theme: urlParams.get('vconsole_theme') || 'light',
                      onReady: function() {
                        console.log('vConsole is ready');
                      }
                    });
                  }
                `}} />
              </>
            )}
          </head>
          <body className="bg-gray-50">
            <div id="root"></div>
          </body>
        </html>
      )
    }
  }

  // 后台管理路由
  honoApp.get('/admin', createHtmlWithConfig({
    src: "https://esm.d8d.fun/xb", 
    href: "/client/admin/web_app.tsx", 
    denoJson: "/client/admin/deno.json", 
    refresh: true, 
    prodPath: "admin/web_app.js"
  }, GLOBAL_CONFIG.APP_NAME))
  
  honoApp.get('/admin/*', createHtmlWithConfig({
    src: "https://esm.d8d.fun/xb", 
    href: "/client/admin/web_app.tsx", 
    denoJson: "/client/admin/deno.json", 
    refresh: true, 
    prodPath: "admin/web_app.js"
  }, GLOBAL_CONFIG.APP_NAME))

  // 移动端路由
  honoApp.get('/mobile', createHtmlWithConfig({
    src: "https://esm.d8d.fun/xb", 
    href: "/client/mobile/mobile_app.tsx", 
    denoJson: "/client/mobile/deno.json", 
    refresh: true, 
    prodPath: "mobile/mobile_app.js"
  }, GLOBAL_CONFIG.APP_NAME))
  
  honoApp.get('/mobile/*', createHtmlWithConfig({
    src: "https://esm.d8d.fun/xb", 
    href: "/client/mobile/mobile_app.tsx", 
    denoJson: "/client/mobile/deno.json", 
    refresh: true, 
    prodPath: "mobile/mobile_app.js"
  }, GLOBAL_CONFIG.APP_NAME))

  const staticRoutes = serveStatic({ 
    root: moduleDir,
    onFound: async (path: string, c: HonoContext) => {
      const fileExt = path.split('.').pop()?.toLowerCase()
      if (fileExt === 'tsx' || fileExt === 'ts') {
        c.header('Content-Type', 'text/typescript; charset=utf-8')
      } else if (fileExt === 'js' || fileExt === 'mjs') {
        c.header('Content-Type', 'application/javascript; charset=utf-8')
      } else if (fileExt === 'json') {
        c.header('Content-Type', 'application/json; charset=utf-8')
      } else if (fileExt === 'html') {
        c.header('Content-Type', 'text/html; charset=utf-8')
      } else if (fileExt === 'css') {
        c.header('Content-Type', 'text/css; charset=utf-8')
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '')) {
        c.header('Content-Type', `image/${fileExt}`)
      }
      const fileInfo = await Deno.stat(path)
      c.header('Last-Modified', fileInfo.mtime?.toUTCString() ?? new Date().toUTCString())
    },
  })
  
  // 静态资源路由
  honoApp.get('/client/*', staticRoutes)
  honoApp.get('/amap/*', staticRoutes)
  honoApp.get('/tailwindcss@3.4.16/*', staticRoutes)
  honoApp.get('/client_dist/*', staticRoutes)
  
  return honoApp
}
