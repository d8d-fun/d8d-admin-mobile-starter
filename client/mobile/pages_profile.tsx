import React from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { UserAPI } from './api.ts'
import type { User } from '../share/types.ts'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<Omit<User, 'id' | 'role' | 'avatar'> & { password?: string }>()
  const [loading, setLoading] = React.useState(false)
  const [user, setUser] = React.useState<User | null>(null)

  // 获取当前用户信息
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await UserAPI.getUsers({ limit: 1 })
        if (res.data?.length > 0) {
          const userData = res.data[0]
          setUser(userData)
          setValue('username', userData.username)
          setValue('nickname', userData.nickname)
          setValue('email', userData.email)
          setValue('phone', userData.phone)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    }
    fetchUser()
  }, [setValue])

  // 提交表单更新用户信息
  const onSubmit = async (data: User) => {
    try {
      setLoading(true)
      if (!user?.id) return
      
      const updatedUser = await UserAPI.updateUser(user.id, {
        nickname: data.nickname,
        email: data.email,
        phone: data.phone,
        ...(data.password ? { password: data.password } : {})
      })
      
      setUser(updatedUser.data)
      alert('更新成功')
    } catch (error) {
      console.error('更新失败:', error)
      alert('更新失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">个人信息</h1>
      
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
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存'}
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
  )
}