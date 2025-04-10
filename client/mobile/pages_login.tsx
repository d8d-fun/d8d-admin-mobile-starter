import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRightIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from './hooks.tsx';
import { handleApiError } from './utils.ts';

// 登录页面组件
const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('用户名和密码不能为空');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-500 to-blue-700 p-6">
      {/* 顶部Logo和标题 */}
      <div className="flex flex-col items-center justify-center mt-10 mb-8">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <svg className="w-12 h-12 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white">
          {window.CONFIG?.APP_NAME || '移动应用'}
        </h1>
        <p className="text-blue-100 mt-2">登录您的账户</p>
      </div>

      {/* 登录表单 */}
      <div className="bg-white rounded-xl shadow-xl p-6 w-full">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="username">
              用户名
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入用户名"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
              密码
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入密码"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <ArrowRightIcon className="h-5 w-5 mr-2" />
            )}
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-700"
            onClick={() => navigate('/register')}
          >
            注册账号
          </button>
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            忘记密码?
          </button>
        </div>
      </div>
      
      {/* 底部文本 */}
      <div className="mt-auto pt-8 text-center text-blue-100 text-sm">
        &copy; {new Date().getFullYear()} {window.CONFIG?.APP_NAME || '移动应用'} 
        <p className="mt-1">保留所有权利</p>
      </div>
    </div>
  );
};

export default LoginPage; 