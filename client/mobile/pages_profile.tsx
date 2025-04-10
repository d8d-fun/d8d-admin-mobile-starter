import React from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@tanstack/react-query'
import { UserAPI } from './api.ts'
import type { User } from '../share/types.ts'
import { useAuth } from './hooks.tsx'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<{
    username: string
    nickname: string
    email: string
    phone?: string
    password?: string
  }>()

  // 获取当前用户信息
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await UserAPI.getUsers({ limit: 1 })
      if (res.data?.length > 0) {
        const userData = res.data[0]
        setValue('username', userData.username)
        setValue('nickname', userData.nickname || '')
        setValue('email', userData.email || '')
        setValue('phone', userData.phone || '')
        return userData
      }
      return null
    }
  })

  
    // 更新用户信息
    const { mutate: updateUser, isPending } = useMutation({
      mutationFn: async (data: {
        nickname: string
        email: string
        phone?: string
        password?: string
      }) => {
        if (!user?.id) throw new Error('用户ID不存在')
        return UserAPI.updateUser(user.id, {
          nickname: data.nickname,
          email: data.email,
          phone: data.phone,
          ...(data.password ? { password: data.password } : {})
        })
      },
      onSuccess: (updatedUser) => {
        alert('更新成功')
      },
      onError: (error) => {
        console.error('更新失败:', error)
        alert('更新失败')
      }
    })

  const onSubmit = (data: {
    username: string
    nickname: string
    email: string
    phone?: string
    password?: string
  }) => {
    updateUser({
      nickname: data.nickname,
      email: data.email,
      phone: data.phone,
      password: data.password
    })
  }

  const { logout } = useAuth()

  const handleLogout = async () => {
    if (confirm('确定要退出登录吗？')) {
      await logout()
      navigate('/mobile/login')
    }
  }

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
      
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-lg font-semibold mb-4">编辑信息</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input
            {...register('username')}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
          <input
            {...register('nickname', { required: '请输入昵称' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.nickname && <p className="mt-1 text-sm text-red-600">{errors.nickname.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input
            {...register('email', { 
              required: '请输入邮箱',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '请输入有效的邮箱地址'
              }
            })}
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
          <input
            {...register('phone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
          <input
            {...register('password')}
            type="password"
            placeholder="留空则不修改密码"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isPending ? '保存中...' : '保存'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            返回
          </button>
        </div>
      </form>
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
  )
}