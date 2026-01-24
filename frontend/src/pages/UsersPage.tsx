import React from 'react';
import { Table, Tag, Typography, Card } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import keycloak from '../auth/keycloak';

const { Title } = Typography;

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
}

const UsersPage: React.FC = () => {
    const { data: users, isLoading } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/users', {
                headers: {
                    Authorization: `Bearer ${keycloak.token}`,
                },
            });
            return data;
        },
    });

    const columns = [
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'First Name',
            dataIndex: 'firstName',
            key: 'firstName',
        },
        {
            title: 'Last Name',
            dataIndex: 'lastName',
            key: 'lastName',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => (
                <Tag color={role === 'admin' ? 'pro' : 'blue'}>
                    {role.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
    ];

    return (
        <div>
            <Title level={2}>User Management</Title>
            <Card>
                <Table
                    dataSource={users}
                    columns={columns}
                    loading={isLoading}
                    rowKey="id"
                />
            </Card>
        </div>
    );
};

export default UsersPage;
