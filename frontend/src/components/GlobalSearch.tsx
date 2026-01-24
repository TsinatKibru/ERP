import React, { useState, useEffect, useRef } from 'react';
import { Input, List, Avatar, Spin, Empty, Typography } from 'antd';
import { SearchOutlined, ShoppingOutlined, UserOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import keycloak from '../auth/keycloak';

const { Text } = Typography;

interface SearchResult {
    id: string;
    type: 'PRODUCT' | 'CUSTOMER' | 'ORDER' | 'EMPLOYEE';
    title: string;
    subtitle: string;
    link: string;
}

const GlobalSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (val: string) => {
        setQuery(val);
        if (val.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.get(`http://localhost:3000/search?q=${val}`, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            setResults(data);
            setShowResults(true);
        } catch (err) {
            console.error('Search failed', err);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'PRODUCT': return <ShoppingOutlined style={{ color: '#1890ff' }} />;
            case 'CUSTOMER': return <UserOutlined style={{ color: '#52c41a' }} />;
            case 'ORDER': return <FileTextOutlined style={{ color: '#faad14' }} />;
            case 'EMPLOYEE': return <TeamOutlined style={{ color: '#722ed1' }} />;
            default: return <SearchOutlined />;
        }
    };

    const handleSelect = (item: SearchResult) => {
        setShowResults(false);
        setQuery('');
        navigate(item.link);
    };

    return (
        <div style={{ position: 'relative', width: 300 }} ref={dropdownRef}>
            <Input
                placeholder="Global search..."
                prefix={<SearchOutlined />}
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => query.length >= 2 && setShowResults(true)}
                style={{ borderRadius: 8 }}
            />
            {showResults && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    borderRadius: 8,
                    marginTop: 8,
                    zIndex: 1000,
                    maxHeight: 400,
                    overflowY: 'auto'
                }}>
                    <Spin spinning={loading}>
                        {results.length > 0 ? (
                            <List
                                size="small"
                                dataSource={results}
                                renderItem={(item) => (
                                    <List.Item
                                        onClick={() => handleSelect(item)}
                                        style={{ cursor: 'pointer', padding: '10px 15px' }}
                                        className="search-item-hover"
                                    >
                                        <List.Item.Meta
                                            avatar={<Avatar icon={getIcon(item.type)} style={{ backgroundColor: '#f5f5f5' }} />}
                                            title={<Text strong>{item.title}</Text>}
                                            description={<Text type="secondary" style={{ fontSize: 12 }}>{item.subtitle}</Text>}
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            !loading && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No results found" />
                        )}
                    </Spin>
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
