import React, { useState } from 'react';
import { Typography, Card, Form, Select, InputNumber, Button, Space, Divider, message, List } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import keycloak from '../../auth/keycloak';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface Product {
    id: string;
    name: string;
    price: number;
}

interface Customer {
    id: string;
    name: string;
}

const CreateOrderPage: React.FC = () => {
    const [items, setItems] = useState<{ productId: string; name: string; quantity: number; price: number }[]>([]);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: customers } = useQuery<Customer[]>({
        queryKey: ['customers'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/customers', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const { data: products } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/products', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (values: any) => {
            const payload = {
                customerId: values.customerId,
                items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
            };
            await axios.post('http://localhost:3000/orders', payload, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            message.success('Order created successfully');
            navigate('/orders');
        },
    });

    const addItem = (v: any) => {
        const product = products?.find(p => p.id === v.productId);
        if (!product) return;

        setItems([...items, { ...v, name: product.name, price: product.price }]);
        form.setFieldsValue({ productId: undefined, quantity: 1 });
    };

    const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Title level={2}>Create New Sales Order</Title>

            <Card title="Order Details">
                <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
                    <Form.Item name="customerId" label="Select Customer" rules={[{ required: true }]}>
                        <Select showSearch optionFilterProp="children">
                            {customers?.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
                        </Select>
                    </Form.Item>

                    <Divider>Add Products</Divider>

                    <Space align="baseline">
                        <Form.Item name="productId" label="Product">
                            <Select style={{ width: 300 }}>
                                {products?.map(p => <Select.Option key={p.id} value={p.id}>{p.name} (${p.price})</Select.Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item name="quantity" label="Qty" initialValue={1}>
                            <InputNumber min={1} />
                        </Form.Item>
                        <Button type="dashed" onClick={() => addItem(form.getFieldsValue(['productId', 'quantity']))}>
                            Add Item
                        </Button>
                    </Space>

                    <List
                        header={<b>Items List</b>}
                        bordered
                        dataSource={items}
                        renderItem={(item, index) => (
                            <List.Item actions={[<Button type="link" onClick={() => setItems(items.filter((_, i) => i !== index))}>Remove</Button>]}>
                                <Text strong>{item.name}</Text> x {item.quantity} - <Text type="secondary">${(item.price * item.quantity).toFixed(2)}</Text>
                            </List.Item>
                        )}
                        style={{ marginTop: 20 }}
                    />

                    <div style={{ marginTop: 20, textAlign: 'right' }}>
                        <Title level={4}>Total Amount: ${total.toFixed(2)}</Title>
                    </div>

                    <Form.Item style={{ marginTop: 20 }}>
                        <Button type="primary" size="large" onClick={() => form.submit()} loading={createMutation.isPending} disabled={items.length === 0}>
                            Submit Order
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default CreateOrderPage;
