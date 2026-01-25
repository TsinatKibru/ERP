import React from 'react';
import { Table, Typography, Card, Button, Form, Select, Tag, message, Modal, InputNumber, Space } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import keycloak from '../../auth/keycloak';
import { FilePdfOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface PayrollRecord {
    id: string;
    employee: { id: string; name: string };
    period: string;
    baseSalary: number;
    bonuses: number;
    absentDays: number;
    attendanceDeduction: number;
    deductions: number;
    netSalary: number;
    status: 'draft' | 'paid' | 'cancelled';
}

const generatePeriods = () => {
    const periods = [];
    const now = new Date();

    // Generate rolling window: 12 months back and 12 months forward
    for (let i = -12; i <= 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        periods.push(d.toISOString().slice(0, 7));
    }

    return Array.from(new Set(periods)).sort((a, b) => b.localeCompare(a));
};

const PayrollPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = React.useState(false);
    const [form] = Form.useForm();
    const [bulkForm] = Form.useForm();
    const [editingRecord, setEditingRecord] = React.useState<PayrollRecord | null>(null);
    const [downloadingId, setDownloadingId] = React.useState<string | null>(null);
    const periods = generatePeriods();
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [selectedPeriod, setSelectedPeriod] = React.useState<string>(currentMonth);

    const { data: payrollRecords, isLoading } = useQuery<PayrollRecord[]>({
        queryKey: ['payroll', selectedPeriod],
        queryFn: async () => {
            const { data } = await axios.get(`http://localhost:3000/hr/payroll?period=${selectedPeriod}`, {
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
            setIsBulkModalOpen(false);
            message.success(`Generated payroll for ${res.count} employees`);
        },
    });

    const bulkStatusMutation = useMutation({
        mutationFn: async (data: { period: string; status: string }) => {
            await axios.patch('http://localhost:3000/hr/payroll/bulk/status', data, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payroll'] });
            message.success('All records in period marked as paid');
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
            title: 'Attendance (Absent)',
            key: 'attendance',
            render: (_: any, record: PayrollRecord) => (
                <Space direction="vertical" size={0}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.absentDays} days</Text>
                    <Text type="danger" style={{ fontSize: 11 }}>-${Number(record.attendanceDeduction).toLocaleString()}</Text>
                </Space>
            )
        },
        {
            title: 'Other Deductions',
            dataIndex: 'deductions',
            key: 'deductions',
            render: (val: number) => `$${Number(val).toLocaleString()}`,
        },
        {
            title: 'Net Salary',
            dataIndex: 'netSalary',
            key: 'netSalary',
            render: (val: number) => <Tag color="gold" style={{ fontWeight: 'bold', fontSize: 14 }}>${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Tag>,
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
                        icon={<FilePdfOutlined />}
                        loading={record.id === downloadingId}
                        onClick={async () => {
                            setDownloadingId(record.id);
                            try {
                                const response = await axios.get(`http://localhost:3000/hr/payroll/${record.id}/pdf`, {
                                    headers: { Authorization: `Bearer ${keycloak.token}` },
                                    responseType: 'blob',
                                });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', `payslip-${record.employee.name.replace(/\s+/g, '_')}-${record.period}.pdf`);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                window.URL.revokeObjectURL(url);
                            } catch (err) {
                                message.error('Failed to download payslip');
                            } finally {
                                setDownloadingId(null);
                            }
                        }}
                    >
                        Payslip
                    </Button>
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

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Payroll Management</Title>
                <Space>
                    <Select
                        value={selectedPeriod}
                        onChange={setSelectedPeriod}
                        style={{ width: 140 }}
                        placeholder="Filter Period"
                    >
                        {periods.map(p => <Select.Option key={p} value={p}>{p}</Select.Option>)}
                    </Select>
                    <Button
                        loading={bulkMutation.isPending}
                        onClick={() => setIsBulkModalOpen(true)}
                    >
                        Bulk Generate
                    </Button>
                    <Button
                        loading={bulkStatusMutation.isPending}
                        onClick={() => {
                            Modal.confirm({
                                title: `Mark all ${selectedPeriod} records as Paid?`,
                                content: 'This will update all draft records for this period to PAID status.',
                                onOk: () => bulkStatusMutation.mutate({ period: selectedPeriod, status: 'paid' }),
                            });
                        }}
                    >
                        Mark All as Paid
                    </Button>
                    <Button type="primary" onClick={() => {
                        setEditingRecord(null);
                        form.resetFields();
                        setIsModalOpen(true);
                    }}>Generate Individual</Button>
                </Space>
            </div>

            <Card>
                <Table columns={columns} dataSource={payrollRecords} rowKey="id" loading={isLoading} />
            </Card>

            <Modal
                title={editingRecord ? 'Edit Payroll Record' : 'Generate Individual Payroll'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={generateMutation.isPending || updateMutation.isPending}
            >
                <Form form={form} layout="vertical" onFinish={(v) => editingRecord ? updateMutation.mutate(v) : generateMutation.mutate(v)} initialValues={{ period: selectedPeriod }}>
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
                                    {periods.map(p => <Select.Option key={p} value={p}>{p}</Select.Option>)}
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

            <Modal
                title="Bulk Generate Payroll"
                open={isBulkModalOpen}
                onCancel={() => setIsBulkModalOpen(false)}
                onOk={() => bulkForm.submit()}
                confirmLoading={bulkMutation.isPending}
            >
                <Form form={bulkForm} layout="vertical" onFinish={(v) => bulkMutation.mutate(v.period)} initialValues={{ period: selectedPeriod }}>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                        This will generate draft payroll records for all active employees for the selected period.
                        Existing records for the period will be refreshed.
                    </Text>
                    <Form.Item name="period" label="Target Period" rules={[{ required: true }]}>
                        <Select>
                            {periods.map(p => <Select.Option key={p} value={p}>{p}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PayrollPage;
