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
  SafetyOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Spin } from 'antd';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import DashboardPage from './pages/DashboardPage';
import CategoriesPage from './pages/inventory/CategoriesPage';
import ProductsPage from './pages/inventory/ProductsPage';
import InventoryLedgerPage from './pages/inventory/InventoryLedgerPage';
import CustomersPage from './pages/sales/CustomersPage';
import OrdersPage from './pages/sales/OrdersPage';
import CreateOrderPage from './pages/sales/CreateOrderPage';
import UsersPage from './pages/UsersPage';
import SuppliersPage from './pages/procurement/SuppliersPage';
import PurchaseOrdersPage from './pages/procurement/PurchaseOrdersPage';
import CreatePurchaseOrderPage from './pages/procurement/CreatePurchaseOrderPage';
import InvoicesPage from './pages/finance/InvoicesPage';
import ExpensesPage from './pages/finance/ExpensesPage';
import SettingsPage from './pages/SettingsPage';
import AuditLogPage from './pages/AuditLogPage';
import EmployeesPage from './pages/hr/EmployeesPage';
import DepartmentsPage from './pages/hr/DepartmentsPage';
import AttendancePage from './pages/hr/AttendancePage';
import PayrollPage from './pages/hr/PayrollPage';
import EmployeeDashboard from './pages/hr/EmployeeDashboard';
import keycloak from './auth/keycloak';
import GlobalSearch from './components/GlobalSearch';
import Notifications from './components/Notifications';

// Remove default Vite styles that conflict with Ant Design
import './index.css';

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3000/profile/me', {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      return data;
    },
    enabled: !!authenticated,
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3000/settings', {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      return data;
    },
    enabled: !!authenticated,
  });

  const shortName = settings?.find((s: any) => s.key === 'company_short_name')?.value || 'AG';
  const userRole = profile?.role || 'employee';

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

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  if (authenticated === null || (authenticated && !profile)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large">
          <div style={{ marginTop: '40px' }}>Initializing Experience...</div>
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

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
      hidden: userRole === 'employee',
    },
    {
      key: '/my-service',
      icon: <UserOutlined />,
      label: <Link to="/my-service">My Self-Service</Link>,
      hidden: userRole !== 'employee',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: <Link to="/users">Users</Link>,
      hidden: userRole !== 'admin',
    },
    {
      key: '3',
      icon: <ShopOutlined />,
      label: 'Inventory',
      hidden: userRole === 'employee',
      children: [
        {
          key: '/categories',
          label: <Link to="/categories">Categories</Link>,
        },
        {
          key: '/products',
          label: <Link to="/products">Products</Link>,
        },
        {
          key: '/inventory/ledger',
          label: <Link to="/inventory/ledger">Inventory Ledger</Link>,
        },
      ],
    },
    {
      key: '4',
      icon: <TransactionOutlined />,
      label: 'Sales',
      hidden: userRole === 'employee',
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
      hidden: userRole === 'employee',
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
      key: '7',
      icon: <WalletOutlined />,
      label: 'Finance',
      hidden: userRole !== 'admin' && userRole !== 'manager',
      children: [
        {
          key: '/invoices',
          label: <Link to="/invoices">Invoices</Link>,
        },
        {
          key: '/expenses',
          label: <Link to="/expenses">Expenses</Link>,
        },
      ],
    },
    {
      key: '8',
      icon: <UserOutlined />,
      label: 'HR',
      hidden: userRole !== 'admin' && userRole !== 'manager',
      children: [
        {
          key: '/hr/departments',
          label: <Link to="/hr/departments">Departments</Link>,
          hidden: userRole !== 'admin',
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
      key: '/audit',
      icon: <SafetyOutlined />,
      label: <Link to="/audit">Audit Trail</Link>,
      hidden: userRole !== 'admin',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">Settings</Link>,
      hidden: userRole !== 'admin',
    },
  ].filter(item => !item.hidden);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: 18,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '0 10px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis'
        }}>
          {collapsed ? shortName?.slice(0, 2).toUpperCase() : shortName}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
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
            <GlobalSearch />
          </div>
          <Notifications />
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
            <Route path="/" element={userRole === 'employee' ? <EmployeeDashboard /> : <DashboardPage />} />
            <Route path="/my-service" element={<EmployeeDashboard />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/inventory/ledger" element={<InventoryLedgerPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/new" element={<CreateOrderPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="/purchase-orders/new" element={<CreatePurchaseOrderPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/audit" element={<AuditLogPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/hr/departments" element={<DepartmentsPage />} />
            <Route path="/hr/employees" element={<EmployeesPage />} />
            <Route path="/hr/attendance" element={<AttendancePage />} />
            <Route path="/hr/payroll" element={<PayrollPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
