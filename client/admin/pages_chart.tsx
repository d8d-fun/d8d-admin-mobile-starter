import React from 'react';
import { 
  Layout, Menu, Button, Table, Space,
  Form, Input, Select, message, Modal,
  Card, Spin, Row, Col, Breadcrumb, Avatar,
  Dropdown, ConfigProvider, theme, Typography,
  Switch, Badge, Image, Upload, Divider, Descriptions,
  Popconfirm, Tag, Statistic, DatePicker, Radio, Progress, Tabs, List, Alert, Collapse, Empty, Drawer
} from 'antd';

import { 
  useQuery,
} from '@tanstack/react-query';
import { Line , Pie, Column} from "@ant-design/plots";
import 'dayjs/locale/zh-cn';


import { ChartAPI } from './api.ts';
import { useTheme } from './hooks_sys.tsx';

interface ChartTooltipInfo {
  items: Array<Record<string, any>>;
  title: string;
}

// 用户活跃度图表组件
const UserActivityChart: React.FC = () => {
  const { isDark } = useTheme();
  const { data: activityData, isLoading } = useQuery({
    queryKey: ['userActivity'],
    queryFn: async () => {
      const response = await ChartAPI.getUserActivity();
      return response.data;
    }
  });

  if (isLoading) return <Spin />;

  const config = {
    data: activityData || [],
    xField: 'date',
    yField: 'count',
    smooth: true,
    theme: isDark ? 'dark' : 'light',
    color: '#1890ff',
    areaStyle: {
      fill: 'l(270) 0:#1890ff10 1:#1890ff',
    },
  };

  return (
    <Card title="用户活跃度趋势" bordered={false}>
      <Line {...config} />
    </Card>
  );
};

// 文件上传统计图表组件
const FileUploadsChart: React.FC = () => {
  const { isDark } = useTheme();
  const { data: uploadsData, isLoading } = useQuery({
    queryKey: ['fileUploads'],
    queryFn: async () => {
      const response = await ChartAPI.getFileUploads();
      return response.data;
    }
  });

  if (isLoading) return <Spin />;

  const config = {
    data: uploadsData || [],
    xField: 'month',
    yField: 'count',
    theme: isDark ? 'dark' : 'light',
    color: '#52c41a',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    meta: {
      month: {
        alias: '月份',
      },
      count: {
        alias: '上传数量',
      },
    },
  };

  return (
    <Card title="文件上传统计" bordered={false}>
      <Column {...config} />
    </Card>
  );
};

// 文件类型分布图表组件
const FileTypesChart: React.FC = () => {
  const { isDark } = useTheme();
  const { data: typesData, isLoading } = useQuery({
    queryKey: ['fileTypes'],
    queryFn: async () => {
      const response = await ChartAPI.getFileTypes();
      return response.data;
    }
  });

  if (isLoading) return <Spin />;

  const config = {
    data: typesData || [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    theme: isDark ? 'dark' : 'light',
    label: {
      type: 'spider',
      labelHeight: 28,
      content: '{name}\n{percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  return (
    <Card title="文件类型分布" bordered={false}>
      <Pie {...config} />
    </Card>
  );
};

// 仪表盘概览组件
const DashboardOverview: React.FC = () => {
  const { data: overviewData, isLoading } = useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: async () => {
      const response = await ChartAPI.getDashboardOverview();
      return response.data;
    }
  });

  if (isLoading) return <Spin />;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={12} sm={12} md={6}>
        <Card bordered={false}>
          <Statistic
            title="用户总数"
            value={overviewData?.userCount || 0}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={12} md={6}>
        <Card bordered={false}>
          <Statistic
            title="文件总数"
            value={overviewData?.fileCount || 0}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={12} md={6}>
        <Card bordered={false}>
          <Statistic
            title="文章总数"
            value={overviewData?.articleCount || 0}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={12} md={6}>
        <Card bordered={false}>
          <Statistic
            title="今日登录"
            value={overviewData?.todayLoginCount || 0}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

// 图表仪表盘页面组件
export const ChartDashboardPage: React.FC = () => {
  return (
    <div className="chart-dashboard">
      <DashboardOverview />
      <div style={{ height: 24 }} />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <UserActivityChart />
        </Col>
        <Col xs={24} lg={12}>
          <FileUploadsChart />
        </Col>
        <Col xs={24}>
          <FileTypesChart />
        </Col>
      </Row>
    </div>
  );
};
