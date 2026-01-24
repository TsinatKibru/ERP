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

interface Supplier {
    id: string;
    name: string;
}

const CreatePurchaseOrderPage: React.FC = () => {
    const [items, setItems] = useState<{ productId: string; name: string; quantity: number; unitPrice: number }[]>([]);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: suppliers } = useQuery<Supplier[]>({
        queryKey: ['suppliers'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/suppliers', {
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
                supplierId: values.supplierId,
                items: items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice }))
            };
            await axios.post('http://localhost:3000/purchase-orders', payload, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
            message.success('Purchase Order created successfully');
            navigate('/purchase-orders');
        },
    });

    const addItem = (v: any) => {
        const product = products?.find(p => p.id === v.productId);
        if (!product) return;

        setItems([...items, { ...v, name: product.name }]);
        form.setFieldsValue({ productId: undefined, quantity: 1, unitPrice: product.price });
    };

    const total = items.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0);

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Title level={2}>Create Purchase Order</Title>

            <Card title="Order Details">
                <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
                    <Form.Item name="supplierId" label="Select Supplier" rules={[{ required: true }]}>
                        <Select showSearch optionFilterProp="children">
                            {suppliers?.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
                        </Select>
                    </Form.Item>

                    <Divider>Add Items</Divider>

                    <Space align="baseline">
                        <Form.Item name="productId" label="Product">
                            <Select style={{ width: 250 }} onChange={(val) => {
                                const p = products?.find(x => x.id === val);
                                if (p) form.setFieldsValue({ unitPrice: p.price });
                            }}>
                                {products?.map(p => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item name="quantity" label="Qty" initialValue={1}>
                            <InputNumber min={1} />
                        </Form.Item>
                        <Form.Item name="unitPrice" label="Cost Price">
                            <InputNumber min={0.01} precision={2} />
                        </Form.Item>
                        <Button type="dashed" onClick={() => addItem(form.getFieldsValue(['productId', 'quantity', 'unitPrice']))}>
                            Add
                        </Button>
                    </Space>

                    <List
                        header={<b>Items List</b>}
                        bordered
                        dataSource={items}
                        renderItem={(item, index) => (
                            <List.Item actions={[<Button type="link" onClick={() => setItems(items.filter((_, i) => i !== index))}>Remove</Button>]}>
                                <Text strong>{item.name}</Text> x {item.quantity} - <Text type="secondary">${(item.unitPrice * item.quantity).toFixed(2)}</Text>
                            </List.Item>
                        )}
                        style={{ marginTop: 20 }}
                    />

                    <div style={{ marginTop: 20, textAlign: 'right' }}>
                        <Title level={4}>Estimated Total: ${total.toFixed(2)}</Title>
                    </div>

                    <Form.Item style={{ marginTop: 20 }}>
                        <Button type="primary" size="large" onClick={() => form.submit()} loading={createMutation.isPending} disabled={items.length === 0}>
                            Submit Purchase Order
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default CreatePurchaseOrderPage;
