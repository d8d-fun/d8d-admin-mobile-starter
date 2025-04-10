import { Hono } from 'hono'
import type { Variables } from './app.tsx'
import type { WithAuth } from './app.tsx'

export function createUserRoutes(withAuth: WithAuth) {
  const usersRoutes = new Hono<{ Variables: Variables }>()
  
  // 获取用户列表
  usersRoutes.get('/', withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient')
      
      const page = Number(c.req.query('page')) || 1
      const pageSize = Number(c.req.query('pageSize')) || 10
      const offset = (page - 1) * pageSize
      
      const search = c.req.query('search') || ''
      
      let query = apiClient.database.table('users')
        .orderBy('id', 'desc')
      
      if (search) {
        query = query.where((builder) => {
          builder.where('username', 'like', `%${search}%`)
              .orWhere('nickname', 'like', `%${search}%`)
              .orWhere('email', 'like', `%${search}%`)
        })
      }
      
      const total = await query.clone().count()
      const users = await query.select('id', 'username', 'nickname', 'email', 'phone', 'created_at')
        .limit(pageSize).offset(offset)
      
      return c.json({
        data: users,
        pagination: {
          total: Number(total),
          current: page,
          pageSize
        }
      })
    } catch (error) {
      console.error('获取用户列表失败:', error)
      return c.json({ error: '获取用户列表失败' }, 500)
    }
  })
  
  // 获取单个用户详情
  usersRoutes.get('/:id', withAuth, async (c) => {
    try {
      const id = Number(c.req.param('id'))
      
      if (!id || isNaN(id)) {
        return c.json({ error: '无效的用户ID' }, 400)
      }
      
      const apiClient = c.get('apiClient')
      const user = await apiClient.database.table('users')
        .where('id', id)
        .select('id', 'username', 'nickname', 'email', 'phone', 'role', 'created_at')
        .first()
      
      if (!user) {
        return c.json({ error: '用户不存在' }, 404)
      }
      
      return c.json({
        data: user,
        message: '获取用户详情成功'
      })
    } catch (error) {
      console.error('获取用户详情失败:', error)
      return c.json({ error: '获取用户详情失败' }, 500)
    }
  })

  // 创建用户
  usersRoutes.post('/', withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient')
      const body = await c.req.json()
      
      // 验证必填字段
      const { username, nickname, email, password, role } = body
      if (!username || !nickname || !email || !password || !role) {
        return c.json({ error: '缺少必要的用户信息' }, 400)
      }

      // 检查用户名是否已存在
      const existingUser = await apiClient.database.table('users')
        .where('username', username)
        .first()
      
      if (existingUser) {
        return c.json({ error: '用户名已存在' }, 400)
      }

      // 创建用户
      const [id] = await apiClient.database.table('users').insert({
        username,
        nickname,
        email,
        password: password, // 加密密码
        role,
        created_at: new Date(),
        updated_at: new Date()
      })

      const newUser = await apiClient.database.table('users')
        .where('id', id)
        .select('id', 'username', 'nickname', 'email', 'role', 'created_at')
        .first()

      return c.json({
        data: newUser,
        message: '创建用户成功'
      })
    } catch (error) {
      console.error('创建用户失败:', error)
      return c.json({ error: '创建用户失败' }, 500)
    }
  })

  // 更新用户
  usersRoutes.put('/:id', withAuth, async (c) => {
    try {
      const id = Number(c.req.param('id'))
      if (!id || isNaN(id)) {
        return c.json({ error: '无效的用户ID' }, 400)
      }

      const apiClient = c.get('apiClient')
      const body = await c.req.json()
      
      // 验证必填字段
      const { username, nickname, email, role } = body
      if (!username || !nickname || !email || !role) {
        return c.json({ error: '缺少必要的用户信息' }, 400)
      }

      // 检查用户是否存在
      const existingUser = await apiClient.database.table('users')
        .where('id', id)
        .first()
      
      if (!existingUser) {
        return c.json({ error: '用户不存在' }, 404)
      }

      // 如果修改了用户名，检查新用户名是否已被使用
      if (username !== existingUser.username) {
        const userWithSameName = await apiClient.database.table('users')
          .where('username', username)
          .whereNot('id', id.toString())
          .first()
        
        if (userWithSameName) {
          return c.json({ error: '用户名已存在' }, 400)
        }
      }

      // 更新用户信息
      const updateData: any = {
        username,
        nickname,
        email,
        role,
        updated_at: new Date()
      }

      // 如果提供了新密码，则更新密码
      if (body.password) {
        updateData.password = body.password
      }

      await apiClient.database.table('users')
        .where('id', id)
        .update(updateData)

      const updatedUser = await apiClient.database.table('users')
        .where('id', id)
        .select('id', 'username', 'nickname', 'email', 'role', 'created_at')
        .first()

      return c.json({
        data: updatedUser,
        message: '更新用户成功'
      })
    } catch (error) {
      console.error('更新用户失败:', error)
      return c.json({ error: '更新用户失败' }, 500)
    }
  })

  // 删除用户
  usersRoutes.delete('/:id', withAuth, async (c) => {
    try {
      const id = Number(c.req.param('id'))
      if (!id || isNaN(id)) {
        return c.json({ error: '无效的用户ID' }, 400)
      }

      const apiClient = c.get('apiClient')
      
      // 检查用户是否存在
      const existingUser = await apiClient.database.table('users')
        .where('id', id)
        .first()
      
      if (!existingUser) {
        return c.json({ error: '用户不存在' }, 404)
      }

      // 检查是否为最后一个管理员
      if (existingUser.role === 'admin') {
        const adminCount = await apiClient.database.table('users')
          .where('role', 'admin')
          .count()
        
        if (Number(adminCount) <= 1) {
          return c.json({ error: '不能删除最后一个管理员' }, 400)
        }
      }

      // 删除用户
      await apiClient.database.table('users')
        .where('id', id)
        .delete()

      return c.json({
        message: '删除用户成功',
        id
      })
    } catch (error) {
      console.error('删除用户失败:', error)
      return c.json({ error: '删除用户失败' }, 500)
    }
  })

  // 获取当前用户信息
  usersRoutes.get('/me/profile', withAuth, async (c) => {
    try {
      const user = c.get('user')!
      
      const apiClient = c.get('apiClient')
      const userData = await apiClient.database.table('users')
        .where('id', user.id)
        .select('id', 'username', 'nickname', 'email', 'phone', 'created_at')
        .first()
      
      if (!user) {
        return c.json({ error: '用户不存在' }, 404)
      }
      
      return c.json({
        data: userData,
        message: '获取用户详情成功'
      })
    } catch (error) {
      console.error('获取当前用户信息失败:', error)
      return c.json({ error: '获取当前用户信息失败' }, 500)
    }
  })

  // 更新当前用户信息
  usersRoutes.put('/me/profile', withAuth, async (c) => {
    try {
      const user = c.get('user')!
      const apiClient = c.get('apiClient')
      const body = await c.req.json()
      
      // 验证必填字段
      const { nickname, email, phone } = body
      if (!nickname || !email) {
        return c.json({ error: '缺少必要的用户信息' }, 400)
      }

      // 更新用户信息
      const updateData: any = {
        nickname,
        email,
        phone: phone || null,
        updated_at: new Date()
      }

      // 如果提供了新密码，则更新密码
      if (body.password) {
        updateData.password = body.password
      }

      await apiClient.database.table('users')
        .where('id', user.id)
        .update(updateData)

      const updatedUser = await apiClient.database.table('users')
        .where('id', user.id)
        .select('id', 'username', 'nickname', 'email', 'phone', 'created_at')
        .first()

      return c.json({
        data: updatedUser,
        message: '更新用户信息成功'
      })
    } catch (error) {
      console.error('更新当前用户信息失败:', error)
      return c.json({ error: '更新当前用户信息失败' }, 500)
    }
  })

  return usersRoutes
}