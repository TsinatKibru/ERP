import React from 'react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';
import { Typography } from 'antd';

const { Title, Text } = Typography;

interface SalesTrendChartProps {
    data: {
        month: string;
        revenue: number;
        orders: number;
    }[];
}

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data }) => {
    return (
        <div style={{ width: '100%', height: 350, padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
                <Title level={4}>Sales Revenue Trends</Title>
                <Text type="secondary">Revenue and order volume over the last 6 months</Text>
            </div>
            <ResponsiveContainer width="100%" height="80%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#8c8c8c" />
                    <YAxis stroke="#8c8c8c" tickFormatter={(value) => `$${value}`} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <Tooltip
                        formatter={(value: any) => [`$${(value || 0).toLocaleString()}`, 'Revenue']}
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#1890ff"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        strokeWidth={3}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SalesTrendChart;
