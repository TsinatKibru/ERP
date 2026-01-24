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
  WalletOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Spin } from 'antd';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
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
import InvoicesPage from './pages/finance/InvoicesPage';
import SettingsPage from './pages/SettingsPage';
import EmployeesPage from './pages/hr/EmployeesPage';
import DepartmentsPage from './pages/hr/DepartmentsPage';
import AttendancePage from './pages/hr/AttendancePage';
import PayrollPage from './pages/hr/PayrollPage';
import keycloak from './auth/keycloak';

// Remove default Vite styles that conflict with Ant Design
import './index.css';

const { Header, Sider, Content } = Layout;

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

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
      <Layout style={{ minHeight: '100vh' }}>
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className="demo-logo-vertical" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, .2)', borderRadius: 6 }} />
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={['3', '4', '5', '8']}
            items={[
              {
                key: '/',
                icon: <DashboardOutlined />,
                label: <Link to="/">Dashboard</Link>,
              },
              {
                key: '/users',
                icon: <UserOutlined />,
                label: <Link to="/users">Users</Link>,
              },
              {
                key: '3',
                icon: <ShopOutlined />,
                label: 'Inventory',
                children: [
                  {
                    key: '/categories',
                    label: <Link to="/categories">Categories</Link>,
                  },
                  {
                    key: '/products',
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
                    key: '/customers',
                    label: <Link to="/customers">Customers</Link>,
                  },
                  {
                    key: '/orders',
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
                    key: '/suppliers',
                    label: <Link to="/suppliers">Suppliers</Link>,
                  },
                  {
                    key: '/purchase-orders',
                    label: <Link to="/purchase-orders">Purchase Orders</Link>,
                  },
                ],
              },
              {
                key: '/invoices',
                icon: <WalletOutlined />,
                label: <Link to="/invoices">Finance</Link>,
              },
              {
                key: '8',
                icon: <UserOutlined />,
                label: 'HR',
                children: [
                  {
                    key: '/hr/departments',
                    label: <Link to="/hr/departments">Departments</Link>,
                  },
                  {
                    key: '/hr/employees',
                    label: <Link to="/hr/employees">Employees</Link>,
                  },
                  {
                    key: '/hr/attendance',
                    label: <Link to="/hr/attendance">Attendance</Link>,
                  },
                  {
                    key: '/hr/payroll',
                    label: <Link to="/hr/payroll">Payroll</Link>,
                  },
                ],
              },
              {
                key: '/settings',
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
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/hr/departments" element={<DepartmentsPage />} />
              <Route path="/hr/employees" element={<EmployeesPage />} />
              <Route path="/hr/attendance" element={<AttendancePage />} />
              <Route path="/hr/payroll" element={<PayrollPage />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </QueryClientProvider>
  );
};

export default App;
