import React, { useState } from 'react';
import { Form, Input, InputNumber, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function UploadResource() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    if (fileList.length === 0) {
      message.error('请选择要上传的文件');
      return;
    }

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('points_required', values.points_required || 0);
    formData.append('file', fileList[0].originFileObj);

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('请先登录');
        navigate('/login');
        return;
      }

      await axios.post('http://localhost:3000/api/resources', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      message.success('资料上传成功');
      navigate('/');
    } catch (error) {
      message.error(error.response?.data?.message || '上传失败');
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file) => {
    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      message.error('文件大小不能超过100MB');
    }
    return false;
  };

  const handleChange = (info) => {
    setFileList(info.fileList.slice(-1));
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 0' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 30 }}>上传资料</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="资料标题"
          name="title"
          rules={[{ required: true, message: '请输入资料标题' }]}
        >
          <Input placeholder="请输入资料标题" />
        </Form.Item>

        <Form.Item
          label="资料描述"
          name="description"
          rules={[{ required: true, message: '请输入资料描述' }]}
        >
          <Input.TextArea
            placeholder="请输入资料描述"
            rows={4}
          />
        </Form.Item>

        <Form.Item
          label="所需积分"
          name="points_required"
          initialValue={0}
        >
          <InputNumber
            min={0}
            placeholder="请输入下载所需积分"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="上传文件"
          required
        >
          <Upload
            beforeUpload={beforeUpload}
            onChange={handleChange}
            fileList={fileList}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>选择文件</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
          >
            上传
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default UploadResource;