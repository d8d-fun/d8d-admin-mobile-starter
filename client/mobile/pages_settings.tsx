import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { UserAPI } from './api.ts'
import type { User } from '../share/types.ts'
import type { UserResponse } from './api.ts'

export default function SettingsPage() {
  const { data: userResponse, isLoading } = useQuery<UserResponse, Error, User>({
    queryKey: ['currentUser'],
    queryFn: () => UserAPI.getCurrentUser(),
    select: (response) => response.data
  })

  const { register, handleSubmit, formState: { errors }, reset } = useForm<{
    nickname: string
    email: string
    phone?: string
    password?: string
  }>()

  const { mutate: updateUser, isPending } = useMutation({
    mutationFn: async (data: {
      nickname: string
      email: string
      phone?: string
      password?: string
    }) => {
      return UserAPI.updateCurrentUser({
        nickname: data.nickname,
        email: data.email,
        phone: data.phone,
        ...(data.password ? { password: data.password } : {})
      })
    },
    onSuccess: () => alert('更新成功'),
    onError: (error) => {
      console.error('更新失败:', error)
      alert('更新失败')
    }
  })

  const onSubmit = (data: {
    nickname: string
    email: string
    phone?: string
    password?: string
  }) => {
    updateUser(data)
  }

  React.useEffect(() => {
    if (userResponse) {
      reset({
        nickname: userResponse.nickname || '',
        email: userResponse.email || '',
        phone: userResponse.phone || ''
      })
    }
  }, [userResponse, reset])

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">设置</h1>
        <div className="bg-white rounded-lg shadow p-4">
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">设置</h1>
      
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-lg font-semibold mb-4">编辑个人信息</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          </div>
        </form>
      </div>
    </div>
  )
}