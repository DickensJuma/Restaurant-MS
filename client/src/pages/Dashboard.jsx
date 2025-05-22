import React, { useEffect, useState } from "react";
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
  Grid,
  Avatar,
  Tooltip,
  Empty,
  Select,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FireOutlined,
  BarChartOutlined,
  TrophyOutlined,
  EyeOutlined,
  PlusOutlined,
  MenuOutlined,
  FileTextOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Line } from "@ant-design/plots";
import { reportsAPI, ordersAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;

const Dashboard = () => {
  const screens = useBreakpoint();
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
  const [staffStats, setStaffStats] = useState({});
  const [selectedStaff, setSelectedStaff] = useState("all");
  const navigate = useNavigate();

  // Determine if we're on mobile
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, recentOrdersResponse, salesResponse] =
          await Promise.all([
            reportsAPI.getSalesReport(),
            reportsAPI.getRecentOrders(),
            reportsAPI.getSalesAnalytics({ period: "weekly" }),
          ]);

        setStats(statsResponse.data.summary);
        setRecentOrders(recentOrdersResponse.data.recentOrders || []);
        setSalesData(salesResponse.data.analytics || []);

        // Fetch orders and calculate popular meals and staff stats
        const allOrdersResponse = await ordersAPI.getAll();
        const orders = allOrdersResponse.data;

        // Calculate popular meals
        const mealCounts = {};
        // Calculate staff stats
        const staffOrderCounts = {};
        const staffRevenue = {};
        const staffCustomers = {};

        orders.forEach((order) => {
          // Track staff stats
          const staffId = order.staffId?._id || order.staffId || "unknown";
          if (!staffOrderCounts[staffId]) {
            staffOrderCounts[staffId] = 0;
            staffRevenue[staffId] = 0;
            staffCustomers[staffId] = new Set();
          }
          staffOrderCounts[staffId]++;
          staffRevenue[staffId] += order.total || 0;
          if (order.customer) {
            staffCustomers[staffId].add(order.customer);
          }

          // Calculate popular meals
          order.items?.forEach((item) => {
            if (item.mealId) {
              const mealId = item.mealId._id || item.mealId;
              if (!mealCounts[mealId]) {
                mealCounts[mealId] = {
                  name: item.mealId.name,
                  count: 0,
                  image: item.mealId.images?.[0]?.url,
                  price: item.mealId.price,
                  category: item.mealId.category,
                };
              }
              mealCounts[mealId].count += item.quantity || 1;
            }
          });
        });

        // Calculate staff statistics
        const staffStatsData = {};
        Object.keys(staffOrderCounts).forEach((staffId) => {
          const staff = orders.find(
            (o) => (o.staffId?._id || o.staffId) === staffId
          )?.staffId;
          staffStatsData[staffId] = {
            name: staff?.name || "Unknown Staff",
            totalOrders: staffOrderCounts[staffId],
            totalRevenue: staffRevenue[staffId],
            uniqueCustomers: staffCustomers[staffId].size,
            averageOrderValue:
              staffRevenue[staffId] / staffOrderCounts[staffId],
          };
        });

        setStaffStats(staffStatsData);

        const popular = Object.values(mealCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setPopularMeals(popular);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Mobile-optimized columns for recent orders
  const recentOrdersColumns = isMobile
    ? [
        {
          title: "Order",
          key: "order",
          render: (_, record) => (
            <div>
              <Text strong style={{ fontSize: "12px" }}>
                #{record.orderId?.slice(-6) || "N/A"}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: "11px" }}>
                {record.customer || "Anonymous"}
              </Text>
            </div>
          ),
        },
        {
          title: "Amount & Status",
          key: "amountStatus",
          render: (_, record) => (
            <div style={{ textAlign: "right" }}>
              <Text strong style={{ color: "#52c41a", fontSize: "12px" }}>
                KES {record.total?.toFixed(2) || "0.00"}
              </Text>
              <br />
              <Tag
                size="small"
                color={
                  record.status === "completed"
                    ? "green"
                    : record.status === "pending"
                    ? "orange"
                    : record.status === "cancelled"
                    ? "red"
                    : "blue"
                }
              >
                {record.status?.toUpperCase() || "UNKNOWN"}
              </Tag>
            </div>
          ),
        },
      ]
    : [
        {
          title: "Order ID",
          dataIndex: "orderId",
          key: "orderId",
          render: (id) => (
            <Text copyable style={{ fontSize: "12px" }}>
              #{id?.slice(-6) || "N/A"}
            </Text>
          ),
          width: 100,
        },
        {
          title: "Customer",
          dataIndex: "customer",
          key: "customer",
          ellipsis: true,
          width: 150,
        },
        {
          title: "Amount",
          dataIndex: "total",
          key: "total",
          render: (amount) => (
            <Text strong style={{ color: "#52c41a" }}>
              KES {amount?.toFixed(2) || "0.00"}
            </Text>
          ),
          width: 100,
          align: "right",
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "status",
          render: (status) => (
            <Tag
              color={
                status === "completed"
                  ? "green"
                  : status === "pending"
                  ? "orange"
                  : status === "cancelled"
                  ? "red"
                  : "blue"
              }
            >
              {status?.toUpperCase() || "UNKNOWN"}
            </Tag>
          ),
          width: 100,
        },
        {
          title: "Time",
          dataIndex: "createdAt",
          key: "createdAt",
          render: (date) => (
            <Text style={{ fontSize: "12px" }}>
              {date ? new Date(date).toLocaleTimeString() : "N/A"}
            </Text>
          ),
          width: 100,
        },
      ];

  // Sales chart configuration
  const salesConfig = {
    data: salesData,
    xField: "date",
    yField: "amount",
    seriesField: "type",
    smooth: true,
    animation: {
      appear: {
        animation: "path-in",
        duration: 1000,
      },
    },
  };

  // Stat card component with responsive design
  const StatCard = ({ title, value, prefix, icon, trend }) => (
    <Card
      bodyStyle={{
        padding: isMobile ? "16px" : "24px",
        minHeight: isMobile ? "100px" : "120px",
      }}
      hoverable
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ flex: 1 }}>
          <Statistic
            title={
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "11px" : "14px" }}
              >
                {title}
              </Text>
            }
            value={value}
            precision={prefix ? 2 : 0}
            prefix={prefix}
            valueStyle={{
              fontSize: isMobile ? "18px" : "24px",
              fontWeight: "bold",
            }}
          />
          {trend && (
            <div style={{ marginTop: "4px" }}>
              <Text
                type={trend.value >= 0 ? "success" : "danger"}
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                {trend.value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(trend.value)}%
              </Text>
            </div>
          )}
        </div>
        {icon && (
          <div
            style={{
              fontSize: isMobile ? "24px" : "32px",
              color: "#1890ff",
              opacity: 0.8,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );

  // Quick action card component
  const QuickActionCard = ({ icon, title, description, onClick }) => (
    <Card
      hoverable
      onClick={onClick}
      bodyStyle={{
        padding: isMobile ? "12px" : "16px",
        textAlign: isMobile ? "center" : "left",
      }}
      style={{
        height: "100%",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
    >
      <Space
        direction={isMobile ? "vertical" : "horizontal"}
        size={isMobile ? "small" : "middle"}
        style={{ width: "100%" }}
      >
        <div
          style={{
            fontSize: isMobile ? "20px" : "24px",
            color: "#1890ff",
            display: "flex",
            justifyContent: isMobile ? "center" : "flex-start",
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <Title
            level={5}
            style={{
              margin: 0,
              fontSize: isMobile ? "14px" : "16px",
              textAlign: isMobile ? "center" : "left",
            }}
          >
            {title}
          </Title>
          <Text
            type="secondary"
            style={{
              fontSize: isMobile ? "11px" : "12px",
              display: "block",
              textAlign: isMobile ? "center" : "left",
            }}
          >
            {description}
          </Text>
        </div>
      </Space>
    </Card>
  );

  // Staff stats columns
  const staffStatsColumns = [
    {
      title: "Staff Member",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Total Orders",
      dataIndex: "totalOrders",
      key: "totalOrders",
      sorter: (a, b) => a.totalOrders - b.totalOrders,
    },
    {
      title: "Total Revenue",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (value) => `KES ${value.toFixed(2)}`,
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
    },
    {
      title: "Unique Customers",
      dataIndex: "uniqueCustomers",
      key: "uniqueCustomers",
      sorter: (a, b) => a.uniqueCustomers - b.uniqueCustomers,
    },
    {
      title: "Avg. Order Value",
      dataIndex: "averageOrderValue",
      key: "averageOrderValue",
      render: (value) => `KES ${value.toFixed(2)}`,
      sorter: (a, b) => a.averageOrderValue - b.averageOrderValue,
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <Spin size="large" />
        <Text type="secondary">Loading dashboard data...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          message="Error Loading Dashboard"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: isMobile ? "12px" : isTablet ? "16px" : "24px",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title
          level={isMobile ? 3 : 2}
          style={{
            margin: 0,
            fontSize: isMobile ? "20px" : "28px",
          }}
        >
          Dashboard
        </Title>
        <Text type="secondary" style={{ fontSize: isMobile ? "12px" : "14px" }}>
          Welcome back! Here's what's happening with your restaurant today.
        </Text>
      </div>

      <Row gutter={[isMobile ? 8 : 16, isMobile ? 12 : 16]}>
        {/* Quick Stats */}
        <Col xs={12} sm={12} md={6}>
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            prefix="KES"
            icon={<DollarOutlined />}
            trend={{ value: stats.revenueChange }}
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingCartOutlined />}
            trend={{ value: stats.ordersChange }}
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard
            title="Today's Revenue"
            value={stats.todayRevenue}
            prefix="KES"
            icon={<ClockCircleOutlined />}
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard
            title="Today's Orders"
            value={stats.todayOrders}
            icon={<UserOutlined />}
          />
        </Col>

        {/* Quick Actions */}
        <Col xs={24}>
          <Card
            title={
              <Space>
                <MenuOutlined />
                Quick Actions
              </Space>
            }
            bodyStyle={{ padding: isMobile ? "12px" : "16px" }}
          >
            <Row gutter={[isMobile ? 8 : 16, isMobile ? 12 : 16]}>
              <Col xs={24} sm={8}>
                <QuickActionCard
                  icon={<PlusOutlined />}
                  title="New Order"
                  description="Create a new order"
                  onClick={() => navigate("/orders")}
                />
              </Col>
              <Col xs={24} sm={8}>
                <QuickActionCard
                  icon={<FireOutlined />}
                  title="Manage Menu"
                  description="Update menu items"
                  onClick={() => navigate("/menu")}
                />
              </Col>
              <Col xs={24} sm={8}>
                <QuickActionCard
                  icon={<BarChartOutlined />}
                  title="View Reports"
                  description="Generate reports"
                  onClick={() => navigate("/reports")}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Recent Orders */}
        <Col xs={24}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                Recent Orders
              </Space>
            }
            extra={
              !isMobile && (
                <Button
                  type="primary"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => navigate("/orders")}
                >
                  View All
                </Button>
              )
            }
            bodyStyle={{ padding: isMobile ? "12px" : "16px" }}
          >
            {recentOrders.length === 0 ? (
              <Empty
                description="No recent orders"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table
                columns={recentOrdersColumns}
                dataSource={recentOrders}
                pagination={false}
                size={isMobile ? "small" : "middle"}
                scroll={{ x: isMobile ? 300 : undefined }}
              />
            )}
            {isMobile && recentOrders.length > 0 && (
              <div style={{ textAlign: "center", marginTop: "12px" }}>
                <Button
                  type="link"
                  onClick={() => navigate("/orders")}
                  icon={<EyeOutlined />}
                >
                  View All Orders
                </Button>
              </div>
            )}
          </Card>
        </Col>

        {/* Charts Row */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                Sales Trend
              </Space>
            }
            bodyStyle={{ padding: isMobile ? "12px" : "16px" }}
          >
            {salesData.length === 0 ? (
              <Empty
                description="No sales data available"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Line {...salesConfig} />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <TrophyOutlined />
                Popular Meals
              </Space>
            }
            bodyStyle={{ padding: isMobile ? "12px" : "16px" }}
          >
            {popularMeals.length === 0 ? (
              <Empty
                description="No meal data available"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                dataSource={popularMeals}
                renderItem={(meal) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={meal.image}
                          shape="square"
                          size={64}
                          style={{ objectFit: "cover" }}
                        />
                      }
                      title={
                        <Space>
                          <span>{meal.name}</span>
                          <Tag color="red">{meal.count} orders</Tag>
                        </Space>
                      }
                      description={
                        <Space>
                          <Tag color="blue">{meal.category}</Tag>
                          <span>KES {meal.price}</span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* Staff Performance Section */}
        <Col xs={24}>
          <Card
            title={
              <Space>
                <TeamOutlined />
                Staff Performance
              </Space>
            }
            extra={
              <Select
                defaultValue="all"
                style={{ width: 200 }}
                onChange={setSelectedStaff}
              >
                <Option value="all">All Staff</Option>
                {Object.entries(staffStats).map(([staffId, stats]) => (
                  <Option key={staffId} value={staffId}>
                    {stats.name}
                  </Option>
                ))}
              </Select>
            }
            bodyStyle={{ padding: isMobile ? "12px" : "16px" }}
          >
            {Object.keys(staffStats).length === 0 ? (
              <Empty
                description="No staff performance data available"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table
                columns={staffStatsColumns}
                dataSource={
                  selectedStaff === "all"
                    ? Object.entries(staffStats).map(([staffId, stats]) => ({
                        key: staffId,
                        ...stats,
                      }))
                    : staffStats[selectedStaff]
                    ? [
                        {
                          key: selectedStaff,
                          ...staffStats[selectedStaff],
                        },
                      ]
                    : []
                }
                pagination={false}
                size={isMobile ? "small" : "middle"}
                scroll={{ x: isMobile ? 300 : undefined }}
              />
            )}
          </Card>
        </Col>

        {/* Additional Stats for larger screens */}
        {!isMobile && (
          <Col xs={24}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Average Order Value"
                    value={stats.averageOrderValue}
                    precision={2}
                    prefix="KES"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Total Customers"
                    value={stats.totalCustomers}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Order Completion Rate"
                    value={85}
                    suffix="%"
                  />
                  <Progress percent={85} showInfo={false} />
                </Card>
              </Col>
            </Row>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default Dashboard;
