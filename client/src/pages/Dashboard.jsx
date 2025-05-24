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
import { Column } from "@ant-design/plots";
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

  console.log("selectedStaff", selectedStaff);
  console.log("staffStats", staffStats);

  // Determine if we're on mobile
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check for token
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch data with individual error handling
        const [
          statsResponse,
          recentOrdersResponse,
          salesResponse,
          popularMealsResponse,
        ] = await Promise.all([
          reportsAPI.getSalesReport().catch((error) => {
            console.error("Error fetching sales report:", error);
            return {
              data: {
                summary: {},
                dailySales: [],
                tableData: [],
                columns: [],
              },
            };
          }),
          reportsAPI.getRecentOrders().catch((error) => {
            console.error("Error fetching recent orders:", error);
            return { data: [] };
          }),
          reportsAPI.getSalesAnalytics({ period: "weekly" }).catch((error) => {
            console.error("Error fetching sales analytics:", error);
            return { data: { analytics: [], summary: {} } };
          }),
          reportsAPI.getPopularMeals().catch((error) => {
            console.error("Error fetching popular meals:", error);
            return { data: { popularMeals: [], summary: {} } };
          }),
        ]);

        console.log("Dashboard API Responses:", {
          stats: statsResponse,
          recentOrders: recentOrdersResponse,
          sales: salesResponse,
          popularMeals: popularMealsResponse,
        });

        // Set stats with null check
        if (statsResponse?.data?.summary) {
          const summary = statsResponse.data.summary;
          setStats({
            totalRevenue: summary.totalSales || 0,
            totalOrders: summary.totalOrders || 0,
            averageOrderValue: summary.averageOrderValue || 0,
            customerCount: summary.totalCustomers || 0,
            todayOrders: summary.todayOrders || 0,
            todayRevenue: summary.todayRevenue || 0,
            revenueChange: summary.revenueChange || 0,
            ordersChange: summary.ordersChange || 0,
          });
        } else {
          setStats({
            totalRevenue: 0,
            totalOrders: 0,
            averageOrderValue: 0,
            customerCount: 0,
            todayOrders: 0,
            todayRevenue: 0,
            revenueChange: 0,
            ordersChange: 0,
          });
        }

        // Set recent orders with null check and error handling
        try {
          if (recentOrdersResponse?.data) {
            setRecentOrders(
              Array.isArray(recentOrdersResponse.data)
                ? recentOrdersResponse.data
                : []
            );
          } else {
            setRecentOrders([]);
          }
        } catch (error) {
          console.error("Error processing recent orders:", error);
          setRecentOrders([]);
        }

        // Set sales data with null check
        if (salesResponse?.data?.analytics) {
          setSalesData(salesResponse.data.analytics);
        } else if (statsResponse?.data?.dailySales) {
          // Fallback to dailySales from stats if analytics is not available
          setSalesData(
            statsResponse.data.dailySales.map((item) => ({
              date: item.date,
              sales: item.amount,
              orders: item.orders,
            }))
          );
        } else {
          setSalesData([]);
        }

        // Set popular meals with null check
        if (popularMealsResponse?.data?.popularMeals) {
          setPopularMeals(popularMealsResponse.data.popularMeals);
        } else {
          setPopularMeals([]);
        }

        // Fetch all orders for popular meals and staff stats
        try {
          const ordersResponse = await ordersAPI.getAll();
          const orders = ordersResponse?.data || [];

          console.log("orders", orders);

          if (Array.isArray(orders)) {
            // Calculate staff statistics
            const staffStats = {};
            orders.forEach((order) => {
              if (order.staffId && order.staffId.name) {
                if (!staffStats[order.staffId.name]) {
                  staffStats[order.staffId.name] = {
                    orderCount: 0,
                    revenue: 0,
                    customers: new Set(),
                  };
                }
                staffStats[order.staffId.name].orderCount++;
                staffStats[order.staffId.name].revenue += order.total || 0;
                if (order.customerName) {
                  staffStats[order.staffId.name].customers.add(
                    order.customerName
                  );
                }
              }
            });

            const formattedStaffStats = Object.entries(staffStats).map(
              ([name, stats]) => ({
                name,
                orderCount: stats.orderCount,
                revenue: stats.revenue,
                customerCount: stats.customers.size,
                averageOrderValue:
                  stats.orderCount > 0 ? stats.revenue / stats.orderCount : 0,
              })
            );

            console.log("Formatted staff stats:", formattedStaffStats);
            setStaffStats(formattedStaffStats);
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
          setStaffStats([]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message || "Failed to fetch dashboard data");
        // Initialize with empty data
        setStats({
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          customerCount: 0,
          todayOrders: 0,
          todayRevenue: 0,
          revenueChange: 0,
          ordersChange: 0,
        });
        setRecentOrders([]);
        setSalesData([]);
        setPopularMeals([]);
        setStaffStats([]);
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
    yField: "sales",
    color: "#1890ff",
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    label: {
      position: "top",
      style: {
        fill: "#8c8c8c",
      },
    },
    xAxis: {
      label: {
        style: {
          fill: "#8c8c8c",
        },
      },
    },
    yAxis: {
      title: {
        text: "Revenue (KES)",
        style: {
          fill: "#8c8c8c",
        },
      },
      label: {
        formatter: (v) => `KES ${v}`,
        style: {
          fill: "#8c8c8c",
        },
      },
    },
    tooltip: {
      formatter: (datum) => {
        return {
          name: "Revenue",
          value: `KES ${datum.sales}`,
        };
      },
    },
    interactions: [
      {
        type: "marker-active",
      },
    ],
  };

  // Add debug render for sales data
  const renderSalesChart = () => {
    console.log("Current salesData:", salesData);

    if (!salesData || !Array.isArray(salesData) || salesData.length === 0) {
      return (
        <Empty
          description="No sales data available"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    // Transform data if needed
    const transformedData = salesData.map((item) => ({
      date: item.date || item.key || new Date().toISOString().split("T")[0],
      sales: Number(
        item.sales || item.amount || item.total || item.revenue || 0
      ),
    }));

    console.log("Transformed data:", transformedData);

    return <Column {...salesConfig} data={transformedData} />;
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
      dataIndex: "orderCount",
      key: "orderCount",
      sorter: (a, b) => a.orderCount - b.orderCount,
    },
    {
      title: "Total Revenue",
      dataIndex: "revenue",
      key: "revenue",
      render: (value) => `KES ${value.toFixed(2)}`,
      sorter: (a, b) => a.revenue - b.revenue,
    },
    {
      title: "Unique Customers",
      dataIndex: "customerCount",
      key: "customerCount",
      sorter: (a, b) => a.customerCount - b.customerCount,
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
            {renderSalesChart()}
          </Card>
        </Col>

        {/* Popular Meals Card */}
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
                          <Tag color="red">{meal.quantity} orders</Tag>
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
