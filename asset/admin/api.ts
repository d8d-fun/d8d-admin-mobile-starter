import axios from 'axios';
import type { MinioUploadPolicy, OSSUploadPolicy } from '@d8d-appcontainer/types';
import 'dayjs/locale/zh-cn';
import type { 
  User, ZichanInfo, ZichanTransLog, DeviceInstance, DeviceType,
  AlertHandleLog, AlertNotifyConfig, DeviceAlert, DeviceAlertRule,
  DeviceMonitorData, FileLibrary, FileCategory, ZichanCategory, ZichanArea, RackServerType,
  RackInfo, RackServer, KnowInfo, WorkOrder, WorkOrderTemplate, WorkOrderLog,
  AuthContextType, ThemeContextType, Attachment, ThemeSettings,
  CategoryChartData, OnlineRateChartData, StateChartData, StateChartDataWithPercent, 
  AlarmChartData, CategoryChartDataWithPercent, MapViewDevice, DeviceMapFilter, DeviceMapStats,
  DeviceMapDataResponse, DeviceMapStatsResponse, DeviceTreeNode, DeviceTreeStats,
  LoginLocation, LoginLocationDetail, SystemSetting, SystemSettingGroupData
} from '../share/types.ts';

import {
  DeviceCategory, DeviceStatus, AssetTransferType, 
} from '../share/types.ts';


// 定义API基础URL
const API_BASE_URL = '/api';

// 获取OSS完整URL
export const getOssUrl = (path: string): string => {
  // 获取全局配置中的OSS_HOST，如果不存在使用默认值
  const ossHost = (window.CONFIG?.OSS_BASE_URL) || '';
  // 确保path不以/开头
  const ossPath = path.startsWith('/') ? path.substring(1) : path;
  return `${ossHost}/${ossPath}`;
};

// ===================
// Auth API 定义部分
// ===================

// 定义API返回数据类型
interface AuthLoginResponse {
  message: string;
  token: string;
  refreshToken?: string;
  user: User;
}

interface AuthResponse {
  message: string;
  [key: string]: any;
}

// 定义Auth API接口类型
interface AuthAPIType {
  login: (username: string, password: string) => Promise<AuthLoginResponse>;
  register: (username: string, email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<AuthResponse>;
  getCurrentUser: () => Promise<User>;
  updateUser: (userId: number, userData: Partial<User>) => Promise<User>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<AuthResponse>;
  requestPasswordReset: (email: string) => Promise<AuthResponse>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResponse>;
}


// Auth相关API
export const AuthAPI: AuthAPIType = {
  // 登录API
  login: async (username: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 注册API
  register: async (username: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, { username, email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 登出API
  logout: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/logout`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取当前用户信息
  getCurrentUser: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 更新用户信息
  updateUser: async (userId: number, userData: Partial<User>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 修改密码
  changePassword: async (oldPassword: string, newPassword: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/change-password`, { oldPassword, newPassword });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 请求重置密码
  requestPasswordReset: async (email: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/request-password-reset`, { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 重置密码
  resetPassword: async (token: string, newPassword: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, { token, newPassword });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// 为UserAPI添加的接口响应类型
interface UsersResponse {
  data: User[];
  pagination: {
    total: number;
    current: number;
    pageSize: number;
    totalPages: number;
  };
}

interface UserResponse {
  data: User;
  message?: string;
}

interface UserCreateResponse {
  message: string;
  data: User;
}

interface UserUpdateResponse {
  message: string;
  data: User;
}

interface UserDeleteResponse {
  message: string;
  id: number;
}

// 用户管理API
export const UserAPI = {
  // 获取用户列表
  getUsers: async (params?: { page?: number, limit?: number, search?: string }): Promise<UsersResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取单个用户详情
  getUser: async (userId: number): Promise<UserResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 创建用户
  createUser: async (userData: Partial<User>): Promise<UserCreateResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 更新用户信息
  updateUser: async (userId: number, userData: Partial<User>): Promise<UserUpdateResponse> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 删除用户
  deleteUser: async (userId: number): Promise<UserDeleteResponse> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// 资产管理API
export const ZichanAPI = {
  // 获取资产列表
  getZichanList: async (params?: { 
    page?: number, 
    limit?: number, 
    asset_name?: string, 
    device_category?: DeviceCategory, 
    device_status?: DeviceStatus 
  }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/zichan`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取单个资产
  getZichan: async (id: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/zichan/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 创建资产
  createZichan: async (data: Partial<ZichanInfo>) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/zichan`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 更新资产
  updateZichan: async (id: number, data: Partial<ZichanInfo>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/zichan/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 删除资产
  deleteZichan: async (id: number) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/zichan/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};



// 资产流转API接口定义
export const ZichanTransferAPI = {
  // 获取资产流转记录列表
  getTransferList: async (params?: { page?: number, limit?: number, asset_id?: number, asset_transfer?: AssetTransferType }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/zichan-transfer`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取资产流转记录详情
  getTransfer: async (id: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/zichan-transfer/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 创建资产流转记录
  createTransfer: async (data: Partial<ZichanTransLog>) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/zichan-transfer`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 更新资产流转记录
  updateTransfer: async (id: number, data: Partial<ZichanTransLog>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/zichan-transfer/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 删除资产流转记录
  deleteTransfer: async (id: number) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/zichan-transfer/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// 设备实例API接口定义
interface DeviceInstancesResponse {
  data: DeviceInstance[];
  pagination: {
    total: number;
    current: number;
    pageSize: number;
    totalPages: number;
  };
}

interface DeviceInstanceResponse {
  data: DeviceInstance;
  asset_info?: ZichanInfo;
  type_info?: DeviceType;
  message?: string;
}

interface DeviceInstanceCreateResponse {
  message: string;
  data: DeviceInstance;
}

interface DeviceInstanceUpdateResponse {
  message: string;
  data: DeviceInstance;
}

interface DeviceInstanceDeleteResponse {
  message: string;
  id: number;
}

// 设备类型API接口定义
interface DeviceTypeResponse {
  data: DeviceType[];
  pagination: {
    total: number;
    current: number;
    pageSize: number;
    totalPages: number;
  };
}

interface DeviceTypeDetailResponse {
  data: DeviceType;
  message?: string;
}

interface DeviceTypeCreateResponse {
  message: string;
  data: DeviceType;
}

interface DeviceTypeUpdateResponse {
  message: string;
  data: DeviceType;
}

interface DeviceTypeDeleteResponse {
  message: string;
  id: number;
}

export const DeviceTypeAPI = {
  // 获取设备类型列表
  getDeviceTypes: async (params?: { 
    page?: number, 
    pageSize?: number, 
    code?: string,
    name?: string,
    is_enabled?: boolean
  }): Promise<DeviceTypeResponse> => {
    try {
      const response = await axios.get('/api/device/types', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取单个设备类型信息
  getDeviceType: async (id: number): Promise<DeviceTypeDetailResponse> => {
    try {
      const response = await axios.get(`/api/device/types/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 创建设备类型
  createDeviceType: async (data: Partial<DeviceType>): Promise<DeviceTypeCreateResponse> => {
    try {
      const response = await axios.post('/api/device/types', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 更新设备类型
  updateDeviceType: async (id: number, data: Partial<DeviceType>): Promise<DeviceTypeUpdateResponse> => {
    try {
      const response = await axios.put(`/api/device/types/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 删除设备类型
  deleteDeviceType: async (id: number): Promise<DeviceTypeDeleteResponse> => {
    try {
      const response = await axios.delete(`/api/device/types/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取设备类型图标
  getTypeIcons: async (): Promise<{data: Record<string, string>, success: boolean}> => {
    try {
      const response = await axios.get('/api/device/types/icons');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export const DeviceInstanceAPI = {
  // 获取设备实例列表
  getDeviceInstances: async (params?: { 
    page?: number, 
    limit?: number, 
    type_id?: number,
    protocol?: string,
    status?: number
  }): Promise<DeviceInstancesResponse> => {
    try {
      const response = await axios.get('/api/device/instances', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取单个设备实例信息
  getDeviceInstance: async (id: number): Promise<DeviceInstanceResponse> => {
    try {
      const response = await axios.get(`/api/device/instances/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 创建设备实例
  createDeviceInstance: async (data: Partial<DeviceInstance>): Promise<DeviceInstanceCreateResponse> => {
    try {
      const response = await axios.post('/api/device/instances', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 更新设备实例
  updateDeviceInstance: async (id: number, data: Partial<DeviceInstance>): Promise<DeviceInstanceUpdateResponse> => {
    try {
      const response = await axios.put(`/api/device/instances/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 删除设备实例
  deleteDeviceInstance: async (id: number): Promise<DeviceInstanceDeleteResponse> => {
    try {
      const response = await axios.delete(`/api/device/instances/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// 机柜管理API接口定义
export const RackAPI = {
  // 获取机柜列表
  getRackList: async (params?: { 
    page?: number, 
    limit?: number, 
    rack_name?: string, 
    rack_code?: string, 
    area?: string
  }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/racks`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取单个机柜信息
  getRack: async (id: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/racks/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 创建机柜
  createRack: async (data: Partial<RackInfo>) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/racks`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 更新机柜
  updateRack: async (id: number, data: Partial<RackInfo>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/racks/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 删除机柜
  deleteRack: async (id: number) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/racks/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// 机柜服务器API接口定义
export const RackServerAPI = {
  // 获取机柜服务器列表
  getRackServerList: async (params?: { 
    page?: number, 
    limit?: number, 
    rack_id?: number,
    asset_id?: number,
    server_type?: string
  }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rack-servers`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取单个机柜服务器信息
  getRackServer: async (id: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rack-servers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 创建机柜服务器
  createRackServer: async (data: Partial<RackServer>) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/rack-servers`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 更新机柜服务器
  updateRackServer: async (id: number, data: Partial<RackServer>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/rack-servers/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 删除机柜服务器
  deleteRackServer: async (id: number) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/rack-servers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

interface DeviceMonitorDataResponse {
  data: DeviceMonitorData[];
  total: number;
  page: number;
  pageSize: number;
}

interface DeviceMonitorResponse {
  data: DeviceMonitorData;
  message?: string;
}

interface MonitorCreateResponse {
  data: DeviceMonitorData;
  message: string;
}

interface MonitorUpdateResponse {
  data: DeviceMonitorData;
  message: string;
}

interface MonitorDeleteResponse {
  message: string;
}

// 告警相关响应类型
interface DeviceAlertDataResponse {
  data: DeviceAlert[];
  total: number;
  page: number;
  pageSize: number;
}

interface DeviceAlertResponse {
  data: DeviceAlert;
  message?: string;
}

interface AlertCreateResponse {
  data: DeviceAlert;
  message: string;
}

interface AlertUpdateResponse {
  data: DeviceAlert;
  message: string;
}

interface AlertDeleteResponse {
  message: string;
}

// 告警处理相关响应类型
interface AlertHandleDataResponse {
  data: AlertHandleLog[];
  total: number;
  page: number;
  pageSize: number;
}

interface AlertHandleResponse {
  data: AlertHandleLog;
  message?: string;
}

// 告警通知配置相关响应类型
interface AlertNotifyConfigDataResponse {
  data: AlertNotifyConfig[];
  total: number;
  page: number;
  pageSize: number;
}

interface AlertNotifyConfigResponse {
  data: AlertNotifyConfig;
  message?: string;
}

// 监控API接口定义
export const MonitorAPI = {
  // 获取监控数据
  getMonitorData: async (params?: { 
    page?: number, 
    limit?: number, 
    device_id?: number, 
    device_type?: string, 
    start_time?: string, 
    end_time?: string
  }): Promise<DeviceMonitorDataResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/monitor/data`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取设备树数据
  getDeviceTree: async (params?: {
    status?: string,
    keyword?: string
  }): Promise<{ data: DeviceTreeNode[] }> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/monitor/devices/tree`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取设备树统计数据
  getDeviceTreeStats: async (): Promise<{ data: DeviceTreeStats }> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/monitor/devices/tree/statistics`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取设备地图数据
  getDeviceMapData: async (params?: { 
    type_code?: string, 
    device_status?: DeviceStatus, 
    keyword?: string,
    device_id?: number
  }): Promise<{ data: MapViewDevice[], stats: DeviceMapStats }> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/monitor/devices/map`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取单个监控数据
  getMonitor: async (id: number): Promise<DeviceMonitorResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/monitor/data/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 创建监控数据
  createMonitor: async (data: Partial<DeviceMonitorData>): Promise<MonitorCreateResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/monitor/data`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 更新监控数据
  updateMonitor: async (id: number, data: Partial<DeviceMonitorData>): Promise<MonitorUpdateResponse> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/monitor/data/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 删除监控数据
  deleteMonitor: async (id: number): Promise<MonitorDeleteResponse> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/monitor/data/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// 告警API接口定义
export const AlertAPI = {
  // 获取告警数据
  getAlertData: async (params?: { 
    page?: number, 
    limit?: number, 
    alert_type?: string, 
    alert_level?: string, 
    start_time?: string, 
    end_time?: string
  }): Promise<DeviceAlertDataResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/alerts`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取单个告警数据
  getAlert: async (id: number): Promise<DeviceAlert> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/alerts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 创建告警数据
  createAlert: async (data: Partial<DeviceAlert>): Promise<AlertCreateResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/alerts`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 更新告警数据
  updateAlert: async (id: number, data: Partial<DeviceAlert>): Promise<AlertUpdateResponse> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/alerts/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 删除告警数据
  deleteAlert: async (id: number): Promise<AlertDeleteResponse> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/alerts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// 告警处理API接口定义
export const AlertHandleAPI = {
  // 获取告警处理数据
  getAlertHandleData: async (params?: { 
    page?: number, 
    limit?: number, 
    alert_id?: number, 
    handle_type?: string, 
    start_time?: string, 
    end_time?: string
  }): Promise<AlertHandleDataResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/alert-handles`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取单个告警处理数据
  getAlertHandle: async (id: number): Promise<AlertHandleResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/alert-handles/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 创建告警处理数据
  createAlertHandle: async (data: Partial<AlertHandleLog>) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/alert-handles`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 更新告警处理数据
  updateAlertHandle: async (id: number, data: Partial<AlertHandleLog>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/alert-handles/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 删除告警处理数据
  deleteAlertHandle: async (id: number) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/alert-handles/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// 告警通知配置API接口定义
export const AlertNotifyConfigAPI = {
  // 获取告警通知配置
  getAlertNotifyConfig: async (params?: { 
    page?: number, 
    limit?: number, 
    device_id?: number, 
    alert_level?: string 
  }): Promise<AlertNotifyConfigDataResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/alert-notify-configs`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 创建告警通知配置
  createAlertNotifyConfig: async (data: Partial<AlertNotifyConfig>): Promise<AlertNotifyConfigResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/alert-notify-configs`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 更新告警通知配置
  updateAlertNotifyConfig: async (id: number, data: Partial<AlertNotifyConfig>): Promise<AlertNotifyConfigResponse> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/alert-notify-configs/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 删除告警通知配置
  deleteAlertNotifyConfig: async (id: number): Promise<AlertNotifyConfigResponse> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/alert-notify-configs/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// 设备告警规则API接口定义
export const DeviceAlertRuleAPI = {
  // 获取设备告警规则
  getDeviceAlertRules: async (params?: { 
    page?: number, 
    limit?: number, 
    device_id?: number, 
    rule_type?: string
  }): Promise<DeviceAlertDataResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/device-alert-rules`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取单个设备告警规则
  getDeviceAlertRule: async (id: number): Promise<DeviceAlertResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/device-alert-rules/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 创建设备告警规则
  createDeviceAlertRule: async (data: Partial<DeviceAlertRule>): Promise<DeviceAlertResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/device-alert-rules`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 更新设备告警规则
  updateDeviceAlertRule: async (id: number, data: Partial<DeviceAlertRule>): Promise<DeviceAlertResponse> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/device-alert-rules/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 删除设备告警规则
  deleteDeviceAlertRule: async (id: number): Promise<AlertDeleteResponse> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/device-alert-rules/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};


// 资产分类API响应类型
interface ZichanCategoryResponse {
  data: ZichanCategory[];
  pagination: {
    total: number;
    current: number;
    pageSize: number;
  };
}

// 资产归属区域API响应类型
interface ZichanAreaResponse {
  data: ZichanArea[];
  pagination: {
    total: number;
    current: number;
    pageSize: number;
  };
}

// 机柜服务器类型API响应类型
interface RackServerTypeResponse {
  data: RackServerType[];
  pagination: {
    total: number;
    current: number;
    pageSize: number;
  };
}

// 资产分类API接口定义
export const ZichanCategoryAPI = {
  // 获取资产分类列表
  getZichanCategoryList: async (params?: { 
    page?: number, 
    limit?: number, 
    name?: string,
    code?: string
  }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/zichan-categories`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取单个资产分类信息
  getZichanCategory: async (id: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/zichan-categories/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 创建资产分类
  createZichanCategory: async (data: Partial<ZichanCategory>) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/zichan-categories`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 更新资产分类
  updateZichanCategory: async (id: number, data: Partial<ZichanCategory>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/zichan-categories/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 删除资产分类
  deleteZichanCategory: async (id: number) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/zichan-categories/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// 资产归属区域API接口定义
export const ZichanAreaAPI = {
  // 获取资产归属区域列表
  getZichanAreaList: async (params?: { 
    page?: number, 
    limit?: number, 
    name?: string,
    code?: string
  }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/zichan-areas`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取单个资产归属区域信息
  getZichanArea: async (id: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/zichan-areas/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 创建资产归属区域
  createZichanArea: async (data: Partial<ZichanArea>) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/zichan-areas`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 更新资产归属区域
  updateZichanArea: async (id: number, data: Partial<ZichanArea>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/zichan-areas/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 删除资产归属区域
  deleteZichanArea: async (id: number) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/zichan-areas/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// 机柜服务器类型API接口定义
export const RackServerTypeAPI = {
  // 获取机柜服务器类型列表
  getRackServerTypeList: async (params?: { 
    page?: number, 
    limit?: number, 
    name?: string,
    code?: string
  }): Promise<RackServerTypeResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rack-server-types`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取单个机柜服务器类型信息
  getRackServerType: async (id: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rack-server-types/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 创建机柜服务器类型
  createRackServerType: async (data: Partial<RackServerType>) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/rack-server-types`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 更新机柜服务器类型
  updateRackServerType: async (id: number, data: Partial<RackServerType>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/rack-server-types/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 删除机柜服务器类型
  deleteRackServerType: async (id: number) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/rack-server-types/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// 定义文件相关接口类型
interface FileUploadPolicyResponse {
  message: string;
  data: MinioUploadPolicy | OSSUploadPolicy;
}

interface FileListResponse {
  message: string;
  data: {
    list: FileLibrary[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
    };
  };
}

interface FileSaveResponse {
  message: string;
  data: FileLibrary;
}

interface FileInfoResponse {
  message: string;
  data: FileLibrary;
}

interface FileDeleteResponse {
  message: string;
}


interface FileCategoryListResponse {
  data: FileCategory[];
  total: number;
  page: number;
  pageSize: number;
}

interface FileCategoryCreateResponse {
  message: string;
  data: FileCategory;
}

interface FileCategoryUpdateResponse {
  message: string;
  data: FileCategory;
}

interface FileCategoryDeleteResponse {
  message: string;
}

// 文件API接口定义
export const FileAPI = {
  // 获取文件上传策略
  getUploadPolicy: async (filename: string, prefix: string = 'uploads/', maxSize: number = 10 * 1024 * 1024): Promise<FileUploadPolicyResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/upload/policy`, { 
        params: { filename, prefix, maxSize } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 保存文件信息
  saveFileInfo: async (fileData: Partial<FileLibrary>): Promise<FileSaveResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/upload/save`, fileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 获取文件列表
  getFileList: async (params?: {
    page?: number,
    pageSize?: number,
    category_id?: number,
    fileType?: string,
    keyword?: string
  }): Promise<FileListResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/upload/list`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 获取单个文件信息
  getFileInfo: async (id: number): Promise<FileInfoResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/upload/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 更新文件下载计数
  updateDownloadCount: async (id: number): Promise<FileDeleteResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/upload/${id}/download`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 删除文件
  deleteFile: async (id: number): Promise<FileDeleteResponse> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/upload/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 获取文件分类列表
  getCategories: async (params?: {
    page?: number,
    pageSize?: number,
    search?: string
  }): Promise<FileCategoryListResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/file-categories`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 创建文件分类
  createCategory: async (data: Partial<FileCategory>): Promise<FileCategoryCreateResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/file-categories`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 更新文件分类
  updateCategory: async (id: number, data: Partial<FileCategory>): Promise<FileCategoryUpdateResponse> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/file-categories/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 删除文件分类
  deleteCategory: async (id: number): Promise<FileCategoryDeleteResponse> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/file-categories/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// // 添加图表类型定义（从大屏移植）
// interface CategoryChartData {
//   设备分类: string;
//   设备数: number;
// }

// interface CategoryChartDataWithPercent extends CategoryChartData {
//   百分比: string;
// }

// interface OnlineRateChartData {
//   time_interval: string;
//   online_devices: number;
//   total_devices: number;
// }

// interface StateChartData {
//   资产流转: string;
//   设备数: number;
// }

// interface StateChartDataWithPercent extends StateChartData {
//   百分比: string;
// }

// interface AlarmChartData {
//   time_interval: string;
//   total_devices: number;
// }

// 统一图表数据查询函数
export const chartQueryFns = {
  // 资产分类数据查询
  fetchCategoryData: async (): Promise<CategoryChartDataWithPercent[]> => {
    const res = await axios.get<CategoryChartData[]>(`${API_BASE_URL}/big/zichan_category_chart`);
    
    // 预先计算百分比
    const data = res.data;
    const total = data.reduce((sum: number, item: CategoryChartData) => sum + item['设备数'], 0);
    
    // 为每个数据项添加百分比字段
    return data.map(item => ({
      ...item,
      百分比: total > 0 ? (item['设备数'] / total * 100).toFixed(1) : '0'
    }));
  },

  // 在线率变化数据查询
  fetchOnlineRateData: async (params?: {
    created_at_gte?: string;
    created_at_lte?: string;
    dimension?: string;
  }): Promise<OnlineRateChartData[]> => {
    // 可选参数
    // const params = {
    //   created_at_gte: dayjs().subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss'),
    //   created_at_lte: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    //   dimension: 'day'
    // };
    
    const res = await axios.get<OnlineRateChartData[]>(`${API_BASE_URL}/big/zichan_online_rate_chart`, { params });
    return res.data;
  },

  // 资产流转状态数据查询
  fetchStateData: async (): Promise<StateChartDataWithPercent[]> => {
    const res = await axios.get<StateChartData[]>(`${API_BASE_URL}/big/zichan_state_chart`);
    
    // 预先计算百分比
    const data = res.data;
    const total = data.reduce((sum: number, item: StateChartData) => sum + item['设备数'], 0);
    
    // 为每个数据项添加百分比字段
    return data.map(item => ({
      ...item,
      百分比: total > 0 ? (item['设备数'] / total * 100).toFixed(1) : '0'
    }));
  },

  // 告警数据变化查询
  fetchAlarmData: async (params?: {
    created_at_gte?: string;
    created_at_lte?: string;
    dimension?: string;
  }): Promise<AlarmChartData[]> => {
    // 可选参数
    // const params = {
    //   created_at_gte: dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    //   created_at_lte: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
    //   dimension: 'hour'
    // };

    
    const res = await axios.get<AlarmChartData[]>(`${API_BASE_URL}/big/zichan_alarm_chart`, { params });
    return res.data;
  }
};

// Theme API 响应类型
export interface ThemeSettingsResponse {
  message: string;
  data: ThemeSettings;
}

// Theme API 定义
export const ThemeAPI = {
  // 获取主题设置
  getThemeSettings: async (): Promise<ThemeSettings> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/theme`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // 更新主题设置
  updateThemeSettings: async (themeData: Partial<ThemeSettings>): Promise<ThemeSettings> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/theme`, themeData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // 重置主题设置
  resetThemeSettings: async (): Promise<ThemeSettings> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/theme/reset`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
};

// 图表数据API接口类型
interface ChartDataResponse<T> {
  message: string;
  data: T;
}

interface UserActivityData {
  date: string;
  count: number;
}

interface FileUploadsData {
  month: string;
  count: number;
}

interface FileTypesData {
  type: string;
  value: number;
}

interface DashboardOverviewData {
  userCount: number;
  fileCount: number;
  articleCount: number;
  todayLoginCount: number;
}

// 图表数据API
export const ChartAPI = {
  // 获取用户活跃度数据
  getUserActivity: async (): Promise<ChartDataResponse<UserActivityData[]>> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/charts/user-activity`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 获取文件上传统计数据
  getFileUploads: async (): Promise<ChartDataResponse<FileUploadsData[]>> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/charts/file-uploads`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 获取文件类型分布数据
  getFileTypes: async (): Promise<ChartDataResponse<FileTypesData[]>> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/charts/file-types`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 获取仪表盘概览数据
  getDashboardOverview: async (): Promise<ChartDataResponse<DashboardOverviewData>> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/charts/dashboard-overview`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// 地图相关API的接口类型定义
export interface LoginLocationResponse {
  message: string;
  data: LoginLocation[];
}

export interface LoginLocationDetailResponse {
  message: string;
  data: LoginLocationDetail;
}

export interface LoginLocationUpdateResponse {
  message: string;
  data: LoginLocationDetail;
}


// 地图相关API
export const MapAPI = {
  // 获取地图标记点数据
  getMarkers: async (params?: { 
    startTime?: string; 
    endTime?: string; 
    userId?: number 
  }): Promise<LoginLocationResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/map/markers`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 获取登录位置详情
  getLocationDetail: async (locationId: number): Promise<LoginLocationDetailResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/map/location/${locationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 更新登录位置信息
  updateLocation: async (locationId: number, data: { 
    longitude: number; 
    latitude: number; 
    location_name?: string; 
  }): Promise<LoginLocationUpdateResponse> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/map/location/${locationId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// 系统设置API响应类型
interface SystemSettingsResponse {
  message: string;
  data: SystemSetting[];
}

// 系统设置API
export const SystemAPI = {
  // 获取所有系统设置
  getSettings: async (): Promise<SystemSettingGroupData[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // 获取指定分组的系统设置
  getSettingsByGroup: async (group: string): Promise<SystemSetting[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings/group/${group}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // 更新系统设置
  updateSettings: async (settings: Partial<SystemSetting>[]): Promise<SystemSetting[]> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/settings`, settings);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // 重置系统设置
  resetSettings: async (): Promise<SystemSetting[]> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/settings/reset`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
};

