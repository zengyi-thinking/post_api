import React, { useState, useEffect } from 'react';
import { List, Card, message, Empty } from 'antd';
import axios from 'axios';

function Favorites({ user }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/users/favorites', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFavorites(response.data);
    } catch (error) {
      message.error('获取收藏列表失败');
    } finally {
      setLoading(false);
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
      <h2>我的收藏</h2>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={favorites}
        loading={loading}
        renderItem={item => (
          <List.Item>
            <Card
              title={item.title}
              extra={<a href={item.download_url}>下载</a>}
            >
              <p>{item.description}</p>
              <p>上传者：{item.uploader}</p>
              <p>上传时间：{new Date(item.upload_time).toLocaleDateString()}</p>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}

export default Favorites;