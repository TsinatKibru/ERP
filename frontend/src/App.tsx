import React, { useState, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DashboardOutlined,
  SettingOutlined,
  ShopOutlined,
  ContactsOutlined,
  TransactionOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Spin } from 'antd';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import ProductsPage from './pages/inventory/ProductsPage';
import CustomersPage from './pages/sales/CustomersPage';
import OrdersPage from './pages/sales/OrdersPage';
import CreateOrderPage from './pages/sales/CreateOrderPage';
import UsersPage from './pages/UsersPage';
import CategoriesPage from './pages/inventory/CategoriesPage';
import DashboardPage from './pages/DashboardPage';
import SuppliersPage from './pages/procurement/SuppliersPage';
import PurchaseOrdersPage from './pages/procurement/PurchaseOrdersPage';
import CreatePurchaseOrderPage from './pages/procurement/CreatePurchaseOrderPage';
import keycloak from './auth/keycloak';

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
                  icon: <ShopOutlined />,
                  label: 'Inventory',
                  children: [
                    {
                      key: '3-1',
                      label: <Link to="/categories">Categories</Link>,
                    },
                    {
                      key: '3-2',
                      label: <Link to="/products">Products</Link>,
                    },
                  ],
                },
                {
                  key: '4',
                  icon: <TransactionOutlined />,
                  label: 'Sales',
                  children: [
                    {
                      key: '4-1',
                      label: <Link to="/customers">Customers</Link>,
                    },
                    {
                      key: '4-2',
                      label: <Link to="/orders">Orders</Link>,
                    },
                  ],
                },
                {
                  key: '5',
                  icon: <ContactsOutlined />,
                  label: 'Procurement',
                  children: [
                    {
                      key: '5-1',
                      label: <Link to="/suppliers">Suppliers</Link>,
                    },
                    {
                      key: '5-2',
                      label: <Link to="/purchase-orders">Purchase Orders</Link>,
                    },
                  ],
                },
                {
                  key: '6',
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
                <Route path="/" element={<DashboardPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/new" element={<CreateOrderPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
                <Route path="/purchase-orders/new" element={<CreatePurchaseOrderPage />} />
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
