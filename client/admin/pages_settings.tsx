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

// 颜色选择器组件
// const ColorPicker: React.FC<{
//   value?: string;
//   onChange?: (color: string) => void;
//   label?: string;
// }> = ({ value = '#1890ff', onChange, label = '选择颜色' }) => {
//   const [color, setColor] = useState(value);
//   const [open, setOpen] = useState(false);

//   // 更新颜色（预览）
//   const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newColor = e.target.value;
//     setColor(newColor);
//   };

//   // 关闭时确认颜色
//   const handleOpenChange = (visible: boolean) => {
//     if (!visible && color) {
//       onChange?.(color);
//     }
//     setOpen(visible);
//   };

//   return (
//     <Popover
//       open={open}
//       onOpenChange={handleOpenChange}
//       trigger="click"
//       content={
//         <div style={{ padding: '8px' }}>
//           <Input 
//             type="color" 
//             value={color} 
//             onChange={handleColorChange}
//             style={{ width: 60, cursor: 'pointer' }}
//           />
//         </div>
//       }
//     >
//       <Button 
//         icon={<BgColorsOutlined />} 
//         style={{ 
//           backgroundColor: color,
//           borderColor: color,
//           color: '#fff'
//         }}
//       >
//         {label}
//       </Button>
//     </Popover>
//   );
// };

// 基础设置页面
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
                {Object.entries(COLOR_SCHEMES[form.getFieldValue('theme_mode') as ThemeMode]).map(([key, scheme]) => (
                  <Button
                    key={key}
                    onClick={() => {
                      handleColorSchemeChange(key);
                      form.setFieldValue('scheme_name', scheme.name);
                    }}
                    style={{
                      backgroundColor: scheme.background,
                      color: scheme.text,
                      borderColor: scheme.primary
                    }}
                  >
                    {scheme.name}
                  </Button>
                ))}
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
