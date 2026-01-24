import React from 'react';
import { Table, Typography, Card, Button, Modal, Form, Input, InputNumber, Select, Tag, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import keycloak from '../../auth/keycloak';
import {
    HistoryOutlined,
    SwapOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface LedgerItem {
    id: string;
    type: 'SALE' | 'PURCHASE' | 'ADJUSTMENT';
    reference: string;
    productName: string;
    quantity: number;
    previousStock?: number;
    newStock?: number;
    date: string;
    performedBy: string;
    reason: string;
}

const InventoryLedgerPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [form] = Form.useForm();

    const { data: ledger, isLoading } = useQuery<LedgerItem[]>({
        queryKey: ['inventory-ledger'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/inventory/ledger', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const { data: products } = useQuery<any[]>({
        queryKey: ['products'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/inventory/products', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const adjustmentMutation = useMutation({
        mutationFn: async (values: any) => {
            await axios.post('http://localhost:3000/inventory/adjustments', values, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory-ledger'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setIsModalOpen(false);
            form.resetFields();
            message.success('Stock adjustment recorded and audited');
        },
    });

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')
        },
        {
            title: 'Product',
            dataIndex: 'productName',
            key: 'productName',
            render: (name: string) => <Text strong>{name}</Text>
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => {
                const colors: any = { SALE: 'orange', PURCHASE: 'green', ADJUSTMENT: 'blue' };
                return <Tag color={colors[type]}>{type}</Tag>;
            }
        },
        { title: 'Reference', dataIndex: 'reference', key: 'reference' },
        {
            title: 'Qty Change',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (qty: number) => (
                <Text type={qty > 0 ? 'success' : 'danger'}>
                    {qty > 0 ? `+${qty}` : qty}
                </Text>
            )
        },
        { title: 'Performed By', dataIndex: 'performedBy', key: 'performedBy' },
        { title: 'Reason', dataIndex: 'reason', key: 'reason' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}><HistoryOutlined /> Inventory Ledger</Title>
                <Button
                    type="primary"
                    icon={<SwapOutlined />}
                    onClick={() => setIsModalOpen(true)}
                >
                    Record Adjustment
                </Button>
            </div>

            <Card variant="borderless">
                <Table
                    columns={columns}
                    dataSource={ledger}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 12 }}
                />
            </Card>

            <Modal
                title="Manual Stock Adjustment"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={adjustmentMutation.isPending}
            >
                <Form form={form} layout="vertical" onFinish={(v) => adjustmentMutation.mutate(v)}>
                    <Form.Item name="productId" label="Product" rules={[{ required: true }]}>
                        <Select
                            showSearch
                            placeholder="Select a product"
                            optionFilterProp="children"
                        >
                            {products?.map(p => (
                                <Select.Option key={p.id} value={p.id}>{p.name} (Stock: {p.stockLevel})</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="type" label="Adjustment Type" initialValue="addition" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="addition">Addition (Stock IN)</Select.Option>
                            <Select.Option value="subtraction">Subtraction (Stock OUT)</Select.Option>
                            <Select.Option value="set">Set Absolute (Overwrite)</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item name="reason" label="Reason / Notes" rules={[{ required: true }]}>
                        <Input.TextArea rows={3} placeholder="e.g. Damaged during shipping, Annual stock audit, Return to vendor" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default InventoryLedgerPage;
