import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { Button, Table, Space, Modal, Form, Input, Select, message } from 'antd';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import { MessageAPI } from './api.ts';
import { UserAPI } from './api.ts';
import type { UserMessage } from '../share/types.ts';
import { MessageStatusNameMap , MessageStatus} from '../share/types.ts';

export  const MessagesPage = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchParams, setSearchParams] = useState({
    page: 1,
    pageSize: 10,
    type: undefined,
    status: undefined,
    search: undefined
  });

  // 获取消息列表
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', searchParams],
    queryFn: () => MessageAPI.getMessages(searchParams),
  });

  // 获取用户列表
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => UserAPI.getUsers({ page: 1, limit: 1000 }),
  });

  // 获取未读消息数
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
      message.success('标记已读成功');
    },
  });

  // 删除消息
  const deleteMutation = useMutation({
    mutationFn: (id: number) => MessageAPI.deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      message.success('删除成功');
    },
  });

  // 发送消息
  const sendMessageMutation = useMutation({
    mutationFn: (data: any) => MessageAPI.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      message.success('发送成功');
      setIsModalVisible(false);
      form.resetFields();
    },
  });

  const columns: TableProps<UserMessage>['columns'] = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '发送人',
      dataIndex: 'sender_name',
      key: 'sender_name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: MessageStatus) => (
        <span style={{ color: status === MessageStatus.UNREAD ? 'red' : 'green' }}>
          {MessageStatusNameMap[status]}
        </span>
      ),
    },
    {
      title: '发送时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            onClick={() => markAsReadMutation.mutate(record.id)}
            disabled={record.status === MessageStatus.READ}
          >
            标记已读
          </Button>
          <Button 
            type="link" 
            danger 
            onClick={() => deleteMutation.mutate(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleSearch = (values: any) => {
    setSearchParams({
      ...searchParams,
      ...values,
      page: 1
    });
  };

  const handleTableChange = (pagination: any) => {
    setSearchParams({
      ...searchParams,
      page: pagination.current,
      pageSize: pagination.pageSize
    });
  };

  const handleSendMessage = (values: any) => {
    sendMessageMutation.mutate(values);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">消息管理</h1>
        <div className="flex items-center space-x-4">
          {unreadCount && unreadCount.count > 0 && (
            <span className="text-red-500">{unreadCount.count}条未读</span>
          )}
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            发送消息
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <Form layout="inline" onFinish={handleSearch} className="mb-4">
          <Form.Item name="type" label="类型">
            <Select
              style={{ width: 120 }}
              allowClear
              options={[
                { value: 'SYSTEM', label: '系统消息' },
                { value: 'NOTICE', label: '公告' },
                { value: 'PERSONAL', label: '个人消息' },
              ]}
            />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              style={{ width: 120 }}
              allowClear
              options={[
                { value: 'UNREAD', label: '未读' },
                { value: 'READ', label: '已读' },
              ]}
            />
          </Form.Item>
          <Form.Item name="search" label="搜索">
            <Input placeholder="输入标题或内容" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={messages?.data}
          loading={isLoading}
          rowKey="id"
          pagination={{
            current: searchParams.page,
            pageSize: searchParams.pageSize,
            total: messages?.pagination?.total,
            showSizeChanger: true,
          }}
          onChange={handleTableChange}
        />
      </div>

      <Modal
        title="发送消息"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSendMessage}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入消息标题" />
          </Form.Item>

          <Form.Item
            name="type"
            label="消息类型"
            rules={[{ required: true, message: '请选择消息类型' }]}
          >
            <Select
              options={[
                { value: 'SYSTEM', label: '系统消息' },
                { value: 'NOTICE', label: '公告' },
                { value: 'PERSONAL', label: '个人消息' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="receiver_ids"
            label="接收人"
            rules={[{ required: true, message: '请选择接收人' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择接收人"
              options={users?.data?.map((user: any) => ({
                value: user.id,
                label: user.username,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入消息内容' }]}
          >
            <Input.TextArea rows={6} placeholder="请输入消息内容" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={sendMessageMutation.status === 'pending'}
            >
              发送
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};