import React, { useState } from 'react';
import { Table, Button, Space, Typography, Card, Modal, Form, Input, InputNumber, Select, message, Tag } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import keycloak from '../../auth/keycloak';

const { Title } = Typography;

interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    stockLevel: number;
    category: Category;
}

const ProductsPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: products, isLoading } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/products', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const { data: categories } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/categories', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (values: any) => {
            await axios.post('http://localhost:3000/products', values, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            message.success('Product created');
            setIsModalOpen(false);
            form.resetFields();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`http://localhost:3000/products/${id}`, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            message.success('Product deleted');
        },
    });

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'SKU', dataIndex: 'sku', key: 'sku' },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `$${Number(price).toFixed(2)}`,
        },
        {
            title: 'Stock',
            dataIndex: 'stockLevel',
            key: 'stockLevel',
            render: (stock: number) => (
                <Tag color={stock < 10 ? 'red' : 'green'}>{stock}</Tag>
            ),
        },
        {
            title: 'Category',
            dataIndex: ['category', 'name'],
            key: 'category',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: Product) => (
                <Button danger type="link" onClick={() => deleteMutation.mutate(record.id)}>
                    Delete
                </Button>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Products</Title>
                <Button type="primary" onClick={() => setIsModalOpen(true)}>
                    Add Product
                </Button>
            </div>

            <Card>
                <Table dataSource={products} columns={columns} loading={isLoading} rowKey="id" />
            </Card>

            <Modal
                title="Create Product"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={createMutation.isPending}
            >
                <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="price" label="Price" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="stockLevel" label="Stock Level" initialValue={0}>
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                        <Select>
                            {categories?.map((c) => (
                                <Select.Option key={c.id} value={c.id}>
                                    {c.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductsPage;
