import React, { useState } from 'react';
import { Table, Button, Typography, Card, Modal, Form, Input, InputNumber, Select, message, Tag, Space, Popconfirm } from 'antd';
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
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: products, isLoading } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/inventory/products', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const { data: categories } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/inventory/categories', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (values: any) => {
            await axios.post('http://localhost:3000/inventory/products', values, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            message.success('Product created');
            handleCancel();
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (values: any) => {
            await axios.patch(`http://localhost:3000/inventory/products/${editingProduct?.id}`, values, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            message.success('Product updated');
            handleCancel();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`http://localhost:3000/inventory/products/${id}`, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            message.success('Product deleted');
        },
    });

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
        form.setFieldsValue({
            ...product,
            category: product.category.id
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        form.resetFields();
    };

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
                <Space>
                    <Button type="link" onClick={() => handleEdit(record)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete Product"
                        description="Are you sure you want to delete this product? This action cannot be undone."
                        onConfirm={() => deleteMutation.mutate(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger type="link">
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
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
                title={editingProduct ? "Edit Product" : "Create Product"}
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={() => form.submit()}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form form={form} layout="vertical" onFinish={(v) => editingProduct ? updateMutation.mutate(v) : createMutation.mutate(v)}>
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
