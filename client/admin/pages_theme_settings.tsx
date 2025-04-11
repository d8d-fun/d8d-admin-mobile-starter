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


// 定义预设配色方案 - 按明暗模式分组
const COLOR_SCHEMES: Record<ThemeMode, Record<string, ColorScheme>> = {
  [ThemeMode.LIGHT]: {
    DEFAULT: {
      name: '默认浅色',
      primary: '#1890ff',
      background: '#f0f2f5',
      text: '#000000'
    },
    BLUE: {
      name: '蓝色',
      primary: '#096dd9', 
      background: '#e6f7ff',
      text: '#003a8c'
    },
    GREEN: {
      name: '绿色',
      primary: '#52c41a',
      background: '#f6ffed',
      text: '#135200'
    },
    WARM: {
      name: '暖橙',
      primary: '#fa8c16',
      background: '#fff7e6',
      text: '#873800'
    }
  },
  [ThemeMode.DARK]: {
    DEFAULT: {
      name: '默认深色',
      primary: '#177ddc',
      background: '#141414',
      text: '#ffffff'
    },
    MIDNIGHT: {
      name: '午夜蓝',
      primary: '#1a3b7a',
      background: '#0a0a1a',
      text: '#e0e0e0'
    },
    FOREST: {
      name: '森林',
      primary: '#2e7d32',
      background: '#121212',
      text: '#e0e0e0'
    },
    SUNSET: {
      name: '日落',
      primary: '#f5222d',
      background: '#1a1a1a',
      text: '#ffffff'
    }
  }
};

// 主题设置页面
export const ThemeSettingsPage = () => {
  const { isDark, currentTheme, updateTheme, saveTheme, resetTheme } = useTheme();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 处理配色方案选择
  const handleColorSchemeChange = (schemeName: string) => {
    const currentMode = form.getFieldValue('theme_mode') as ThemeMode;
    const scheme = COLOR_SCHEMES[currentMode][schemeName];
    if (!scheme) return;
    form.setFieldsValue({
      primary_color: scheme.primary,
      background_color: scheme.background,
      text_color: scheme.text
    });
    updateTheme({
      primary_color: scheme.primary,
      background_color: scheme.background,
      text_color: scheme.text
    });
  };

  // 初始化表单数据
  useEffect(() => {
    form.setFieldsValue({
      theme_mode: currentTheme.theme_mode,
      primary_color: currentTheme.primary_color,
      background_color: currentTheme.background_color || (isDark ? '#141414' : '#f0f2f5'),
      font_size: currentTheme.font_size,
      is_compact: currentTheme.is_compact
    });
  }, [currentTheme, form, isDark]);

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await saveTheme(values);
    } catch (error) {
      message.error('保存主题设置失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理重置
  const handleReset = async () => {
    try {
      setLoading(true);
      await resetTheme();
    } catch (error) {
      message.error('重置主题设置失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理表单值变化 - 实时预览
  const handleValuesChange = (changedValues: any) => {
    updateTheme(changedValues);
  };

  return (
    <div>
      <Title level={2}>主题设置</Title>
      <Card>
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            onValuesChange={handleValuesChange}
            initialValues={{
              theme_mode: currentTheme.theme_mode,
              primary_color: currentTheme.primary_color,
              background_color: currentTheme.background_color || (isDark ? '#141414' : '#f0f2f5'),
              font_size: currentTheme.font_size,
              is_compact: currentTheme.is_compact
            }}
          >
            {/* 配色方案选择 */}
            <Form.Item label="预设配色方案">
              <Space wrap>
                {(() => {
                  const themeMode = (form.getFieldValue('theme_mode') as ThemeMode) || ThemeMode.LIGHT;
                  const schemes = COLOR_SCHEMES[themeMode] || {};
                  const currentPrimary = form.getFieldValue('primary_color');
                  const currentBg = form.getFieldValue('background_color');
                  const currentText = form.getFieldValue('text_color');
                  
                  return Object.entries(schemes).map(([key, scheme]) => {
                    const isActive = 
                      scheme.primary === currentPrimary && 
                      scheme.background === currentBg && 
                      scheme.text === currentText;
                    
                    return (
                      <Button
                        key={key}
                        onClick={() => {
                          handleColorSchemeChange(key);
                          form.setFieldValue('scheme_name', scheme.name);
                        }}
                        style={{
                          backgroundColor: scheme.background,
                          color: scheme.text,
                          borderColor: isActive ? scheme.text : scheme.primary,
                          borderWidth: isActive ? 2 : 1,
                          boxShadow: isActive ? `0 0 0 2px ${scheme.primary}` : 'none',
                          fontWeight: isActive ? 'bold' : 'normal',
                          transition: 'all 0.3s'
                        }}
                      >
                        {scheme.name}
                        {isActive && (
                          <span style={{ marginLeft: 4 }}>✓</span>
                        )}
                      </Button>
                    );
                  });
                })()}
              </Space>
            </Form.Item>

            {/* 主题模式 */}
            <Form.Item
              label="主题模式"
              name="theme_mode"
              rules={[{ required: true, message: '请选择主题模式' }]}
            >
              <Radio.Group>
                <Radio value={ThemeMode.LIGHT}>浅色模式</Radio>
                <Radio value={ThemeMode.DARK}>深色模式</Radio>
              </Radio.Group>
            </Form.Item>

            {/* 主题色 */}
            <Form.Item
              label="主题色"
              name="primary_color"
              rules={[{ required: true, message: '请选择主题色' }]}
            >
              <ColorPicker 
                value={form.getFieldValue('primary_color')}
                onChange={(color) => {
                  form.setFieldValue('primary_color', color.toHexString());
                  updateTheme({ primary_color: color.toHexString() });
                }}
                allowClear
              />
            </Form.Item>

            {/* 背景色 */}
            <Form.Item
              label="背景色"
              name="background_color"
              rules={[{ required: true, message: '请选择背景色' }]}
            >
              <ColorPicker 
                value={form.getFieldValue('background_color')}
                onChange={(color) => {
                  form.setFieldValue('background_color', color.toHexString());
                  updateTheme({ background_color: color.toHexString() });
                }}
                allowClear
              />
            </Form.Item>

            {/* 文字颜色 */}
            <Form.Item
              label="文字颜色"
              name="text_color"
              rules={[{ required: true, message: '请选择文字颜色' }]}
            >
              <ColorPicker 
                value={form.getFieldValue('text_color')}
                onChange={(color) => {
                  form.setFieldValue('text_color', color.toHexString());
                  updateTheme({ text_color: color.toHexString() });
                }}
                allowClear
              />
            </Form.Item>

            {/* 圆角大小 */}
            <Form.Item
              label="圆角大小"
              name="border_radius"
              rules={[{ required: true, message: '请设置圆角大小' }]}
              initialValue={6}
            >
              <InputNumber<number>
                min={0} 
                max={20}
                addonAfter="px"
              />
            </Form.Item>

            {/* 字体大小 */}
            <Form.Item
              label="字体大小"
              name="font_size"
              rules={[{ required: true, message: '请选择字体大小' }]}
            >
              <Radio.Group>
                <Radio value={FontSize.SMALL}>小</Radio>
                <Radio value={FontSize.MEDIUM}>中</Radio>
                <Radio value={FontSize.LARGE}>大</Radio>
              </Radio.Group>
            </Form.Item>

            {/* 紧凑模式 */}
            <Form.Item
              label="紧凑模式"
              name="is_compact"
              valuePropName="checked"
              getValueFromEvent={(checked: boolean) => checked ? CompactMode.COMPACT : CompactMode.NORMAL}
              getValueProps={(value: CompactMode) => ({
                checked: value === CompactMode.COMPACT
              })}
            >
              <Switch 
                checkedChildren="开启" 
                unCheckedChildren="关闭"
              />
            </Form.Item>

            {/* 操作按钮 */}
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  保存设置
                </Button>
                <Popconfirm
                  title="确定要重置主题设置吗？"
                  onConfirm={handleReset}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button>重置为默认值</Button>
                </Popconfirm>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};
