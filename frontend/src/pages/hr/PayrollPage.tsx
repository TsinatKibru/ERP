import React from 'react';
import { Table, Typography, Card, Button, Form, Select, Tag, message, Modal, InputNumber, Space } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import keycloak from '../../auth/keycloak';

const { Title } = Typography;

interface PayrollRecord {
    id: string;
    employee: { id: string; name: string };
    period: string;
    baseSalary: number;
    bonuses: number;
    deductions: number;
    netSalary: number;
    status: 'draft' | 'paid' | 'cancelled';
}

const PayrollPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [form] = Form.useForm();
    const [editingRecord, setEditingRecord] = React.useState<PayrollRecord | null>(null);

    const { data: payrollRecords, isLoading } = useQuery<PayrollRecord[]>({
        queryKey: ['payroll'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/hr/payroll', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const { data: employees } = useQuery<any[]>({
        queryKey: ['employees'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/hr/employees', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const generateMutation = useMutation({
        mutationFn: async (values: any) => {
            await axios.post('http://localhost:3000/hr/payroll', values, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payroll'] });
            setIsModalOpen(false);
            form.resetFields();
            message.success('Payroll record generated');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (values: any) => {
            if (editingRecord) {
                await axios.patch(`http://localhost:3000/hr/payroll/${editingRecord.id}`, values, {
                    headers: { Authorization: `Bearer ${keycloak.token}` },
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payroll'] });
            setIsModalOpen(false);
            form.resetFields();
            message.success('Payroll record updated');
        },
    });

    const statusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            await axios.patch(`http://localhost:3000/hr/payroll/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payroll'] });
            message.success('Payroll status updated');
        },
    });

    const bulkMutation = useMutation({
        mutationFn: async (period: string) => {
            const { data } = await axios.post('http://localhost:3000/hr/payroll/bulk', { period }, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
        onSuccess: (res: any) => {
            queryClient.invalidateQueries({ queryKey: ['payroll'] });
            message.success(`Generated payroll for ${res.count} employees`);
        },
    });

    const columns = [
        { title: 'Period', dataIndex: 'period', key: 'period' },
        { title: 'Employee', dataIndex: ['employee', 'name'], key: 'employee' },
        {
            title: 'Base Salary (p.m.)',
            dataIndex: 'baseSalary',
            key: 'baseSalary',
            render: (val: number) => `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        },
        {
            title: 'Bonuses',
            dataIndex: 'bonuses',
            key: 'bonuses',
            render: (val: number) => `$${Number(val).toLocaleString()}`,
        },
        {
            title: 'Deductions',
            dataIndex: 'deductions',
            key: 'deductions',
            render: (val: number) => `$${Number(val).toLocaleString()}`,
        },
        {
            title: 'Net Salary',
            dataIndex: 'netSalary',
            key: 'netSalary',
            render: (val: number) => <strong>${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'paid' ? 'green' : status === 'draft' ? 'blue' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: PayrollRecord) => (
                <Space>
                    <Button
                        type="link"
                        onClick={() => {
                            setEditingRecord(record);
                            form.setFieldsValue(record);
                            setIsModalOpen(true);
                        }}
                    >
                        Edit
                    </Button>
                    {record.status === 'draft' && (
                        <Button
                            type="link"
                            onClick={() => statusMutation.mutate({ id: record.id, status: 'paid' })}
                        >
                            Mark Paid
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    const currentPeriod = new Date().toISOString().slice(0, 7); // e.g. "2026-01"

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Payroll Management</Title>
                <Space>
                    <Button
                        loading={bulkMutation.isPending}
                        onClick={() => bulkMutation.mutate(currentPeriod)}
                    >
                        Bulk Generate ({currentPeriod})
                    </Button>
                    <Button type="primary" onClick={() => {
                        setEditingRecord(null);
                        form.resetFields();
                        setIsModalOpen(true);
                    }}>Generate Payroll</Button>
                </Space>
            </div>

            <Card>
                <Table columns={columns} dataSource={payrollRecords} rowKey="id" loading={isLoading} />
            </Card>

            <Modal
                title={editingRecord ? 'Edit Payroll Record' : 'Generate Payroll Record'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={generateMutation.isPending || updateMutation.isPending}
            >
                <Form form={form} layout="vertical" onFinish={(v) => editingRecord ? updateMutation.mutate(v) : generateMutation.mutate(v)} initialValues={{ period: currentPeriod }}>
                    {!editingRecord && (
                        <>
                            <Form.Item name="employeeId" label="Employee" rules={[{ required: true }]}>
                                <Select showSearch optionFilterProp="children">
                                    {employees?.map((e: any) => (
                                        <Select.Option key={e.id} value={e.id}>{e.name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name="period" label="Period (YYYY-MM)" rules={[{ required: true }]}>
                                <Select>
                                    <Select.Option value={currentPeriod}>{currentPeriod}</Select.Option>
                                    <Select.Option value="2025-12">2025-12</Select.Option>
                                </Select>
                            </Form.Item>
                        </>
                    )}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Form.Item name="bonuses" label="Bonuses" style={{ flex: 1 }} initialValue={0}>
                            <InputNumber style={{ width: '100%' }} prefix="$" />
                        </Form.Item>
                        <Form.Item name="deductions" label="Deductions" style={{ flex: 1 }} initialValue={0}>
                            <InputNumber style={{ width: '100%' }} prefix="$" />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default PayrollPage;
