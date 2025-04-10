import { Hono } from 'hono'
import { APIClient } from '@d8d-appcontainer/api'
import type { Variables } from './app.tsx'
import type { WithAuth } from './app.tsx'
import { migrations } from './migrations.ts'
import debug from "debug";
const log = {
  api: debug("api:migrations"),
};
// 初始化数据库
const initDatabase = async (apiClient: APIClient) => {
  try {
    log.api('正在执行数据库迁移...')
    
    const migrationsResult = await apiClient.database.executeLiveMigrations(migrations)
    // log.app('数据库迁移完成 %O',migrationsResult)
    log.api('数据库迁移完成')
    return migrationsResult
    
  } catch (error) {
    log.api('数据库迁移失败:', error)
  }
}
export function createMigrationsRoutes(withAuth: WithAuth) {
  const migrationsRoutes = new Hono<{ Variables: Variables }>()

  migrationsRoutes.get('/', async (c) => {
    const apiClient = c.get('apiClient')
    const migrationsResult = await initDatabase(apiClient)
    
    const failedResult = migrationsResult?.find((migration) => migration.status === 'failed')
    if (failedResult) {
      log.api('数据库迁移失败 %O', failedResult)
      return c.json({ error: '数据库迁移失败' }, 500)
    }

    return c.json({ success: true })
  })

  return migrationsRoutes
}