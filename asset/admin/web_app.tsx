import React, { useState, useEffect, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useNavigate,
  useLocation,
  Navigate,
  useParams
} from 'react-router';
import { 
  Layout, Menu, Button, Table, Space,
  Form, Input, Select, message, Modal,
  Card, Spin, Row, Col, Breadcrumb, Avatar,
  Dropdown, ConfigProvider, theme, Typography,
  Switch, Badge, Image, Upload, Divider, Descriptions,
  Popconfirm, Tag, Statistic, DatePicker, Radio, Progress, Tabs, List, Alert, Collapse, Empty, Drawer
} from 'antd';
import zhCN from "antd/locale/zh_CN";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DashboardOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  BookOutlined,
  FileOutlined,
  PieChartOutlined,
  UploadOutlined,
  GlobalOutlined,
  VerticalAlignTopOutlined,
  CloseOutlined,
  SearchOutlined
} from '@ant-design/icons';   
import { 
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import { uploadMinIOWithPolicy } from '@d8d-appcontainer/api';
import type { MinioUploadPolicy } from '@d8d-appcontainer/types';
import { Line, Pie, Column } from "@ant-design/plots";
import 'dayjs/locale/zh-cn';
import type { 
  GlobalConfig
} from '../share/types.ts';

import {
  EnableStatus, DeleteStatus, ThemeMode, FontSize, CompactMode
} from '../share/types.ts';

import { getEnumOptions } from './utils.ts';

import {
  AuthProvider,
  useAuth,
  ThemeProvider,
  useTheme,
} from './hooks_sys.tsx';

import {
  DashboardPage,
  UsersPage,
  KnowInfoPage,
  FileLibraryPage
} from './pages_sys.tsx';
import { 
  SettingsPage,
  ThemeSettingsPage,
 } from './pages_settings.tsx';
 import {
  ChartDashboardPage,
 } from './pages_chart.tsx';
 import {
  LoginMapPage
 } from './pages_map.tsx';

import {
  LoginPage,
} from './pages_login_reg.tsx';


// 配置 dayjs 插件
dayjs.extend(weekday);
dayjs.extend(localeData);

// 设置 dayjs 语言
dayjs.locale('zh-cn');

const { Header, Sider, Content } = Layout;

// 创建QueryClient实例
const queryClient = new QueryClient();


// 声明全局配置对象类型
declare global {
  interface Window {
    CONFIG?: GlobalConfig;
  }
}


// 主布局组件
const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [showBackTop, setShowBackTop] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredMenuItems, setFilteredMenuItems] = useState<any[]>([]);
  
  // 检测滚动位置，控制回到顶部按钮显示
  useEffect(() => {
    const handleScroll = () => {
      setShowBackTop(window.pageYOffset > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // 回到顶部
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // 菜单项配置
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/analysis',
      icon: <PieChartOutlined />,
      label: '数据分析',
      children: [
        {
          key: '/chart-dashboard',
          label: '图表统计',
        },
        {
          key: '/map-dashboard',
          label: '地图概览',
        },
      ],
    },
    {
      key: '/files',
      icon: <FileOutlined />,
      label: '文件管理',
      children: [
        {
          key: '/file-library',
          label: '文件库',
        },
      ],
    },
    {
      key: '/know-info',
      icon: <BookOutlined />,
      label: '知识库',
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: '用户管理',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      children: [
        {
          key: '/theme-settings',
          label: '主题设置',
        },
        {
          key: '/settings',
          label: '基本设置',
        },
      ],
    },
  ];
  
  // 初始化filteredMenuItems
  useEffect(() => {
    setFilteredMenuItems(menuItems);
  }, []);

  // 搜索菜单项
  const handleSearch = (value: string) => {
    setSearchText(value);
    
    if (!value.trim()) {
      setFilteredMenuItems(menuItems);
      return;
    }
    
    // 搜索功能 - 过滤菜单项
    const filtered = menuItems.reduce((acc: any[], item) => {
      // 检查主菜单项是否匹配
      const mainItemMatch = item.label.toString().toLowerCase().includes(value.toLowerCase());
      
      // 如果有子菜单，检查子菜单中是否有匹配项
      if (item.children) {
        const matchedChildren = item.children.filter(child => 
          child.label.toString().toLowerCase().includes(value.toLowerCase())
        );
        
        if (matchedChildren.length > 0) {
          // 如果有匹配的子菜单，创建包含匹配子菜单的副本
          acc.push({
            ...item,
            children: matchedChildren
          });
          return acc;
        }
      }
      
      // 如果主菜单项匹配，添加整个项
      if (mainItemMatch) {
        acc.push(item);
      }
      
      return acc;
    }, []);
    
    setFilteredMenuItems(filtered);
  };
  
  // 清除搜索
  const clearSearch = () => {
    setSearchText('');
    setFilteredMenuItems(menuItems);
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(`/admin${key}`);
    // 如果有搜索文本，清除搜索
    if (searchText) {
      clearSearch();
    }
  };
  
  // 处理登出
  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };
  
  // 处理菜单展开/收起
  const onOpenChange = (keys: string[]) => {
    // 当侧边栏折叠时不保存openKeys状态
    if (!collapsed) {
      setOpenKeys(keys);
    }
  };
  
  // 当侧边栏折叠状态改变时，控制菜单打开状态
  useEffect(() => {
    if (collapsed) {
      setOpenKeys([]);
    } else {
      // 找到当前路径所属的父菜单
      const currentPath = location.pathname.replace('/admin', '');
      const parentKeys = menuItems
        .filter(item => item.children && item.children.some(child => child.key === currentPath))
        .map(item => item.key);
      
      // 仅展开当前所在的菜单组
      if (parentKeys.length > 0) {
        setOpenKeys(parentKeys);
      } else {
        // 初始时可以根据需要设置要打开的菜单组
        setOpenKeys([]);
      }
    }
  }, [collapsed, location.pathname]);
  
  // 用户下拉菜单项
  const userMenuItems = [
    {
      key: 'profile',
      label: '个人信息',
      icon: <UserOutlined />
    },
    {
      key: 'theme',
      label: isDark ? '切换到亮色模式' : '切换到暗色模式',
      icon: <SettingOutlined />,
      onClick: toggleTheme
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout
    }
  ];
  
  // 应用名称 - 从CONFIG中获取或使用默认值
  const appName = window.CONFIG?.APP_NAME || '应用Starter';
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={240}
        className="custom-sider"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div className="p-4">
          <Typography.Title level={2} className="text-xl font-bold truncate">
            {collapsed ? '应用' : appName}
          </Typography.Title>
        </div>
        
        {/* 搜索框 - 仅在展开状态下显示 */}
        {!collapsed && (
          <div style={{ padding: '0 16px 16px' }}>
            <Input 
              placeholder="搜索菜单..." 
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              suffix={
                searchText ? 
                <Button 
                  type="text" 
                  size="small" 
                  icon={<CloseOutlined />} 
                  onClick={clearSearch}
                /> : 
                <SearchOutlined />
              }
            />
          </div>
        )}
        
        <Menu
          theme={isDark ? "light" : "light"}
          mode="inline"
          selectedKeys={[location.pathname.replace('/admin', '')]}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          items={filteredMenuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        <Header className="p-0 flex justify-between items-center" 
          style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 99, 
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="w-16 h-16"
          />
          
          <Space size="middle" className="mr-4">
            <Badge count={5} offset={[0, 5]}>
              <Button 
                type="text" 
                icon={<BellOutlined />}
              />
            </Badge>
            
            <Dropdown menu={{ items: userMenuItems }}>
              <Space className="cursor-pointer">
                <Avatar 
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=40&auto=format&fit=crop'}
                  icon={!user?.avatar && !navigator.onLine && <UserOutlined />}
                />
                <span>
                  {user?.nickname || user?.username}
                </span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content className="m-6" style={{ overflow: 'initial' }}>
          <div className="site-layout-content p-6 rounded-lg">
            <Outlet />
          </div>
          
          {/* 回到顶部按钮 */}
          {showBackTop && (
            <Button
              type="primary"
              shape="circle"
              icon={<VerticalAlignTopOutlined />}
              size="large"
              onClick={scrollToTop}
              style={{
                position: 'fixed',
                right: 30,
                bottom: 30,
                zIndex: 1000,
                boxShadow: '0 3px 6px rgba(0,0,0,0.16)',
              }}
            />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

// 受保护的路由组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // 只有在加载完成且未认证时才重定向
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  // 显示加载状态，直到认证检查完成
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }
  
  // 如果未认证且不再加载中，不显示任何内容（等待重定向）
  if (!isAuthenticated) {
    return null;
  }
  
  return children;
};

// 错误页面组件
const ErrorPage = ({ error }: { error?: Error }) => {
  const { isDark } = useTheme();
  
  return (
    <div className="flex flex-col items-center justify-center h-screen"
      style={{ color: isDark ? '#fff' : 'inherit' }}
    >
      <h1 className="text-2xl font-bold mb-4">发生错误</h1>
      <p className="mb-4">{error?.message || '抱歉，应用程序遇到了一些问题。'}</p>
      <Button 
        type="primary" 
        onClick={() => window.location.reload()}
      >
        重新加载
      </Button>
    </div>
  );
};

// 应用入口组件
const App = () => {
  // 路由配置
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Navigate to="/admin" replace />
    },
    {
      path: '/admin/login',
      element: <LoginPage />
    },
    {
      path: '/admin',
      element: (
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <Navigate to="/admin/dashboard" />
        },
        {
          path: 'dashboard',
          element: <DashboardPage />,
          errorElement: <ErrorPage />
        },
        {
          path: 'users',
          element: <UsersPage />,
          errorElement: <ErrorPage />
        },
        {
          path: 'settings',
          element: <SettingsPage />,
          errorElement: <ErrorPage />
        },
        {
          path: 'theme-settings',
          element: <ThemeSettingsPage />,
          errorElement: <ErrorPage />
        },
        {
          path: 'chart-dashboard',
          element: <ChartDashboardPage />,
          errorElement: <ErrorPage />
        },
        {
          path: 'map-dashboard',
          element: <LoginMapPage />,
          errorElement: <ErrorPage />
        },
        {
          path: 'know-info',
          element: <KnowInfoPage />,
          errorElement: <ErrorPage />
        },
        {
          path: 'file-library',
          element: <FileLibraryPage />,
          errorElement: <ErrorPage />
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />
};

// 渲染应用
const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

