import React from 'react';
import { Table, Typography, Card, Button, Form, Input, Select, DatePicker, message, Modal, InputNumber, Space, Tag } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import {
    PlusOutlined,
    DollarOutlined,
    TagOutlined,
    FileTextOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import keycloak from '../../auth/keycloak';

const { Title, Text } = Typography;

interface Expense {
    id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
    reference: string;
}

const ExpensesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [form] = Form.useForm();

    const { data: expenses, isLoading } = useQuery<Expense[]>({
        queryKey: ['expenses'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/finance/expenses', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: any) => {
            await axios.post('http://localhost:3000/finance/expenses', {
                ...values,
                date: values.date.format('YYYY-MM-DD'),
            }, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            setIsModalOpen(false);
            form.resetFields();
            message.success('Expense recorded successfully');
        },
    });

    const categories = [
        'rent', 'utilities', 'marketing', 'office_supplies', 'travel', 'salaries', 'taxes', 'other'
    ];

    const getCategoryColor = (cat: string) => {
        const colors: Record<string, string> = {
            rent: 'volcano',
            utilities: 'cyan',
            marketing: 'magenta',
            office_supplies: 'blue',
            travel: 'purple',
            salaries: 'green',
            taxes: 'orange',
            other: 'default'
        };
        return colors[cat] || 'default';
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => <span><CalendarOutlined style={{ marginRight: 8 }} />{date}</span>
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (cat: string) => <Tag color={getCategoryColor(cat)} style={{ textTransform: 'uppercase' }}><TagOutlined /> {cat.replace('_', ' ')}</Tag>
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (val: number) => <Text type="danger" style={{ fontWeight: 'bold' }}>-${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
        },
        {
            title: 'Reference',
            dataIndex: 'reference',
            key: 'reference',
            render: (text: string) => <Text type="secondary">{text || '-'}</Text>
        },
    ];

    const totalSpent = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <Title level={2}><DollarOutlined /> Expense Management</Title>
                    <Text type="secondary">Track all operational costs and company expenditure.</Text>
                </div>
                <Space>
                    <Card size="small" variant="borderless" style={{ background: '#fff1f0', border: '1px solid #ffccc7' }}>
                        <Statistic
                            title="Total Expenditure"
                            value={totalSpent}
                            prefix="-$"
                            valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
                        />
                    </Card>
                    <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                        Record Expense
                    </Button>
                </Space>
            </div>

            <Card variant="borderless">
                <Table
                    columns={columns}
                    dataSource={expenses}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={<><PlusOutlined /> Record New Expense</>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={mutation.isPending}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={(v) => mutation.mutate(v)} initialValues={{ date: dayjs() }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item name="date" label="Expense Date" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="category" label="Category" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <Select>
                                {categories.map(c => (
                                    <Select.Option key={c} value={c}>{c.replace('_', ' ').toUpperCase()}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} prefix="$" size="large" min={0.01} />
                    </Form.Item>

                    <Form.Item name="description" label="Description / Payee" rules={[{ required: true }]}>
                        <Input prefix={<FileTextOutlined />} placeholder="e.g., Monthly Office Rent - Jan 2026" />
                    </Form.Item>

                    <Form.Item name="reference" label="Reference (Optional)">
                        <Input placeholder="Invoice #, Receipt ID, etc." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ExpensesPage;

// Internal dependencies for the card
import { Statistic } from 'antd';
