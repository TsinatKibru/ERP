import React from 'react';
import { Table, Typography, Card, Tag, Button, Space, message, Modal, Form, InputNumber, Select, Input } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import keycloak from '../../auth/keycloak';

const { Title } = Typography;

interface Invoice {
    id: string;
    invoiceNumber: string;
    amount: number;
    status: string;
    dueDate: string;
    order: { orderNumber: string; customer: { name: string } };
}

const InvoicesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
    const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
    const [form] = Form.useForm();

    const { data: invoices, isLoading } = useQuery<Invoice[]>({
        queryKey: ['invoices'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/invoices', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const recordPaymentMutation = useMutation({
        mutationFn: async (values: any) => {
            await axios.post(`http://localhost:3000/payments/invoice/${selectedInvoice?.id}`, values, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            message.success('Payment recorded');
            setIsPaymentModalOpen(false);
            form.resetFields();
        },
    });

    const columns = [
        { title: 'Invoice #', dataIndex: 'invoiceNumber', key: 'invoiceNumber' },
        { title: 'Order #', dataIndex: ['order', 'orderNumber'], key: 'orderNumber' },
        { title: 'Customer', dataIndex: ['order', 'customer', 'name'], key: 'customer' },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (val: number) => `$${Number(val).toFixed(2)}`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'paid' ? 'green' : status === 'unpaid' ? 'orange' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: Invoice) => (
                <Space>
                    <Button
                        icon={<FilePdfOutlined />}
                        onClick={() => {
                            window.open(`http://localhost:3000/invoices/${record.id}/pdf`, '_blank');
                        }}
                    >
                        PDF
                    </Button>
                    {record.status === 'unpaid' && (
                        <Button
                            type="link"
                            onClick={() => {
                                setSelectedInvoice(record);
                                setIsPaymentModalOpen(true);
                                form.setFieldsValue({ amount: record.amount });
                            }}
                        >
                            Record Payment
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Title level={2}>Invoices & AR</Title>

            <Card>
                <Table dataSource={invoices} columns={columns} loading={isLoading} rowKey="id" />
            </Card>

            <Modal
                title={`Record Payment for ${selectedInvoice?.invoiceNumber}`}
                open={isPaymentModalOpen}
                onCancel={() => setIsPaymentModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={recordPaymentMutation.isPending}
            >
                <Form form={form} layout="vertical" onFinish={(v) => recordPaymentMutation.mutate(v)}>
                    <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} precision={2} />
                    </Form.Item>
                    <Form.Item name="method" label="Payment Method" rules={[{ required: true }]} initialValue="Bank Transfer">
                        <Select>
                            <Select.Option value="Cash">Cash</Select.Option>
                            <Select.Option value="Bank Transfer">Bank Transfer</Select.Option>
                            <Select.Option value="Credit Card">Credit Card</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="reference" label="Reference Number">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default InvoicesPage;
