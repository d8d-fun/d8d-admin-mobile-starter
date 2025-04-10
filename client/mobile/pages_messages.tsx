import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { BellIcon } from '@heroicons/react/24/outline';


// 添加通知页面组件
import { MessageAPI } from './api.ts';

export const NotificationsPage = () => {
  const queryClient = useQueryClient();

  // 获取消息列表
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: () => MessageAPI.getMessages(),
  });

  // 获取未读消息数量
  const { data: unreadCount } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => MessageAPI.getUnreadCount(),
  });

  // 标记消息为已读
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => MessageAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  // 删除消息
  const deleteMutation = useMutation({
    mutationFn: (id: number) => MessageAPI.deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这条消息吗？')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">通知</h1>
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">通知</h1>
        {unreadCount && unreadCount.count > 0 ? (
          <div className="flex items-center">
            <BellIcon className="h-5 w-5 text-red-500 mr-1" />
            <span className="text-sm text-red-500">{unreadCount.count}条未读</span>
          </div>
        ) : null}
      </div>

      <div className="bg-white rounded-lg shadow divide-y">
        {messages?.data.map((message) => (
          <div key={message.id} className="p-4">
            <div className="flex justify-between items-start">
              <h3 className="font-medium">{message.title}</h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(message.id)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  标记已读
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(message.id)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  删除
                </button>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-1">{message.content}</p>
            <p className="text-xs text-gray-400 mt-2">
              {dayjs(message.created_at).format('YYYY-MM-DD HH:mm')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};