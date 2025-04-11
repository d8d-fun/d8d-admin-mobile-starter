import React, { useState, useEffect } from 'react';
import { 
  Layout, Menu, Button, Table, Space,
  Form, Input, Select, message, Modal,
  Card, Spin, Row, Col, Breadcrumb, Avatar,
  Dropdown, ConfigProvider, theme, Typography,
  Switch, Badge, Image, Upload, Divider, Descriptions,
  Popconfirm, Tag, Statistic, DatePicker, Radio, Progress, Tabs, List, Alert, Collapse, Empty, Drawer
} from 'antd';
import {
  UploadOutlined,
  FileImageOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  FileOutlined,
} from '@ant-design/icons';   
import { 
  useQuery,
} from '@tanstack/react-query';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import { uploadMinIOWithPolicy,uploadOSSWithPolicy } from '@d8d-appcontainer/api';
import type { MinioUploadPolicy, OSSUploadPolicy } from '@d8d-appcontainer/types';
import 'dayjs/locale/zh-cn';
import type { 
  FileLibrary, FileCategory, KnowInfo
} from '../share/types.ts';

import {
   AuditStatus,AuditStatusNameMap,
   OssType,
} from '../share/types.ts';

import { getEnumOptions } from './utils.ts';

import {
  FileAPI,
  UserAPI,
} from './api.ts';


// 配置 dayjs 插件
dayjs.extend(weekday);
dayjs.extend(localeData);

// 设置 dayjs 语言
dayjs.locale('zh-cn');

const { Title } = Typography;


// 仪表盘页面
export const DashboardPage = () => {
  return (
    <div>
      <Title level={2}>仪表盘</Title>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="活跃用户"
              value={112893}
              loading={false}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="系统消息"
              value={93}
              loading={false}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="在线用户"
              value={1128}
              loading={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// 用户管理页面
export const UsersPage = () => {
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10,
    search: ''
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form] = Form.useForm();

  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['users', searchParams],
    queryFn: async () => {
      return await UserAPI.getUsers(searchParams);
    }
  });

  const users = usersData?.data || [];
  const pagination = {
    current: searchParams.page,
    pageSize: searchParams.limit,
    total: usersData?.pagination?.total || 0
  };

  // 处理搜索
  const handleSearch = (values: any) => {
    setSearchParams(prev => ({
      ...prev,
      search: values.search || '',
      page: 1
    }));
  };

  // 处理分页变化
  const handleTableChange = (newPagination: any) => {
    setSearchParams(prev => ({
      ...prev,
      page: newPagination.current,
      limit: newPagination.pageSize
    }));
  };

  // 打开创建用户模态框
  const showCreateModal = () => {
    setModalTitle('创建用户');
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑用户模态框
  const showEditModal = (user: any) => {
    setModalTitle('编辑用户');
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  // 处理模态框确认
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingUser) {
        // 编辑用户
        await UserAPI.updateUser(editingUser.id, values);
        message.success('用户更新成功');
      } else {
        // 创建用户
        await UserAPI.createUser(values);
        message.success('用户创建成功');
      }
      
      setModalVisible(false);
      form.resetFields();
      refetch(); // 刷新用户列表
    } catch (error) {
      console.error('表单提交失败:', error);
      message.error('操作失败，请重试');
    }
  };

  // 处理删除用户
  const handleDelete = async (id: number) => {
    try {
      await UserAPI.deleteUser(id);
      message.success('用户删除成功');
      refetch(); // 刷新用户列表
    } catch (error) {
      console.error('删除用户失败:', error);
      message.error('删除失败，请重试');
    }
  };
  
  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="link" onClick={() => showEditModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除此用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  return (
    <div>
      <Title level={2}>用户管理</Title>
      <Card>
        <Form layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
          <Form.Item name="search" label="搜索">
            <Input placeholder="用户名/昵称/邮箱" allowClear />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                搜索
              </Button>
              <Button type="primary" onClick={showCreateModal}>
                创建用户
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={users}
          loading={isLoading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* 创建/编辑用户模态框 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' }
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="nickname"
            label="昵称"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Select.Option value="user">普通用户</Select.Option>
              <Select.Option value="admin">管理员</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 文件库管理页面
export const FileLibraryPage = () => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<FileLibrary[]>([]);
  const [categories, setCategories] = useState<FileCategory[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchParams, setSearchParams] = useState({
    fileType: '',
    keyword: ''
  });
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [fileDetailModalVisible, setFileDetailModalVisible] = useState(false);
  const [currentFile, setCurrentFile] = useState<FileLibrary | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<FileCategory | null>(null);

  // 获取文件图标
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) {
      return <FileImageOutlined style={{ fontSize: '24px', color: '#1890ff' }} />;
    } else if (fileType.includes('pdf')) {
      return <FilePdfOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />;
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return <FileExcelOutlined style={{ fontSize: '24px', color: '#52c41a' }} />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileWordOutlined style={{ fontSize: '24px', color: '#2f54eb' }} />;
    } else {
      return <FileOutlined style={{ fontSize: '24px', color: '#faad14' }} />;
    }
  };

  // 加载文件列表
  const fetchFileList = async () => {
    setLoading(true);
    try {
      const response = await FileAPI.getFileList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams
      });
      
      if (response && response.data) {
        setFileList(response.data.list);
        setPagination({
          ...pagination,
          total: response.data.pagination.total
        });
      }
    } catch (error) {
      console.error('获取文件列表失败:', error);
      message.error('获取文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载文件分类
  const fetchCategories = async () => {
    try {
      const response = await FileAPI.getCategories();
      if (response && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('获取文件分类失败:', error);
      message.error('获取文件分类失败');
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    fetchFileList();
    fetchCategories();
  }, [pagination.current, pagination.pageSize, searchParams]);

  // 上传文件
  const handleUpload = async (file: File) => {
    try {
      setUploadLoading(true);
      
      // 1. 获取上传策略
      const policyResponse = await FileAPI.getUploadPolicy(file.name);
      if (!policyResponse || !policyResponse.data) {
        throw new Error('获取上传策略失败');
      }
      
      const policy = policyResponse.data;
      
      // 2. 上传文件至 MinIO
      const uploadProgress = {
        progress: 0,
        completed: false,
        error: null as Error | null
      };
      
      const callbacks = {
        onProgress: (event: { progress: number }) => {
          uploadProgress.progress = event.progress;
        },
        onComplete: () => {
          uploadProgress.completed = true;
        },
        onError: (err: Error) => {
          uploadProgress.error = err;
        }
      };
      
      const uploadUrl = window.CONFIG?.OSS_TYPE === OssType.MINIO ? await uploadMinIOWithPolicy(
        policy as MinioUploadPolicy,
        file,
        file.name,
        callbacks
      ) : await uploadOSSWithPolicy(
        policy as OSSUploadPolicy,
        file,
        file.name,
        callbacks
      );
      
      if (!uploadUrl || uploadProgress.error) {
        throw uploadProgress.error || new Error('上传文件失败');
      }
      
      // 3. 保存文件信息到文件库
      const fileValues = form.getFieldsValue();
      const fileData = {
        file_name: file.name,
        file_path: uploadUrl,
        file_type: file.type,
        file_size: file.size,
        category_id: fileValues.category_id ? Number(fileValues.category_id) : undefined,
        tags: fileValues.tags,
        description: fileValues.description
      };
      
      const saveResponse = await FileAPI.saveFileInfo(fileData);
      
      if (saveResponse && saveResponse.data) {
        message.success('文件上传成功');
        setUploadModalVisible(false);
        form.resetFields();
        fetchFileList();
      }
    } catch (error) {
      console.error('上传文件失败:', error);
      message.error('上传文件失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setUploadLoading(false);
    }
  };

  // 处理文件上传
  const uploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    beforeUpload: (file: File) => {
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过10MB！');
        return false;
      }
      handleUpload(file);
      return false;
    }
  };

  // 查看文件详情
  const viewFileDetail = async (id: number) => {
    try {
      const response = await FileAPI.getFileInfo(id);
      if (response && response.data) {
        setCurrentFile(response.data);
        setFileDetailModalVisible(true);
      }
    } catch (error) {
      console.error('获取文件详情失败:', error);
      message.error('获取文件详情失败');
    }
  };

  // 下载文件
  const downloadFile = async (file: FileLibrary) => {
    try {
      // 更新下载计数
      await FileAPI.updateDownloadCount(file.id);
      
      // 创建一个暂时的a标签用于下载
      const link = document.createElement('a');
      link.href = file.file_path;
      link.target = '_blank';
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('下载已开始');
    } catch (error) {
      console.error('下载文件失败:', error);
      message.error('下载文件失败');
    }
  };

  // 删除文件
  const handleDeleteFile = async (id: number) => {
    try {
      await FileAPI.deleteFile(id);
      message.success('文件删除成功');
      fetchFileList();
    } catch (error) {
      console.error('删除文件失败:', error);
      message.error('删除文件失败');
    }
  };

  // 处理搜索
  const handleSearch = (values: any) => {
    setSearchParams(values);
    setPagination({
      ...pagination,
      current: 1
    });
  };

  // 处理表格分页变化
  const handleTableChange = (newPagination: any) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    });
  };

  // 添加或更新分类
  const handleCategorySave = async () => {
    try {
      const values = await categoryForm.validateFields();
      
      if (currentCategory) {
        // 更新分类
        await FileAPI.updateCategory(currentCategory.id, values);
        message.success('分类更新成功');
      } else {
        // 创建分类
        await FileAPI.createCategory(values);
        message.success('分类创建成功');
      }
      
      setCategoryModalVisible(false);
      categoryForm.resetFields();
      setCurrentCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('保存分类失败:', error);
      message.error('保存分类失败');
    }
  };

  // 编辑分类
  const handleEditCategory = (category: FileCategory) => {
    setCurrentCategory(category);
    categoryForm.setFieldsValue(category);
    setCategoryModalVisible(true);
  };

  // 删除分类
  const handleDeleteCategory = async (id: number) => {
    try {
      await FileAPI.deleteCategory(id);
      message.success('分类删除成功');
      fetchCategories();
    } catch (error) {
      console.error('删除分类失败:', error);
      message.error('删除分类失败');
    }
  };

  // 文件表格列配置
  const columns = [
    {
      title: '文件名',
      key: 'file_name',
      render: (text: string, record: FileLibrary) => (
        <Space>
          {getFileIcon(record.file_type)}
          <a onClick={() => viewFileDetail(record.id)}>
            {record.original_filename || record.file_name}
          </a>
        </Space>
      )
    },
    {
      title: '文件类型',
      dataIndex: 'file_type',
      key: 'file_type',
      width: 120,
      render: (text: string) => text.split('/').pop()
    },
    {
      title: '大小',
      dataIndex: 'file_size',
      key: 'file_size',
      width: 100,
      render: (size: number) => {
        if (size < 1024) {
          return `${size} B`;
        } else if (size < 1024 * 1024) {
          return `${(size / 1024).toFixed(2)} KB`;
        } else {
          return `${(size / 1024 / 1024).toFixed(2)} MB`;
        }
      }
    },
    {
      title: '分类',
      dataIndex: 'category_id',
      key: 'category_id',
      width: 120
    },
    {
      title: '上传者',
      dataIndex: 'uploader_name',
      key: 'uploader_name',
      width: 120
    },
    {
      title: '下载次数',
      dataIndex: 'download_count',
      key: 'download_count',
      width: 120
    },
    {
      title: '上传时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: FileLibrary) => (
        <Space size="middle">
          <Button type="link" onClick={() => downloadFile(record)}>
            下载
          </Button>
          <Popconfirm
            title="确定要删除这个文件吗？"
            onConfirm={() => handleDeleteFile(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 分类表格列配置
  const categoryColumns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '分类编码',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: FileCategory) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEditCategory(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个分类吗？"
            onConfirm={() => handleDeleteCategory(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>文件库管理</Title>
      
      <Card>
        <Tabs defaultActiveKey="files">
          <Tabs.TabPane tab="文件管理" key="files">
            {/* 搜索表单 */}
            <Form layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
              <Form.Item name="keyword" label="关键词">
                <Input placeholder="文件名/描述/标签" allowClear />
              </Form.Item>
              <Form.Item name="category_id" label="分类">
                <Select placeholder="选择分类" allowClear style={{ width: 160 }}>
                  {categories.map(category => (
                    <Select.Option key={category.id} value={category.id}>
                      {category.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="fileType" label="文件类型">
                <Select placeholder="选择文件类型" allowClear style={{ width: 160 }}>
                  <Select.Option value="image">图片</Select.Option>
                  <Select.Option value="document">文档</Select.Option>
                  <Select.Option value="application">应用</Select.Option>
                  <Select.Option value="audio">音频</Select.Option>
                  <Select.Option value="video">视频</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  搜索
                </Button>
              </Form.Item>
              <Button 
                type="primary" 
                onClick={() => setUploadModalVisible(true)}
                icon={<UploadOutlined />}
                style={{ marginLeft: 16 }}
              >
                上传文件
              </Button>
            </Form>
            
            {/* 文件列表 */}
            <Table
              columns={columns}
              dataSource={fileList}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
              onChange={handleTableChange}
            />
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="分类管理" key="categories">
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                onClick={() => {
                  setCurrentCategory(null);
                  categoryForm.resetFields();
                  setCategoryModalVisible(true);
                }}
              >
                添加分类
              </Button>
            </div>
            
            <Table
              columns={categoryColumns}
              dataSource={categories}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>
      
      {/* 上传文件弹窗 */}
      <Modal
        title="上传文件"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="file"
            label="文件"
            rules={[{ required: true, message: '请选择要上传的文件' }]}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} loading={uploadLoading}>
                选择文件
              </Button>
              <div style={{ marginTop: 8 }}>
                支持任意类型文件，单个文件不超过10MB
              </div>
            </Upload>
          </Form.Item>
          
          <Form.Item
            name="category_id"
            label="分类"
          >
            <Select placeholder="选择分类" allowClear>
              {categories.map(category => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="标签"
          >
            <Input placeholder="多个标签用逗号分隔" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={4} placeholder="文件描述..." />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 文件详情弹窗 */}
      <Modal
        title="文件详情"
        open={fileDetailModalVisible}
        onCancel={() => setFileDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setFileDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            onClick={() => currentFile && downloadFile(currentFile)}
          >
            下载
          </Button>
        ]}
        width={700}
      >
        {currentFile && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="系统文件名" span={2}>
              {currentFile.file_name}
            </Descriptions.Item>
            {currentFile.original_filename && (
              <Descriptions.Item label="原始文件名" span={2}>
                {currentFile.original_filename}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="文件类型">
              {currentFile.file_type}
            </Descriptions.Item>
            <Descriptions.Item label="文件大小">
              {currentFile.file_size < 1024 * 1024 
                ? `${(currentFile.file_size / 1024).toFixed(2)} KB` 
                : `${(currentFile.file_size / 1024 / 1024).toFixed(2)} MB`}
            </Descriptions.Item>
            <Descriptions.Item label="上传者">
              {currentFile.uploader_name}
            </Descriptions.Item>
            <Descriptions.Item label="上传时间">
              {dayjs(currentFile.created_at).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="分类">
              {currentFile.category_id}
            </Descriptions.Item>
            <Descriptions.Item label="下载次数">
              {currentFile.download_count}
            </Descriptions.Item>
            <Descriptions.Item label="标签" span={2}>
              {currentFile.tags?.split(',').map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {currentFile.description}
            </Descriptions.Item>
            {currentFile.file_type.startsWith('image/') && (
              <Descriptions.Item label="预览" span={2}>
                <Image src={currentFile.file_path} style={{ maxWidth: '100%' }} />
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
      
      {/* 分类管理弹窗 */}
      <Modal
        title={currentCategory ? "编辑分类" : "添加分类"}
        open={categoryModalVisible}
        onOk={handleCategorySave}
        onCancel={() => {
          setCategoryModalVisible(false);
          categoryForm.resetFields();
          setCurrentCategory(null);
        }}
      >
        <Form form={categoryForm} layout="vertical">
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          
          <Form.Item
            name="code"
            label="分类编码"
            rules={[{ required: true, message: '请输入分类编码' }]}
          >
            <Input placeholder="请输入分类编码" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="分类描述"
          >
            <Input.TextArea rows={4} placeholder="分类描述..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};