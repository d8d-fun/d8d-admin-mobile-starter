import { Hono } from 'hono'
import type { Variables } from './app.tsx'
import type { WithAuth } from './app.tsx'

export function createAuthRoutes(withAuth: WithAuth) {
  const authRoutes = new Hono<{ Variables: Variables }>()
  
  // 登录状态检查
  authRoutes.get('/status', async (c) => {
    try {
      const auth = c.get('auth')
      const token = c.req.header('Authorization')?.replace('Bearer ', '')
      
      if (!token) {
        return c.json({ isValid: false }, 200)
      }
      
      const status = await auth.checkLoginStatus(token)
      return c.json(status)
    } catch (error) {
      console.error('登录状态检查失败:', error)
      return c.json({ isValid: false, error: '登录状态检查失败' }, 500)
    }
  })
  
  // 注册
  authRoutes.post('/register', async (c) => {
    try {
      const auth = c.get('auth')
      const { username, email, password } = await c.req.json()
      
      if (!username || !password) {
        return c.json({ error: '用户名和密码不能为空' }, 400)
      }
      
      try {
        await auth.createUser({ username, password, email })
        const result = await auth.authenticate(username, password)
        
        return c.json({
          message: '注册成功',
          user: result.user
        }, 201)
      } catch (authError) {
        return c.json({ error: '用户已存在或注册失败' }, 400)
      }
    } catch (error) {
      console.error('注册失败:', error)
      return c.json({ error: '注册失败' }, 500)
    }
  })
  
  // 登录
  authRoutes.post('/login', async (c) => {
    try {
      const auth = c.get('auth')
      const { username, password } = await c.req.json()
      
      if (!username || !password) {
        return c.json({ error: '用户名和密码不能为空' }, 400)
      }
      
      try {
        const result = await auth.authenticate(username, password)
        
        if (result.user) {
          const apiClient = c.get('apiClient')
          await apiClient.database.insert('login_history', {
            user_id: result.user.id,
            login_time: apiClient.database.fn.now(),
            ip_address: c.req.header('x-forwarded-for') || '未知',
            user_agent: c.req.header('user-agent') || '未知'
          })
        }
        
        return c.json({
          message: '登录成功',
          token: result.token,
          refreshToken: result.refreshToken,
          user: result.user
        })
      } catch (authError) {
        return c.json({ error: '用户名或密码错误' }, 401)
      }
    } catch (error) {
      console.error('登录失败:', error)
      return c.json({ error: '登录失败' }, 500)
    }
  })
  
  // 获取当前用户信息
  authRoutes.get('/me', withAuth, (c) => {
    const user = c.get('user')
    return c.json(user)
  })
  
  // 登出
  authRoutes.post('/logout', async (c) => {
    return c.json({ message: '登出成功' })
  })

  return authRoutes
} 