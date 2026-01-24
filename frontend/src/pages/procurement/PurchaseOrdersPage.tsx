import React from 'react';
import { Table, Typography, Card, Tag, Button, Space, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import keycloak from '../../auth/keycloak';
import { Link } from 'react-router-dom';

const { Title } = Typography;

interface PurchaseOrderItem {
    id: string;
    product: { name: string };
    quantity: number;
    unitPrice: number;
}

interface PurchaseOrder {
    id: string;
    poNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    supplier: { name: string };
    items: PurchaseOrderItem[];
}

const PurchaseOrdersPage: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: pos, isLoading } = useQuery<PurchaseOrder[]>({
        queryKey: ['purchase-orders'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/purchase-orders', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            await axios.patch(`http://localhost:3000/purchase-orders/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
            message.success('PO status updated');
        },
    });

    const columns = [
        { title: 'PO #', dataIndex: 'poNumber', key: 'poNumber' },
        { title: 'Supplier', dataIndex: ['supplier', 'name'], key: 'supplier' },
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
                <Tag color={status === 'received' ? 'green' : status === 'pending' ? 'gold' : 'red'}>
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
            render: (_: any, record: PurchaseOrder) => (
                <Space>
                    {record.status === 'pending' && (
                        <>
                            <Button
                                type="link"
                                onClick={() => updateStatusMutation.mutate({ id: record.id, status: 'received' })}
                            >
                                Mark Received
                            </Button>
                            <Button
                                type="link"
                                danger
                                onClick={() => updateStatusMutation.mutate({ id: record.id, status: 'cancelled' })}
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    const expandedRowRender = (record: PurchaseOrder) => {
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
                <Title level={2}>Purchase Orders</Title>
                <Link to="/purchase-orders/new">
                    <Button type="primary">Create Purchase Order</Button>
                </Link>
            </div>

            <Card>
                <Table
                    dataSource={pos}
                    columns={columns}
                    loading={isLoading}
                    rowKey="id"
                    expandable={{ expandedRowRender }}
                />
            </Card>
        </div>
    );
};

export default PurchaseOrdersPage;
