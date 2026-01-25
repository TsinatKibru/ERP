import React, { useState } from 'react';
import { Table, Button, Typography, Card, Modal, Form, Input, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import keycloak from '../../auth/keycloak';

const { Title } = Typography;

interface Supplier {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
}

const SuppliersPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: suppliers, isLoading } = useQuery<Supplier[]>({
        queryKey: ['suppliers'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/procurement/suppliers', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (values: Partial<Supplier>) => {
            await axios.post('http://localhost:3000/procurement/suppliers', values, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            message.success('Supplier created');
            setIsModalOpen(false);
            form.resetFields();
        },
    });

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Contact', dataIndex: 'contactPerson', key: 'contactPerson' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Phone', dataIndex: 'phone', key: 'phone' },
        {
            title: 'Action',
            key: 'action',
            render: () => (
                <Button type="link" onClick={() => { }}>Edit</Button>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Suppliers Management</Title>
                <Button type="primary" onClick={() => setIsModalOpen(true)}>Add Supplier</Button>
            </div>

            <Card>
                <Table dataSource={suppliers} columns={columns} loading={isLoading} rowKey="id" />
            </Card>

            <Modal
                title="Add New Supplier"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={createMutation.isPending}
            >
                <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
                    <Form.Item name="name" label="Company Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="contactPerson" label="Contact Person">
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="Phone">
                        <Input />
                    </Form.Item>
                    <Form.Item name="address" label="Address">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SuppliersPage;
