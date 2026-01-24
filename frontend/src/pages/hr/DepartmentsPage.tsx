import React from 'react';
import { Table, Typography, Card, Button, Modal, Form, Input, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import keycloak from '../../auth/keycloak';

const { Title } = Typography;

interface Department {
    id: string;
    name: string;
    description: string;
}

const DepartmentsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingDept, setEditingDept] = React.useState<Department | null>(null);
    const [form] = Form.useForm();

    const { data: departments, isLoading } = useQuery<Department[]>({
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
            if (editingDept) {
                await axios.patch(`http://localhost:3000/hr/departments/${editingDept.id}`, values, {
                    headers: { Authorization: `Bearer ${keycloak.token}` },
                });
            } else {
                await axios.post('http://localhost:3000/hr/departments', values, {
                    headers: { Authorization: `Bearer ${keycloak.token}` },
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            setIsModalOpen(false);
            form.resetFields();
            message.success(`Department ${editingDept ? 'updated' : 'created'} successfully`);
        },
    });

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Description', dataIndex: 'description', key: 'description' },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: Department) => (
                <Button
                    type="link"
                    onClick={() => {
                        setEditingDept(record);
                        form.setFieldsValue(record);
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
                <Title level={2}>Department Management</Title>
                <Button
                    type="primary"
                    onClick={() => {
                        setEditingDept(null);
                        form.resetFields();
                        setIsModalOpen(true);
                    }}
                >
                    Add Department
                </Button>
            </div>

            <Card>
                <Table columns={columns} dataSource={departments} rowKey="id" loading={isLoading} />
            </Card>

            <Modal
                title={editingDept ? 'Edit Department' : 'Add New Department'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={mutation.isPending}
            >
                <Form form={form} layout="vertical" onFinish={(v) => mutation.mutate(v)}>
                    <Form.Item name="name" label="Department Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default DepartmentsPage;
