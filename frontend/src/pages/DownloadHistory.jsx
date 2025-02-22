import React, { useState, useEffect } from 'react';
import { List, Card, message, Empty, Tag, Space, Button, Typography } from 'antd';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Paragraph } = Typography;

function formatFileSize(bytes) {
  if (!bytes) return '未知大小';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function DownloadHistory({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/users/download-history', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setHistory(response.data);
    } catch (error) {
      message.error('获取下载历史失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (item) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/resources/${item.resource_id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      message.success('下载成功');
    } catch (error) {
      message.error('下载失败，请检查积分是否足够');
    }
  };

  const handlePreview = async (item) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/resources/${item.resource_id}/preview`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      message.error('预览失败');
    }
  };

  if (!user) {
    return (
      <Empty
        description="请先登录"
        style={{ marginTop: '20%' }}
      />
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '24px' }}>下载历史</h2>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={history}
        loading={loading}
        renderItem={item => (
          <List.Item>
            <Card
              actions={[
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={() => handleDownload(item)}
                >
                  重新下载
                </Button>,
                <Button 
                  icon={<EyeOutlined />}
                  onClick={() => handlePreview(item)}
                >
                  预览
                </Button>
              ]}
            >
              <Card.Meta
                title={item.title}
                description={
                  <>
                    <Paragraph ellipsis={{ rows: 2 }}>{item.description}</Paragraph>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Space>
                        <Tag color="blue">{item.category || '未分类'}</Tag>
                        <Tag color="green">积分: {item.points_required || 0}</Tag>
                      </Space>
                      <div>下载时间：{formatDate(item.download_time)}</div>
                      <div>文件大小：{formatFileSize(item.file_size)}</div>
                    </Space>
                  </>
                }
              />
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}

export default DownloadHistory;