export enum OssType {
  ALIYUN = 'aliyun',
  MINIO = 'minio',
}

// 全局配置常量
export interface GlobalConfig {
  OSS_BASE_URL: string;
  OSS_TYPE: OssType;
  API_BASE_URL: string;
  APP_NAME: string;
  ENV: string;
  DEFAULT_THEME: string;
  MAP_CONFIG: {
    KEY: string;
    VERSION: string;
    PLUGINS: string[];
    MAP_MODE: MapMode;
  };
  CHART_THEME: string;
  ENABLE_THEME_CONFIG: boolean;
  THEME: ThemeSettings | null;
}


// 定义类型
export interface User {
  id: number;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string;
  role: string;
  avatar?: string;
}

export interface MenuItem {
  id: number;
  name: string;
  path: string;
  icon: string;
  component: string;
  parent_id?: number;
  children?: MenuItem[];
}

// 认证上下文类型
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string, latitude?: number, longitude?: number) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// 主题上下文类型
export interface ThemeContextType {
  isDark: boolean;
  currentTheme: ThemeSettings;
  updateTheme: (theme: Partial<ThemeSettings>) => void;  // 实时预览
  saveTheme: (theme: Partial<ThemeSettings>) => Promise<ThemeSettings>;  // 保存到后端
  resetTheme: () => Promise<ThemeSettings>;
  toggleTheme: () => void;  // 切换主题模式
}

// 主题模式枚举
export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark'
}

// 字体大小枚举
export enum FontSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}

// 紧凑模式枚举
export enum CompactMode {
  NORMAL = 0,  // 正常模式
  COMPACT = 1  // 紧凑模式
}

// 主题设置类型
export interface ThemeSettings {
  /** 主键ID */
  id?: number;
  
  /** 用户ID */
  user_id: number;
  
  /** 主题模式(light/dark) */
  theme_mode: ThemeMode;
  
  /** 主题主色 */
  primary_color: string;
  
  /** 背景色 */
  background_color?: string;
  
  /** 文字颜色 */
  text_color?: string;
  
  /** 边框圆角 */
  border_radius?: number;
  
  /** 字体大小(small/medium/large) */
  font_size: FontSize;
  
  /** 是否紧凑模式(0否 1是) */
  is_compact: CompactMode;
  
  /** 创建时间 */
  created_at?: string;
  
  /** 更新时间 */
  updated_at?: string;
}

// 启用/禁用状态枚举
export enum EnableStatus {
  DISABLED = 0, // 禁用
  ENABLED = 1   // 启用
}

// 启用/禁用状态中文映射
export const EnableStatusNameMap: Record<EnableStatus, string> = {
  [EnableStatus.DISABLED]: '禁用',
  [EnableStatus.ENABLED]: '启用'
};

// 删除状态枚举
export enum DeleteStatus {
  NOT_DELETED = 0, // 未删除
  DELETED = 1      // 已删除
}

// 删除状态中文映射
export const DeleteStatusNameMap: Record<DeleteStatus, string> = {
  [DeleteStatus.NOT_DELETED]: '未删除',
  [DeleteStatus.DELETED]: '已删除'
};

// 地图类型
export enum MapMode {
  ONLINE = 'online',
  OFFLINE = 'offline'
}

// 审核状态枚举
export enum AuditStatus {
  PENDING = 0,   // 待审核
  APPROVED = 1,  // 已通过
  REJECTED = 2   // 已拒绝
}

// 审核状态中文映射
export const AuditStatusNameMap: Record<AuditStatus, string> = {
  [AuditStatus.PENDING]: '待审核',
  [AuditStatus.APPROVED]: '已通过',
  [AuditStatus.REJECTED]: '已拒绝'
};

// 图标类型映射
type IconType = 'dashboard' | 'user' | 'setting' | 'team' | 'book' | 'calendar' | 'pie-chart' | 'database';

// 图标类型中文映射
export const IconTypeNameMap: Record<IconType, string> = {
  'dashboard': '仪表盘',
  'user': '用户',
  'setting': '设置',
  'team': '团队',
  'book': '文档',
  'calendar': '日历',
  'pie-chart': '图表',
  'database': '数据库'
};

// 附件类型定义
export interface Attachment {
  /** 附件ID */
  id: string;
  
  /** 附件名称 */
  name: string;
  
  /** 附件访问地址 */
  url: string;
  
  /** 附件类型(如image/jpeg, application/pdf等) */
  type: string;
  
  /** 附件大小(字节) */
  size: number;
  
  /** 上传时间 */
  upload_time: string;
}

// 操作日志表
export interface OperationLog {
  /** 主键ID */
  id: number;
  
  /** 操作人ID */
  operator_id: number;
  
  /** 操作类型 */
  operation_type: string;
  
  /** 操作内容 */
  operation_content?: string;
  
  /** 操作结果 */
  operation_result?: string;
  
  /** 操作IP */
  ip_address?: string;
  
  /** 是否删除 (0否 1是) */
  is_deleted?: number;
  
  /** 创建时间 */
  created_at: Date;
  
  /** 更新时间 */
  updated_at: Date;
}

// 系统设置分组
export enum SystemSettingGroup {
  BASIC = 'basic',           // 基础设置
  FEATURE = 'feature',       // 功能设置
  UPLOAD = 'upload',         // 上传设置
  NOTIFICATION = 'notify'    // 通知设置
}

// 系统设置键
export enum SystemSettingKey {
  // 基础设置
  SITE_NAME = 'SITE_NAME',              // 站点名称
  SITE_DESCRIPTION = 'SITE_DESCRIPTION', // 站点描述
  SITE_KEYWORDS = 'SITE_KEYWORDS',       // 站点关键词
  SITE_LOGO = 'SITE_LOGO',              // 站点LOGO
  SITE_FAVICON = 'SITE_FAVICON',         // 站点图标
  
  // 功能设置
  ENABLE_REGISTER = 'ENABLE_REGISTER',   // 是否开启注册
  ENABLE_CAPTCHA = 'ENABLE_CAPTCHA',     // 是否开启验证码
  LOGIN_ATTEMPTS = 'LOGIN_ATTEMPTS',     // 登录尝试次数
  SESSION_TIMEOUT = 'SESSION_TIMEOUT',   // 会话超时时间(分钟)
  
  // 上传设置
  UPLOAD_MAX_SIZE = 'UPLOAD_MAX_SIZE',   // 最大上传大小(MB)
  ALLOWED_FILE_TYPES = 'ALLOWED_FILE_TYPES', // 允许的文件类型
  IMAGE_COMPRESS = 'IMAGE_COMPRESS',     // 是否压缩图片
  IMAGE_MAX_WIDTH = 'IMAGE_MAX_WIDTH',   // 图片最大宽度
  
  // 通知设置
  NOTIFY_ON_LOGIN = 'NOTIFY_ON_LOGIN',   // 登录通知
  NOTIFY_ON_UPLOAD = 'NOTIFY_ON_UPLOAD', // 上传通知
  NOTIFY_ON_ERROR = 'NOTIFY_ON_ERROR',   // 错误通知

  // 主题设置
  ENABLE_THEME_CONFIG = 'ENABLE_THEME_CONFIG' // 是否开启主题配置
}

export type SystemSettingGroupType = SystemSettingGroup;
export type SystemSettingKeyType = SystemSettingKey;

// 系统设置值类型
export type SystemSettingValue = string | number | boolean;

// 系统设置项接口
export interface SystemSetting {
  id: number;
  key: SystemSettingKeyType;         // 设置键
  value: SystemSettingValue;     // 设置值
  description?: string;          // 设置描述
  group: SystemSettingGroupType;     // 设置分组
  created_at?: string;
  updated_at?: string;
}

// 系统设置分组类型
export interface SystemSettingGroupData {
  name: string;
  description: string;
  settings: SystemSetting[];
}

// 系统设置记录类型
export type SystemSettingRecord = Record<SystemSettingKey, SystemSettingValue>;

// 允许的文件类型枚举
export enum AllowedFileType {
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
  GIF = 'gif',
  DOC = 'doc',
  DOCX = 'docx',
  XLS = 'xls',
  XLSX = 'xlsx',
  PDF = 'pdf'
}

// 允许的文件类型列表（用于系统设置）
export const ALLOWED_FILE_TYPES = Object.values(AllowedFileType).join(',');

// 文件库接口
export interface FileLibrary {
  /** 主键ID */
  id: number;
  
  /** 文件名称 */
  file_name: string;
  
  /** 原始文件名 */
  original_filename?: string;
  
  /** 文件路径 */
  file_path: string;
  
  /** 文件类型 */
  file_type: string;
  
  /** 文件大小(字节) */
  file_size: number;
  
  /** 上传用户ID */
  uploader_id?: number;
  
  /** 上传者名称 */
  uploader_name?: string;
  
  /** 文件分类 */
  category_id?: number;
  
  /** 文件标签 */
  tags?: string;
  
  /** 文件描述 */
  description?: string;
  
  /** 下载次数 */
  download_count: number;
  
  /** 是否禁用 (0否 1是) */
  is_disabled?: EnableStatus;
  
  /** 是否被删除 (0否 1是) */
  is_deleted?: DeleteStatus;
  
  /** 创建时间 */
  created_at: string;
  
  /** 更新时间 */
  updated_at: string;
}

// 文件分类接口
export interface FileCategory {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_deleted?: DeleteStatus;
  created_at: string;
  updated_at: string;
} 


// 知识库表
export interface KnowInfo {
  /** 主键ID */
  id: number;
  
  /** 文章的标题 */
  title?: string;
  
  /** 文章的标签 */
  tags?: string;
  
  /** 文章的内容 */
  content?: string;
  
  /** 文章的作者 */
  author?: string;
  
  /** 文章的分类 */
  category?: string;
  
  /** 文章的封面图片URL */
  cover_url?: string;
  
  /** 审核状态 */
  audit_status?: number;
  
  /** 是否被删除 (0否 1是) */
  is_deleted?: number;
  
  /** 创建时间 */
  created_at: Date;
  
  /** 更新时间 */
  updated_at: Date;
}

// 登录位置详细信息
export interface LoginLocationDetail {
  /** 记录ID */
  id: number;
  /** 用户ID */
  user_id: number;
  /** 登录时间 */
  login_time: string;
  /** IP地址 */
  ip_address: string;
  /** 用户代理 */
  user_agent: string;
  /** 纬度 */
  latitude: number | null;
  /** 经度 */
  longitude: number | null;
  /** 位置名称 */
  location_name?: string;
  /** 关联用户信息 */
  user?: {
    id: number;
    username: string;
    nickname?: string;
  };
}

// 登录位置信息
export interface LoginLocation {
  /** 纬度 */
  latitude: number | null;
  /** 经度 */
  longitude: number | null;
  /** IP地址 */
  ip_address?: string;
  /** 用户代理 */
  user_agent?: string;
  /** 登录时间 */
  login_time?: string;
}
