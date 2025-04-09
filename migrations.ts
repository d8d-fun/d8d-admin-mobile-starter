import type { MigrationLiveDefinition } from '@d8d-appcontainer/types'

import {
  DeviceCategory, DeviceStatus, AlertLevel, AlertStatus, EnableStatus, DeleteStatus,
  HandleType, ProblemType, NotifyType, ServerType, AssetTransferType, AuditStatus,
  DeviceProtocolType, MetricType, ThemeMode, FontSize, CompactMode,

  AssetStatus, NetworkStatus, PacketLossStatus,
  ZichanArea, ZichanCategory, DeviceType, DeviceInstance, RackInfo, RackServerType, RackServer, ZichanTransLog, DeviceAlertRule,
  ZichanInfo, AlertNotifyConfig, KnowInfo,
  SystemSettingKey,
  SystemSettingGroup,
  ALLOWED_FILE_TYPES,
} from './asset/share/types.ts';

// 定义用户表迁移
const createUsersTable: MigrationLiveDefinition = {
  name: "create_users_table",
  up: async (api) => {
    await api.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('username').unique().notNullable();
      table.string('password').notNullable();
      table.string('phone').unique();
      table.string('email').unique();
      table.string('nickname');
      table.string('name');
      table.integer('is_disabled').defaultTo(0);
      table.integer('is_deleted').defaultTo(0);
      table.timestamps(true, true);
      
      // 添加索引
      table.index('username');
      table.index('is_disabled');
      table.index('is_deleted');
    });
  },
  down: async (api) => {
    await api.schema.dropTable('users');
  }
}

// 定义登录历史表迁移
const createLoginHistoryTable: MigrationLiveDefinition = {
  name: "create_login_history_table",
  up: async (api) => {
    await api.schema.createTable('login_history', (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.timestamp('login_time').defaultTo(api.fn.now())
      table.string('ip_address')
      table.text('user_agent')
      table.decimal('longitude', 10, 6).nullable()  // 经度
      table.decimal('latitude', 10, 6).nullable()   // 纬度
      table.string('location_name').nullable()      // 地点名称
      
      // 添加索引
      table.index('user_id');
      table.index('login_time');
      // table.index(['longitude', 'latitude']);
    })
  },
  down: async (api) => {
    await api.schema.dropTable('login_history')
  }
}

// 定义知识库文章表迁移
const createKnowInfoTable: MigrationLiveDefinition = {
  name: "create_know_info_table",
  up: async (api) => {
    await api.schema.createTable('know_info', (table) => {
      table.increments('id').primary();
      table.string('title').comment('文章标题');
      table.string('tags').comment('文章标签');
      table.text('content').comment('文章内容');
      table.string('author').comment('作者');
      table.string('category').comment('分类');
      table.string('cover_url').comment('封面图片URL');
      table.integer('audit_status').defaultTo(AuditStatus.PENDING).comment('审核状态');
      table.integer('is_deleted').defaultTo(0).comment('是否被删除 (0否 1是)');
      table.timestamps(true, true);
      
      // 添加索引
      table.index('title');
      table.index('tags');
      table.index('author');
      table.index('category');
      table.index('audit_status');
      table.index('is_deleted');
    });
  },
  down: async (api) => {
    await api.schema.dropTable('know_info');
  }
};

// 定义文件分类表迁移
const createFileCategoryTable: MigrationLiveDefinition = {
  name: "create_file_category_table",
  up: async (api) => {
    await api.schema.createTable('file_categories', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable().comment('分类名称');
      table.string('code').notNullable().unique().comment('分类编码');
      table.text('description').comment('分类描述');
      table.integer('is_deleted').defaultTo(DeleteStatus.NOT_DELETED).comment('是否被删除 (0否 1是)');
      table.timestamps(true, true);
      
      // 添加索引
      table.index('name');
      table.index('code');
      table.index('is_deleted');
    });
  },
  down: async (api) => {
    await api.schema.dropTable('file_categories');
  }
};

// 定义文件库表迁移
const createFileLibraryTable: MigrationLiveDefinition = {
  name: "create_file_library_table",
  up: async (api) => {
    await api.schema.createTable('file_library', (table) => {
      table.increments('id').primary();
      table.string('file_name').notNullable().comment('文件名称');
      table.string('original_filename').comment('原始文件名');
      table.string('file_path').notNullable().comment('文件路径');
      table.string('file_type').comment('文件类型');
      table.integer('file_size').unsigned().comment('文件大小(字节)');
      table.integer('uploader_id').unsigned().references('id').inTable('users').onDelete('SET NULL').comment('上传用户ID');
      table.string('uploader_name').comment('上传者名称');
      table.integer('category_id').unsigned().references('id').inTable('file_categories').onDelete('SET NULL').comment('文件分类');
      table.string('tags').comment('文件标签');
      table.text('description').comment('文件描述');
      table.integer('download_count').defaultTo(0).comment('下载次数');
      table.integer('is_disabled').defaultTo(EnableStatus.DISABLED).comment('是否禁用 (0否 1是)');
      table.integer('is_deleted').defaultTo(DeleteStatus.NOT_DELETED).comment('是否被删除 (0否 1是)');
      table.timestamps(true, true);
      
      // 添加索引
      table.index('file_name');
      table.index('file_type');
      table.index('category_id');
      table.index('uploader_id');
      table.index('is_deleted');
    });
  },
  down: async (api) => {
    await api.schema.dropTable('file_library');
  }
};

// 定义主题设置表迁移
const createThemeSettingsTable: MigrationLiveDefinition = {
  name: "create_theme_settings_table",
  up: async (api) => {
    await api.schema.createTable('theme_settings', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.jsonb('settings').comment('主题设置');
      table.timestamps(true, true);
      
      // 添加索引
      table.index('user_id');
    });
  },
  down: async (api) => {
    await api.schema.dropTable('theme_settings');
  }
};

// 定义系统设置表迁移
const createSystemSettingsTable: MigrationLiveDefinition = {
  name: "create_system_settings_table",
  up: async (api) => {
    await api.schema.createTable('system_settings', (table) => {
      table.increments('id').primary();
      table.string('key').notNullable().unique().comment('设置键');
      table.text('value').notNullable().comment('设置值');
      table.string('description').nullable().comment('设置描述');
      table.string('group').notNullable().comment('设置分组');
      table.timestamps(true, true);
      
      // 添加索引
      table.index('key');
      table.index('group');
    });
  },
  down: async (api) => {
    await api.schema.dropTable('system_settings');
  }
};

// 初始测试数据迁移
const seedInitialData: MigrationLiveDefinition = {
  name: "seed_initial_data",
  up: async (api) => {
    // 1. 添加默认用户
    const defaultUser = {
      username: 'admin',
      password: 'admin123', // 实际应用中应使用加密后的密码
      email: 'admin@example.com',
      nickname: '系统管理员',
      name: '管理员',
      is_disabled: EnableStatus.ENABLED,
      is_deleted: DeleteStatus.NOT_DELETED
    };
    
    const [userId] = await api.table('users').insert(defaultUser);
    
    // 2. 添加默认主题设置
    await api.table('theme_settings').insert({
      user_id: userId,
      settings: {
        theme_mode: ThemeMode.LIGHT,
        primary_color: '#1890ff',
        font_size: FontSize.MEDIUM,
        is_compact: CompactMode.NORMAL
      },
      created_at: api.fn.now(),
      updated_at: api.fn.now()
    });
    
    // 3. 添加知识库文章示例
    await api.table('know_info').insert([
      {
        title: '欢迎使用应用Starter',
        tags: 'starter,指南',
        content: '# 欢迎使用应用Starter\n\n这是一个基础的应用Starter，提供了用户认证、文件管理、知识库、主题管理等功能。\n\n## 主要功能\n\n- 用户认证与管理\n- 文件上传与管理\n- 知识库文章管理\n- 主题设置（暗黑模式/明亮模式）\n- 图表数据统计\n- 地图集成\n\n更多功能请参考文档...',
        author: '系统管理员',
        category: '使用指南',
        audit_status: AuditStatus.APPROVED,
        is_deleted: DeleteStatus.NOT_DELETED
      },
      {
        title: '如何使用文件管理',
        tags: '文件,上传,管理',
        content: '# 文件管理使用指南\n\n文件管理模块可以帮助您上传、分类和管理各种文件。\n\n## 上传文件\n\n1. 点击"上传文件"按钮\n2. 选择要上传的文件\n3. 填写文件信息（分类、标签等）\n4. 点击"确定"完成上传\n\n## 文件分类\n\n您可以创建自定义的文件分类，方便管理不同类型的文件...',
        author: '系统管理员',
        category: '使用指南',
        audit_status: AuditStatus.APPROVED,
        is_deleted: DeleteStatus.NOT_DELETED
      },
      {
        title: '主题设置指南',
        tags: '主题,设置,外观',
        content: '# 主题设置指南\n\n主题设置允许您自定义应用的外观和感觉，包括颜色模式、字体大小等。\n\n## 颜色模式\n\n您可以选择明亮模式或暗黑模式，适应不同的工作环境和个人偏好。\n\n## 主题颜色\n\n可以选择主题的主色调，系统会根据选择自动生成配色方案。\n\n## 字体大小\n\n提供小、中、大三种字体大小选项，满足不同用户的阅读需求。',
        author: '系统管理员',
        category: '使用指南',
        audit_status: AuditStatus.APPROVED,
        is_deleted: DeleteStatus.NOT_DELETED
      },
      {
        title: '数据分析功能介绍',
        tags: '分析,图表,数据',
        content: '# 数据分析功能介绍\n\n数据分析模块提供了多种图表和可视化工具，帮助您理解和分析数据。\n\n## 图表类型\n\n支持柱状图、折线图、饼图等多种图表类型，适用于不同的数据展示需求。\n\n## 数据筛选\n\n可以根据时间范围、数据类型等条件筛选数据，获得更精确的分析结果。',
        author: '系统管理员',
        category: '使用指南',
        audit_status: AuditStatus.APPROVED,
        is_deleted: DeleteStatus.NOT_DELETED
      }
    ]);
    
    // 4. 添加文件分类示例
    await api.table('file_categories').insert([
      {
        name: '文档',
        code: 'doc',
        description: '各类文档文件',
        is_deleted: DeleteStatus.NOT_DELETED
      },
      {
        name: '图片',
        code: 'image',
        description: '各类图片文件',
        is_deleted: DeleteStatus.NOT_DELETED
      },
      {
        name: '视频',
        code: 'video',
        description: '各类视频文件',
        is_deleted: DeleteStatus.NOT_DELETED
      },
      {
        name: '音频',
        code: 'audio',
        description: '各类音频文件',
        is_deleted: DeleteStatus.NOT_DELETED
      },
      {
        name: '其他',
        code: 'other',
        description: '其他类型文件',
        is_deleted: DeleteStatus.NOT_DELETED
      }
    ]);

    // 5. 添加系统设置示例
    await api.table('system_settings').insert([
      {
        key: SystemSettingKey.SITE_NAME,
        value: '应用管理系统',
        description: '站点名称',
        group: SystemSettingGroup.BASIC
      },
      {
        key: SystemSettingKey.SITE_DESCRIPTION,
        value: '一个功能完善的应用管理系统',
        description: '站点描述',
        group: SystemSettingGroup.BASIC
      },
      {
        key: SystemSettingKey.SITE_KEYWORDS,
        value: '应用,管理,系统',
        description: '站点关键词',
        group: SystemSettingGroup.BASIC
      },
      {
        key: SystemSettingKey.ENABLE_REGISTER,
        value: true,
        description: '是否开启注册功能',
        group: SystemSettingGroup.FEATURE
      },
      {
        key: SystemSettingKey.ENABLE_CAPTCHA,
        value: true,
        description: '是否开启验证码',
        group: SystemSettingGroup.FEATURE
      },
      {
        key: SystemSettingKey.LOGIN_ATTEMPTS,
        value: 5,
        description: '允许的登录尝试次数',
        group: SystemSettingGroup.FEATURE
      },
      {
        key: SystemSettingKey.SESSION_TIMEOUT,
        value: 120,
        description: '会话超时时间(分钟)',
        group: SystemSettingGroup.FEATURE
      },
      {
        key: SystemSettingKey.UPLOAD_MAX_SIZE,
        value: 10,
        description: '最大上传大小(MB)',
        group: SystemSettingGroup.UPLOAD
      },
      {
        key: SystemSettingKey.ALLOWED_FILE_TYPES,
        value: ALLOWED_FILE_TYPES,
        description: '允许上传的文件类型',
        group: SystemSettingGroup.UPLOAD
      },
      {
        key: SystemSettingKey.IMAGE_COMPRESS,
        value: true,
        description: '是否压缩图片',
        group: SystemSettingGroup.UPLOAD
      },
      {
        key: SystemSettingKey.IMAGE_MAX_WIDTH,
        value: 1920,
        description: '图片最大宽度',
        group: SystemSettingGroup.UPLOAD
      },
      {
        key: SystemSettingKey.NOTIFY_ON_LOGIN,
        value: true,
        description: '是否开启登录通知',
        group: SystemSettingGroup.NOTIFICATION
      },
      {
        key: SystemSettingKey.NOTIFY_ON_UPLOAD,
        value: true,
        description: '是否开启上传通知',
        group: SystemSettingGroup.NOTIFICATION
      },
      {
        key: SystemSettingKey.NOTIFY_ON_ERROR,
        value: true,
        description: '是否开启错误通知',
        group: SystemSettingGroup.NOTIFICATION
      }
    ]);
  },
  down: async (api) => {
    // 删除初始数据
    await api.table('login_history').where('user_id', 1).delete();
    await api.table('theme_settings').where('user_id', 1).delete();
    await api.table('know_info').delete();
    await api.table('file_categories').delete();
    await api.table('users').where('username', 'admin').delete();
  }
};

// 导出所有迁移
export const migrations = [
  createUsersTable,
  createLoginHistoryTable,
  createKnowInfoTable,
  createFileCategoryTable,
  createFileLibraryTable,
  createThemeSettingsTable,
  createSystemSettingsTable,
  seedInitialData
];