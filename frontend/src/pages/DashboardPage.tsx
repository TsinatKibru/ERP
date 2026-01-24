import React from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Tag, List } from 'antd';
import {
    DollarCircleOutlined,
    WarningOutlined,
    ArrowUpOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import keycloak from '../auth/keycloak';

const { Title, Text } = Typography;

interface DashboardStats {
    totalRevenue: number;
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
                    <Card bordered={false}>
                        <Statistic
                            title="Total Revenue"
                            value={stats?.totalRevenue}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarCircleOutlined />}
                            suffix="$"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
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
                    <Card bordered={false}>
                        <Statistic
                            title="Accounts Payable"
                            value={stats?.accountsPayable}
                            precision={2}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<DollarCircleOutlined />}
                            suffix="$"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Inventory Value"
                            value={stats?.inventoryValue}
                            precision={2}
                            prefix={<ArrowUpOutlined />}
                            suffix="$"
                        />
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
