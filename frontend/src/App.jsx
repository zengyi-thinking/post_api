import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, message, Switch, Dropdown, Space, Avatar, Card, List, Tag, Select, Input } from 'antd';
import { UserOutlined, FileOutlined, UploadOutlined, BulbOutlined, HeartOutlined, HistoryOutlined, SearchOutlined, HeartFilled, DownloadOutlined, EyeOutlined, StarOutlined, StarFilled, CommentOutlined, LikeOutlined, LikeFilled } from '@ant-design/icons';
import Login from './pages/Login';
import Register from './pages/Register';
import ResourceList from './pages/ResourceList';
import UploadResource from './pages/UploadResource';
import UserProfile from './pages/UserProfile';
import Favorites from './pages/Favorites';
import DownloadHistory from './pages/DownloadHistory';

const { Header, Content, Footer, Sider } = Layout;

function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:3000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (!data.message) {
          setUser(data);
        }
      })
      .catch(err => {
        console.error('获取用户信息失败:', err);
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    message.success('退出登录成功');
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.style.backgroundColor = darkMode ? '#fff' : '#141414';
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/profile">个人中心</Link>
      </Menu.Item>
      <Menu.Item key="favorites">
        <Link to="/favorites">我的收藏</Link>
      </Menu.Item>
      <Menu.Item key="history">
        <Link to="/history">下载历史</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme={darkMode ? 'dark' : 'light'}>
        <div style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu theme={darkMode ? 'dark' : 'light'} defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1" icon={<FileOutlined />}>
            <Link to="/">资料列表</Link>
          </Menu.Item>
          {user && (
            <>
              <Menu.Item key="2" icon={<UploadOutlined />}>
                <Link to="/upload">上传资料</Link>
              </Menu.Item>
              <Menu.Item key="3" icon={<HeartOutlined />}>
                <Link to="/favorites">我的收藏</Link>
              </Menu.Item>
              <Menu.Item key="4" icon={<HistoryOutlined />}>
                <Link to="/history">下载历史</Link>
              </Menu.Item>
            </>
          )}
        </Menu>
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: darkMode ? '#141414' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h1 style={{ color: darkMode ? '#fff' : '#000' }}>校园资料分享平台</h1>
          <Space>
            <Switch
              checkedChildren={<BulbOutlined />}
              unCheckedChildren={<BulbOutlined />}
              checked={darkMode}
              onChange={toggleDarkMode}
            />
            {user ? (
              <Dropdown overlay={userMenu} placement="bottomRight">
                <Space style={{ cursor: 'pointer', color: darkMode ? '#fff' : '#000' }}>
                  <Avatar icon={<UserOutlined />} />
                  <span>{user.username}</span>
                  <span>({user.points} 积分)</span>
                </Space>
              </Dropdown>
            ) : (
              <Space>
                <Link to="/login">
                  <Button type="primary">登录</Button>
                </Link>
                <Link to="/register">
                  <Button>注册</Button>
                </Link>
              </Space>
            )}
          </Space>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: darkMode ? '#141414' : '#fff' }}>
          <Routes>
            <Route path="/" element={<ResourceList darkMode={darkMode} />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/upload" element={<UploadResource />} />
            <Route path="/profile" element={<UserProfile user={user} />} />
            <Route path="/favorites" element={<Favorites user={user} />} />
            <Route path="/history" element={<DownloadHistory user={user} />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: 'center', background: darkMode ? '#141414' : '#fff', color: darkMode ? '#fff' : '#000' }}>
          校园资料分享平台 ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
}

export default App;