import React, { useState } from 'react';
import { Table, Button, Space, Typography, Card, Modal, Form, Input, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import keycloak from '../../auth/keycloak';

const { Title } = Typography;

interface Category {
    id: string;
    name: string;
    description: string;
    createdAt: string;
}

const CategoriesPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: categories, isLoading } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/categories', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (values: Partial<Category>) => {
            await axios.post('http://localhost:3000/categories', values, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            message.success('Category created');
            setIsModalOpen(false);
            form.resetFields();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`http://localhost:3000/categories/${id}`, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            message.success('Category deleted');
        },
    });

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Description', dataIndex: 'description', key: 'description' },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: Category) => (
                <Button danger type="link" onClick={() => deleteMutation.mutate(record.id)}>
                    Delete
                </Button>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Categories</Title>
                <Button type="primary" onClick={() => setIsModalOpen(true)}>
                    Add Category
                </Button>
            </div>

            <Card>
                <Table dataSource={categories} columns={columns} loading={isLoading} rowKey="id" />
            </Card>

            <Modal
                title="Create Category"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={createMutation.isPending}
            >
                <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoriesPage;
