import { Hono } from "hono";
import debug from "debug";
import {
  DeleteStatus,
} from "../client/share/types.ts";

import type { Variables, WithAuth } from "./app.tsx";

const log = {
  api: debug("api:sys"),
};


// 创建图表数据路由
export function createChartRoutes(withAuth: WithAuth) {
  const chartRoutes = new Hono<{ Variables: Variables }>();

  // 获取用户活跃度图表数据
  chartRoutes.get("/user-activity", withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient');
      
      // 获取过去30天的数据
      const days = 30;
      const result = [];
      
      // 当前日期
      const currentDate = new Date();
      
      // 生成过去30天的日期范围
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(currentDate.getDate() - i);
        
        // 格式化日期为 YYYY-MM-DD
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        // 查询当天的登录次数
        const loginCount = await apiClient.database
          .table('login_history')
          .whereRaw(`DATE(login_time) = ?`, [formattedDate])
          .count();
          
        result.push({
          date: formattedDate,
          count: Number(loginCount),
        });
      }
      
      return c.json({
        message: "获取用户活跃度数据成功",
        data: result,
      });
    } catch (error) {
      log.api("获取用户活跃度数据失败:", error);
      return c.json({ error: "获取用户活跃度数据失败" }, 500);
    }
  });
  
  // 获取文件上传统计图表数据
  chartRoutes.get("/file-uploads", withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient');
      
      // 获取过去12个月的数据
      const months = 12;
      const result = [];
      
      // 当前日期
      const currentDate = new Date();
      
      // 生成过去12个月的月份范围
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(currentDate.getMonth() - i);
        
        // 获取年月
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        // 月份标签
        const monthLabel = `${year}-${String(month).padStart(2, '0')}`;
        
        // 查询当月的文件上传数量
        const fileCount = await apiClient.database
          .table('file_library')
          .whereRaw(`YEAR(created_at) = ? AND MONTH(created_at) = ?`, [year, month])
          .count();
          
        result.push({
          month: monthLabel,
          count: Number(fileCount),
        });
      }
      
      return c.json({
        message: "获取文件上传统计数据成功",
        data: result,
      });
    } catch (error) {
      log.api("获取文件上传统计数据失败:", error);
      return c.json({ error: "获取文件上传统计数据失败" }, 500);
    }
  });
  
  // 获取文件类型分布图表数据
  chartRoutes.get("/file-types", withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient');
      
      // 查询不同文件类型的数量
      const fileTypeStats = await apiClient.database
        .table('file_library')
        .select('file_type',apiClient.database.raw('count(id) as count'))
        .where('is_deleted', DeleteStatus.NOT_DELETED)
        .groupBy('file_type');
        
      // 将结果转换为饼图所需格式
      const result = fileTypeStats.map(item => ({
        type: item.file_type || '未知',
        value: Number(item.count),
      }));
      
      return c.json({
        message: "获取文件类型分布数据成功",
        data: result,
      });
    } catch (error) {
      log.api("获取文件类型分布数据失败:", error);
      return c.json({ error: "获取文件类型分布数据失败" }, 500);
    }
  });
  
  // 获取仪表盘概览数据
  chartRoutes.get("/dashboard-overview", withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient');
      
      // 获取用户总数
      const userCount = await apiClient.database
        .table('users')
        .where('is_deleted', DeleteStatus.NOT_DELETED)
        .count();
        
      // 获取文件总数
      const fileCount = await apiClient.database
        .table('file_library')
        .where('is_deleted', DeleteStatus.NOT_DELETED)
        .count();
        
      // 获取知识库文章总数
      const articleCount = await apiClient.database
        .table('know_info')
        .where('is_deleted', DeleteStatus.NOT_DELETED)
        .count();
        
      // 获取今日登录次数
      const today = new Date().toISOString().split('T')[0];
      const todayLoginCount = await apiClient.database
        .table('login_history')
        .whereRaw(`DATE(login_time) = ?`, [today])
        .count();
        
      return c.json({
        message: "获取仪表盘概览数据成功",
        data: {
          userCount: Number(userCount),
          fileCount: Number(fileCount),
          articleCount: Number(articleCount),
          todayLoginCount: Number(todayLoginCount),
        },
      });
    } catch (error) {
      log.api("获取仪表盘概览数据失败:", error);
      return c.json({ error: "获取仪表盘概览数据失败" }, 500);
    }
  });

  return chartRoutes;
}
