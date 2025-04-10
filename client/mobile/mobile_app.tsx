import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useLocation,
  useNavigate,
  Link,
  useRouteError
} from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { AuthProvider, ThemeProvider, useAuth } from './hooks.tsx';
import HomePage from './pages_index.tsx';
import LoginPage from './pages_login.tsx';
import { GlobalConfig } from "../share/types.ts";
import { ExclamationTriangleIcon, HomeIcon, BellIcon, UserIcon } from '@heroicons/react/24/outline';

// 设置中文语言
dayjs.locale('zh-cn');

// 声明全局配置对象类型
declare global {
  interface Window {
    CONFIG?: GlobalConfig;
  }
}


// 创建QueryClient实例
const queryClient = new QueryClient();

// 添加全局CSS（使用TailwindCSS的类）
const injectGlobalStyles = () => {
  const style = document.createElement('style');
  style.innerHTML = `
    :root {
      --primary-color: #3B82F6;
      --background-color: #F9FAFB;
      --text-color: #111827;
      --border-radius: 8px;
      --font-size: 16px;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
        Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: var(--background-color);
      color: var(--text-color);
      font-size: var(--font-size);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    /* 暗色模式支持 */
    .dark {
      color-scheme: dark;
    }
    
    .dark body {
      background-color: #121212;
      color: #E5E7EB;
    }
    
    /* 滚动条美化 */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #BFDBFE;
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #93C5FD;
    }
    
    /* 移动端点击高亮颜色 */
    * {
      -webkit-tap-highlight-color: transparent;
    }
  `;
  document.head.appendChild(style);
};

// 授权路由守卫
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/mobile/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// 页面组件
const PageNotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
    <div className="text-6xl font-bold text-blue-600 mb-4">404</div>
    <h1 className="text-2xl font-medium mb-2">页面不存在</h1>
    <p className="text-gray-500 mb-6">您访问的页面不存在或已被移除</p>
    <a 
      href="/mobile"
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      返回首页
    </a>
  </div>
);

// 添加错误页面组件
const ErrorPage = () => {
  const error = useRouteError() as any;
  const errorMessage = error?.statusText || error?.message || '未知错误';
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <ExclamationTriangleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-medium mb-2">出错了</h1>
        <div className="text-gray-500 mb-4">抱歉，页面加载过程中发生错误</div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-700 text-sm font-medium">错误信息：</p>
          <p className="text-red-600 mt-1 text-sm break-all">{errorMessage}</p>
          {error?.stack && (
            <details className="mt-2">
              <summary className="text-red-700 text-sm cursor-pointer">查看详细信息</summary>
              <pre className="mt-2 text-xs text-red-600 overflow-auto p-2 bg-red-50 rounded">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
        
        <a 
          href="/mobile"
          className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full"
        >
          返回首页
        </a>
      </div>
    </div>
  );
};

// 添加个人页面组件
const ProfilePage = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (confirm('确定要退出登录吗？')) {
      await logout();
      navigate('/mobile/login');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">我的</h1>
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.nickname || user?.username || '用户'}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl text-blue-600">用户</span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.nickname || user?.username || '未登录用户'}</h2>
            <p className="text-gray-500">个人信息</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="p-4 border-b">
          <span className="font-medium">设置</span>
        </div>
        <div className="divide-y">
          <div className="p-4 flex justify-between items-center">
            <span>账号安全</span>
            <span className="text-gray-400">›</span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span>通知设置</span>
            <span className="text-gray-400">›</span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span>隐私</span>
            <span className="text-gray-400">›</span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span>关于</span>
            <span className="text-gray-400">›</span>
          </div>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        退出登录
      </button>
    </div>
  );
};

// 添加通知页面组件
const NotificationsPage = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">通知</h1>
    <div className="bg-white rounded-lg shadow divide-y">
      <div className="p-4">
        <h3 className="font-medium">系统通知</h3>
        <p className="text-gray-500 text-sm mt-1">欢迎使用移动应用!</p>
        <p className="text-xs text-gray-400 mt-2">今天 10:00</p>
      </div>
      <div className="p-4">
        <h3 className="font-medium">活动提醒</h3>
        <p className="text-gray-500 text-sm mt-1">您有一个新的活动邀请</p>
        <p className="text-xs text-gray-400 mt-2">昨天 14:30</p>
      </div>
    </div>
  </div>
);

// 移动端布局组件 - 包含底部导航
const MobileLayout = () => {
  const location = useLocation();
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 pb-16">
        <Outlet />
      </div>
      
      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around">
          <Link 
            to="/mobile"
            className={`flex flex-col items-center py-2 px-4 ${
              location.pathname === '/mobile' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <HomeIcon className="w-6 h-6 mb-1" />
            <span className="text-xs">首页</span>
          </Link>
          <Link 
            to="/mobile/notifications"
            className={`flex flex-col items-center py-2 px-4 ${
              location.pathname === '/mobile/notifications' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <BellIcon className="w-6 h-6 mb-1" />
            <span className="text-xs">通知</span>
          </Link>
          <Link 
            to="/mobile/profile"
            className={`flex flex-col items-center py-2 px-4 ${
              location.pathname === '/mobile/profile' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <UserIcon className="w-6 h-6 mb-1" />
            <span className="text-xs">我的</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

// 主应用组件
const App = () => {
  // 创建路由器配置
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Navigate to="/mobile" replace />,
      errorElement: <ErrorPage />
    },
    {
      path: '/mobile/login',
      element: <LoginPage />,
      errorElement: <ErrorPage />
    },
    {
      path: '/mobile',
      element: (
        <ProtectedRoute>
          <MobileLayout />
        </ProtectedRoute>
      ),
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <HomePage />
        },
        {
          path: 'profile',
          element: <ProfilePage />
        },
        {
          path: 'notifications',
          element: <NotificationsPage />
        }
      ]
    },
    {
      path: '*',
      element: <PageNotFound />
    }
  ]);

  return <RouterProvider router={router} />;
};

// 渲染应用到DOM
const initApp = () => {
  // 注入全局样式
  injectGlobalStyles();
  
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
};

// 初始化应用
initApp(); 