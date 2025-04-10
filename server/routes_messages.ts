import { Hono } from 'hono'
import type { Variables } from './app.tsx'
import type { WithAuth } from './app.tsx'
import { MessageType, MessageStatus } from '../client/share/types.ts'

export function createMessagesRoutes(withAuth: WithAuth) {
  const messagesRoutes = new Hono<{ Variables: Variables }>()

  // 发送消息
  messagesRoutes.post('/', withAuth, async (c) => {
    try {
      const auth = c.get('auth')
      const apiClient = c.get('apiClient')
      const { title, content, type, receiver_ids } = await c.req.json()

      if (!title || !content || !type || !receiver_ids?.length) {
        return c.json({ error: '缺少必要参数' }, 400)
      }

      // 创建消息
      const user = c.get('user')
      if (!user) return c.json({ error: '未授权访问' }, 401)
      
      const [messageId] = await apiClient.database.table('messages').insert({
        title,
        content,
        type,
        sender_id: user.id,
        sender_name: user.username,
        created_at: apiClient.database.fn.now(),
        updated_at: apiClient.database.fn.now()
      })

      // 关联用户消息
      const userMessages = receiver_ids.map((userId: number) => ({
        user_id: userId,
        message_id: messageId,
        status: MessageStatus.UNREAD,
        created_at: apiClient.database.fn.now(),
        updated_at: apiClient.database.fn.now()
      }))

      await apiClient.database.table('user_messages').insert(userMessages)

      return c.json({ message: '消息发送成功', id: messageId }, 201)
    } catch (error) {
      console.error('发送消息失败:', error)
      return c.json({ error: '发送消息失败' }, 500)
    }
  })

  // 获取用户消息列表
  messagesRoutes.get('/', withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient')
      
      const page = Number(c.req.query('page')) || 1
      const pageSize = Number(c.req.query('pageSize')) || 20
      const type = c.req.query('type')
      const status = c.req.query('status')

      const user = c.get('user')
      if (!user) return c.json({ error: '未授权访问' }, 401)
      
      const query = apiClient.database.table('user_messages as um')
        .select('m.*', 'um.status as user_status', 'um.read_at', 'um.id as user_message_id')
        .leftJoin('messages as m', 'um.message_id', 'm.id')
        .where('um.user_id', user.id)
        .where('um.is_deleted', 0)
        .orderBy('m.created_at', 'desc')
        .limit(pageSize)
        .offset((page - 1) * pageSize)

      if (type) query.where('m.type', type)
      if (status) query.where('um.status', status)

      const messages = await query

      return c.json(messages)
    } catch (error) {
      console.error('获取消息列表失败:', error)
      return c.json({ error: '获取消息列表失败' }, 500)
    }
  })

  // 获取消息详情
  messagesRoutes.get('/:id', withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient')
      
      const messageId = c.req.param('id')

      const user = c.get('user')
      if (!user) return c.json({ error: '未授权访问' }, 401)
      
      const message = await apiClient.database.table('user_messages as um')
        .select('m.*', 'um.status as user_status', 'um.read_at')
        .leftJoin('messages as m', 'um.message_id', 'm.id')
        .where('um.user_id', user.id)
        .where('um.message_id', messageId)
        .first()

      if (!message) {
        return c.json({ error: '消息不存在或无权访问' }, 404)
      }

      // 标记为已读
      if (message.user_status === MessageStatus.UNREAD) {
        const user = c.get('user')
        if (!user) return c.json({ error: '未授权访问' }, 401)
        
        await apiClient.database.table('user_messages')
          .where('user_id', user.id)
          .where('message_id', messageId)
          .update({
            status: MessageStatus.READ,
            read_at: apiClient.database.fn.now(),
            updated_at: apiClient.database.fn.now()
          })
      }

      return c.json(message)
    } catch (error) {
      console.error('获取消息详情失败:', error)
      return c.json({ error: '获取消息详情失败' }, 500)
    }
  })

  // 删除消息(软删除)
  messagesRoutes.delete('/:id', withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient')
      const user = c.get('user')
      if (!user) return c.json({ error: '未授权访问' }, 401)
      
      const messageId = c.req.param('id')

      await apiClient.database.table('user_messages')
        .where('user_id', user.id)
        .where('message_id', messageId)
        .update({
          is_deleted: 1,
          updated_at: apiClient.database.fn.now()
        })

      return c.json({ message: '消息已删除' })
    } catch (error) {
      console.error('删除消息失败:', error)
      return c.json({ error: '删除消息失败' }, 500)
    }
  })

  // 获取未读消息数量
  messagesRoutes.get('/count/unread', withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient')

      const user = c.get('user')
      if (!user) return c.json({ error: '未授权访问' }, 401)
      
      const count = await apiClient.database.table('user_messages')
        .where('user_id', user.id)
        .where('status', MessageStatus.UNREAD)
        .where('is_deleted', 0)
        .count()

      return c.json({ count: Number(count) })
    } catch (error) {
      console.error('获取未读消息数失败:', error)
      return c.json({ error: '获取未读消息数失败' }, 500)
    }
  })

  return messagesRoutes
}