import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  message,
  Typography,
  Row,
  Col,
  InputNumber,
  Divider,
  Badge,
  Avatar,
  Tag,
  Spin,
  Empty,
  Radio,
  Alert,
  Tooltip,
  notification,
  Table,
  DatePicker,
  Statistic,
  Descriptions,
} from "antd";
import {
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  UserOutlined,
  CheckOutlined,
  MobileOutlined,
  BankOutlined,
  InfoCircleOutlined,
  WalletOutlined,
  BellOutlined,
  ShoppingOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { ordersAPI, mealsAPI, staffAPI } from "../services/api";
import { useWindowSize } from "../hooks/useWindowSize";
import { useNotification } from "../context/NotificationContext";

const { Title, Text } = Typography;
const { Option } = Select;

const Orders = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const { width: windowWidth } = useWindowSize();
  const [staff, setStaff] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("mobile");
  const [isProcessing, setIsProcessing] = useState(false);
  const { addNotification } = useNotification();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mealsResponse, staffResponse, ordersResponse] = await Promise.all([
        mealsAPI.getAll(),
        staffAPI.getAll(),
        ordersAPI.getAll(),
      ]);

      setMeals(mealsResponse.data || mealsResponse);
      setStaff(staffResponse.data || staffResponse);
      setOrders(ordersResponse.data || ordersResponse);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      message.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const showOrderNotification = (type, title, description) => {
    notification[type]({
      message: title,
      description: description,
      placement: "topRight",
      duration: 4.5,
      icon: (
        <BellOutlined
          style={{ color: type === "success" ? "#52c41a" : "#ff4d4f" }}
        />
      ),
    });
  };

  const addToCart = (meal) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.mealId === meal._id);
      if (existingItem) {
        showOrderNotification(
          "success",
          "Item Updated",
          `${meal.name} quantity updated to ${existingItem.quantity + 1}`
        );
        return prevItems.map((item) =>
          item.mealId === meal._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      showOrderNotification(
        "success",
        "Item Added",
        `${meal.name} added to cart`
      );
      return [...prevItems, { mealId: meal._id, quantity: 1, meal }];
    });
    setIsDrawerVisible(true);
  };

  const removeFromCart = (mealId) => {
    const item = cartItems.find((item) => item.mealId === mealId);
    if (item) {
      showOrderNotification(
        "info",
        "Item Removed",
        `${item.meal.name} removed from cart`
      );
    }
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.mealId !== mealId)
    );
  };

  const updateQuantity = (mealId, quantity) => {
    if (quantity < 1) {
      removeFromCart(mealId);
      return;
    }
    const item = cartItems.find((item) => item.mealId === mealId);
    if (item) {
      showOrderNotification(
        "success",
        "Quantity Updated",
        `${item.meal.name} quantity updated to ${quantity}`
      );
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.mealId === mealId ? { ...item, quantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + (item.meal?.price || 0) * item.quantity,
      0
    );
  };

  const handleSubmit = async (values) => {
    if (cartItems.length === 0) {
      addNotification(
        "error",
        "Cart Empty",
        "Please add items to cart",
        "orders"
      );
      return;
    }

    try {
      setIsProcessing(true);
      const orderData = {
        customerName: values.customerName,
        items: cartItems.map((item) => ({
          mealId: item.mealId,
          quantity: item.quantity,
        })),
        total: calculateTotal(),
        status: "completed",
        paymentMethod: values.paymentMethod,
        staffId: values.staffId,
      };

      console.log("Submitting order:", orderData);
      const response = await ordersAPI.create(orderData);
      console.log("Order creation response:", response.data);

      if (response.data.success && response.data.data) {
        addNotification(
          "success",
          "Order Created",
          "Order has been created successfully",
          "orders"
        );
        setOrders((prev) => [...prev, response.data.data]);
        form.resetFields();
        setCartItems([]);
        setIsDrawerVisible(false);
      } else {
        throw new Error(response.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Order creation error:", error);
      addNotification(
        "error",
        "Order Failed",
        error.message || "Failed to create order",
        "orders"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const categories = ["all", ...new Set(meals.map((meal) => meal.category))];

  const filteredMeals =
    selectedCategory === "all"
      ? meals
      : meals.filter((meal) => meal.category === selectedCategory);

  const renderMenuItems = () => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
        </div>
      );
    }

    if (filteredMeals.length === 0) {
      return (
        <Empty description="No meals available" style={{ margin: "40px 0" }} />
      );
    }

    return (
      <Row gutter={[16, 16]}>
        {filteredMeals.map((meal) => (
          <Col xs={24} sm={12} md={8} lg={6} key={meal._id}>
            <Card
              hoverable
              cover={
                <div
                  style={{
                    height: 200,
                    backgroundImage: `url(${
                      meal.images?.[0]?.url || "https://via.placeholder.com/300"
                    })`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              }
              actions={[
                <Space>
                  <Button
                    size="small"
                    icon={<MinusOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      const existingItem = cartItems.find(
                        (item) => item.mealId === meal._id
                      );
                      if (existingItem) {
                        updateQuantity(meal._id, existingItem.quantity - 1);
                      }
                    }}
                  />
                  <Text>
                    {cartItems.find((item) => item.mealId === meal._id)
                      ?.quantity || 0}
                  </Text>
                  <Button
                    size="small"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(meal);
                    }}
                  />
                </Space>,
              ]}
            >
              <Card.Meta
                title={meal.name}
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">{meal.description}</Text>
                    <Text strong style={{ color: "#52c41a" }}>
                      KES {meal.price?.toFixed(2)}
                    </Text>
                    <Tag color="blue">{meal.category}</Tag>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status?.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total) => `KES ${total.toLocaleString()}`,
    },
  ];

  const itemColumns = [
    {
      title: "Meal",
      dataIndex: "meal",
      key: "meal",
      render: (meal) => (
        <Space>
          <Avatar size={40} src={meal?.images?.[0]?.url} />
          <span>{meal?.name}</span>
        </Space>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Price",
      dataIndex: "meal",
      key: "price",
      render: (meal) => `KES ${meal?.price?.toFixed(2)}`,
    },
  ];

  const renderOrderList = () => (
    <Card
      title="Orders"
      extra={
        <Space>
          <DatePicker.RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            allowClear={false}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            New Order
          </Button>
        </Space>
      }
    >
      <Table
        dataSource={
          orders?.map((order) => ({
            ...order,
            key: order._id,
          })) || []
        }
        loading={loading}
        columns={columns}
        pagination={{
          total: orders?.length || 0,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} orders`,
        }}
        scroll={{ x: true }}
      />
    </Card>
  );

  const renderOrderStats = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="Total Orders"
            value={orders?.length || 0}
            prefix={<ShoppingOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="Total Revenue"
            value={
              orders?.reduce((sum, order) => sum + (order?.total || 0), 0) || 0
            }
            prefix={<DollarOutlined />}
            precision={2}
            formatter={(value) => `KES ${value.toLocaleString()}`}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="Average Order Value"
            value={
              orders?.length
                ? orders.reduce((sum, order) => sum + (order?.total || 0), 0) /
                  orders.length
                : 0
            }
            prefix={<DollarOutlined />}
            precision={2}
            formatter={(value) => `KES ${value.toLocaleString()}`}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="Unique Customers"
            value={
              new Set(
                orders?.map((order) => order?.customerName).filter(Boolean) ||
                  []
              ).size
            }
            prefix={<UserOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );

  const renderOrderDetails = () => {
    if (!selectedOrder) return null;

    return (
      <Card
        title={
          <Space>
            <ShoppingOutlined />
            Order Details
          </Space>
        }
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Order ID">
            {selectedOrder?._id}
          </Descriptions.Item>
          <Descriptions.Item label="Customer">
            {selectedOrder?.customerName}
          </Descriptions.Item>
          <Descriptions.Item label="Date">
            {selectedOrder?.createdAt
              ? new Date(selectedOrder.createdAt).toLocaleString()
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(selectedOrder?.status)}>
              {selectedOrder?.status?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Total">
            KES {selectedOrder?.total?.toLocaleString()}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Items</Divider>
        <Table
          dataSource={
            selectedOrder?.items?.map((item) => ({
              ...item,
              key: item._id,
            })) || []
          }
          columns={itemColumns}
          pagination={false}
        />
      </Card>
    );
  };

  return (
    <div style={{ padding: windowWidth < 768 ? "12px" : "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Menu</Title>
        <Space wrap style={{ marginBottom: "16px" }}>
          {categories.map((category) => (
            <Button
              key={category}
              type={selectedCategory === category ? "primary" : "default"}
              onClick={() => setSelectedCategory(category)}
            >
              {category.toUpperCase()}
            </Button>
          ))}
        </Space>
      </div>

      {renderMenuItems()}

      <Drawer
        title={
          <Space>
            <ShoppingCartOutlined />
            <span>Current Order</span>
            <Badge count={cartItems.length} />
          </Space>
        }
        placement="right"
        onClose={() => {
          setIsDrawerVisible(false);
          form.resetFields();
        }}
        open={isDrawerVisible}
        width={windowWidth < 768 ? "100%" : 400}
        destroyOnClose={true}
        extra={
          <Button
            type="primary"
            onClick={() => form.submit()}
            disabled={cartItems.length === 0}
            loading={isProcessing}
          >
            {isProcessing ? "Processing..." : "Place Order"}
          </Button>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="customerName"
            label="Customer Name"
            rules={[{ required: true, message: "Please enter customer name!" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter customer name"
            />
          </Form.Item>

          <Form.Item
            name="staffId"
            label="Staff Member"
            rules={[{ required: true, message: "Please select staff member!" }]}
          >
            <Select placeholder="Select staff member">
              {staff.map((staffMember) => (
                <Option key={staffMember._id} value={staffMember._id}>
                  {staffMember.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider>Payment Details</Divider>

          <Form.Item
            name="paymentMethod"
            label={
              <Space>
                <WalletOutlined />
                <span>Payment Method</span>
                <Tooltip title="Select how the customer will pay for this order">
                  <InfoCircleOutlined style={{ color: "#1890ff" }} />
                </Tooltip>
              </Space>
            }
            initialValue="mobile"
            rules={[
              { required: true, message: "Please select payment method!" },
            ]}
          >
            <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Radio value="mobile">
                  <Card
                    size="small"
                    style={{
                      width: "100%",
                      borderColor:
                        paymentMethod === "mobile" ? "#1890ff" : "#d9d9d9",
                    }}
                  >
                    <Space>
                      <MobileOutlined
                        style={{ fontSize: "20px", color: "#1890ff" }}
                      />
                      <div>
                        <div style={{ fontWeight: "bold" }}>Mobile Money</div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          Pay using mobile money (M-Pesa, etc.)
                        </div>
                      </div>
                    </Space>
                  </Card>
                </Radio>
                <Radio value="cash">
                  <Card
                    size="small"
                    style={{
                      width: "100%",
                      borderColor:
                        paymentMethod === "cash" ? "#1890ff" : "#d9d9d9",
                    }}
                  >
                    <Space>
                      <BankOutlined
                        style={{ fontSize: "20px", color: "#52c41a" }}
                      />
                      <div>
                        <div style={{ fontWeight: "bold" }}>Cash</div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          Pay with cash at counter
                        </div>
                      </div>
                    </Space>
                  </Card>
                </Radio>
                <Radio value="card">
                  <Card
                    size="small"
                    style={{
                      width: "100%",
                      borderColor:
                        paymentMethod === "card" ? "#1890ff" : "#d9d9d9",
                    }}
                  >
                    <Space>
                      <BankOutlined
                        style={{ fontSize: "20px", color: "#722ed1" }}
                      />
                      <div>
                        <div style={{ fontWeight: "bold" }}>Card</div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          Pay with credit/debit card
                        </div>
                      </div>
                    </Space>
                  </Card>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          {paymentMethod === "cash" && (
            <Alert
              message="Cash Payment"
              description={`Please collect the payment of KES ${calculateTotal().toFixed(
                2
              )} at the counter.`}
              type="success"
              showIcon
            />
          )}

          <Divider>Order Items</Divider>

          {cartItems.length === 0 ? (
            <Empty description="No items in cart" />
          ) : (
            <Space direction="vertical" style={{ width: "100%" }}>
              {cartItems.map((item) => (
                <Card
                  key={item.mealId}
                  size="small"
                  style={{ marginBottom: "8px" }}
                >
                  <Space align="start" style={{ width: "100%" }}>
                    <Avatar
                      size={40}
                      src={item.meal?.images?.[0]?.url}
                      icon={<ShoppingCartOutlined />}
                    />
                    <div style={{ flex: 1 }}>
                      <Text strong>{item.meal?.name}</Text>
                      <div>
                        <Text type="secondary">
                          KES {item.meal?.price?.toFixed(2)} × {item.quantity}
                        </Text>
                      </div>
                    </div>
                    <Space>
                      <Button
                        size="small"
                        icon={<MinusOutlined />}
                        onClick={() =>
                          updateQuantity(item.mealId, item.quantity - 1)
                        }
                      />
                      <Text>{item.quantity}</Text>
                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() =>
                          updateQuantity(item.mealId, item.quantity + 1)
                        }
                      />
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeFromCart(item.mealId)}
                      />
                    </Space>
                  </Space>
                </Card>
              ))}

              <Divider />

              <div style={{ textAlign: "right" }}>
                <Text strong>Total: </Text>
                <Text strong style={{ color: "#52c41a", fontSize: "18px" }}>
                  KES {calculateTotal().toFixed(2)}
                </Text>
              </div>
            </Space>
          )}
        </Form>
      </Drawer>

      {renderOrderList()}
      {renderOrderStats()}
      {renderOrderDetails()}
    </div>
  );
};

export default Orders;
