
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
  login: (username: string, password: string) => Promise<void>;
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

// 设备通信协议类型枚举
export enum DeviceProtocolType {
  SNMP = 'SNMP',       // 简单网络管理协议(网络设备管理)
  HTTP = 'HTTP',       // 超文本传输协议(Web服务)
  MODBUS = 'MODBUS',   // Modbus协议(工业自动化标准通信协议)
  MQTT = 'MQTT',       // 消息队列遥测传输(物联网消息协议)
  SOCKET = 'SOCKET',   // Socket通信(基础网络通信)
  OPC = 'OPC',         // OPC统一架构(工业设备互操作性标准)
  RS485 = 'RS485',     // RS485串行通信(工业现场总线)
  TCP = 'TCP'          // TCP网络协议(可靠的网络传输协议)
}

// 设备通信协议类型中文映射
export const DeviceProtocolTypeNameMap: Record<DeviceProtocolType, string> = {
  [DeviceProtocolType.SNMP]: 'SNMP',
  [DeviceProtocolType.HTTP]: 'HTTP',
  [DeviceProtocolType.MODBUS]: 'MODBUS',  
  [DeviceProtocolType.MQTT]: 'MQTT',
  [DeviceProtocolType.SOCKET]: 'SOCKET',
  [DeviceProtocolType.OPC]: 'OPC',
  [DeviceProtocolType.RS485]: 'RS485',
  [DeviceProtocolType.TCP]: 'TCP'
};

// 统一的监控指标类型枚举
export enum MetricType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  VOLTAGE = 'voltage',
  CPU_USAGE = 'cpu_usage',
  MEMORY_USAGE = 'memory_usage',
  DISK_USAGE = 'disk_usage',
  NETWORK_TRAFFIC = 'network_traffic',
  PING_TIME = 'ping_time',
  PACKET_LOSS = 'packet_loss',
  SNMP_RESPONSE_TIME = 'snmp_response_time',
  SNMP_ERRORS = 'snmp_errors',
  HTTP_RESPONSE_TIME = 'http_response_time',
  HTTP_STATUS = 'http_status',
  TCP_CONNECTION_TIME = 'tcp_connection_time',
  CONNECTION_STATUS = 'connection_status'
}

// 监控类型中文映射
export const MetricTypeNameMap: Record<MetricType, string> = {
  [MetricType.TEMPERATURE]: '温度',
  [MetricType.HUMIDITY]: '湿度',
  [MetricType.VOLTAGE]: '电压',
  [MetricType.CPU_USAGE]: 'CPU使用率',
  [MetricType.MEMORY_USAGE]: '内存使用率',
  [MetricType.DISK_USAGE]: '磁盘使用率',
  [MetricType.NETWORK_TRAFFIC]: '网络流量',
  [MetricType.PING_TIME]: 'Ping时间',
  [MetricType.PACKET_LOSS]: '丢包率',
  [MetricType.SNMP_RESPONSE_TIME]: 'SNMP响应时间',
  [MetricType.SNMP_ERRORS]: 'SNMP错误数',
  [MetricType.HTTP_RESPONSE_TIME]: 'HTTP响应时间',
  [MetricType.HTTP_STATUS]: 'HTTP状态码',
  [MetricType.TCP_CONNECTION_TIME]: 'TCP连接时间',
  [MetricType.CONNECTION_STATUS]: '连接状态'
};

// 处理类型枚举
export enum HandleType {
  CONFIRM = 'confirm',
  RESOLVE = 'resolve',
  IGNORE = 'ignore'
}

// 处理类型中文映射
export const HandleTypeNameMap: Record<HandleType, string> = {
  [HandleType.CONFIRM]: '确认',
  [HandleType.RESOLVE]: '解决',
  [HandleType.IGNORE]: '忽略'
};

// 问题类型枚举
export enum ProblemType {
  DEVICE = 'device',
  NETWORK = 'network',
  POWER = 'power',
  CONSTRUCTION = 'construction',
  OTHER = 'other'
}

// 问题类型中文映射
export const ProblemTypeNameMap: Record<ProblemType, string> = {
  [ProblemType.DEVICE]: '设备故障',
  [ProblemType.NETWORK]: '网络故障',
  [ProblemType.POWER]: '电源故障',
  [ProblemType.CONSTRUCTION]: '施工影响',
  [ProblemType.OTHER]: '其他原因'
};

// 通知类型枚举
export enum NotifyType {
  SMS = 'sms',
  EMAIL = 'email',
  WECHAT = 'wechat'
}

// 通知类型中文映射
export const NotifyTypeNameMap: Record<NotifyType, string> = {
  [NotifyType.SMS]: '短信',
  [NotifyType.EMAIL]: '邮件',
  [NotifyType.WECHAT]: '微信'
};

// 告警等级枚举
export enum AlertLevel {
  MINOR = 0,    // 次要
  NORMAL = 1,   // 一般
  IMPORTANT = 2, // 重要
  URGENT = 3     // 紧急
}

// 告警等级中文映射
export const AlertLevelNameMap: Record<AlertLevel, string> = {
  [AlertLevel.MINOR]: '次要',
  [AlertLevel.NORMAL]: '一般',
  [AlertLevel.IMPORTANT]: '重要',
  [AlertLevel.URGENT]: '紧急'
};

// 告警等级颜色映射
export const AlertLevelColorMap: Record<AlertLevel, string> = {
  [AlertLevel.MINOR]: 'blue',
  [AlertLevel.NORMAL]: 'orange',
  [AlertLevel.IMPORTANT]: 'red',
  [AlertLevel.URGENT]: 'purple'
};

// 设备状态枚举（资产管理）
export enum DeviceStatus {
  NORMAL = 0,   // 正常
  MAINTAIN = 1, // 维护中
  FAULT = 2,    // 故障
  OFFLINE = 3   // 下线
}

// 设备分类枚举
export enum DeviceCategory {
  SERVER = 1,      // 服务器
  NETWORK = 2,     // 网络设备
  STORAGE = 3,     // 存储设备
  SECURITY = 4,    // 安全设备
  OTHER = 5        // 其他设备
}

// 区域枚举
export enum AreaType {
  AREA_A = 1,      // A区
  AREA_B = 2,      // B区
  AREA_C = 3,      // C区
  AREA_OTHER = 4   // 其他区域
}

// 资产状态枚举
export enum AssetStatus {
  IN_USE = 0,     // 使用中
  IDLE = 1,       // 闲置
  REPAIR = 2,     // 维修中
  SCRAPPED = 3    // 已报废
}

// 网络状态枚举
export enum NetworkStatus {
  CONNECTED = 0,    // 已连接
  DISCONNECTED = 1, // 已断开
  UNSTABLE = 2      // 不稳定
}

// 丢包状态枚举
export enum PacketLossStatus {
  NORMAL = 0,      // 正常
  HIGH = 1         // 丢包
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

// 设备状态中文映射（资产管理）
export const DeviceStatusNameMap: Record<DeviceStatus, string> = {
  [DeviceStatus.NORMAL]: '正常',
  [DeviceStatus.MAINTAIN]: '维护中',
  [DeviceStatus.FAULT]: '故障',
  [DeviceStatus.OFFLINE]: '下线'
};

// 设备状态颜色映射（资产管理）
export const DeviceStatusColorMap: Record<DeviceStatus, string> = {
  [DeviceStatus.NORMAL]: 'green',
  [DeviceStatus.MAINTAIN]: 'blue',
  [DeviceStatus.FAULT]: 'red',
  [DeviceStatus.OFFLINE]: 'gray'
};

// 设备分类中文映射
export const DeviceCategoryNameMap: Record<DeviceCategory, string> = {
  [DeviceCategory.SERVER]: '服务器',
  [DeviceCategory.NETWORK]: '网络设备',
  [DeviceCategory.STORAGE]: '存储设备',
  [DeviceCategory.SECURITY]: '安全设备',
  [DeviceCategory.OTHER]: '其他设备'
};

// 告警状态枚举
export enum AlertStatus {
  PENDING = 'pending',
  HANDLING = 'handling',
  RESOLVED = 'resolved',
  IGNORED = 'ignored'
}

// 告警状态中文映射
export const AlertStatusNameMap: Record<AlertStatus, string> = {
  [AlertStatus.PENDING]: '待处理',
  [AlertStatus.HANDLING]: '处理中',
  [AlertStatus.RESOLVED]: '已解决',
  [AlertStatus.IGNORED]: '已忽略'
};

// 告警状态颜色映射
export const AlertStatusColorMap: Record<AlertStatus, string> = {
  [AlertStatus.PENDING]: 'red',
  [AlertStatus.HANDLING]: 'blue',
  [AlertStatus.RESOLVED]: 'green',
  [AlertStatus.IGNORED]: 'gray'
};

// 设备在线状态枚举
export enum OnlineStatus {
  ONLINE = 'online',
  OFFLINE = 'offline'
}

// 设备在线状态中文映射
export const OnlineStatusNameMap: Record<OnlineStatus, string> = {
  [OnlineStatus.ONLINE]: '在线',
  [OnlineStatus.OFFLINE]: '离线'
};

// 设备在线状态颜色映射
export const OnlineStatusColorMap: Record<OnlineStatus, string> = {
  [OnlineStatus.ONLINE]: 'green',
  [OnlineStatus.OFFLINE]: 'red'
};

// 工单状态枚举
export enum WorkOrderStatus {
  PENDING = 0,   // 待处理
  HANDLING = 1,  // 处理中
  AUDITING = 2,  // 待审核
  COMPLETED = 3, // 已完成
  CLOSED = 4     // 已关闭
}

// 工单状态中文映射
export const WorkOrderStatusNameMap: Record<WorkOrderStatus, string> = {
  [WorkOrderStatus.PENDING]: '待处理',
  [WorkOrderStatus.HANDLING]: '处理中',
  [WorkOrderStatus.AUDITING]: '待审核',
  [WorkOrderStatus.COMPLETED]: '已完成',
  [WorkOrderStatus.CLOSED]: '已关闭'
};

// 工单状态颜色映射
export const WorkOrderStatusColorMap: Record<WorkOrderStatus, string> = {
  [WorkOrderStatus.PENDING]: 'orange',
  [WorkOrderStatus.HANDLING]: 'blue',
  [WorkOrderStatus.AUDITING]: 'gold',
  [WorkOrderStatus.COMPLETED]: 'green',
  [WorkOrderStatus.CLOSED]: 'gray'
};

// 工单优先级枚举
export enum WorkOrderPriority {
  NORMAL = 0,    // 普通
  IMPORTANT = 1, // 重要
  URGENT = 2     // 紧急
}

// 工单优先级中文映射
export const WorkOrderPriorityNameMap: Record<WorkOrderPriority, string> = {
  [WorkOrderPriority.NORMAL]: '普通',
  [WorkOrderPriority.IMPORTANT]: '重要',
  [WorkOrderPriority.URGENT]: '紧急'
};

// 工单优先级颜色映射
export const WorkOrderPriorityColorMap: Record<WorkOrderPriority, string> = {
  [WorkOrderPriority.NORMAL]: 'green',
  [WorkOrderPriority.IMPORTANT]: 'orange',
  [WorkOrderPriority.URGENT]: 'red'
};

// 工单操作类型枚举
export enum WorkOrderAction {
  CREATE = 'create',
  ACCEPT = 'accept',
  HANDLE = 'handle',
  AUDIT = 'audit',
  CLOSE = 'close'
}

// 工单操作类型中文映射
export const WorkOrderActionNameMap: Record<WorkOrderAction, string> = {
  [WorkOrderAction.CREATE]: '创建',
  [WorkOrderAction.ACCEPT]: '接受',
  [WorkOrderAction.HANDLE]: '处理',
  [WorkOrderAction.AUDIT]: '审核',
  [WorkOrderAction.CLOSE]: '关闭'
};

// 服务器类型枚举
export enum ServerType {
  STANDARD = 'standard',
  NETWORK = 'network',
  STORAGE = 'storage',
  SPECIAL = 'special'
}

// 服务器类型中文映射
export const ServerTypeNameMap: Record<ServerType, string> = {
  [ServerType.STANDARD]: '标准服务器',
  [ServerType.NETWORK]: '网络设备',
  [ServerType.STORAGE]: '存储设备',
  [ServerType.SPECIAL]: '特殊设备'
};



// 图表类型映射
export const AlertTypeMap = {
  temperature: { text: '温度异常', color: 'orange' },
  humidity: { text: '湿度异常', color: 'blue' },
  offline: { text: '设备离线', color: 'red' }
} as const;

// 工单状态映射
export const StatusMap = {
  unread: { text: '未读', color: 'red' },
  read: { text: '已读', color: 'blue' },
  processed: { text: '已处理', color: 'green' }
} as const;

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

// 定义JSON数据结构接口

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

// 通知项配置类型定义
interface NotifyItem {
  /** 通知项ID */
  id: string;
  
  /** 通知项类型 */
  type: string;
  
  /** 是否启用 */
  enabled: boolean;
  
  /** 通知配置参数 */
  config: Record<string, unknown>;
}

// 监控配置类型定义
export interface MonitorConfig {
  /** 监控间隔(秒) */
  interval: number;
  
  /** 监控指标列表 */
  metrics: Array<{
    /** 指标名称 */
    name: string;
    
    /** 指标类型 */
    type: string;
    
    /** 是否启用 */
    enabled: boolean;
    
    /** 阈值设置 */
    threshold?: {
      /** 最小阈值 */
      min?: number;
      
      /** 最大阈值 */
      max?: number;
    };
  }>;
  
  /** 通知设置 */
  notification: {
    /** 是否启用通知 */
    enabled: boolean;
    
    /** 通知渠道列表 */
    channels: string[];
  };
}

// 告警规则类型定义
export interface AlertRuleConfig {
  /** 规则列表 */
  rules: Array<{
    /** 监控指标 */
    metric: string;
    
    /** 触发条件(如>、<、=等) */
    condition: string;
    
    /** 阈值 */
    threshold: number;
    
    /** 持续时间(秒) */
    duration: number;
    
    /** 告警等级 */
    level: AlertLevel;
  }>;
  
  /** 动作列表 */
  actions: Array<{
    /** 动作类型 */
    type: string;
    
    /** 动作目标 */
    target: string;
    
    /** 通知模板 */
    template?: string;
  }>;
}

// 数据格式配置类型定义
export interface DataSchema {
  /** 版本号 */
  version: string;
  
  /** 属性定义 */
  properties: Record<string, {
    /** 数据类型 */
    type: string;
    
    /** 描述 */
    description?: string;
    
    /** 是否必填 */
    required?: boolean;
    
    /** 格式(如日期格式) */
    format?: string;
    
    /** 枚举值列表 */
    enum?: string[];
  }>;
  
  /** 必填字段列表 */
  required: string[];
}

// 图标配置类型定义
export interface IconConfig {
  /** 图标尺寸 */
  size: {
    /** 宽度 */
    width: number;
    
    /** 高度 */
    height: number;
  };
  
  /** 支持的文件格式 */
  format: string[];
  
  /** 最大文件大小(KB) */
  maxSize: number;
}

// 告警等级配置类型定义
export interface AlertLevelConfig {
  /** 等级定义 */
  levels: Record<string, {
    /** 等级名称 */
    name: string;
    
    /** 等级颜色 */
    color: string;
    
    /** 优先级 */
    priority: number;
    
    /** 是否自动升级 */
    autoEscalation?: boolean;
    
    /** 升级延迟时间(分钟) */
    escalationDelay?: number;
  }>;
  
  /** 默认等级 */
  default: string;
}

// 监控项配置类型定义
export interface MonitorItemConfig {
  /** 监控项列表 */
  items: Array<{
    /** 监控项名称 */
    name: string;
    
    /** 描述 */
    description: string;
    
    /** 监控项类型 */
    type: string;
    
    /** 单位 */
    unit: string;
    
    /** 默认是否启用 */
    defaultEnabled: boolean;
    
    /** 默认阈值 */
    defaultThresholds?: {
      /** 最小阈值 */
      min?: number;
      
      /** 最大阈值 */
      max?: number;
    };
  }>;
}

// 常用语列表类型定义
export interface CommonPhrase {
  /** 常用语ID */
  id: string;
  
  /** 分类 */
  category: string;
  
  /** 内容 */
  content: string;
  
  /** 标签列表 */
  tags: string[];
}

// SLA配置类型定义
export interface SLAConfig {
  /** 响应时间(分钟) */
  responseTime: number;
  
  /** 解决时间(分钟) */
  resolveTime: number;
  
  /** 工作时间 */
  workingHours: {
    /** 开始时间(HH:mm) */
    start: string;
    
    /** 结束时间(HH:mm) */
    end: string;
    
    /** 工作日(0-6,0代表周日) */
    workDays: number[];
  };
  
  /** 升级规则 */
  escalationRules: Array<{
    /** 超时时间(分钟) */
    timeout: number;
    
    /** 动作 */
    action: string;
    
    /** 目标(如用户ID、角色等) */
    target: string[];
  }>;
}

// 流程配置类型定义
export interface WorkflowConfig {
  /** 流程步骤 */
  steps: Array<{
    /** 步骤名称 */
    name: string;
    
    /** 允许操作的角色 */
    roles: string[];
    
    /** 可执行的动作 */
    actions: string[];
    
    /** 下一步可能的步骤 */
    nextSteps: string[];
    
    /** 自动超时时间(分钟) */
    autoTimeout?: number;
  }>;
  
  /** 初始步骤 */
  initialStep: string;
}

// 告警处理记录表
export interface AlertHandleLog {
  /** 主键ID */
  id: number;
  
  /** 关联的告警ID */
  alert_id: number;
  
  /** 处理人ID */
  handler_id: number;
  
  /** 处理类型 */
  handle_type: HandleType;
  
  /** 问题类型 */
  problem_type: ProblemType;
  
  /** 处理结果 */
  handle_result?: string;
  
  /** 附件列表 */
  attachments?: Attachment[];
  
  /** 是否禁用通知 (0否 1是) */
  notify_disabled?: number;
  
  /** 禁用的通知项配置 */
  notify_items?: NotifyItem[];
  
  /** 处理时间 */
  handle_time: Date;
  
  /** 是否删除 (0否 1是) */
  is_deleted?: DeleteStatus;
  
  /** 创建时间 */
  created_at: Date;
  
  /** 更新时间 */
  updated_at: Date;
}

// 告警通知配置表
export interface AlertNotifyConfig {
  /** 主键ID */
  id: number;
  
  /** 关联的设备ID */
  device_id: number;
  
  /** 告警等级 */
  alert_level: AlertLevel;
  
  /** 通知类型 */
  notify_type: NotifyType;
  
  /** 通知模板 */
  notify_template?: string;
  
  /** 通知用户ID列表 */
  notify_users?: number[];
  
  /** 是否启用 (0否 1是) */
  is_enabled?: EnableStatus;
  
  /** 是否删除 (0否 1是) */
  is_deleted?: DeleteStatus;
  
  /** 创建时间 */
  created_at: Date;
  
  /** 更新时间 */
  updated_at: Date;
}

// 设备告警规则表
export interface DeviceAlertRule {
  /** 主键ID */
  id: number;
  
  /** 关联的设备ID */
  device_id: number;
  
  /** 监控指标类型 */
  metric_type: string;
  
  /** 最小阈值 */
  min_value?: number;
  
  /** 最大阈值 */
  max_value?: number;
  
  /** 持续时间(秒) */
  duration_seconds?: number;
  
  /** 告警等级 */
  alert_level: AlertLevel;
  
  /** 告警消息模板 */
  alert_message?: string;
  
  /** 是否启用 (0否 1是) */
  is_enabled?: EnableStatus;
  
  /** 是否删除 (0否 1是) */
  is_deleted?: DeleteStatus;
  
  /** 创建时间 */
  created_at: Date;
  
  /** 更新时间 */
  updated_at: Date;
}

// 设备告警记录表
export interface DeviceAlert {
  /** 主键ID */
  id: number;
  
  /** 关联的设备ID */
  device_id: number;
  
  /** 设备名称 */
  device_name: string;
  
  /** 监控指标类型 */
  metric_type: string;
  
  /** 触发值 */
  metric_value: number;
  
  /** 告警等级 */
  alert_level: AlertLevel;
  
  /** 告警消息 */
  alert_message: string;
  
  /** 状态 */
  status: AlertStatus;
  
  /** 是否删除 (0否 1是) */
  is_deleted?: DeleteStatus;
  
  /** 创建时间 */
  created_at: Date;
  
  /** 更新时间 */
  updated_at: Date;
}

// 设备分类图标表
export interface DeviceCategoryIcon {
  /** 主键ID */
  id: number;
  
  /** 关联的设备分类ID */
  category_id: number;
  
  /** 分类图标 */
  icon?: string;
  
  /** 图标名称 */
  icon_name?: string;
  
  /** 图标类型(svg/url等) */
  icon_type?: string;
  
  /** 排序 */
  sort?: number;
  
  /** 是否为默认图标 (0否 1是) */
  is_default?: number;
  
  /** 是否禁用 (0否 1是) */
  is_disabled?: number;
  
  /** 是否被删除 (0否 1是) */
  is_deleted?: number;
  
  /** 创建时间 */
  created_at: Date;
  
  /** 更新时间 */
  updated_at: Date;
}


// 设备实例表
export interface DeviceInstance {
  /** 关联资产ID */
  id: number;
  
  /** 设备类型ID */
  type_id: number;
  
  /** 通信协议(SNMP/HTTP/RS485/TCP等) */
  protocol: DeviceProtocolType;
  
  /** 通信地址 */
  address: string;
  
  /** 采集间隔(秒) */
  collect_interval?: number;
  
  /** 最后采集时间 */
  last_collect_time?: Date;
  
  /** 备注 */
  remark?: string;
  
  /** 是否启用 (0否 1是) */
  is_enabled?: number;
  
  /** 是否删除 (0否 1是) */
  is_deleted?: number;
  
  /** 创建时间 */
  created_at: Date;
  
  /** 更新时间 */
  updated_at: Date;
  
  /** 资产名称（来自zichan_info表） */
  asset_name?: string;
  
  /** 设备分类（来自zichan_info表） */
  device_category?: DeviceCategory;
  
  /** 归属区域（来自zichan_info表） */
  area?: AreaType;
  
  /** 供应商（来自zichan_info表） */
  supplier?: string;
  
  /** 设备状态（来自zichan_info表） */
  device_status?: DeviceStatus;
}

// 设备监控数据表
export interface DeviceMonitorData {
  /** 主键ID */
  id: number;
  
  /** 关联的设备ID */
  device_id: number;
  
  /** 监控指标类型(temperature/humidity/smoke/water等) */
  metric_type: string;
  
  /** 监控值 */
  metric_value: number;
  
  /** 单位 */
  unit?: string;
  
  /** 状态 */
  status?: DeviceStatus;
  
  /** 采集时间 */
  collect_time: Date;
  
  /** 是否删除 (0否 1是) */
  is_deleted?: DeleteStatus;
  
  /** 创建时间 */
  created_at: Date;
  
  /** 更新时间 */
  updated_at: Date;
}

// 设备类型表
export interface DeviceType {
  /** 主键ID */
  id: number;
  
  /** 类型名称 */
  name: string;
  
  /** 类型编码 */
  code: string;
  
  /** 设备类型图片URL */
  image_url?: string;
  
  /** 类型描述 */
  description?: string;
  
  /** 是否启用 (0否 1是) */
  is_enabled?: number;
  
  /** 是否删除 (0否 1是) */
  is_deleted?: number;
  
  /** 创建时间 */
  created_at: Date;
  
  /** 更新时间 */
  updated_at: Date;
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

// 机柜信息表
export interface RackInfo {
  /** 主键ID */
  id: number;
  
  /** 机柜名称 */
  rack_name?: string;
  
  /** 机柜编号 */
  rack_code?: string;
  
  /** 机柜可容纳设备数量，默认42U */
  capacity?: number;
  
  /** 机柜X轴位置坐标 */
  position_x?: number;
  
  /** 机柜Y轴位置坐标 */
  position_y?: number;
  
  /** 机柜Z轴位置坐标 */
  position_z?: number;
  
  /** 机柜所在区域 */
  area?: string;
  
  /** 机柜所在机房 */
  room?: string;
  
  /** 备注信息 */
  remark?: string;
  
  /** 是否禁用 (0否 1是) */
  is_disabled?: EnableStatus;
  
  /** 是否被删除 (0否 1是) */
  is_deleted?: DeleteStatus;
  
  /** 创建时间 */
  created_at: Date;
  
  /** 更新时间 */
  updated_at: Date;
}

// 机柜服务器表
export interface RackServer {
  /** 主键ID */
  id: number;
  
  /** 关联的机柜ID */
  rack_id: number;
  
  /** 关联的资产ID */
  asset_id: number;
  
  /** 设备安装的起始U位 */
  start_position: number;
  
  /** 设备占用U数 */
  size?: number;
  
  /** 服务器类型 */
  server_type?: number;
  
  /** 备注信息 */
  remark?: string;
  
  /** 是否禁用 (0否 1是) */
  is_disabled?: EnableStatus;
  
  /** 是否被删除 (0否 1是) */
  is_deleted?: DeleteStatus;
  
  /** 创建时间 */
  created_at: Date;
  
  /** 更新时间 */
  updated_at: Date;
}

// 机柜服务器类型表
export interface RackServerType {
  /** 主键ID */
  id: number;
  
  /** 类型名称 */
  name: string;
  
  /** 类型编码 */
  code: string;

  /** 类型图片 */
  image_url?: string;
  
  /** 类型描述 */
  description?: string;
  
  /** 是否启用 (0否 1是) */
  is_enabled?: EnableStatus;
  
  /** 是否被删除 (0否 1是) */
  is_deleted?: DeleteStatus;
  
  /** 创建时间 */
  created_at: Date;
  
  /** 更新时间 */
  updated_at: Date;
}

// 工单表
export interface WorkOrder {
  /** 主键ID */
  id: number;
  
  /** 工单标题 */
  title: string;
  
  /** 关联设备ID */
  device_id?: number;
  
  /** 关联告警ID */
  alert_id?: number;
  
  /** 工单模板ID */
  template_id?: number;
  
  /** 工单内容 */
  content?: string;
  
  /** 工单状态 */
  status: WorkOrderStatus;
  
  /** 优先级 */
  priority: WorkOrderPriority;
  
  /** 创建人ID */
  creator_id: number;
  
  /** 处理人ID */
  handler_id?: number;
  
  /** 审核人ID */
  auditor_id?: number;
  
  /** 截止时间 */
  deadline?: Date;
  
  /** 处理结果 */
  handle_result?: string;
  
  /** 审核结果 */
  audit_result?: string;
  
  /** 是否删除 (0否 1是) */
  is_deleted?: number;
  
  /** 创建时间 */
  created_at: Date;
  
  /** 更新时间 */
  updated_at: Date;
}

// 工单处理记录表
export interface WorkOrderLog {
  /** 主键ID */
  id: number;
  
  /** 工单ID */
  work_order_id: number;
  
  /** 操作人ID */
  operator_id: number;
  
  /** 操作类型 */
  action: WorkOrderAction;
  
  /** 处理内容 */
  content?: string;
  
  /** 是否删除 (0否 1是) */
  is_deleted?: number;
  
  /** 创建时间 */
  created_at: Date;
  
  /** 更新时间 */
  updated_at: Date;
}

// 工单模板表
export interface WorkOrderTemplate {
  /** 主键ID */
  id: number;
  
  /** 模板名称 */
  name: string;
  
  /** 模板内容 */
  content?: string;
  
  /** 是否需要审核 (0否 1是) */
  need_audit: number;
  
  /** 默认处理人 */
  default_handler_id?: number;
  
  /** 默认完成时限(小时) */
  default_deadline_hours?: number;
  
  /** 常用语列表 */
  common_phrases?: CommonPhrase[];
  
  /** SLA配置 */
  sla_config?: SLAConfig;
  
  /** 流程配置 */
  workflow_config?: WorkflowConfig;
  
  /** 是否启用 (0否 1是) */
  is_enabled?: number;
  
  /** 是否删除 (0否 1是) */
  is_deleted?: number;
  
  /** 创建时间 */
  created_at: Date;
  
  /** 更新时间 */
  updated_at: Date;
}

// 资产信息表
export interface ZichanInfo {
  /** 主键ID */
  id: number;
  
  /** 资产名称 */
  asset_name?: string;
  
  /** 设备分类 */
  device_category?: DeviceCategory;
  
  /** 归属区域 */
  area?: AreaType;
  
  /** 供应商 */
  supplier?: string;
  
  /** 使用地址 */
  use_address?: string;
  
  /** 运行情况 */
  operation_status?: string;
  
  /** 是否审核 (0否 1是) */
  is_audited?: number;
  
  /** 审核状态 */
  audit_status?: AuditStatus;
  
  /** 资产状态 */
  asset_status?: AssetStatus;
  
  /** 入库数量 */
  stock_quantity?: number;
  
  /** 质保时间 */
  warranty_time?: Date;
  
  /** 品牌 */
  brand?: string;
  
  /** IP地址 */
  ip_address?: string;
  
  /** 设备状态 */
  device_status?: DeviceStatus;
  
  /** 网络状态 */
  network_status?: NetworkStatus;
  
  /** 丢包率 */
  packet_loss?: number;
  
  /** 图片 */
  images?: string;
  
  /** 是否备件 (0否 1是) */
  is_spare?: number;
  
  /** 是否被禁用 (0否 1是) */
  is_disabled?: number;
  
  /** 是否被删除 (0否 1是) */
  is_deleted?: number;
  
  /** 资产位置经度 */
  longitude?: number;
  
  /** 资产位置纬度 */
  latitude?: number;
  
  /** CPU信息 */
  cpu?: string;
  
  /** 内存信息 */
  memory?: string;
  
  /** 硬盘信息 */
  disk?: string;
  
  /** 创建时间 */
  created_at: Date;
  
  /** 更新时间 */
  updated_at: Date;
}

// 资产分类表
export interface ZichanCategory {
  /** 主键ID */
  id: number;

  /** 分类名称 */
  name: string;

  /** 分类编码 */
  code: string;

  /** 分类图片 */
  image_url?: string;

  /** 分类描述 */
  description?: string;

  /** 是否启用 (0否 1是) */
  is_enabled?: EnableStatus;

  /** 是否被删除 (0否 1是) */ 
  is_deleted?: DeleteStatus;

  /** 创建时间 */
  created_at: Date;

  /** 更新时间 */
  updated_at: Date;
}

// 资产归属区域
export interface ZichanArea {
  /** 主键ID */
  id: number;

  /** 区域名称 */
  name: string;

  /** 区域编码 */
  code: string;

  /** 区域图片 */
  image_url?: string;

  /** 区域描述 */
  description?: string;
  
  /** 是否启用 (0否 1是) */
  is_enabled?: EnableStatus;

  /** 是否被删除 (0否 1是) */ 
  is_deleted?: DeleteStatus;

  /** 创建时间 */
  created_at: Date;

  /** 更新时间 */
  updated_at: Date;
}

// 资产流转记录表
export interface ZichanTransLog {
  /** 主键ID */
  id: number;
  
  /** 资产流转 */
  asset_transfer?: AssetTransferType;
  
  /** 资产ID */
  asset_id?: number;
  
  /** 人员 */
  person?: string;
  
  /** 部门 */
  department?: string;
  
  /** 电话 */
  phone?: string;
  
  /** 流转事由 */
  transfer_reason?: string;
  
  /** 流转时间 */
  transfer_time?: Date | string;
  
  /** 是否被禁用 (0否 1是) */
  is_disabled?: number;
  
  /** 是否被删除 (0否 1是) */
  is_deleted?: number;
  
  /** 创建时间 */
  created_at: Date;
  
  /** 更新时间 */
  updated_at: Date;
  
  /** 关联的资产信息（查询时后端关联返回） */
  asset_info?: ZichanInfo;
}

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

// 资产流转类型枚举
export enum AssetTransferType {
  STOCK = 0,       // 在库
  BORROW = 1,      // 借用
  RETURN = 2,      // 归还
  LOST = 3,        // 遗失
  MAINTAIN = 4     // 维护保养
}

// 资产流转类型名称映射
export const AssetTransferTypeNameMap: Record<AssetTransferType, string> = {
  [AssetTransferType.STOCK]: '在库',
  [AssetTransferType.BORROW]: '借用',
  [AssetTransferType.RETURN]: '归还',
  [AssetTransferType.LOST]: '遗失',
  [AssetTransferType.MAINTAIN]: '维护保养'
};

// 资产流转类型颜色映射
export const AssetTransferTypeColorMap: Record<AssetTransferType, string> = {
  [AssetTransferType.STOCK]: 'green',
  [AssetTransferType.BORROW]: 'blue',
  [AssetTransferType.RETURN]: 'cyan',
  [AssetTransferType.LOST]: 'red',
  [AssetTransferType.MAINTAIN]: 'orange'
};

// 添加图表类型定义（从大屏移植）
export interface CategoryChartData {
  设备分类: string;
  设备数: number;
}

export interface CategoryChartDataWithPercent extends CategoryChartData {
  百分比: string;
}

export interface OnlineRateChartData {
  time_interval: string;
  online_devices: number;
  total_devices: number;
}

export interface StateChartData {
  资产流转: string;
  设备数: number;
}

export interface StateChartDataWithPercent extends StateChartData {
  百分比: string;
}

export interface AlarmChartData {
  time_interval: string;
  total_devices: number;
}

export interface AlarmDeviceData {
  deviceName: string;
  alarmCount: number;
  rank: number;
}

// 设备与资产信息结合的接口
export interface DeviceWithAssetInfo {
  id: number;
  asset_name?: string;
  device_category?: number;
  ip_address?: string;
  device_status?: DeviceStatus;
  network_status?: NetworkStatus;
  packet_loss?: PacketLossStatus;
  cpu?: string;
  memory?: string;
  disk?: string;
  is_deleted?: number;
}

// 地图类型
export enum MapMode {
  ONLINE = 'online',
  OFFLINE = 'offline'
}

// 地图标记数据接口 - 基础定义
export interface MarkerData {
  /** 标记点经度 */
  longitude: number;
  
  /** 标记点纬度 */
  latitude: number;
  
  /** 标记点ID */
  id?: string | number;
  
  /** 标记点标题 */
  title?: string;
  
  /** 标记点描述 */
  description?: string;
  
  /** 标记点图标URL */
  iconUrl?: string;
  
  /** 标记点状态 */
  status?: string;
  
  /** 标记点类型 */
  type?: string;
  
  /** 标记点额外数据 */
  extraData?: Record<string, any>;
}

// 设备地图监控视图设备接口
export interface MapViewDevice extends MarkerData {
  id: number;
  name?: string;
  type_code: string;
  device_category?: DeviceCategory;
  device_status?: DeviceStatus;
  description?: string;
  address?: string;
  protocol?: DeviceProtocolType;
  last_update_time?: string;
  area_code?: string;
  area_name?: string;
  image_url?: string;
}

// 设备地图筛选条件
export interface DeviceMapFilter {
  type_code?: string;
  device_category?: DeviceCategory[];
  device_status?: DeviceStatus;
  area_code?: string[];
  keyword?: string;
  device_id?: number;
}

// 设备地图统计数据接口
export interface DeviceMapStats {
  total: number;
  online: number;
  offline: number;
  error: number;
  normal?: number;
  fault?: number;
  categoryStats?: {
    category: DeviceCategory;
    count: number;
    name: string;
  }[];
}

// 设备树统计数据类型
export type DeviceTreeStats = Record<string, {
  total: number;
  online: number;
  offline: number;
  error: number;
}>;

// 设备地图响应数据接口
export interface DeviceMapDataResponse {
  data: MapViewDevice[];
  stats: DeviceMapStats;
  total?: number;
  page?: number;
  pageSize?: number;
}

// 设备地图统计响应接口
export interface DeviceMapStatsResponse {
  data: DeviceMapStats;
}

// 设备树节点类型枚举
export enum DeviceTreeNodeType {
  CATEGORY = 'category',
  DEVICE = 'device'
}

// 设备树节点状态枚举
export enum DeviceTreeNodeStatus {
  NORMAL = 'normal',
  ERROR = 'error',
  OFFLINE = 'offline',
  WARNING = 'warning'
}

// 设备树节点接口
export interface DeviceTreeNode {
  key: string;
  title: string;
  type: DeviceTreeNodeType;
  status?: DeviceTreeNodeStatus;
  icon?: string | null;
  isLeaf?: boolean;
  children?: DeviceTreeNode[];
}

// 登录位置相关类型定义
export interface LoginLocation {
  id: number;
  loginTime: string;
  ipAddress: string;
  longitude: number;
  latitude: number;
  location_name?: string;
  user: {
    id: number;
    username: string;
    nickname: string;
  };
}

export interface LoginLocationDetail {
  id: number;
  user_id: number;
  login_time: string;
  ip_address: string;
  longitude: number;
  latitude: number;
  location_name: string;
  user_agent: string;
  user: {
    id: number;
    username: string;
    nickname: string;
  };
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