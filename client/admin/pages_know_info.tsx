import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  KnowInfoAPI,
  type KnowInfoListResponse
} from './api.ts';


// 配置 dayjs 插件
dayjs.extend(weekday);
dayjs.extend(localeData);

// 设置 dayjs 语言
dayjs.locale('zh-cn');

const { Title } = Typography;


// 知识库管理页面组件
export const KnowInfoPage = () => {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({
    title: '',
    category: '',
    page: 1,
    limit: 10,
  });
  
  // 使用React Query获取知识库文章列表
  const { data: articlesData, isLoading: isListLoading, refetch } = useQuery({
    queryKey: ['knowInfos', searchParams],
    queryFn: () => KnowInfoAPI.getKnowInfos({
      page: searchParams.page,
      pageSize: searchParams.limit,
      title: searchParams.title,
      category: searchParams.category
    }),
    placeholderData: {
      data: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        totalPages: 1
      }
    }
  });
  
  const articles = React.useMemo(() => (articlesData as KnowInfoListResponse)?.data || [], [articlesData]);
  const pagination = React.useMemo(() => ({
    current: (articlesData as KnowInfoListResponse)?.pagination?.current || 1,
    pageSize: (articlesData as KnowInfoListResponse)?.pagination?.pageSize || 10,
    total: (articlesData as KnowInfoListResponse)?.pagination?.total || 0,
    totalPages: (articlesData as KnowInfoListResponse)?.pagination?.totalPages || 1
  }), [articlesData]);
  
  // 获取单个知识库文章
  const fetchArticle = async (id: number) => {
    try {
      const response = await KnowInfoAPI.getKnowInfo(id);
      return response.data;
    } catch (error) {
      message.error('获取知识库文章详情失败');
      return null;
    }
  };
  
  // 处理表单提交
  const handleSubmit = async (values: Partial<KnowInfo>) => {
    console.log('handleSubmit', values)
    try {
      const response = formMode === 'create'
        ? await KnowInfoAPI.createKnowInfo(values)
        : await KnowInfoAPI.updateKnowInfo(editingId!, values);
      
      message.success(formMode === 'create' ? '创建知识库文章成功' : '更新知识库文章成功');
      setModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error) {
      message.error((error as Error).message);
    }
  };
  
  // 处理编辑
  const handleEdit = async (id: number) => {
    const article = await fetchArticle(id);
    
    if (article) {
      setFormMode('edit');
      setEditingId(id);
      form.setFieldsValue(article);
      setModalVisible(true);
    }
  };
  
  // 处理删除
  const handleDelete = async (id: number) => {
    try {
      await KnowInfoAPI.deleteKnowInfo(id);
      
      message.success('删除知识库文章成功');
      refetch();
    } catch (error) {
      message.error((error as Error).message);
    }
  };
  
  // 处理搜索
  const handleSearch = async (values: any) => {
    try {
      queryClient.removeQueries({ queryKey: ['knowInfos'] });
      setSearchParams({
        title: values.title || '',
        category: values.category || '',
        page: 1,
        limit: searchParams.limit,
      });
    } catch (error) {
      message.error('搜索失败');
    }
  };
  
  // 处理分页
  const handlePageChange = (page: number, pageSize?: number) => {
    setSearchParams(prev => ({
      ...prev,
      page,
      limit: pageSize || prev.limit,
    }));
  };
  
  // 处理添加
  const handleAdd = () => {
    setFormMode('create');
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };
  
  // 审核状态映射
  const auditStatusOptions = getEnumOptions(AuditStatus, AuditStatusNameMap);
  
  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string) => tags ? tags.split(',').map(tag => (
        <Tag key={tag}>{tag}</Tag>
      )) : null,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: '审核状态',
      dataIndex: 'audit_status',
      key: 'audit_status',
      render: (status: AuditStatus) => {
        let color = '';
        let text = '';
        
        switch(status) {
          case AuditStatus.PENDING:
            color = 'orange';
            text = '待审核';
            break;
          case AuditStatus.APPROVED:
            color = 'green';
            text = '已通过';
            break;
          case AuditStatus.REJECTED:
            color = 'red';
            text = '已拒绝';
            break;
          default:
            color = 'default';
            text = '未知';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: KnowInfo) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record.id)}>编辑</Button>
          <Popconfirm
            title="确定要删除这篇文章吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  return (
    <div>
      <Card title="知识库管理" className="mb-4">
        <Form
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: '16px' }}
        >
          <Form.Item name="title" label="标题">
            <Input placeholder="请输入文章标题" />
          </Form.Item>
          
          <Form.Item name="category" label="分类">
            <Input placeholder="请输入文章分类" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                搜索
              </Button>
              <Button htmlType="reset" onClick={() => {
                setSearchParams({
                  title: '',
                  category: '',
                  page: 1,
                  limit: 10,
                });
              }}>
                重置
              </Button>
              <Button type="primary" onClick={handleAdd}>
                添加文章
              </Button>
            </Space>
          </Form.Item>
        </Form>
        
        <Table
          columns={columns}
          dataSource={articles}
          rowKey="id"
          loading={{
            spinning: isListLoading,
            tip: '正在加载数据...',
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handlePageChange,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
      
      <Modal
        title={formMode === 'create' ? '添加知识库文章' : '编辑知识库文章'}
        open={modalVisible}
        onOk={() => {
          console.log('onOk', form.getFieldsValue())
          form.submit()
        }}
        onCancel={() => setModalVisible(false)}
        width={800}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            audit_status: AuditStatus.PENDING,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="文章标题"
                rules={[{ required: true, message: '请输入文章标题' }]}
              >
                <Input placeholder="请输入文章标题" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="文章分类"
              >
                <Input placeholder="请输入文章分类" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="tags"
            label="文章标签"
            help="多个标签请用英文逗号分隔，如: 服务器,网络,故障"
          >
            <Input placeholder="请输入文章标签，多个标签请用英文逗号分隔" />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="文章内容"
            rules={[{ required: true, message: '请输入文章内容' }]}
          >
            <Input.TextArea rows={15} placeholder="请输入文章内容，支持Markdown格式" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="author"
                label="文章作者"
              >
                <Input placeholder="请输入文章作者" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="cover_url"
                label="封面图片URL"
              >
                <Input placeholder="请输入封面图片URL" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="audit_status"
            label="审核状态"
          >
            <Select options={auditStatusOptions} />
          </Form.Item>
          
        </Form>
      </Modal>
    </div>
  );
};
