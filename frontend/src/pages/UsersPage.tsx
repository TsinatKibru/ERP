import React from 'react';
import { Table, Tag, Typography, Card, Button, Modal, Select, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import keycloak from '../auth/keycloak';

const { Title, Text } = Typography;

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
    employee?: { id: string, name: string };
}

const UsersPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
    const [linkingEmployeeId, setLinkingEmployeeId] = React.useState<string | null>(null);

    const { data: users, isLoading } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/users', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const { data: employees } = useQuery<any[]>({
        queryKey: ['employees'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/hr/employees', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const linkMutation = useMutation({
        mutationFn: async ({ userId, employeeId }: { userId: string, employeeId: string | null }) => {
            await axios.patch(`http://localhost:3000/users/${userId}/employee`, { employeeId }, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            message.success('User linked to employee');
            setIsModalOpen(false);
        },
    });

    const columns = [
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'First Name', dataIndex: 'firstName', key: 'firstName' },
        { title: 'Last Name', dataIndex: 'lastName', key: 'lastName' },
        {
            title: 'Linked Employee',
            key: 'employee',
            render: (_: any, record: User) => record.employee ? <Tag color="green">{record.employee.name}</Tag> : <Text type="secondary">Not Linked</Text>,
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => (
                <Tag color={role === 'admin' ? 'pro' : role === 'manager' ? 'purple' : 'blue'}>
                    {role.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: User) => (
                <Button type="link" onClick={() => {
                    setSelectedUser(record);
                    setLinkingEmployeeId(record.employee?.id || null);
                    setIsModalOpen(true);
                }}>
                    Link Employee
                </Button>
            ),
        },
    ];

    return (
        <div>
            <Title level={2}>User Management</Title>
            <Card>
                <Table dataSource={users} columns={columns} loading={isLoading} rowKey="id" />
            </Card>

            <Modal
                title={`Link ${selectedUser?.firstName} to Employee`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => linkMutation.mutate({ userId: selectedUser!.id, employeeId: linkingEmployeeId })}
                confirmLoading={linkMutation.isPending}
            >
                <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">Linking a user to an employee allows them to see their own payslips and attendance in the Self-Service portal.</Text>
                </div>
                <Select
                    placeholder="Select Employee"
                    style={{ width: '100%' }}
                    value={linkingEmployeeId}
                    onChange={setLinkingEmployeeId}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                >
                    {employees?.map(e => <Select.Option key={e.id} value={e.id}>{e.name} ({e.email})</Select.Option>)}
                </Select>
            </Modal>
        </div>
    );
};

export default UsersPage;
