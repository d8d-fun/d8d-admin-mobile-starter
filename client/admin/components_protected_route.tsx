import React, { useEffect } from 'react';
import { 
  useNavigate,
} from 'react-router';


import { useAuth } from './hooks_sys.tsx';


export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
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