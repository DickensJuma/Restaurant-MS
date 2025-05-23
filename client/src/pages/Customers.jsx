import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Statistic,
  Row,
  Col,
  Typography,
  Space,
  Tag,
  Progress,
  DatePicker,
  Select,
  Spin,
  Alert,
  List,
  Avatar,
} from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { ordersAPI } from "../services/api";
import { useNotification } from "../context/NotificationContext";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Customers = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("week");
  const [dateRange, setDateRange] = useState(null);
  const [orders, setOrders] = useState([]);
  const [popularMeals, setPopularMeals] = useState([]);
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      console.log("Fetched orders response:", response);

      if (response?.data) {
        setOrders(response.data);
        calculatePopularMeals(response.data);
      } else {
        setOrders([]);
        setPopularMeals([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Failed to fetch orders");
      setOrders([]);
      setPopularMeals([]);
    } finally {
      setLoading(false);
    }
  };

  const calculatePopularMeals = (ordersData) => {
    if (!Array.isArray(ordersData)) {
      console.log("No valid orders data to calculate popular meals");
      setPopularMeals([]);
      return;
    }

    console.log("Calculating popular meals from orders:", ordersData);
    const mealCounts = {};

    ordersData.forEach((order) => {
      if (!order?.items) return;

      order.items.forEach((item) => {
        if (item?.mealId) {
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

    const popular = Object.values(mealCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setPopularMeals(popular);
  };

  // Calculate customer statistics
  const calculateStats = () => {
    if (!orders || orders.length === 0) {
      console.log("No orders available");
      return null;
    }

    console.log("Calculating stats for orders:", orders);

    const customerOrders = orders.reduce((acc, order) => {
      const customerId = order.customerName || "Walk-in Customer";
      if (!acc[customerId]) {
        acc[customerId] = {
          totalOrders: 0,
          totalSpent: 0,
          lastOrder: null,
          items: new Set(),
        };
      }

      acc[customerId].totalOrders++;
      acc[customerId].totalSpent += order.total || 0;
      acc[customerId].lastOrder = new Date(order.createdAt);
      order.items?.forEach((item) => {
        acc[customerId].items.add(item.meal?.name || "Unknown Item");
      });

      return acc;
    }, {});

    const stats = Object.entries(customerOrders).map(([name, data]) => ({
      name,
      totalOrders: data.totalOrders,
      totalSpent: data.totalSpent,
      lastOrder: data.lastOrder,
      favoriteItems: Array.from(data.items),
    }));

    console.log("Calculated customer stats:", stats);
    return stats;
  };

  const customerStats = calculateStats();
  console.log("Final customer stats:", customerStats);

  const columns = [
    {
      title: "Customer",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <Space>
          <UserOutlined />
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: "Total Orders",
      dataIndex: "totalOrders",
      key: "totalOrders",
      sorter: (a, b) => a.totalOrders - b.totalOrders,
      render: (orders) => (
        <Tag color="blue" icon={<ShoppingOutlined />}>
          {orders}
        </Tag>
      ),
    },
    {
      title: "Total Spent",
      dataIndex: "totalSpent",
      key: "totalSpent",
      sorter: (a, b) => a.totalSpent - b.totalSpent,
      render: (amount) => (
        <Tag color="green" icon={<DollarOutlined />}>
          KES {amount.toFixed(2)}
        </Tag>
      ),
    },
    {
      title: "Last Order",
      dataIndex: "lastOrder",
      key: "lastOrder",
      sorter: (a, b) => new Date(a.lastOrder) - new Date(b.lastOrder),
      render: (date) => (
        <Space>
          <ClockCircleOutlined />
          {new Date(date).toLocaleDateString()}
        </Space>
      ),
    },
    {
      title: "Favorite Items",
      dataIndex: "favoriteItems",
      key: "favoriteItems",
      render: (items) => (
        <Space wrap>
          {items.slice(0, 3).map((item, index) => (
            <Tag key={index} color="purple">
              {item}
            </Tag>
          ))}
          {items.length > 3 && (
            <Tag color="default">+{items.length - 3} more</Tag>
          )}
        </Space>
      ),
    },
  ];

  const handleAddCustomer = async (values) => {
    try {
      const response = await customersAPI.createCustomer(values);
      if (response.success) {
        addNotification(
          "success",
          "Customer Added",
          `${values.name} has been added to the customer list`,
          "customers"
        );
        form.resetFields();
        fetchCustomers();
      }
    } catch (error) {
      addNotification(
        "error",
        "Failed to Add Customer",
        error.response?.data?.message ||
          "Failed to add customer. Please try again.",
        "customers"
      );
    }
  };

  const handleUpdateCustomer = async (values) => {
    try {
      const response = await customersAPI.updateCustomer(
        selectedCustomer._id,
        values
      );
      if (response.success) {
        addNotification(
          "success",
          "Customer Updated",
          `${values.name}'s information has been updated successfully`,
          "customers"
        );
        setSelectedCustomer(null);
        form.resetFields();
        fetchCustomers();
      }
    } catch (error) {
      addNotification(
        "error",
        "Update Failed",
        error.response?.data?.message ||
          "Failed to update customer information. Please try again.",
        "customers"
      );
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      const response = await customersAPI.deleteCustomer(customerId);
      if (response.success) {
        addNotification(
          "success",
          "Customer Removed",
          "The customer has been removed successfully",
          "customers"
        );
        fetchCustomers();
      }
    } catch (error) {
      addNotification(
        "error",
        "Deletion Failed",
        error.response?.data?.message ||
          "Failed to remove customer. Please try again.",
        "customers"
      );
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Customer Analytics</Title>
        <Space style={{ marginBottom: "16px" }}>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 120 }}
          >
            <Select.Option value="week">Last Week</Select.Option>
            <Select.Option value="month">Last Month</Select.Option>
            <Select.Option value="year">Last Year</Select.Option>
            <Select.Option value="custom">Custom Range</Select.Option>
          </Select>
          {timeRange === "custom" && (
            <RangePicker value={dateRange} onChange={setDateRange} />
          )}
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Customers"
              value={customerStats?.length || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Average Order Value"
              value={
                customerStats
                  ? (
                      customerStats.reduce((sum, c) => sum + c.totalSpent, 0) /
                      customerStats.reduce((sum, c) => sum + c.totalOrders, 0)
                    ).toFixed(2)
                  : 0
              }
              prefix="KES"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Repeat Customers"
              value={
                customerStats
                  ? customerStats.filter((c) => c.totalOrders > 1).length
                  : 0
              }
              suffix={`/ ${customerStats?.length || 0}`}
            />
            <Progress
              percent={
                customerStats
                  ? (customerStats.filter((c) => c.totalOrders > 1).length /
                      customerStats.length) *
                    100
                  : 0
              }
              size="small"
              status="active"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="New Customers (Last 30 Days)"
              value={
                customerStats
                  ? customerStats.filter(
                      (c) =>
                        new Date(c.lastOrder) >
                        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    ).length
                  : 0
              }
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col xs={24} lg={12}>
          <Card
            title="Popular Meals"
            extra={<FireOutlined style={{ color: "#ff4d4f" }} />}
          >
            <List
              dataSource={popularMeals}
              renderItem={(meal, index) => (
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
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Customer Statistics">
            <Table
              dataSource={customerStats}
              columns={columns}
              rowKey="name"
              pagination={{
                pageSize: 5,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} customers`,
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Customers;
