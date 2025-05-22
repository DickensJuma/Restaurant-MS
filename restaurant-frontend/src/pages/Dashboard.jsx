import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Row,
  Col,
  Card,
  Statistic,
  Spin,
  Alert,
  Table,
  Typography,
  Space,
  Button,
  Progress,
  List,
  Tag,
  Divider,
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FireOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';
import { reportsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    todayOrders: 0,
    todayRevenue: 0,
    revenueChange: 0,
    ordersChange: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [popularMeals, setPopularMeals] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, ordersResponse, mealsResponse, salesResponse] = await Promise.all([
          reportsAPI.getSalesReport(),
          reportsAPI.getRecentOrders(),
          reportsAPI.getPopularMeals(),
          reportsAPI.getSalesAnalytics({ period: 'weekly' })
        ]);

        setStats(statsResponse.data);
        setRecentOrders(ordersResponse.data);
        setPopularMeals(mealsResponse.data);
        setSalesData(salesResponse.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const recentOrdersColumns = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      key: '_id',
      render: (id) => <Text copyable>{id.slice(-6)}</Text>,
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Amount',
      dataIndex: 'total',
      key: 'total',
      render: (amount) => `KES ${amount.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'green' :
          status === 'pending' ? 'orange' :
          status === 'cancelled' ? 'red' : 'blue'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleTimeString(),
    },
  ];

  const salesConfig = {
    data: salesData,
    xField: 'date',
    yField: 'amount',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  const popularMealsConfig = {
    data: popularMeals,
    angleField: 'count',
    colorField: 'name',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name}: {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        {/* Quick Stats */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              precision={2}
              prefix="KES"
              suffix={
                <Text type={stats.revenueChange >= 0 ? 'success' : 'danger'}>
                  {stats.revenueChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(stats.revenueChange)}%
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              suffix={
                <Text type={stats.ordersChange >= 0 ? 'success' : 'danger'}>
                  {stats.ordersChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(stats.ordersChange)}%
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Today's Revenue"
              value={stats.todayRevenue}
              precision={2}
              prefix="KES"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Today's Orders"
              value={stats.todayOrders}
            />
          </Card>
        </Col>
          {/* Quick Actions */}
          <Col xs={24}>
          <Card title="Quick Actions">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card hoverable onClick={() => navigate('/orders')}>
                  <Space>
                    <ShoppingCartOutlined style={{ fontSize: '24px' }} />
                    <div>
                      <Title level={5}>New Order</Title>
                      <Text type="secondary">Create a new order</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card hoverable onClick={() => navigate('/menu')}>
                  <Space>
                    <FireOutlined style={{ fontSize: '24px' }} />
                    <div>
                      <Title level={5}>Manage Menu</Title>
                      <Text type="secondary">Update menu items</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card hoverable onClick={() => navigate('/reports')}>
                  <Space>
                    <BarChartOutlined style={{ fontSize: '24px' }} />
                    <div>
                      <Title level={5}>View Reports</Title>
                      <Text type="secondary">Generate reports</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

           {/* Recent Orders */}
           <Col xs={24}>
          <Card 
            title="Recent Orders"
            extra={
              <Button type="primary" onClick={() => navigate('/orders')}>
                View All Orders
              </Button>
            }
          >
            <Table
              columns={recentOrdersColumns}
              dataSource={recentOrders}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Sales Chart */}
        <Col xs={24} lg={16}>
          <Card title="Sales Trend">
            <Line {...salesConfig} />
          </Card>
        </Col>

        {/* Popular Meals */}
        <Col xs={24} lg={8}>
          <Card title="Popular Meals">
            <Pie {...popularMealsConfig} />
          </Card>
        </Col>

     

      
      </Row>
    </div>
  );
};

export default Dashboard;