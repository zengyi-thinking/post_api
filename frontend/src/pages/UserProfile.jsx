import React, { useState } from 'react';
import { Card, Descriptions, Avatar, Button, Upload, Input, message, Space, Divider, Row, Col, Statistic } from 'antd';
import { UserOutlined, UploadOutlined, EditOutlined, TrophyOutlined } from '@ant-design/icons';

function UserProfile({ user }) {
  const [avatar, setAvatar] = useState(user?.avatar);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');

  if (!user) {
    return null;
  }

  const handleAvatarChange = async (info) => {
    if (info.file.status === 'done') {
      setAvatar(info.file.response.url);
      message.success('头像更新成功');
    }
  };

  const handleBioSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bio })
      });
      setEditing(false);
      message.success('个人简介更新成功');
    } catch (error) {
      message.error('更新失败');
    }
  };

  const achievements = [
    { title: '上传达人', value: user.uploads_count || 0, description: '已上传资料数' },
    { title: '下载专家', value: user.downloads_count || 0, description: '已下载资料数' },
    { title: '受欢迎', value: user.favorites_count || 0, description: '被收藏次数' },
    { title: '活跃度', value: user.points || 0, description: '当前积分' }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 0' }}>
      <Row gutter={24}>
        <Col span={8}>
          <Card bordered={false}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Upload
                name="avatar"
                showUploadList={false}
                action="http://localhost:3000/api/users/avatar"
                headers={{
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }}
                onChange={handleAvatarChange}
              >
                <div style={{ marginBottom: 16 }}>
                  <Avatar
                    size={120}
                    src={avatar}
                    icon={<UserOutlined />}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                <Button icon={<UploadOutlined />}>更换头像</Button>
              </Upload>
              <h2 style={{ marginTop: 16 }}>{user.username}</h2>
              {editing ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input.TextArea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="写一些关于你自己的介绍..."
                    autoSize={{ minRows: 3, maxRows: 6 }}
                  />
                  <Space>
                    <Button type="primary" onClick={handleBioSave}>保存</Button>
                    <Button onClick={() => setEditing(false)}>取消</Button>
                  </Space>
                </Space>
              ) : (
                <div>
                  <p style={{ color: '#666' }}>{bio || '这个人很懒，还没有写简介'}</p>
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => setEditing(true)}
                  >
                    编辑简介
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col span={16}>
          <Card
            title={<Space><TrophyOutlined /> 个人成就</Space>}
            bordered={false}
          >
            <Row gutter={[24, 24]}>
              {achievements.map(item => (
                <Col span={12} key={item.title}>
                  <Card bordered={false}>
                    <Statistic
                      title={item.title}
                      value={item.value}
                      suffix={<div style={{ fontSize: 14, color: '#666' }}>{item.description}</div>}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
          <Divider />
          <Card
            title="最近动态"
            bordered={false}
          >
            <Descriptions column={2}>
              <Descriptions.Item label="注册时间">
                {new Date(user.created_at).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="最近登录">
                {new Date(user.last_login).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="最近上传">
                {user.last_upload ? new Date(user.last_upload).toLocaleDateString() : '暂无'}
              </Descriptions.Item>
              <Descriptions.Item label="最近下载">
                {user.last_download ? new Date(user.last_download).toLocaleDateString() : '暂无'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default UserProfile;