import React, { useState, useEffect } from 'react';
import { Card, List, Input, Select, Tag, Space, Button, Rate, message, Typography, Form } from 'antd';
import { SearchOutlined, HeartOutlined, HeartFilled, DownloadOutlined, EyeOutlined, StarOutlined, StarFilled, CommentOutlined, LikeOutlined, LikeFilled } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;
const { Title, Paragraph } = Typography;

const categories = [
  '全部',
  '计算机科学',
  '数学',
  '物理',
  '化学',
  '生物',
  '经济学',
  '文学',
  '历史',
  '艺术'
];

function ResourceList({ darkMode }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState('全部');
  const [favorites, setFavorites] = useState([]);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentResource, setCurrentResource] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentForm] = Form.useForm();
  const [userRatings, setUserRatings] = useState({});
  const [downloading, setDownloading] = useState(false);
  const [userLikes, setUserLikes] = useState({});
  const [userFavorites, setUserFavorites] = useState({});

  useEffect(() => {
    fetchResources();
    fetchUserFavorites();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/resources');
      const data = await response.json();
      setResources(data);
      setLoading(false);
    } catch (error) {
      console.error('获取资料列表失败:', error);
      setLoading(false);
    }
  };

  const handleDownload = async (resource) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('请先登录');
      return;
    }

    setDownloading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/resources/${resource.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resource.title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      message.success('下载成功');
    } catch (error) {
      message.error('下载失败，请检查积分是否足够');
    } finally {
      setDownloading(false);
    }
  };

  const fetchUserFavorites = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch('http://localhost:3000/api/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setFavorites(data.map(f => f.resource_id));
      } catch (error) {
        console.error('获取收藏列表失败:', error);
      }
    }
  };

  const handleFavorite = async (resource) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('请先登录');
      return;
    }

    try {
      const method = favorites.includes(resource.id) ? 'DELETE' : 'POST';
      await fetch(`http://localhost:3000/api/favorites/${resource.id}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (method === 'POST') {
        setFavorites([...favorites, resource.id]);
        message.success('收藏成功');
      } else {
        setFavorites(favorites.filter(id => id !== resource.id));
        message.success('取消收藏成功');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleLike = async (resourceId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('请先登录');
      return;
    }

    try {
      const method = userLikes[resourceId] ? 'DELETE' : 'POST';
      await fetch(`http://localhost:3000/api/likes/${resourceId}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUserLikes({
        ...userLikes,
        [resourceId]: !userLikes[resourceId]
      });
      message.success(method === 'POST' ? '点赞成功' : '取消点赞成功');
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handlePreview = (resource) => {
    // 实现预览功能
    message.info('预览功能开发中');
  };

  const filteredResources = resources
    .filter(resource =>
      (category === '全部' || resource.category === category) &&
      (resource.title.toLowerCase().includes(searchText.toLowerCase()) ||
       resource.description.toLowerCase().includes(searchText.toLowerCase()))
    );

  return (
    <div className={`resource-list ${darkMode ? 'dark' : ''}`}>
      <div className="resource-header">
        <Select
          value={category}
          onChange={setCategory}
          style={{ width: 200, marginRight: 16 }}
        >
          {categories.map(cat => (
            <Option key={cat} value={cat}>{cat}</Option>
          ))}
        </Select>
        <Search
          placeholder="搜索资源"
          onSearch={value => setSearchText(value)}
          style={{ width: 300 }}
        />
      </div>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={filteredResources}
        loading={loading}
        renderItem={resource => (
          <List.Item>
            <Card
              actions={[
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={() => handleDownload(resource)}
                  loading={downloading}
                >
                  下载
                </Button>,
                <Button
                  icon={favorites.includes(resource.id) ? <HeartFilled /> : <HeartOutlined />}
                  onClick={() => handleFavorite(resource)}
                />,
                <Button 
                  icon={<EyeOutlined />}
                  onClick={() => handlePreview(resource)}
                />
              ]}
            >
              <Card.Meta
                title={resource.title}
                description={
                  <>
                    <Paragraph ellipsis={{ rows: 2 }}>{resource.description}</Paragraph>
                    <Space>
                      <Tag color="blue">{resource.category}</Tag>
                      <Tag color="green">积分: {resource.points_required}</Tag>
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

export default ResourceList;