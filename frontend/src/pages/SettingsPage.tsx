import React from 'react';
import { Card, Typography, Tabs, Form, Input, Button, message, Spin, Row, Col, Empty } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import keycloak from '../auth/keycloak';

const { Title, Paragraph } = Typography;

interface Setting {
    key: string;
    value: string;
    category: string;
    description: string;
}

const SettingsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [form] = Form.useForm();

    const { data: settings, isLoading } = useQuery<Setting[]>({
        queryKey: ['settings'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/settings', {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            return data;
        },
    });

    const seedMutation = useMutation({
        mutationFn: async () => {
            await axios.post('http://localhost:3000/seeds/settings', {}, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            message.success('Initial settings seeded successfully');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (values: any) => {
            const bulkSettings = Object.entries(values).map(([key, value]) => ({
                key,
                value: String(value),
                category: settings?.find(s => s.key === key)?.category || 'general'
            }));
            await axios.post('http://localhost:3000/settings/bulk', bulkSettings, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            message.success('Settings updated successfully');
        },
    });

    React.useEffect(() => {
        if (settings) {
            const initialValues = settings.reduce((acc, curr) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {} as any);
            form.setFieldsValue(initialValues);
        }
    }, [settings, form]);

    if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

    const renderForm = (category: string) => {
        const categorySettings = settings?.filter(s => s.category === category) || [];

        if (categorySettings.length === 0) {
            return (
                <Empty
                    description="No settings found in this category."
                    style={{ padding: '40px 0' }}
                >
                    <Button type="primary" loading={seedMutation.isPending} onClick={() => seedMutation.mutate()}>
                        Initialize Default Settings
                    </Button>
                </Empty>
            );
        }

        return (
            <Form form={form} layout="vertical" onFinish={(v) => updateMutation.mutate(v)}>
                <Row gutter={16}>
                    {categorySettings.map(setting => (
                        <Col span={12} key={setting.key}>
                            <Form.Item
                                name={setting.key}
                                label={setting.key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                help={setting.description}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    ))}
                </Row>
                <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                    Save Changes
                </Button>
            </Form>
        );
    };

    const items = [
        {
            key: 'company',
            label: 'Company Profile',
            children: (
                <div style={{ padding: '24px 0' }}>
                    <Title level={4}>Professional Identity</Title>
                    <Paragraph>Customizing these details will automatically update the headers on your generated Invoices and Purchase Orders.</Paragraph>
                    {renderForm('company')}
                </div>
            ),
        },
        {
            key: 'regional',
            label: 'Regional & Localization',
            children: (
                <div style={{ padding: '24px 0' }}>
                    <Title level={4}>Localization</Title>
                    <Paragraph>Set your preferred currency and regional formats for the entire system.</Paragraph>
                    {renderForm('regional')}
                </div>
            ),
        },
    ];

    return (
        <div>
            <Title level={2}>System Settings</Title>
            <Card>
                <Tabs defaultActiveKey="company" items={items} />
            </Card>
        </div>
    );
};

export default SettingsPage;
