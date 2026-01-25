import React from 'react';
import { Typography, Card, Table, Tag, Space, Button, message } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import keycloak from '../../auth/keycloak';
import { FilePdfOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const EmployeeDashboard: React.FC = () => {
    const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

    const { data: profile } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/profile/me', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const { data: payslips, isLoading: payslipsLoading } = useQuery<any[]>({
        queryKey: ['my-payroll'],
        queryFn: async () => {
            const { data } = await axios.get(`http://localhost:3000/hr/payroll`, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
        enabled: !!profile?.employee,
    });

    const { data: attendance, isLoading: attendanceLoading } = useQuery<any[]>({
        queryKey: ['my-attendance'],
        queryFn: async () => {
            const { data } = await axios.get(`http://localhost:3000/hr/attendance`, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
        enabled: !!profile?.employee,
    });

    const payrollColumns = [
        { title: 'Period', dataIndex: 'period', key: 'period' },
        {
            title: 'Net Salary',
            dataIndex: 'netSalary',
            key: 'netSalary',
            render: (val: number) => <Tag color="gold" style={{ fontWeight: 'bold' }}>${Number(val).toLocaleString()}</Tag>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => <Tag color={status === 'paid' ? 'green' : 'blue'}>{status.toUpperCase()}</Tag>
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
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
                            link.setAttribute('download', `payslip-${record.period}.pdf`);
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
                    Download PDF
                </Button>
            )
        }
    ];

    if (!profile?.employee) {
        return (
            <Card>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Title level={3}>Welcome, {profile?.firstName}!</Title>
                    <Text type="secondary">Your account is not yet linked to an employee record. Please contact HR to enable your self-service portal.</Text>
                </div>
            </Card>
        );
    }

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={2}>Employee Self-Service</Title>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <Card title="Quick Stats">
                    <Text type="secondary">Welcome back, </Text>
                    <Title level={4} style={{ marginTop: 0 }}>{profile.firstName} {profile.lastName}</Title>
                    <Text>Role: <Tag color="blue">{profile.role.toUpperCase()}</Tag></Text>
                </Card>
            </div>

            <Card title="Recent Payslips">
                <Table
                    dataSource={payslips}
                    columns={payrollColumns}
                    rowKey="id"
                    loading={payslipsLoading}
                    pagination={{ pageSize: 5 }}
                />
            </Card>

            <Card title="My Attendance History">
                <Table
                    dataSource={attendance}
                    columns={[
                        { title: 'Date', dataIndex: 'date', key: 'date' },
                        { title: 'Check In', dataIndex: 'checkIn', key: 'checkIn' },
                        { title: 'Check Out', dataIndex: 'checkOut', key: 'checkOut' },
                        {
                            title: 'Status',
                            dataIndex: 'status',
                            key: 'status',
                            render: (s: string) => <Tag color={s === 'present' ? 'green' : 'red'}>{s.toUpperCase()}</Tag>
                        }
                    ]}
                    rowKey="id"
                    loading={attendanceLoading}
                    pagination={{ pageSize: 5 }}
                />
            </Card>
        </Space>
    );
};

export default EmployeeDashboard;
