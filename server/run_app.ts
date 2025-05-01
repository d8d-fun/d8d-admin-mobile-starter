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
        moduleDir: './'
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