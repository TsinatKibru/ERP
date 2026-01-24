import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Typography } from 'antd';

const { Title, Text } = Typography;

interface CategoryPieChartProps {
    data: {
        name: string;
        value: number;
        count: number;
    }[];
}

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
    return (
        <div style={{ width: '100%', height: 350, padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
                <Title level={4}>Inventory Distribution</Title>
                <Text type="secondary">Value distribution by product category</Text>
            </div>
            <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: any) => [`$${(value || 0).toLocaleString()}`, 'Total Value']}
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CategoryPieChart;
