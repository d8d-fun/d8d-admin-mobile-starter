import React, { useState, useEffect } from 'react';
import { 
  Layout, Menu, Button, Table, Space,
  Form, Input, Select, message, Modal,
  Card, Spin, Row, Col, Breadcrumb, Avatar,
  Dropdown, ConfigProvider, theme, Typography,
  Switch, Badge, Image, Upload, Divider, Descriptions,
  Popconfirm, Tag, Statistic, DatePicker, Radio, Progress, Tabs, List, Alert, Collapse, Empty, Drawer, InputNumber,ColorPicker,
  Popover
} from 'antd';
import {
  UploadOutlined,
  ReloadOutlined,
  SaveOutlined,
  BgColorsOutlined
} from '@ant-design/icons';
import { debounce } from 'lodash';
import { 
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import 'dayjs/locale/zh-cn';
import type { 
  FileLibrary, FileCategory, KnowInfo, SystemSetting, SystemSettingValue,
  ColorScheme
} from '../share/types.ts';
import { ThemeMode } from '../share/types.ts';

import {
  SystemSettingGroup,
  SystemSettingKey,
  FontSize,
  CompactMode, 
  AllowedFileType
} from '../share/types.ts';


import { getEnumOptions } from './utils.ts';

import {
  SystemAPI,
} from './api.ts';

import { useTheme } from './hooks_sys.tsx';

import { Uploader } from './components_uploader.tsx';

// 配置 dayjs 插件
dayjs.extend(weekday);
dayjs.extend(localeData);

// 设置 dayjs 语言
dayjs.locale('zh-cn');

const { Title } = Typography;

// 分组标题映射
const GROUP_TITLES: Record<typeof SystemSettingGroup[keyof typeof SystemSettingGroup], string> = {
  [SystemSettingGroup.BASIC]: '基础设置',
  [SystemSettingGroup.FEATURE]: '功能设置',
  [SystemSettingGroup.UPLOAD]: '上传设置',
  [SystemSettingGroup.NOTIFICATION]: '通知设置'
};

// 分组描述映射
const GROUP_DESCRIPTIONS: Record<typeof SystemSettingGroup[keyof typeof SystemSettingGroup], string> = {
  [SystemSettingGroup.BASIC]: '配置站点的基本信息',
  [SystemSettingGroup.FEATURE]: '配置系统功能的开启状态',
  [SystemSettingGroup.UPLOAD]: '配置文件上传相关的参数',
  [SystemSettingGroup.NOTIFICATION]: '配置系统通知的触发条件'
};

export const SettingsPage = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();

  // 获取系统设置
  const { data: settingsData, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: SystemAPI.getSettings,
  });

  // 更新系统设置
  const updateSettingsMutation = useMutation({
    mutationFn: (values: Partial<SystemSetting>[]) => SystemAPI.updateSettings(values),
    onSuccess: () => {
      message.success('基础设置已更新');
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
    },
    onError: (error) => {
      message.error('更新基础设置失败');
      console.error('更新基础设置失败:', error);
    },
  });

  // 重置系统设置
  const resetSettingsMutation = useMutation({
    mutationFn: SystemAPI.resetSettings,
    onSuccess: () => {
      message.success('基础设置已重置');
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
    },
    onError: (error) => {
      message.error('重置基础设置失败');
      console.error('重置基础设置失败:', error);
    },
  });

  // 初始化表单数据
  useEffect(() => {
    if (settingsData) {
      const formValues = settingsData.reduce((acc: Record<string, any>, group) => {
        group.settings.forEach(setting => {
          // 根据值的类型进行转换
          let value = setting.value;
          if (typeof value === 'string') {
            if (value === 'true' || value === 'false') {
              value = value === 'true';
            } else if (!isNaN(Number(value)) && !value.includes('.')) {
              value = parseInt(value, 10);
            } else if (setting.key === SystemSettingKey.ALLOWED_FILE_TYPES) {
              value = (value ? (value as string).split(',') : []) as unknown as string;
            }
          }
          acc[setting.key] = value;
        });
        return acc;
      }, {});
      form.setFieldsValue(formValues);
    }
  }, [settingsData, form]);

  // 处理表单提交
  const handleSubmit = async (values: Record<string, SystemSettingValue>) => {
    const settings = Object.entries(values).map(([key, value]) => ({
      key: key as typeof SystemSettingKey[keyof typeof SystemSettingKey],
      value: String(value),
      group: key.startsWith('SITE_') ? SystemSettingGroup.BASIC :
             key.startsWith('ENABLE_') || key.includes('LOGIN_') || key.includes('SESSION_') ? SystemSettingGroup.FEATURE :
             key.includes('UPLOAD_') || key.includes('FILE_') || key.includes('IMAGE_') ? SystemSettingGroup.UPLOAD :
             SystemSettingGroup.NOTIFICATION
    }));
    updateSettingsMutation.mutate(settings);
  };

  // 处理重置
  const handleReset = () => {
    Modal.confirm({
      title: '确认重置',
      content: '确定要将所有设置重置为默认值吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        resetSettingsMutation.mutate();
      },
    });
  };

  // 根据设置类型渲染不同的输入控件
  const renderSettingInput = (setting: SystemSetting) => {
    const value = setting.value;
    
    if (typeof value === 'boolean' || value === 'true' || value === 'false') {
      return <Switch checkedChildren="开启" unCheckedChildren="关闭" />;
    }
    
    if (setting.key === SystemSettingKey.ALLOWED_FILE_TYPES) {
      return <Select
        mode="tags"
        placeholder="请输入允许的文件类型"
        tokenSeparators={[',']}
        options={Object.values(AllowedFileType).map(type => ({
          label: type.toUpperCase(),
          value: type
        }))}
      />;
    }
    
    if (setting.key.includes('MAX_SIZE') || setting.key.includes('ATTEMPTS') || 
        setting.key.includes('TIMEOUT') || setting.key.includes('MAX_WIDTH')) {
      return <InputNumber min={1} style={{ width: '100%' }} />;
    }
    
    if (setting.key === SystemSettingKey.SITE_LOGO || setting.key === SystemSettingKey.SITE_FAVICON) {
      return (
        <div>
          {value && <img src={String(value)} alt="图片" style={{ width: 100, height: 100, objectFit: 'contain', marginBottom: 8 }} />}
          <div style={{ width: 100 }}>
            <Uploader
              maxSize={2 * 1024 * 1024}
              prefix={setting.key === SystemSettingKey.SITE_LOGO ? 'logo/' : 'favicon/'}
              allowedTypes={['image/jpeg', 'image/png', 'image/svg+xml', 'image/x-icon']}
              onSuccess={(fileUrl) => {
                form.setFieldValue(setting.key, fileUrl);
                updateSettingsMutation.mutate([{
                  key: setting.key,
                  value: fileUrl,
                  group: SystemSettingGroup.BASIC
                }]);
              }}
              onError={(error) => {
                message.error(`上传失败：${error.message}`);
              }}
            />
          </div>
        </div>
      );
    }
    
    return <Input placeholder={`请输入${setting.description || setting.key}`} />;
  };

  return (
    <div>
      <Card
        title={
          <Space>
            <Title level={2} style={{ margin: 0 }}>系统设置</Title>
          </Space>
        }
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />}
              onClick={handleReset}
              loading={resetSettingsMutation.isPending}
            >
              重置默认
            </Button>
          </Space>
        }
      >
        <Spin spinning={isLoadingSettings || updateSettingsMutation.isPending}>
          <Tabs
            type="card"
            items={Object.values(SystemSettingGroup).map(group => ({
              key: group,
              label: String(GROUP_TITLES[group]),
              children: (
                <div>
                  <Alert
                    message={GROUP_DESCRIPTIONS[group]}
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                  >
                    {settingsData
                      ?.find(g => g.name === group)
                      ?.settings.map(setting => (
                        <Form.Item
                          key={setting.key}
                          label={setting.description || setting.key}
                          name={setting.key}
                          rules={[{ required: true, message: `请输入${setting.description || setting.key}` }]}
                        >
                          {renderSettingInput(setting)}
                        </Form.Item>
                      ))}
                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={updateSettingsMutation.isPending}
                      >
                        保存设置
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              )
            }))}
          />
        </Spin>
      </Card>
    </div>
  );
};

