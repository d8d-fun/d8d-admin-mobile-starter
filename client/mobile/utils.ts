import dayjs from 'dayjs';
import { EnableStatus, DeleteStatus, AuditStatus } from '../share/types.ts';

// 日期格式化
export const formatDate = (date: string | Date, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

// 格式化时间为相对时间（如：3小时前）
export const formatRelativeTime = (date: string | Date): string => {
  if (!date) return '-';
  const now = dayjs();
  const dateObj = dayjs(date);
  const diffInSeconds = now.diff(dateObj, 'second');
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}秒前`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}分钟前`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}小时前`;
  } else if (diffInSeconds < 2592000) {
    return `${Math.floor(diffInSeconds / 86400)}天前`;
  } else {
    return formatDate(date, 'YYYY-MM-DD');
  }
};

// 获取枚举的选项（用于下拉菜单等）
export const getEnumOptions = (enumObj: Record<string | number, string | number>) => {
  return Object.entries(enumObj)
    .filter(([key]) => !isNaN(Number(key))) // 过滤掉映射对象中的字符串键
    .map(([value, label]) => ({
      value: Number(value),
      label: String(label)
    }));
};

// 获取启用状态选项
export const getEnableStatusOptions = () => {
  return [
    { value: EnableStatus.ENABLED, label: '启用' },
    { value: EnableStatus.DISABLED, label: '禁用' }
  ];
};

// 获取删除状态选项
export const getDeleteStatusOptions = () => {
  return [
    { value: DeleteStatus.NOT_DELETED, label: '未删除' },
    { value: DeleteStatus.DELETED, label: '已删除' }
  ];
};

// 获取审核状态选项
export const getAuditStatusOptions = () => {
  return [
    { value: AuditStatus.PENDING, label: '待审核' },
    { value: AuditStatus.APPROVED, label: '已通过' },
    { value: AuditStatus.REJECTED, label: '已拒绝' }
  ];
};

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 处理API错误
export const handleApiError = (error: any): string => {
  if (error.response) {
    // 服务器响应错误
    const status = error.response.status;
    const data = error.response.data;
    
    if (status === 401) {
      return '您的登录已过期，请重新登录';
    } else if (status === 403) {
      return '您没有权限执行此操作';
    } else if (status === 404) {
      return '请求的资源不存在';
    } else if (status === 422) {
      // 表单验证错误
      return data.message || '输入数据无效';
    } else {
      return data.message || `服务器错误 (${status})`;
    }
  } else if (error.request) {
    // 请求发送成功但没有收到响应
    return '网络连接错误，请检查您的网络连接';
  } else {
    // 请求设置错误
    return '应用程序错误，请稍后再试';
  }
};

// 复制文本到剪贴板
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('复制到剪贴板失败:', error);
    return false;
  }
};

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait) as unknown as number;
  };
};

// 生成随机颜色
export const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// 获取本地存储值，带过期检查
export const getLocalStorageWithExpiry = (key: string) => {
  const itemStr = localStorage.getItem(key);
  
  if (!itemStr) return null;
  
  const item = JSON.parse(itemStr);
  const now = new Date();
  
  if (item.expiry && now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  
  return item.value;
};

// 设置本地存储值，带过期时间
export const setLocalStorageWithExpiry = (key: string, value: any, expiryHours = 24) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + expiryHours * 60 * 60 * 1000
  };
  
  localStorage.setItem(key, JSON.stringify(item));
};