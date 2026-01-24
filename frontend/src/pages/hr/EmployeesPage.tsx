import React from 'react';
import { Table, Typography, Card, Button, Modal, Form, Input, InputNumber, DatePicker, Select, Tag, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import keycloak from '../../auth/keycloak';

const { Title } = Typography;

interface Employee {
    id: string;
    name: string;
    email: string;
    phone: string;
    jobTitle: string;
    department: string;
    salary: number;
    hireDate: string;
    status: 'active' | 'inactive' | 'terminated';
}

const EmployeesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(null);
    const [form] = Form.useForm();

    const { data: employees, isLoading } = useQuery<Employee[]>({
        queryKey: ['employees'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/hr/employees', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const { data: departments } = useQuery<any[]>({
        queryKey: ['departments'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/hr/departments', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: any) => {
            const payload = {
                ...values,
                hireDate: values.hireDate.format('YYYY-MM-DD'),
            };
            if (editingEmployee) {
                await axios.patch(`http://localhost:3000/hr/employees/${editingEmployee.id}`, payload, {
                    headers: { Authorization: `Bearer ${keycloak.token}` },
                });
            } else {
                // For create, backend expects department object usually, but I'll make it handle both.
                await axios.post('http://localhost:3000/hr/employees', { ...payload, department: { id: values.departmentId } }, {
                    headers: { Authorization: `Bearer ${keycloak.token}` },
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            setIsModalOpen(false);
            form.resetFields();
            message.success(`Employee ${editingEmployee ? 'updated' : 'created'} successfully`);
        },
    });

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Department', dataIndex: ['department', 'name'], key: 'department' },
        { title: 'Job Title', dataIndex: 'jobTitle', key: 'jobTitle' },
        {
            title: 'Annual Base Salary',
            dataIndex: 'salary',
            key: 'salary',
            render: (val: number) => `$${Number(val).toLocaleString()}`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'active' ? 'green' : status === 'inactive' ? 'orange' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: Employee) => (
                <Button
                    type="link"
                    onClick={() => {
                        setEditingEmployee(record);
                        form.setFieldsValue({
                            ...record,
                            hireDate: dayjs(record.hireDate),
                            departmentId: (record as any).department?.id
                        });
                        setIsModalOpen(true);
                    }}
                >
                    Edit
                </Button>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Employee Management</Title>
                <Button
                    type="primary"
                    onClick={() => {
                        setEditingEmployee(null);
                        form.resetFields();
                        setIsModalOpen(true);
                    }}
                >
                    Add Employee
                </Button>
            </div>

            <Card>
                <Table columns={columns} dataSource={employees} rowKey="id" loading={isLoading} />
            </Card>

            <Modal
                title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={mutation.isPending}
            >
                <Form form={form} layout="vertical" onFinish={(v) => mutation.mutate(v)}>
                    <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="Phone">
                        <Input />
                    </Form.Item>
                    <Form.Item name="departmentId" label="Department" rules={[{ required: true }]}>
                        <Select placeholder="Select Department">
                            {departments?.map(d => (
                                <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="jobTitle" label="Job Title" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Manager, Senior Dev" />
                    </Form.Item>
                    <Form.Item name="salary" label="Annual Base Salary" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} prefix="$" />
                    </Form.Item>
                    <Form.Item name="hireDate" label="Hire Date" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="status" label="Status" initialValue="active">
                        <Select>
                            <Select.Option value="active">Active</Select.Option>
                            <Select.Option value="inactive">Inactive</Select.Option>
                            <Select.Option value="terminated">Terminated</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EmployeesPage;
