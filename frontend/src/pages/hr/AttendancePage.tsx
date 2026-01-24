import React from 'react';
import { Table, Typography, Card, Button, Form, DatePicker, Select, Tag, message, Modal, Input } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
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
                date: values.date.format('YYYY-MM-DD'),
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

    const columns = [
        { title: 'Date', dataIndex: 'date', key: 'date' },
        { title: 'Employee', dataIndex: ['employee', 'name'], key: 'employee' },
        { title: 'Check In', dataIndex: 'checkIn', key: 'checkIn' },
        { title: 'Check Out', dataIndex: 'checkOut', key: 'checkOut' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'present' ? 'green' : status === 'late' ? 'orange' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        { title: 'Note', dataIndex: 'note', key: 'note' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Attendance Tracking</Title>
                <Button type="primary" onClick={() => setIsModalOpen(true)}>Record Attendance</Button>
            </div>

            <Card>
                <Table columns={columns} dataSource={attendanceData} rowKey="id" loading={isLoading} />
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
