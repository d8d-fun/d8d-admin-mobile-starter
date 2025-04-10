import React, { useState, useEffect, createContext, useContext } from 'react';
import { ConfigProvider, theme, message
} from 'antd';
import zhCN from "antd/locale/zh_CN";

import { 
  useQuery,
  useQueryClient,
  useMutation
} from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import 'dayjs/locale/zh-cn';
import type { 
  User, AuthContextType, ThemeContextType, ThemeSettings
} from '../share/types.ts';
import {
  ThemeMode,
  FontSize,
  CompactMode
} from '../share/types.ts';
import {
  AuthAPI,
  ThemeAPI
} from './api.ts';


// 配置 dayjs 插件
dayjs.extend(weekday);
dayjs.extend(localeData);

// 设置 dayjs 语言
dayjs.locale('zh-cn');


// 确保ConfigProvider能够正确使用中文日期
const locale = {
  ...zhCN,
  DatePicker: {
    ...zhCN.DatePicker,
    lang: {
      ...zhCN.DatePicker?.lang,
      shortWeekDays: ['日', '一', '二', '三', '四', '五', '六'],
      shortMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    }
  }
};

// 创建认证上下文
const AuthContext = createContext<AuthContextType | null>(null);
const ThemeContext = createContext<ThemeContextType | null>(null);

// 认证提供器组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const queryClient = useQueryClient();
  
  // 声明handleLogout函数
  const handleLogout = async () => {
    try {
      // 如果已登录，调用登出API
      if (token) {
        await AuthAPI.logout();
      }
    } catch (error) {
      console.error('登出请求失败:', error);
    } finally {
      // 清除本地状态
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      // 清除Authorization头
      delete axios.defaults.headers.common['Authorization'];
      console.log('登出时已删除全局Authorization头');
      // 清除所有查询缓存
      queryClient.clear();
    }
  };
  
  // 使用useQuery检查登录状态
  const { isLoading } = useQuery({
    queryKey: ['auth', 'status', token],
    queryFn: async () => {
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return null;
      }
      
      try {
        // 设置全局默认请求头
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // 使用API验证当前用户
        const currentUser = await AuthAPI.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
        return { isValid: true, user: currentUser };
      } catch (error) {
        // 如果API调用失败，自动登出
        handleLogout();
        return { isValid: false };
      }
    },
    enabled: !!token,
    refetchOnWindowFocus: false,
    retry: false
  });
  
  // 设置请求拦截器
  useEffect(() => {
    // 设置响应拦截器处理401错误
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('检测到401错误，执行登出操作');
          handleLogout();
        }
        return Promise.reject(error);
      }
    );
    
    // 清理拦截器
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);
  
  const handleLogin = async (username: string, password: string): Promise<void> => {
    try {
      // 使用AuthAPI登录
      const response = await AuthAPI.login(username, password);
      
      // 保存token和用户信息
      const { token: newToken, user: newUser } = response;
      
      // 设置全局默认请求头
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // 保存状态
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('token', newToken);
      
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  };
  
  return (
    <AuthContext.Provider 
      value={{
        user,
        token,
        login: handleLogin,
        logout: handleLogout,
        isAuthenticated,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 主题提供器组件
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeSettings>({
    user_id: 0,
    theme_mode: ThemeMode.LIGHT,
    primary_color: '#1890ff',
    font_size: FontSize.MEDIUM,
    is_compact: CompactMode.NORMAL
  });
  
  // 获取主题设置
  const { isLoading: isThemeLoading } = useQuery({
    queryKey: ['theme', 'settings'],
    queryFn: async () => {
      try {
        const settings = await ThemeAPI.getThemeSettings();
        setCurrentTheme(settings);
        setIsDark(settings.theme_mode === ThemeMode.DARK);
        
        return settings;
      } catch (error) {
        console.error('获取主题设置失败:', error);
        return null;
      }
    },
    refetchOnWindowFocus: false,
    enabled: !!localStorage.getItem('token')
  });
  
  // 预览主题设置（不保存到后端）
  const previewTheme = (newTheme: Partial<ThemeSettings>) => {
    const updatedTheme = { ...currentTheme, ...newTheme };
    setCurrentTheme(updatedTheme);
    setIsDark(updatedTheme.theme_mode === ThemeMode.DARK);
  };
  
  // 更新主题设置（保存到后端）
  const updateThemeMutation = useMutation({
    mutationFn: async (newTheme: Partial<ThemeSettings>) => {
      return await ThemeAPI.updateThemeSettings(newTheme);
    },
    onSuccess: (data) => {
      setCurrentTheme(data);
      setIsDark(data.theme_mode === ThemeMode.DARK);
      message.success('主题设置已更新');
    },
    onError: (error) => {
      console.error('更新主题设置失败:', error);
      message.error('更新主题设置失败');
    }
  });
  
  // 重置主题设置
  const resetThemeMutation = useMutation({
    mutationFn: async () => {
      return await ThemeAPI.resetThemeSettings();
    },
    onSuccess: (data) => {
      setCurrentTheme(data);
      setIsDark(data.theme_mode === ThemeMode.DARK);
      message.success('主题设置已重置为默认值');
    },
    onError: (error) => {
      console.error('重置主题设置失败:', error);
      message.error('重置主题设置失败');
    }
  });
  
  // 添加 toggleTheme 方法
  const toggleTheme = () => {
    const newTheme = {
      ...currentTheme,
      theme_mode: isDark ? ThemeMode.LIGHT : ThemeMode.DARK
    };
    setIsDark(!isDark);
    setCurrentTheme(newTheme);
  };
  
  return (
    <ThemeContext.Provider value={{ 
      isDark, 
      currentTheme,
      updateTheme: previewTheme,
      saveTheme: updateThemeMutation.mutateAsync,
      resetTheme: resetThemeMutation.mutateAsync,
      toggleTheme
    }}>
      <ConfigProvider
        theme={{
          algorithm: currentTheme.is_compact === CompactMode.COMPACT
            ? [isDark ? theme.darkAlgorithm : theme.defaultAlgorithm, theme.compactAlgorithm]
            : isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: currentTheme.primary_color,
            fontSize: currentTheme.font_size === FontSize.SMALL ? 12 :
                     currentTheme.font_size === FontSize.MEDIUM ? 14 : 16,
            // colorBgBase: isDark ? undefined : currentTheme.background_color || '#fff',
            colorBgBase: currentTheme.background_color,
            borderRadius: currentTheme.border_radius ?? 6,
            colorTextBase: currentTheme.text_color || (isDark ? '#fff' : '#000'),
          },
          components: {
            Layout: {
              // headerBg: isDark ? undefined : currentTheme.background_color || '#fff',
              // siderBg: isDark ? undefined : currentTheme.background_color || '#fff',
              headerBg: currentTheme.background_color,
              siderBg: currentTheme.background_color,
            }
          }
        }}
        locale={locale as any}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

// 使用上下文的钩子
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme必须在ThemeProvider内部使用');
  }
  return context;
};