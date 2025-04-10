import { Hono } from 'hono'
import type { Variables } from './app.tsx'
import type { WithAuth } from './app.tsx'
import { AuditStatus } from '../client/share/types.ts'

export function createHomeRoutes(withAuth: WithAuth) {
  const homeRoutes = new Hono<{ Variables: Variables }>()

  // 获取轮播图数据
  homeRoutes.get('/banners', async (c) => {
    try {
      const apiClient = c.get('apiClient')
      
      const banners = await apiClient.database.table('know_info')
        .where('is_deleted', 0)
        .where('audit_status', AuditStatus.APPROVED) // 使用审核状态替代启用状态
        .where('category', 'banner') // 轮播图类型
        .orderBy('created_at', 'asc') // 使用创建时间排序
        .select('id', 'title', 'cover_url', 'content')

      return c.json({
        message: '获取轮播图成功',
        data: banners
      })
    } catch (error) {
      console.error('获取轮播图失败:', error)
      return c.json({ error: '获取轮播图失败' }, 500)
    }
  })

  // 获取新闻列表
  homeRoutes.get('/news', async (c) => {
    try {
      const apiClient = c.get('apiClient')
      
      const page = Number(c.req.query('page')) || 1
      const pageSize = Number(c.req.query('pageSize')) || 10
      const category = c.req.query('category')

      const query = apiClient.database.table('know_info')
        .where('is_deleted', 0)
        .where('audit_status', AuditStatus.APPROVED) // 使用审核状态替代发布状态
        .where('category', 'news') // 新闻类型
        .orderBy('created_at', 'desc') // 使用创建时间替代发布时间
        .limit(pageSize)
        .offset((page - 1) * pageSize)

      if (category) query.where('sub_category', category)

      const countQuery = query.clone()
      const news = await query
      
      // 获取总数用于分页
      const total = await countQuery.count()
      const totalCount = Number(total)
      const totalPages = Math.ceil(totalCount / pageSize)

      return c.json({
        message: '获取新闻成功',
        data: news,
        pagination: {
          total: totalCount,
          current: page,
          pageSize,
          totalPages
        }
      })
    } catch (error) {
      console.error('获取新闻失败:', error)
      return c.json({ error: '获取新闻失败' }, 500)
    }
  })

  // 获取通知列表
  homeRoutes.get('/notices', async (c) => {
    try {
      const apiClient = c.get('apiClient')
      
      const page = Number(c.req.query('page')) || 1
      const pageSize = Number(c.req.query('pageSize')) || 10

      const notices = await apiClient.database.table('know_info')
        .where('is_deleted', 0)
        .where('status', 1) // 1表示已发布
        .where('category', 'notice') // 通知类型
        .orderBy('created_at', 'desc')
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .select('id', 'title', 'content', 'created_at')

      const total = await apiClient.database.table('know_info')
        .where('is_deleted', 0)
        .where('status', 1)
        .where('category', 'notice')
        .count()
      
      const totalCount = Number(total)
      const totalPages = Math.ceil(totalCount / pageSize)

      return c.json({
        message: '获取通知成功',
        data: notices,
        pagination: {
          total: totalCount,
          current: page,
          pageSize,
          totalPages
        }
      })
    } catch (error) {
      console.error('获取通知失败:', error)
      return c.json({ error: '获取通知失败' }, 500)
    }
  })

  return homeRoutes
}