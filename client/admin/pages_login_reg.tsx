import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  message,
} from 'antd';
import {
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import {
  useAuth,
} from './hooks_sys.tsx';


// 登录页面
export const LoginPage = () => {
  const { login } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (values: { username: string; password: string }) => {
    try {
      setLoading(true);
      await login(values.username, values.password);
      // 登录成功后跳转到管理后台首页
      navigate('/admin/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.error || '登录失败');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录管理后台
          </h2>
        </div>
        
        <Card>
          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="用户名" 
                size="large"
              />
            </Form.Item>
            
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password 
                placeholder="密码" 
                size="large"
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                block
                loading={loading}
              >
                登录
              </Button>
            </Form.Item>
          </Form>
          
          <div className="mt-4 text-center text-gray-500">
            <p>测试账号: admin / admin123</p>
            {/* <p>普通账号: user1 / 123456</p> */}
          </div>
        </Card>
      </div>
    </div>
  );
};
