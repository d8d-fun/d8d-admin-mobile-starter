import { Hono } from "hono";
import debug from "debug";
import type {
  FileLibrary,
  FileCategory,
  KnowInfo,
  ThemeSettings,
} from "./asset/share/types.ts";

import {
  EnableStatus,
  DeleteStatus,
  ThemeMode,
  FontSize,
  CompactMode,
} from "./asset/share/types.ts";

import type { Variables, WithAuth } from "./app.tsx";

const log = {
  api: debug("api:sys"),
};

// 创建地图数据路由
export function createMapRoutes(withAuth: WithAuth) {
  const mapRoutes = new Hono<{ Variables: Variables }>();

  // 获取地图标记点数据
  mapRoutes.get("/markers", withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient');
      
      // 从登录历史表中查询有经纬度的登录记录
      const locations = await apiClient.database
        .table('login_history')
        .select(
          'id',
          'user_id',
          'location_name',
          'longitude',
          'latitude',
          'login_time',
          'ip_address'
        )
        .whereNotNull('longitude')
        .whereNotNull('latitude')
        .orderBy('login_time', 'desc')
        .limit(100); // 限制返回最近100条记录
        
      // 获取相关用户信息
      const userIds = [...new Set(locations.map(loc => loc.user_id))];
      const users = await apiClient.database
        .table('users')
        .select('id', 'username', 'nickname')
        .whereIn('id', userIds);
        
      // 构建用户信息映射
      const userMap = new Map(users.map(user => [user.id, user]));
        
      // 转换为地图标记点数据格式
      const markers = locations.map(location => ({
        id: location.id,
        name: location.location_name || '未知地点',
        longitude: location.longitude,
        latitude: location.latitude,
        loginTime: location.login_time,
        ipAddress: location.ip_address,
        user: userMap.get(location.user_id)
      }));
      
      return c.json({
        message: "获取登录位置数据成功",
        data: markers,
      });
    } catch (error) {
      log.api("获取登录位置数据失败:", error);
      return c.json({ error: "获取登录位置数据失败" }, 500);
    }
  });
  
  // 获取登录位置详情数据
  mapRoutes.get("/location/:id", withAuth, async (c) => {
    try {
      const id = Number(c.req.param("id"));
      
      if (!id || isNaN(id)) {
        return c.json({ error: "无效的登录记录ID" }, 400);
      }
      
      const apiClient = c.get('apiClient');
      
      // 查询登录记录详情
      const location = await apiClient.database
        .table('login_history')
        .where('id', id)
        .first();
        
      if (!location) {
        return c.json({ error: "登录记录不存在" }, 404);
      }
      
      // 获取用户信息
      const [user] = await apiClient.database
        .table('users')
        .select('id', 'username', 'nickname')
        .where('id', location.user_id);
        
      return c.json({
        message: "获取登录位置详情成功",
        data: {
          ...location,
          user
        },
      });
    } catch (error) {
      log.api("获取登录位置详情失败:", error);
      return c.json({ error: "获取登录位置详情失败" }, 500);
    }
  });
  
  // 更新登录位置信息
  mapRoutes.put("/location/:id", withAuth, async (c) => {
    try {
      const id = Number(c.req.param("id"));
      
      if (!id || isNaN(id)) {
        return c.json({ error: "无效的登录记录ID" }, 400);
      }
      
      const apiClient = c.get('apiClient');
      const data = await c.req.json();
      
      // 验证经纬度
      if (!data.longitude || !data.latitude) {
        return c.json({ error: "经度和纬度不能为空" }, 400);
      }
      
      // 检查登录记录是否存在
      const location = await apiClient.database
        .table('login_history')
        .where('id', id)
        .first();
        
      if (!location) {
        return c.json({ error: "登录记录不存在" }, 404);
      }
      
      // 更新位置信息
      await apiClient.database
        .table('login_history')
        .where('id', id)
        .update({
          longitude: data.longitude,
          latitude: data.latitude,
          location_name: data.location_name
        });
        
      // 获取更新后的登录记录
      const updatedLocation = await apiClient.database
        .table('login_history')
        .where('id', id)
        .first();
        
      return c.json({
        message: "登录位置信息更新成功",
        data: updatedLocation,
      });
    } catch (error) {
      log.api("更新登录位置信息失败:", error);
      return c.json({ error: "更新登录位置信息失败" }, 500);
    }
  });

  return mapRoutes;
}
