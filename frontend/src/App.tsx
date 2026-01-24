import React, { useState, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DashboardOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Spin } from 'antd';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import keycloak from './auth/keycloak';
import UsersPage from './pages/UsersPage';

// Remove default Vite styles that conflict with Ant Design
import './index.css';

const { Header, Sider, Content } = Layout;

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        if (keycloak.authenticated === undefined) {
          const auth = await keycloak.init({
            onLoad: 'login-required',
            checkLoginIframe: false,
            pkceMethod: 'S256',
          });
          setAuthenticated(auth);
        } else {
          setAuthenticated(keycloak.authenticated);
        }
      } catch (err) {
        console.error('Keycloak init failed', err);
        setAuthenticated(false);
      }
    };
    initKeycloak();
  }, []);

  useEffect(() => {
    if (authenticated) {
      // Sync user profile with local DB
      axios
        .get('http://localhost:3000/profile/me', {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        })
        .then((res) => console.log('Profile synced successfully', res.data))
        .catch((err) => console.error('Profile sync failed', err));
    }
  }, [authenticated]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  if (authenticated === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large">
          <div style={{ marginTop: '40px' }}>Initializing Authentication...</div>
        </Spin>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h1>Authentication Failed</h1>
        <Button type="primary" onClick={() => window.location.reload()}>Retry Login</Button>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider trigger={null} collapsible collapsed={collapsed}>
            <div className="demo-logo-vertical" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, .2)', borderRadius: 6 }} />
            <Menu
              theme="dark"
              mode="inline"
              defaultSelectedKeys={['1']}
              items={[
                {
                  key: '1',
                  icon: <DashboardOutlined />,
                  label: <Link to="/">Dashboard</Link>,
                },
                {
                  key: '2',
                  icon: <UserOutlined />,
                  label: <Link to="/users">Users</Link>,
                },
                {
                  key: '3',
                  icon: <SettingOutlined />,
                  label: <Link to="/settings">Settings</Link>,
                },
              ]}
            />
          </Sider>
          <Layout>
            <Header style={{ padding: 0, background: colorBgContainer }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              />
            </Header>
            <Content
              style={{
                margin: '24px 16px',
                padding: 24,
                minHeight: 280,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              <Routes>
                <Route path="/" element={<h1>Welcome to ERP Dashboard</h1>} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/settings" element={<h1>System Settings</h1>} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
