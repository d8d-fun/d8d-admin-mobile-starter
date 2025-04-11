import React, { useState, useEffect } from 'react';
import { 
  Layout, Menu, Button, Table, Space,
  Form, Input, Select, message, Modal,
  Card, Spin, Row, Col, Breadcrumb, Avatar,
  Dropdown, ConfigProvider, theme, Typography,
  Switch, Badge, Image, Upload, Divider, Descriptions,
  Popconfirm, Tag, Statistic, DatePicker, Radio, Progress, Tabs, List, Alert, Collapse, Empty, Drawer,
  Tree
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  UserOutlined,
  GlobalOutlined
} from '@ant-design/icons';   
import {
  useQuery,
} from '@tanstack/react-query';
import 'dayjs/locale/zh-cn';
import AMap from './components_amap.tsx'; // 导入地图组件
// 从share/types.ts导入所有类型，包括MapMode
import type { 
   MarkerData, LoginLocation, LoginLocationDetail, User
} from '../share/types.ts';

import { MapAPI,UserAPI } from './api.ts';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;


// 地图页面组件
export const LoginMapPage = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // 获取登录位置数据
  const { data: locations = [], isLoading: markersLoading } = useQuery<LoginLocation[]>({
    queryKey: ['loginLocations', selectedTimeRange, selectedUserId],
    queryFn: async () => {
      try {
        let params: any = {};
        
        if (selectedTimeRange) {
          params.startTime = selectedTimeRange[0].format('YYYY-MM-DD HH:mm:ss');
          params.endTime = selectedTimeRange[1].format('YYYY-MM-DD HH:mm:ss');
        }
        
        if (selectedUserId) {
          params.userId = selectedUserId;
        }
        
        const result = await MapAPI.getMarkers(params);
        return result.data;
      } catch (error) {
        console.error("获取登录位置数据失败:", error);
        message.error("获取登录位置数据失败");
        return [];
      }
    },
    refetchInterval: 30000 // 30秒刷新一次
  });

  // 获取用户列表
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const response = await UserAPI.getUsers();
        return response.data || [];
      } catch (error) {
        console.error("获取用户列表失败:", error);
        message.error("获取用户列表失败");
        return [];
      }
    }
  });

  // 获取选中标记点的详细信息
  const { data: markerDetail, isLoading: detailLoading } = useQuery<LoginLocationDetail | undefined>({
    queryKey: ['loginLocation', selectedMarker?.id],
    queryFn: async () => {
      if (!selectedMarker?.id) return undefined;
      try {
        const result = await MapAPI.getLocationDetail(Number(selectedMarker.id));
        return result.data;
      } catch (error) {
        console.error("获取登录位置详情失败:", error);
        message.error("获取登录位置详情失败");
        return undefined;
      }
    },
    enabled: !!selectedMarker?.id
  });

  // 处理标记点点击
  const handleMarkerClick = (marker: MarkerData) => {
    setSelectedMarker(marker);
    setDrawerVisible(true);
  };

  // 渲染地图标记点
  const renderMarkers = (locations: LoginLocation[] = []): MarkerData[] => {
    if (!Array.isArray(locations)) return [];
    
    return locations
      .filter(location => location?.longitude !== null && location?.latitude !== null)
      .map(location => ({
        id: location.id?.toString() || '',
        longitude: location.longitude as number,
        latitude: location.latitude as number,
        title: location.user?.nickname || location.user?.username || '未知用户',
        description: `登录时间: ${dayjs(location.loginTime).format('YYYY-MM-DD HH:mm:ss')}\nIP地址: ${location.ipAddress}`,
        status: 'online',
        type: 'login',
        extraData: location
      }));
  };

  return (
    <div className="h-full">
      <Card style={{ marginBottom: 16 }}>
        <Space direction="horizontal" size={16} wrap>
          <RangePicker
            showTime
            onChange={(dates) => setSelectedTimeRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            placeholder={['开始时间', '结束时间']}
          />
          <Select
            style={{ width: 200 }}
            placeholder="选择用户"
            allowClear
            onChange={(value) => setSelectedUserId(value)}
            options={users.map((user: User) => ({
              label: user.nickname || user.username,
              value: user.id
            }))}
          />
          <Button 
            type="primary"
            onClick={() => {
              setSelectedTimeRange(null);
              setSelectedUserId(null);
            }}
          >
            重置筛选
          </Button>
        </Space>
      </Card>

      <Card style={{ height: 'calc(100% - 80px)' }}>
        <Spin spinning={markersLoading}>
          <div style={{ height: '100%', minHeight: '500px' }}>
            <AMap
              markers={renderMarkers(locations || [])}
              center={locations[0] && locations[0].longitude !== null && locations[0].latitude !== null 
                ? [locations[0].longitude, locations[0].latitude] as [number, number] 
                : undefined}
              onMarkerClick={handleMarkerClick}
              height={'100%'}
            />
          </div>
        </Spin>
      </Card>

      <Drawer
        title="登录位置详情"
        placement="right"
        onClose={() => {
          setDrawerVisible(false);
          setSelectedMarker(null);
        }}
        open={drawerVisible}
        width={400}
      >
        {detailLoading ? (
          <Spin />
        ) : markerDetail ? (
          <Descriptions column={1}>
            <Descriptions.Item label={<><UserOutlined /> 用户</>}>
              {markerDetail.user?.nickname || markerDetail.user?.username || '未知用户'}
            </Descriptions.Item>
            <Descriptions.Item label={<><ClockCircleOutlined /> 登录时间</>}>
              {dayjs(markerDetail.login_time).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label={<><GlobalOutlined /> IP地址</>}>
              {markerDetail.ip_address}
            </Descriptions.Item>
            <Descriptions.Item label={<><EnvironmentOutlined /> 位置名称</>}>
              {markerDetail.location_name || '未知位置'}
            </Descriptions.Item>
            <Descriptions.Item label="经度">
              {markerDetail.longitude}
            </Descriptions.Item>
            <Descriptions.Item label="纬度">
              {markerDetail.latitude}
            </Descriptions.Item>
            <Descriptions.Item label="浏览器信息">
              <Typography.Paragraph ellipsis={{ rows: 2 }}>
                {markerDetail.user_agent}
              </Typography.Paragraph>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div>暂无详细信息</div>
        )}
      </Drawer>
    </div>
  );
};
