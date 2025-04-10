import React, { useState } from 'react';
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
} from '@ant-design/icons';   
import { uploadMinIOWithPolicy , uploadOSSWithPolicy} from '@d8d-appcontainer/api';
import { getGlobalConfig } from './utils.ts';
import type { MinioUploadPolicy, OSSUploadPolicy } from '@d8d-appcontainer/types';
import 'dayjs/locale/zh-cn';
import { OssType } from '../share/types.ts';

import { FileAPI } from './api.ts';

// MinIO文件上传组件
export const Uploader = ({ 
  onSuccess, 
  onError,
  onProgress, 
  maxSize = 10 * 1024 * 1024,
  prefix = 'uploads/',
  allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain']
}: {
  onSuccess?: (fileUrl: string, fileInfo: any) => void;
  onError?: (error: Error) => void;
  onProgress?: (percent: number) => void;
  maxSize?: number;
  prefix?: string;
  allowedTypes?: string[];
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // 处理文件上传
  const handleUpload = async (options: any) => {
    const { file, onSuccess: uploadSuccess, onError: uploadError, onProgress: uploadProgress } = options;
    
    setUploading(true);
    setProgress(0);
    
    // 文件大小检查
    if (file.size > maxSize) {
      message.error(`文件大小不能超过${maxSize / 1024 / 1024}MB`);
      uploadError(new Error('文件过大'));
      setUploading(false);
      return;
    }
    
    // 文件类型检查
    if (allowedTypes && allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      message.error(`不支持的文件类型: ${file.type}`);
      uploadError(new Error('不支持的文件类型'));
      setUploading(false);
      return;
    }
    
    try {
      // 1. 获取上传策略
      const policyResponse = await FileAPI.getUploadPolicy(file.name, prefix, maxSize);
      const policy = policyResponse.data;
      
      if (!policy) {
        throw new Error('获取上传策略失败');
      }
      
      // 生成随机文件名但保留原始扩展名
      const fileExt = file.name.split('.').pop() || '';
      const randomName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}${fileExt ? `.${fileExt}` : ''}`;
      
      // 2. 上传文件到MinIO
      const callbacks = {
        onProgress: (event: { progress: number }) => {
          const percent = Math.round(event.progress);
          setProgress(percent);
          uploadProgress({ percent });
          onProgress?.(percent);
        },
        onComplete: () => {
          setUploading(false);
          setProgress(100);
        },
        onError: (err: Error) => {
          setUploading(false);
          message.error(`上传失败: ${err.message}`);
          uploadError(err);
          onError?.(err);
        }
      };
      
      // 执行上传
      const fileUrl = getGlobalConfig('OSS_TYPE') === OssType.MINIO ? 
        await uploadMinIOWithPolicy(
          policy as MinioUploadPolicy,
          file,
          randomName,
          callbacks
        ) : await uploadOSSWithPolicy(
          policy as OSSUploadPolicy,
          file,
          randomName,
          callbacks
        );
      
      // 从URL中提取相对路径
      const relativePath = `${policy.prefix}${randomName}`;
      
      // 3. 保存文件信息到文件库
      const fileInfo = {
        file_name: randomName,
        original_filename: file.name,
        file_path: relativePath,
        file_type: file.type,
        file_size: file.size,
        tags: '',
        description: '',
        category_id: undefined
      };
      
      const saveResponse = await FileAPI.saveFileInfo(fileInfo);
      
      // 操作成功
      uploadSuccess(relativePath);
      message.success('文件上传成功');
      onSuccess?.(relativePath, saveResponse.data);
    } catch (error: any) {
      // 上传失败
      setUploading(false);
      message.error(`上传失败: ${error.message}`);
      uploadError(error);
      onError?.(error);
    }
  };
  
  return (
    <Upload.Dragger
      name="file"
      multiple={false}
      customRequest={handleUpload}
      showUploadList={true}
      progress={{
        strokeColor: {
          '0%': '#108ee9',
          '100%': '#87d068',
        },
        format: (percent) => `${Math.round(percent || 0)}%`,
      }}
    >
      <p className="ant-upload-drag-icon">
        <UploadOutlined />
      </p>
      <p className="ant-upload-text">点击或拖动文件到这里上传</p>
      <p className="ant-upload-hint">
        支持单个文件上传，最大{maxSize / 1024 / 1024}MB
      </p>
      {uploading && (
        <div style={{ marginTop: 16 }}>
          <Progress percent={progress} />
        </div>
      )}
    </Upload.Dragger>
  );
};
