import React from 'react';
import { Table, Typography, Card, Tag, Tooltip, Input } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import keycloak from '../auth/keycloak';
import {
    SafetyOutlined,
    ClockCircleOutlined,
    SearchOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface AuditLog {
    id: string;
    action: string;
    entity: string;
    user: string;
    details: any;
    createdAt: string;
}

const AuditLogPage: React.FC = () => {
    const [searchText, setSearchText] = React.useState('');

    const { data: logs, isLoading } = useQuery<AuditLog[]>({
        queryKey: ['audit-logs'],
        queryFn: async () => {
            // This endpoint will be handled by a generic controller or we need to add a controller for it
            const { data } = await axios.get('http://localhost:3000/audit/logs', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const columns = [
        {
            title: 'Timestamp',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => (
                <span><ClockCircleOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />{dayjs(date).format('YYYY-MM-DD HH:mm:ss')}</span>
            )
        },
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            render: (user: string) => <Tag color="blue">{user}</Tag>
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (action: string) => {
                const colors: any = { POST: 'green', PATCH: 'orange', DELETE: 'red', PUT: 'blue' };
                return <Tag color={colors[action]}>{action}</Tag>;
            }
        },
        {
            title: 'Entity',
            dataIndex: 'entity',
            key: 'entity',
            render: (ent: string) => <Text strong>{ent.toUpperCase()}</Text>
        },
        {
            title: 'Details',
            dataIndex: 'details',
            key: 'details',
            render: (details: any) => (
                <Tooltip title={JSON.stringify(details, null, 2)}>
                    <Text code style={{ fontSize: 11, cursor: 'help' }}>
                        {details.url.length > 30 ? details.url.slice(0, 30) + '...' : details.url}
                    </Text>
                </Tooltip>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}><SafetyOutlined /> Audit Trail</Title>
                <Input
                    placeholder="Search logs..."
                    prefix={<SearchOutlined />}
                    style={{ width: 250, borderRadius: 8 }}
                    onChange={e => setSearchText(e.target.value)}
                />
            </div>

            <Card variant="borderless">
                <Table
                    columns={columns}
                    dataSource={logs?.filter(log =>
                        log.entity.includes(searchText.toLowerCase()) ||
                        log.user.includes(searchText.toLowerCase())
                    )}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 15 }}
                />
            </Card>
        </div>
    );
};

export default AuditLogPage;
