import React from 'react';
import { Table, Typography, Card, Tag, Button, Space, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import keycloak from '../../auth/keycloak';
import { Link } from 'react-router-dom';

const { Title } = Typography;

interface OrderItem {
    id: string;
    product: { name: string };
    quantity: number;
    unitPrice: number;
}

interface Order {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    customer: { name: string };
    items: OrderItem[];
}

const OrdersPage: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: orders, isLoading } = useQuery<Order[]>({
        queryKey: ['orders'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/orders', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            await axios.patch(`http://localhost:3000/orders/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            message.success('Order status updated');
        },
    });

    const columns = [
        { title: 'Order #', dataIndex: 'orderNumber', key: 'orderNumber' },
        { title: 'Customer', dataIndex: ['customer', 'name'], key: 'customer' },
        {
            title: 'Total',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (val: number) => `$${Number(val).toFixed(2)}`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'completed' ? 'green' : status === 'pending' ? 'gold' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleString(),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: Order) => (
                <Space>
                    {record.status === 'pending' && (
                        <Button
                            type="link"
                            onClick={() => updateStatusMutation.mutate({ id: record.id, status: 'completed' })}
                        >
                            Mark Complete
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    const expandedRowRender = (record: Order) => {
        const itemColumns = [
            { title: 'Product', dataIndex: ['product', 'name'], key: 'product' },
            { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
            {
                title: 'Unit Price',
                dataIndex: 'unitPrice',
                key: 'unitPrice',
                render: (val: number) => `$${Number(val).toFixed(2)}`,
            },
            {
                title: 'Subtotal',
                key: 'subtotal',
                render: (row: any) => `$${(row.quantity * row.unitPrice).toFixed(2)}`,
            },
        ];

        return (
            <Table
                columns={itemColumns}
                dataSource={record.items}
                pagination={false}
                rowKey="id"
                size="small"
                bordered
            />
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Sales Orders</Title>
                <Link to="/orders/new">
                    <Button type="primary">Create New Order</Button>
                </Link>
            </div>

            <Card>
                <Table
                    dataSource={orders}
                    columns={columns}
                    loading={isLoading}
                    rowKey="id"
                    expandable={{ expandedRowRender }}
                />
            </Card>
        </div>
    );
};

export default OrdersPage;
