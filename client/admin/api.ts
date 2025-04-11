import axios from 'axios';
import { getGlobalConfig } from './utils.ts';
import type { MinioUploadPolicy, OSSUploadPolicy } from '@d8d-appcontainer/types';
import 'dayjs/locale/zh-cn';
import type { 
  User, FileLibrary, FileCategory, ThemeSettings,
 SystemSetting, SystemSettingGroupData, 
 LoginLocation, LoginLocationDetail,
 Message, UserMessage, KnowInfo
} from '../share/types.ts';



// 定义API基础URL
const API_BASE_URL = '/api';

// 获取OSS完整URL
export const getOssUrl = (path: string): string => {
  // 获取全局配置中的OSS_HOST，如果不存在使用默认值
  const ossHost = getGlobalConfig('OSS_BASE_URL') || '';
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
  login: (username: string, password: string, latitude?: number, longitude?: number) => Promise<AuthLoginResponse>;
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
  login: async (username: string, password: string, latitude?: number, longitude?: number) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password,
        latitude,
        longitude
      });
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

// 消息API接口类型
interface MessagesResponse {
  data: UserMessage[];
  pagination: {
    total: number;
    current: number;
    pageSize: number;
    totalPages: number;
  };
}

interface MessageResponse {
  data: Message;
  message?: string;
}

interface MessageCountResponse {
  count: number;
}

// 消息API
export const MessageAPI = {
  // 获取消息列表
  getMessages: async (params?: {
    page?: number,
    pageSize?: number,
    type?: string,
    status?: string,
    search?: string
  }): Promise<MessagesResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 发送消息
  sendMessage: async (data: {
    title: string,
    content: string,
    type: string,
    receiver_ids: number[]
  }): Promise<MessageResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/messages`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 获取未读消息数
  getUnreadCount: async (): Promise<MessageCountResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/count/unread`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 标记消息为已读
  markAsRead: async (id: number): Promise<MessageResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/messages/${id}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 删除消息
  deleteMessage: async (id: number): Promise<MessageResponse> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/messages/${id}`);
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

// 知识库相关接口类型定义
export interface KnowInfoListResponse {
  data: KnowInfo[];
  pagination: {
    total: number;
    current: number;
    pageSize: number;
    totalPages: number;
  };
}

interface KnowInfoResponse {
  data: KnowInfo;
  message?: string;
}

interface KnowInfoCreateResponse {
  message: string;
  data: KnowInfo;
}

interface KnowInfoUpdateResponse {
  message: string;
  data: KnowInfo;
}

interface KnowInfoDeleteResponse {
  message: string;
  id: number;
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

// 系统设置API
// 知识库API
export const KnowInfoAPI = {
  // 获取知识库列表
  getKnowInfos: async (params?: {
    page?: number;
    pageSize?: number;
    title?: string;
    category?: string;
    tags?: string;
  }): Promise<KnowInfoListResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/know-infos`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 获取单个知识详情
  getKnowInfo: async (id: number): Promise<KnowInfoResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/know-infos/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 创建知识
  createKnowInfo: async (data: Partial<KnowInfo>): Promise<KnowInfoCreateResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/know-infos`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 更新知识
  updateKnowInfo: async (id: number, data: Partial<KnowInfo>): Promise<KnowInfoUpdateResponse> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/know-infos/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 删除知识
  deleteKnowInfo: async (id: number): Promise<KnowInfoDeleteResponse> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/know-infos/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

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

