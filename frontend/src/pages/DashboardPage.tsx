import React from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Tag, List } from 'antd';
import {
    DollarCircleOutlined,
    WarningOutlined,
    FallOutlined,
    RiseOutlined,
    BankOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import keycloak from '../auth/keycloak';
import SalesTrendChart from '../components/analytics/SalesTrendChart';
import CategoryPieChart from '../components/analytics/CategoryPieChart';

const { Title, Text } = Typography;

interface DashboardStats {
    totalRevenue: number;
    totalExpenses: number;
    totalPayroll: number;
    netProfit: number;
    accountsReceivable: number;
    accountsPayable: number;
    ordersCount: {
        total: number;
        pending: number;
        completed: number;
    };
    lowStockAlerts: {
        id: string;
        name: string;
        stockLevel: number;
        category: string;
    }[];
    inventoryValue: number;
    salesTrend: {
        month: string;
        revenue: number;
        orders: number;
    }[];
    categoryDistribution: {
        name: string;
        value: number;
        count: number;
    }[];
}

const DashboardPage: React.FC = () => {
    const { data: stats, isLoading } = useQuery<DashboardStats>({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/dashboard/stats', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    if (isLoading) return <Card loading />;

    return (
        <div>
            <Title level={2}>Dashboard Overview</Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless">
                        <Statistic
                            title="Total Revenue"
                            value={stats?.totalRevenue}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<RiseOutlined />}
                            suffix="$"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless">
                        <Statistic
                            title="Accounts Receivable"
                            value={stats?.accountsReceivable}
                            precision={2}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<DollarCircleOutlined />}
                            suffix="$"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless">
                        <Statistic
                            title="Accounts Payable"
                            value={stats?.accountsPayable}
                            precision={2}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<FallOutlined />}
                            suffix="$"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless">
                        <Statistic
                            title="Inventory Value"
                            value={stats?.inventoryValue}
                            precision={2}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<BankOutlined />}
                            suffix="$"
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} sm={12} lg={8}>
                    <Card variant="borderless" style={{ background: '#f6ffed' }}>
                        <Statistic
                            title="Net Profit"
                            value={stats?.netProfit}
                            precision={2}
                            valueStyle={{ color: (stats?.netProfit || 0) >= 0 ? '#3f8600' : '#cf1322', fontWeight: 'bold' }}
                            prefix={(stats?.netProfit || 0) >= 0 ? <RiseOutlined /> : <FallOutlined />}
                            suffix="$"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card variant="borderless" style={{ background: '#fff1f0' }}>
                        <Statistic
                            title="Total Expenditure"
                            value={stats?.totalExpenses}
                            precision={2}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<FallOutlined />}
                            suffix="$"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card variant="borderless" style={{ background: '#e6f7ff' }}>
                        <Statistic
                            title="Payroll Cost (Paid)"
                            value={stats?.totalPayroll}
                            precision={2}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<BankOutlined />}
                            suffix="$"
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                    <Card variant="borderless" style={{ height: '100%', overflow: 'hidden' }}>
                        <SalesTrendChart data={stats?.salesTrend || []} />
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card variant="borderless" style={{ height: '100%', overflow: 'hidden' }}>
                        <CategoryPieChart data={stats?.categoryDistribution || []} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                <Col xs={24} lg={16}>
                    <Card title="Low Stock Alerts" extra={<Text type="danger"><WarningOutlined /> Action Required</Text>}>
                        <Table
                            dataSource={stats?.lowStockAlerts}
                            pagination={false}
                            rowKey="id"
                            columns={[
                                { title: 'Product', dataIndex: 'name', key: 'name' },
                                { title: 'Category', dataIndex: 'category', key: 'category' },
                                {
                                    title: 'Current Stock',
                                    dataIndex: 'stockLevel',
                                    key: 'stockLevel',
                                    render: (val) => <Tag color="red">{val} units left</Tag>
                                }
                            ]}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Quick Actions">
                        <List
                            dataSource={[
                                { title: 'Create New Order', description: 'Process a new customer sale' },
                                { title: 'Restock Products', description: 'Update inventory for low stock items' },
                                { title: 'Review Reports', description: 'Analyze monthly performance' }
                            ]}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<a href="#">{item.title}</a>}
                                        description={item.description}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;
