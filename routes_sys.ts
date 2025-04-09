import { Hono } from "hono";
import debug from "debug";
import type {
  FileLibrary,
  FileCategory,
  KnowInfo,
  ThemeSettings,
  SystemSetting,
  SystemSettingGroupData,
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

// 创建知识库管理路由
export function createKnowInfoRoutes(withAuth: WithAuth) {
  const knowInfoRoutes = new Hono<{ Variables: Variables }>();

  // 获取知识库文章列表
  knowInfoRoutes.get("/", withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient');

      // 获取分页参数
      const page = Number(c.req.query("page")) || 1;
      const limit = Number(c.req.query("limit")) || 10;
      const offset = (page - 1) * limit;

      // 获取筛选参数
      const title = c.req.query("title");
      const category = c.req.query("category");
      const tags = c.req.query("tags");

      // 构建查询
      let query = apiClient.database
        .table("know_info")
        .where("is_deleted", 0)
        .orderBy("id", "desc");

      // 应用筛选条件
      if (title) {
        query = query.where("title", "like", `%${title}%`);
      }

      if (category) {
        query = query.where("category", category);
      }

      if (tags) {
        query = query.where("tags", "like", `%${tags}%`);
      }

      // 克隆查询以获取总数
      const countQuery = query.clone();

      // 执行分页查询
      const articles = await query.limit(limit).offset(offset);

      // 获取总数
      const count = await countQuery.count();

      return c.json({
        data: articles,
        pagination: {
          total: Number(count),
          current: page,
          pageSize: limit,
          totalPages: Math.ceil(Number(count) / limit),
        },
      });
    } catch (error) {
      log.api("获取知识库文章列表失败:", error);
      return c.json({ error: "获取知识库文章列表失败" }, 500);
    }
  });

  // 获取单个知识库文章
  knowInfoRoutes.get("/:id", withAuth, async (c) => {
    try {
      const id = Number(c.req.param("id"));

      if (!id || isNaN(id)) {
        return c.json({ error: "无效的文章ID" }, 400);
      }

      const apiClient = c.get('apiClient');
      const [article] = await apiClient.database
        .table("know_info")
        .where({ id, is_deleted: 0 });

      if (!article) {
        return c.json({ error: "文章不存在" }, 404);
      }

      return c.json(article);
    } catch (error) {
      log.api("获取知识库文章详情失败:", error);
      return c.json({ error: "获取知识库文章详情失败" }, 500);
    }
  });

  // 创建知识库文章
  knowInfoRoutes.post("/", withAuth, async (c) => {
    try {
      const articleData = (await c.req.json()) as Partial<KnowInfo>;

      // 验证必填字段
      if (!articleData.title) {
        return c.json({ error: "文章标题不能为空" }, 400);
      }

      // 如果作者为空，则使用当前用户的用户名
      if (!articleData.author) {
        const user = c.get("user");
        articleData.author = user ? user.username : "unknown";
      }

      const apiClient = c.get('apiClient');
      const [id] = await apiClient.database
        .table("know_info")
        .insert(articleData);

      // 获取创建的文章
      const [createdArticle] = await apiClient.database
        .table("know_info")
        .where("id", id);

      return c.json({
        message: "知识库文章创建成功",
        data: createdArticle,
      });
    } catch (error) {
      log.api("创建知识库文章失败:", error);
      return c.json({ error: "创建知识库文章失败" }, 500);
    }
  });

  // 更新知识库文章
  knowInfoRoutes.put("/:id", withAuth, async (c) => {
    try {
      const id = Number(c.req.param("id"));

      if (!id || isNaN(id)) {
        return c.json({ error: "无效的文章ID" }, 400);
      }

      const articleData = (await c.req.json()) as Partial<KnowInfo>;

      // 验证必填字段
      if (!articleData.title) {
        return c.json({ error: "文章标题不能为空" }, 400);
      }

      const apiClient = c.get('apiClient');

      // 检查文章是否存在
      const [existingArticle] = await apiClient.database
        .table("know_info")
        .where({ id, is_deleted: 0 });

      if (!existingArticle) {
        return c.json({ error: "文章不存在" }, 404);
      }

      // 更新文章
      await apiClient.database
        .table("know_info")
        .where("id", id)
        .update({
          ...articleData,
          updated_at: apiClient.database.fn.now(),
        });

      // 获取更新后的文章
      const [updatedArticle] = await apiClient.database
        .table("know_info")
        .where("id", id);

      return c.json({
        message: "知识库文章更新成功",
        data: updatedArticle,
      });
    } catch (error) {
      log.api("更新知识库文章失败:", error);
      return c.json({ error: "更新知识库文章失败" }, 500);
    }
  });

  // 删除知识库文章（软删除）
  knowInfoRoutes.delete("/:id", withAuth, async (c) => {
    try {
      const id = Number(c.req.param("id"));

      if (!id || isNaN(id)) {
        return c.json({ error: "无效的文章ID" }, 400);
      }

      const apiClient = c.get('apiClient');

      // 检查文章是否存在
      const [existingArticle] = await apiClient.database
        .table("know_info")
        .where({ id, is_deleted: 0 });

      if (!existingArticle) {
        return c.json({ error: "文章不存在" }, 404);
      }

      // 软删除文章
      await apiClient.database.table("know_info").where("id", id).update({
        is_deleted: 1,
        updated_at: apiClient.database.fn.now(),
      });

      return c.json({
        message: "知识库文章删除成功",
      });
    } catch (error) {
      log.api("删除知识库文章失败:", error);
      return c.json({ error: "删除知识库文章失败" }, 500);
    }
  });
  
  return knowInfoRoutes;
}

// 创建文件分类路由
export function createFileCategoryRoutes(withAuth: WithAuth) {
  const fileCategoryRoutes = new Hono<{ Variables: Variables }>();

  // 获取文件分类列表
  fileCategoryRoutes.get("/", withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient');

      const page = Number(c.req.query("page")) || 1;
      const pageSize = Number(c.req.query("pageSize")) || 10;
      const offset = (page - 1) * pageSize;

      const search = c.req.query("search") || "";

      let query = apiClient.database.table("file_category").orderBy("id", "desc");

      if (search) {
        query = query.where("name", "like", `%${search}%`);
      }

      const total = await query.clone().count();

      const categories = await query
        .select("id", "name", "code", "description")
        .limit(pageSize)
        .offset(offset);

      return c.json({
        data: categories,
        total: Number(total),
        page,
        pageSize,
      });
    } catch (error) {
      log.api("获取文件分类列表失败:", error);
      return c.json({ error: "获取文件分类列表失败" }, 500);
    }
  });

  // 创建文件分类
  fileCategoryRoutes.post("/", withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient');
      const data = (await c.req.json()) as Partial<FileCategory>;

      // 验证必填字段
      if (!data.name) {
        return c.json({ error: "分类名称不能为空" }, 400);
      }

      // 插入文件分类
      const [id] = await apiClient.database.table("file_category").insert({
        ...data,
        created_at: apiClient.database.fn.now(),
        updated_at: apiClient.database.fn.now(),
      });

      return c.json({
        message: "文件分类创建成功",
        data: {
          id,
          ...data,
        },
      });
    } catch (error) {
      log.api("创建文件分类失败:", error);
      return c.json({ error: "创建文件分类失败" }, 500);
    }
  });

  // 更新文件分类
  fileCategoryRoutes.put("/:id", withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient');
      const id = Number(c.req.param("id"));

      if (!id || isNaN(id)) {
        return c.json({ error: "无效的分类ID" }, 400);
      }

      const data = (await c.req.json()) as Partial<FileCategory>;

      // 更新文件分类
      await apiClient.database
        .table("file_category")
        .where("id", id)
        .update({
          ...data,
          updated_at: apiClient.database.fn.now(),
        });

      return c.json({
        message: "文件分类更新成功",
        data: {
          id,
          ...data,
        },
      });
    } catch (error) {
      log.api("更新文件分类失败:", error);
      return c.json({ error: "更新文件分类失败" }, 500);
    }
  });

  // 删除文件分类
  fileCategoryRoutes.delete("/:id", withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient');
      const id = Number(c.req.param("id"));

      if (!id || isNaN(id)) {
        return c.json({ error: "无效的分类ID" }, 400);
      }

      await apiClient.database.table("file_category").where("id", id).update({
        is_deleted: DeleteStatus.DELETED,
        updated_at: apiClient.database.fn.now(),
      });

      return c.json({
        message: "文件分类删除成功",
      });
    } catch (error) {
      log.api("删除文件分类失败:", error);
      return c.json({ error: "删除文件分类失败" }, 500);
    }
  });
  
  return fileCategoryRoutes;
}

// 创建文件上传路由
export function createFileUploadRoutes(withAuth: WithAuth) {
  const fileUploadRoutes = new Hono<{ Variables: Variables }>();

  // 获取 MinIO 上传策略
  fileUploadRoutes.get("/policy", withAuth, async (c) => {
    try {
      const prefix = c.req.query("prefix") || "uploads/";
      const filename = c.req.query("filename");
      const maxSize = Number(c.req.query("maxSize")) || 10 * 1024 * 1024; // 默认10MB

      if (!filename) {
        return c.json({ error: "文件名不能为空" }, 400);
      }

      const apiClient = c.get('apiClient');
      const policy = await apiClient.storage.getUploadPolicy(
        prefix,
        filename,
        maxSize
      );

      return c.json({
        message: "获取上传策略成功",
        data: policy,
      });
    } catch (error) {
      log.api("获取上传策略失败:", error);
      return c.json({ error: "获取上传策略失败" }, 500);
    }
  });

  // 保存文件信息到文件库
  fileUploadRoutes.post("/save", withAuth, async (c) => {
    try {
      const fileData = (await c.req.json()) as Partial<FileLibrary>;
      const user = c.get("user");

      // 验证必填字段
      if (!fileData.file_name || !fileData.file_path || !fileData.file_type) {
        return c.json({ error: "文件名、路径和类型不能为空" }, 400);
      }

      const apiClient = c.get('apiClient');

      // 设置上传者信息
      if (user) {
        fileData.uploader_id = user.id;
        fileData.uploader_name = user.nickname || user.username;
      }

      // 插入文件库记录
      const [id] = await apiClient.database.table("file_library").insert({
        ...fileData,
        download_count: 0,
        is_disabled: EnableStatus.ENABLED,
        is_deleted: DeleteStatus.NOT_DELETED,
        created_at: apiClient.database.fn.now(),
        updated_at: apiClient.database.fn.now(),
      });

      // 获取插入的数据
      const [insertedFile] = await apiClient.database
        .table("file_library")
        .where("id", id);

      return c.json({
        message: "文件信息保存成功",
        data: insertedFile,
      });
    } catch (error) {
      log.api("保存文件信息失败:", error);
      return c.json({ error: "保存文件信息失败" }, 500);
    }
  });

  // 获取文件列表
  fileUploadRoutes.get("/list", withAuth, async (c) => {
    try {
      const page = Number(c.req.query("page")) || 1;
      const pageSize = Number(c.req.query("pageSize")) || 10;
      const category_id = c.req.query("category_id");
      const fileType = c.req.query("fileType");
      const keyword = c.req.query("keyword");

      const apiClient = c.get('apiClient');
      let query = apiClient.database
        .table("file_library")
        .where("is_deleted", DeleteStatus.NOT_DELETED)
        .orderBy("created_at", "desc");

      // 应用过滤条件
      if (category_id) {
        query = query.where("category_id", category_id);
      }

      if (fileType) {
        query = query.where("file_type", fileType);
      }

      if (keyword) {
        query = query.where((builder) => {
          builder
            .where("file_name", "like", `%${keyword}%`)
            .orWhere("description", "like", `%${keyword}%`)
            .orWhere("tags", "like", `%${keyword}%`);
        });
      }

      // 获取总数
      const total = await query.clone().count();

      // 分页查询
      const files = await query.limit(pageSize).offset((page - 1) * pageSize);

      return c.json({
        message: "获取文件列表成功",
        data: {
          list: files,
          pagination: {
            current: page,
            pageSize,
            total: Number(total),
          },
        },
      });
    } catch (error) {
      log.api("获取文件列表失败:", error);
      return c.json({ error: "获取文件列表失败" }, 500);
    }
  });

  // 获取单个文件信息
  fileUploadRoutes.get("/:id", withAuth, async (c) => {
    try {
      const id = Number(c.req.param("id"));

      if (!id || isNaN(id)) {
        return c.json({ error: "无效的文件ID" }, 400);
      }

      const apiClient = c.get('apiClient');
      const file = await apiClient.database
        .table("file_library")
        .where("id", id)
        .where("is_deleted", DeleteStatus.NOT_DELETED)
        .first();

      if (!file) {
        return c.json({ error: "文件不存在" }, 404);
      }

      return c.json({
        message: "获取文件信息成功",
        data: file,
      });
    } catch (error) {
      log.api("获取文件信息失败:", error);
      return c.json({ error: "获取文件信息失败" }, 500);
    }
  });

  // 增加文件下载计数
  fileUploadRoutes.post("/:id/download", withAuth, async (c) => {
    try {
      const id = Number(c.req.param("id"));

      if (!id || isNaN(id)) {
        return c.json({ error: "无效的文件ID" }, 400);
      }

      const apiClient = c.get('apiClient');

      // 查询文件是否存在
      const file = await apiClient.database
        .table("file_library")
        .where("id", id)
        .where("is_deleted", DeleteStatus.NOT_DELETED)
        .first();

      if (!file) {
        return c.json({ error: "文件不存在" }, 404);
      }

      // 增加下载计数
      await apiClient.database
        .table("file_library")
        .where("id", id)
        .update({
          download_count: apiClient.database.raw("download_count + 1"),
          updated_at: apiClient.database.fn.now(),
        });

      return c.json({
        message: "更新下载计数成功",
      });
    } catch (error) {
      log.api("更新下载计数失败:", error);
      return c.json({ error: "更新下载计数失败" }, 500);
    }
  });

  // 删除文件
  fileUploadRoutes.delete("/:id", withAuth, async (c) => {
    try {
      const id = Number(c.req.param("id"));

      if (!id || isNaN(id)) {
        return c.json({ error: "无效的文件ID" }, 400);
      }

      const apiClient = c.get('apiClient');

      // 查询文件是否存在
      const file = await apiClient.database
        .table("file_library")
        .where("id", id)
        .where("is_deleted", DeleteStatus.NOT_DELETED)
        .first();

      if (!file) {
        return c.json({ error: "文件不存在" }, 404);
      }

      // 软删除文件
      await apiClient.database.table("file_library").where("id", id).update({
        is_deleted: DeleteStatus.DELETED,
        updated_at: apiClient.database.fn.now(),
      });

      return c.json({
        message: "文件删除成功",
      });
    } catch (error) {
      log.api("删除文件失败:", error);
      return c.json({ error: "删除文件失败" }, 500);
    }
  });
  
  return fileUploadRoutes;
}

// 创建主题设置路由
export function createThemeRoutes(withAuth: WithAuth) {
  const themeRoutes = new Hono<{ Variables: Variables }>();

  // 获取当前主题设置
  themeRoutes.get("/", withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient');
      const user = c.get('user');

      if (!user) {
        return c.json({ error: "未授权访问" }, 401);
      }

      // 获取用户的主题设置
      let themeSettings = await apiClient.database
        .table("theme_settings")
        .where("user_id", user.id)
        .first();

      // 如果用户没有主题设置，则创建默认设置
      if (!themeSettings) {
        const defaultSettings = {
          theme_mode: ThemeMode.LIGHT,
          primary_color: '#1890ff',
          font_size: FontSize.MEDIUM,
          is_compact: CompactMode.NORMAL
        };

        const [id] = await apiClient.database.table("theme_settings").insert({
          user_id: user.id,
          settings: defaultSettings,
          created_at: apiClient.database.fn.now(),
          updated_at: apiClient.database.fn.now(),
        });

        themeSettings = await apiClient.database
          .table("theme_settings")
          .where("id", id)
          .first();
      }

      return c.json({
        message: "获取主题设置成功",
        data: themeSettings?.settings,
      });
    } catch (error) {
      log.api("获取主题设置失败:", error);
      return c.json({ error: "获取主题设置失败" }, 500);
    }
  });

  // 更新主题设置
  themeRoutes.put("/", withAuth, async (c) => {
    try {
      const user = c.get('user');
      const apiClient = c.get('apiClient');

      if (!user) {
        return c.json({ error: "未授权访问" }, 401);
      }

      const themeData = (await c.req.json()) as Partial<ThemeSettings>;

      // 检查用户是否已有主题设置
      const existingTheme = await apiClient.database
        .table("theme_settings")
        .where("user_id", user.id)
        .first();

      if (existingTheme) {
        // 更新现有设置
        const currentSettings = existingTheme.settings || {};
        const updatedSettings = {
          ...currentSettings,
          ...themeData
        };

        await apiClient.database
          .table("theme_settings")
          .where("user_id", user.id)
          .update({
            settings: JSON.stringify(updatedSettings),
            updated_at: apiClient.database.fn.now(),
          });
      } else {
        // 创建新设置
        const defaultSettings = {
          theme_mode: ThemeMode.LIGHT,
          primary_color: '#1890ff',
          font_size: FontSize.MEDIUM,
          is_compact: CompactMode.NORMAL
        };

        const updatedSettings = {
          ...defaultSettings,
          ...themeData
        };

        await apiClient.database.table("theme_settings").insert({
          user_id: user.id,
          settings: updatedSettings,
          created_at: apiClient.database.fn.now(),
          updated_at: apiClient.database.fn.now(),
        });
      }

      // 获取更新后的主题设置
      const updatedTheme = await apiClient.database
        .table("theme_settings")
        .where("user_id", user.id)
        .first();

      return c.json({
        message: "主题设置更新成功",
        data: updatedTheme,
      });
    } catch (error) {
      log.api("更新主题设置失败:", error);
      return c.json({ error: "更新主题设置失败" }, 500);
    }
  });

  // 重置主题设置为默认值
  themeRoutes.post("/reset", withAuth, async (c) => {
    try {
      const user = c.get('user');
      const apiClient = c.get('apiClient');

      if (!user) {
        return c.json({ error: "未授权访问" }, 401);
      }

      // 默认主题设置
      const defaultSettings = {
        theme_mode: ThemeMode.LIGHT,
        primary_color: '#1890ff',
        font_size: FontSize.MEDIUM,
        is_compact: CompactMode.NORMAL
      };

      // 更新用户的主题设置
      await apiClient.database
        .table("theme_settings")
        .where("user_id", user.id)
        .update({
          settings: JSON.stringify(defaultSettings),
          updated_at: apiClient.database.fn.now(),
        });

      // 获取更新后的主题设置
      const updatedTheme = await apiClient.database
        .table("theme_settings")
        .where("user_id", user.id)
        .first();

      return c.json({
        message: "主题设置已重置为默认值",
        data: updatedTheme,
      });
    } catch (error) {
      log.api("重置主题设置失败:", error);
      return c.json({ error: "重置主题设置失败" }, 500);
    }
  });

  return themeRoutes;
}

// 创建系统设置路由
export function createSystemSettingsRoutes(withAuth: WithAuth) {
  const settingsRoutes = new Hono<{ Variables: Variables }>();

  // 获取所有系统设置（按分组）
  settingsRoutes.get('/', withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient');
      const settings = await apiClient.database
        .table('system_settings')
        .select('*');

      // 按分组整理数据
      const groupedSettings = settings.reduce((acc: SystemSettingGroupData[], setting) => {
        const groupIndex = acc.findIndex((g: SystemSettingGroupData) => g.name === setting.group);
        if (groupIndex === -1) {
          acc.push({
            name: setting.group,
            description: `${setting.group}组设置`,
            settings: [{
              id: setting.id,
              key: setting.key,
              value: setting.value,
              description: setting.description,
              group: setting.group
            }]
          });
        } else {
          acc[groupIndex].settings.push({
            id: setting.id,
            key: setting.key,
            value: setting.value,
            description: setting.description,
            group: setting.group
          });
        }
        return acc;
      }, []);

      return c.json({
        message: '获取系统设置成功',
        data: groupedSettings
      });
    } catch (error) {
      log.api('获取系统设置失败:', error);
      return c.json({ error: '获取系统设置失败' }, 500);
    }
  });

  // 获取指定分组的系统设置
  settingsRoutes.get('/group/:group', withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient');
      const group = c.req.param('group');
      
      const settings = await apiClient.database
        .table('system_settings')
        .where('group', group)
        .select('*');

      return c.json({
        message: '获取分组设置成功',
        data: settings
      });
    } catch (error) {
      log.api('获取分组设置失败:', error);
      return c.json({ error: '获取分组设置失败' }, 500);
    }
  });

  // 更新系统设置
  settingsRoutes.put('/:key', withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient');
      const key = c.req.param('key');
      const settingData = await c.req.json();

      // 验证设置是否存在
      const existingSetting = await apiClient.database
        .table('system_settings')
        .where('key', key)
        .first();

      if (!existingSetting) {
        return c.json({ error: '设置项不存在' }, 404);
      }

      // 更新设置
      await apiClient.database
        .table('system_settings')
        .where('key', key)
        .update({
          value: settingData.value,
          updated_at: apiClient.database.fn.now()
        });

      // 获取更新后的设置
      const updatedSetting = await apiClient.database
        .table('system_settings')
        .where('key', key)
        .first();

      return c.json({
        message: '系统设置已更新',
        data: updatedSetting
      });
    } catch (error) {
      log.api('更新系统设置失败:', error);
      return c.json({ error: '更新系统设置失败' }, 500);
    }
  });

  // 批量更新系统设置
  settingsRoutes.put('/', withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient');
      const settingsData = await c.req.json();

      // 验证数据格式
      if (!Array.isArray(settingsData)) {
        return c.json({ error: '无效的请求数据格式,应为数组' }, 400);
      }

      const trxProvider = apiClient.database.transactionProvider();
      const trx = await trxProvider();

      for (const setting of settingsData) {
        if (!setting.key) continue;

        // 验证设置是否存在
        const existingSetting = await trx.table('system_settings')
          .where('key', setting.key)
          .first();

        if (!existingSetting) {
          throw new Error(`设置项 ${setting.key} 不存在`);
        }

        // 更新设置
        await trx.table('system_settings')
          .where('key', setting.key)
          .update({
            value: setting.value,
            updated_at: trx.fn.now()
          });
      }

      await trx.commit();

      // 获取所有更新后的设置
      const updatedSettings = await apiClient.database
        .table('system_settings')
        .whereIn('key', settingsData.map(s => s.key))
        .select('*');

      return c.json({
        message: '系统设置已批量更新',
        data: updatedSettings
      });
    } catch (error) {
      log.api('批量更新系统设置失败:', error);
      return c.json({ error: '批量更新系统设置失败' }, 500);
    }
  });

  // 重置系统设置
  settingsRoutes.post('/reset', withAuth, async (c) => {
    try {
      const apiClient = c.get('apiClient');

      // 重置为迁移文件中定义的初始值
      const trxProvider = apiClient.database.transactionProvider();
      const trx = await trxProvider();

      // 清空现有设置
      await trx.table('system_settings').delete();
      
      // 插入默认设置
      await trx.table('system_settings').insert([
        // 基础设置组
        {
          key: 'SITE_NAME',
          value: '应用管理系统',
          description: '站点名称',
          group: 'basic',
          created_at: apiClient.database.fn.now(),
          updated_at: apiClient.database.fn.now()
        },
        {
          key: 'SITE_DESCRIPTION',
          value: '一个强大的应用管理系统',
          description: '站点描述',
          group: 'basic',
          created_at: apiClient.database.fn.now(),
          updated_at: apiClient.database.fn.now()
        },
        {
          key: 'SITE_KEYWORDS',
          value: '应用管理,系统管理,后台管理',
          description: '站点关键词',
          group: 'basic',
          created_at: apiClient.database.fn.now(),
          updated_at: apiClient.database.fn.now()
        },
        // 功能设置组
        {
          key: 'ENABLE_REGISTER',
          value: 'true',
          description: '是否开启注册',
          group: 'feature',
          created_at: apiClient.database.fn.now(),
          updated_at: apiClient.database.fn.now()
        },
        {
          key: 'ENABLE_CAPTCHA',
          value: 'true',
          description: '是否开启验证码',
          group: 'feature',
          created_at: apiClient.database.fn.now(),
          updated_at: apiClient.database.fn.now()
        },
        {
          key: 'LOGIN_ATTEMPTS',
          value: '5',
          description: '登录尝试次数',
          group: 'feature',
          created_at: apiClient.database.fn.now(),
          updated_at: apiClient.database.fn.now()
        },
        // 上传设置组
        {
          key: 'UPLOAD_MAX_SIZE',
          value: '10',
          description: '最大上传大小(MB)',
          group: 'upload',
          created_at: apiClient.database.fn.now(),
          updated_at: apiClient.database.fn.now()
        },
        {
          key: 'ALLOWED_FILE_TYPES',
          value: 'jpg,jpeg,png,gif,doc,docx,xls,xlsx,pdf',
          description: '允许的文件类型',
          group: 'upload',
          created_at: apiClient.database.fn.now(),
          updated_at: apiClient.database.fn.now()
        },
        // 通知设置组
        {
          key: 'NOTIFY_ON_LOGIN',
          value: 'true',
          description: '登录通知',
          group: 'notify',
          created_at: apiClient.database.fn.now(),
          updated_at: apiClient.database.fn.now()
        },
        {
          key: 'NOTIFY_ON_ERROR',
          value: 'true',
          description: '错误通知',
          group: 'notify',
          created_at: apiClient.database.fn.now(),
          updated_at: apiClient.database.fn.now()
        }
      ]);

      await trx.commit();

      const resetSettings = await apiClient.database
        .table('system_settings')
        .select('*');

      return c.json({
        message: '系统设置已重置',
        data: resetSettings
      });
    } catch (error) {
      log.api('重置系统设置失败:', error);
      return c.json({ error: '重置系统设置失败' }, 500);
    }
  });

  return settingsRoutes;
}
