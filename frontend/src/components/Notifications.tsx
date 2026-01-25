import React from 'react';
import { Badge, Dropdown, List, Typography, Button, message } from 'antd';
import { BellOutlined, InfoCircleOutlined, WarningOutlined, AlertOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import keycloak from '../auth/keycloak';

const { Text } = Typography;

interface Notification {
    id: string;
    type: 'low_stock' | 'audit_alert' | 'invoice_paid' | 'info';
    message: string;
    date: string;
}

const Notifications: React.FC = () => {
    // For now, we simulate real-time notification by fetching dashboard stats 
    // and generating local notifications based on thresholds, or we could add a Notification entity.
    // Let's implement a simple backend-driven notification system in the next step.
    // For this UI demo, let's use some hardcoded ones if stats indicate issues.

    const { data: stats } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/dashboard/stats', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const notifications: Notification[] = [];

    if (stats?.lowStockAlerts?.length > 0) {
        notifications.push({
            id: 'low-stock',
            type: 'low_stock',
            message: `${stats.lowStockAlerts.length} products have low stock levels!`,
            date: new Date().toISOString()
        });
    }

    if (stats?.accountsReceivable > 5000) {
        notifications.push({
            id: 'ar-high',
            type: 'warning',
            message: `High Accounts Receivable: $${stats.accountsReceivable.toLocaleString()} pending.`,
            date: new Date().toISOString()
        } as any);
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'low_stock': return <WarningOutlined style={{ color: '#faad14' }} />;
            case 'audit_alert': return <AlertOutlined style={{ color: '#ff4d4f' }} />;
            case 'invoice_paid': return <InfoCircleOutlined style={{ color: '#52c41a' }} />;
            default: return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
        }
    };

    const menu = (
        <div style={{ background: 'white', padding: 8, borderRadius: 8, boxShadow: '0 3px 6px -4px rgba(0,0,0,0.12), 0 6px 16px 0 rgba(0,0,0,0.08), 0 9px 28px 8px rgba(0,0,0,0.05)', width: 300 }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>Notifications</Text>
                <Button type="link" size="small" onClick={() => message.info('All marked as read')}>Clear All</Button>
            </div>
            <List
                dataSource={notifications}
                locale={{ emptyText: 'No new alerts' }}
                renderItem={(item) => (
                    <List.Item style={{ padding: '12px 16px', borderBottom: '1px solid #f5f5f5' }}>
                        <List.Item.Meta
                            avatar={getIcon(item.type)}
                            title={<Text style={{ fontSize: 13 }}>{item.message}</Text>}
                            description={<Text type="secondary" style={{ fontSize: 11 }}>{new Date(item.date).toLocaleTimeString()}</Text>}
                        />
                    </List.Item>
                )}
            />
        </div>
    );

    return (
        <Dropdown menu={{ items: [{ key: '1', label: menu }] }} trigger={['click']} placement="bottomRight">
            <Badge count={notifications.length} size="small" offset={[-2, 10]}>
                <Button
                    type="text"
                    icon={<BellOutlined style={{ fontSize: 20 }} />}
                    style={{ width: 40, height: 40 }}
                />
            </Badge>
        </Dropdown>
    );
};

export default Notifications;
