import React from 'react';
import { Table, Typography, Card, Button, Form, DatePicker, Select, message, Modal, Input, Space, Dropdown, Tag } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import keycloak from '../../auth/keycloak';

const { Title } = Typography;

interface Attendance {
    id: string;
    employee: { id: string; name: string };
    date: string;
    checkIn: string;
    checkOut: string;
    status: 'present' | 'absent' | 'late' | 'leave';
    note: string;
}

const AttendancePage: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [form] = Form.useForm();

    const { data: attendanceData, isLoading } = useQuery<Attendance[]>({
        queryKey: ['attendance'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/hr/attendance', {
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

    const mutation = useMutation({
        mutationFn: async (values: any) => {
            await axios.post('http://localhost:3000/hr/attendance', {
                ...values,
                date: values.date.format ? values.date.format('YYYY-MM-DD') : values.date,
            }, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            setIsModalOpen(false);
            form.resetFields();
            message.success('Attendance recorded successfully');
        },
    });

    const statusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            const attendance = attendanceData?.find(a => a.id === id);
            await axios.post('http://localhost:3000/hr/attendance', {
                employeeId: attendance?.employee.id,
                date: attendance?.date,
                status
            }, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            message.success('Status updated');
        },
    });

    const bulkAbsentMutation = useMutation({
        mutationFn: async () => {
            for (const id of selectedRowKeys) {
                const attendance = attendanceData?.find(a => a.id === id);
                if (attendance) {
                    await axios.post('http://localhost:3000/hr/attendance', {
                        employeeId: attendance.employee.id,
                        date: attendance.date,
                        status: 'absent'
                    }, {
                        headers: { Authorization: `Bearer ${keycloak.token}` },
                    });
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            setSelectedRowKeys([]);
            message.success('Selected employees marked as absent');
        },
    });

    const bulkMutation = useMutation({
        mutationFn: async () => {
            const today = dayjs().format('YYYY-MM-DD');
            await axios.post('http://localhost:3000/hr/attendance/bulk', {
                date: today,
                checkIn: '09:00',
                checkOut: '17:00'
            }, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: (res: any) => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            message.success(`Recorded attendance for ${res.data.count} active employees`);
        },
    });

    const columns = [
        { title: 'Date', dataIndex: 'date', key: 'date' },
        { title: 'Employee', dataIndex: ['employee', 'name'], key: 'employee' },
        { title: 'Check In', dataIndex: 'checkIn', key: 'checkIn' },
        { title: 'Check Out', dataIndex: 'checkOut', key: 'checkOut' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: Attendance) => {
                const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
                    present: { color: '#52c41a', label: 'PRESENT', icon: <CheckCircleOutlined /> },
                    absent: { color: '#ff4d4f', label: 'ABSENT', icon: <CloseCircleOutlined /> },
                    late: { color: '#faad14', label: 'LATE', icon: <ClockCircleOutlined /> },
                    leave: { color: '#1890ff', label: 'LEAVE', icon: <LogoutOutlined /> },
                };

                // Safety check for null/undefined status
                const currentStatus = status || 'present';
                const config = statusConfig[currentStatus] || {
                    color: '#d9d9d9',
                    label: (currentStatus || 'UNKNOWN').toUpperCase(),
                    icon: null
                };

                const statusItems = [
                    { key: 'present', label: 'Present', icon: <CheckCircleOutlined style={{ color: '#52c41a' }} /> },
                    { key: 'absent', label: 'Absent', icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> },
                    { key: 'late', label: 'Late', icon: <ClockCircleOutlined style={{ color: '#faad14' }} /> },
                    { key: 'leave', label: 'Leave', icon: <LogoutOutlined style={{ color: '#1890ff' }} /> },
                ];

                return (
                    <Dropdown
                        menu={{
                            items: statusItems,
                            onClick: (e) => statusMutation.mutate({ id: record.id, status: e.key })
                        }}
                        trigger={['click']}
                    >
                        <Tag
                            color={config.color}
                            icon={config.icon}
                            style={{
                                cursor: 'pointer',
                                borderRadius: '6px',
                                padding: '4px 12px',
                                fontWeight: 700,
                                fontSize: '12px',
                                border: 'none',
                                color: '#ffffff',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            {config.label}
                        </Tag>
                    </Dropdown>
                );
            },
        },
        { title: 'Note', dataIndex: 'note', key: 'note' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Attendance Tracking</Title>
                <Space>
                    {selectedRowKeys.length > 0 && (
                        <Button
                            danger
                            loading={bulkAbsentMutation.isPending}
                            onClick={() => bulkAbsentMutation.mutate()}
                        >
                            Mark {selectedRowKeys.length} Absent
                        </Button>
                    )}
                    <Button
                        loading={bulkMutation.isPending}
                        onClick={() => bulkMutation.mutate()}
                    >
                        Bulk Check-in Today
                    </Button>
                    <Button type="primary" onClick={() => setIsModalOpen(true)}>Record Attendance</Button>
                </Space>
            </div>

            <Card>
                <Table
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (keys) => setSelectedRowKeys(keys),
                    }}
                    columns={columns}
                    dataSource={attendanceData}
                    rowKey="id"
                    loading={isLoading}
                />
            </Card>

            <Modal
                title="Record Attendance"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={mutation.isPending}
            >
                <Form form={form} layout="vertical" onFinish={(v) => mutation.mutate(v)}>
                    <Form.Item name="employeeId" label="Employee" rules={[{ required: true }]}>
                        <Select showSearch optionFilterProp="children">
                            {employees?.map((e: any) => (
                                <Select.Option key={e.id} value={e.id}>{e.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="date" label="Date" rules={[{ required: true }]} initialValue={dayjs()}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Form.Item name="checkIn" label="Check In" style={{ flex: 1 }}>
                            <Input placeholder="09:00" />
                        </Form.Item>
                        <Form.Item name="checkOut" label="Check Out" style={{ flex: 1 }}>
                            <Input placeholder="18:00" />
                        </Form.Item>
                    </div>
                    <Form.Item name="status" label="Status" rules={[{ required: true }]} initialValue="present">
                        <Select>
                            <Select.Option value="present">Present</Select.Option>
                            <Select.Option value="late">Late</Select.Option>
                            <Select.Option value="absent">Absent</Select.Option>
                            <Select.Option value="leave">Leave</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="note" label="Note">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AttendancePage;
