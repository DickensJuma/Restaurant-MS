import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Popconfirm,
  Tag,
  Spin,
  InputNumber,
  Typography,
  Row,
  Col,
  Drawer,
  Alert,
  Avatar,
  Tooltip,
  Empty,
} from "antd";
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { ordersAPI, mealsAPI, staffAPI } from "../services/api";
import { useWindowSize } from "../hooks/useWindowSize";

const { Option } = Select;
const { Title, Text } = Typography;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [form] = Form.useForm();
  const { width: windowWidth } = useWindowSize();
  const [meals, setMeals] = useState([]);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch meals, orders, and staff concurrently
      const [mealsResponse, ordersResponse, staffResponse] = await Promise.all([
        mealsAPI.getAll(),
        ordersAPI.getAll(),
        staffAPI.getAll(),
      ]);

      setMeals(mealsResponse.data);
      setOrders(ordersResponse.data);
      setStaff(staffResponse.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      message.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleEditOrder = (record) => {
    setEditingOrder(record);
    form.setFieldsValue({
      ...record,
      items: record.items.map((item) => ({
        mealId: item.mealId._id || item.mealId,
        quantity: item.quantity,
      })),
    });
    windowWidth < 768 ? setIsDrawerVisible(true) : setIsModalVisible(true);
  };

  const handleDeleteOrder = async (id) => {
    try {
      await ordersAPI.delete(id);
      message.success("Order deleted successfully");
      fetchData();
    } catch {
      message.error("Failed to delete order");
    }
  };

  const handleSubmit = async (values) => {
    try {
      console.log("Form values:", values);
      console.log("Available meals:", meals);

      // Calculate total amount
      const total =
        values.items?.reduce((sum, item) => {
          console.log("Processing item:", item);
          const meal = meals.find((m) => m._id === item.mealId);
          console.log("Found meal:", meal);

          if (!meal) {
            console.error("Meal not found:", item.mealId);
            return sum;
          }
          return sum + (meal.price || 0) * (item.quantity || 0);
        }, 0) || 0;

      console.log("Calculated total:", total);

      // Ensure items have the correct structure
      const orderItems = values.items.map((item) => {
        console.log("Processing order item:", item);
        if (!item.mealId) {
          throw new Error("Meal ID is required for each item");
        }
        return {
          mealId: item.mealId,
          quantity: item.quantity,
        };
      });

      const orderData = {
        customerName: values.customerName,
        staffId: values.staffId,
        items: orderItems,
        status: values.status,
        total,
      };

      console.log("Order data to be sent:", orderData);

      if (editingOrder) {
        await ordersAPI.update(editingOrder._id, orderData);
        message.success("Order updated successfully");
      } else {
        const response = await ordersAPI.create(orderData);
        console.log("Order creation response:", response);
        message.success("Order created successfully");
      }

      setIsModalVisible(false);
      setIsDrawerVisible(false);
      setEditingOrder(null);
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error("Failed to save order:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      message.error(error.message || "Failed to save order");
    }
  };

  const renderOrderItems = (items) => {
    if (!items || items.length === 0) {
      return <Empty description="No items" size="small" />;
    }

    return (
      <div style={{ maxWidth: "300px" }}>
        {items.map((item, index) => {
          // Handle both nested meal object and meal ID
          const meal =
            item.mealId && typeof item.mealId === "object"
              ? item.mealId
              : meals.find((m) => m._id === (item.mealId || item.mealId));

          if (!meal) {
            console.log("Unknown meal:", item, "Available meals:", meals);
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: index < items.length - 1 ? "8px" : "0",
                  padding: "4px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                }}
              >
                <Avatar size={40} icon={<ShoppingCartOutlined />} />
                <div style={{ flex: 1 }}>
                  <Text type="secondary">Unknown Item</Text>
                  <div style={{ fontSize: "12px", color: "#999" }}>
                    Qty: {item.quantity || 0}
                  </div>
                </div>
              </div>
            );
          }

          const mealImage =
            Array.isArray(meal.images) && meal.images.length > 0
              ? meal.images[0].url.startsWith("http")
                ? meal.images[0].url
                : `${import.meta.env.VITE_API_URL || ""}${meal.images[0].url}`
              : null;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: index < items.length - 1 ? "8px" : "0",
                padding: "4px",
              }}
            >
              <Avatar size={40} src={mealImage} style={{ flexShrink: 0 }}>
                {meal.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: "500",
                    fontSize: "13px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {meal.name}
                </div>
                <div
                  style={{ fontSize: "11px", color: "#666", lineHeight: 1.2 }}
                >
                  {item.quantity} × KES {meal.price?.toFixed(2)} = KES{" "}
                  {((meal.price || 0) * (item.quantity || 0)).toFixed(2)}
                </div>
                <div style={{ fontSize: "10px", color: "#999" }}>
                  {meal.category}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "_id",
      render: (id) => (
        <Text code style={{ fontSize: "11px" }}>
          {id?.slice(-6) || "N/A"}
        </Text>
      ),
      width: windowWidth < 768 ? 80 : 100,
      responsive: ["sm"],
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      render: (name) => (
        <div style={{ minWidth: 0 }}>
          <Text strong style={{ fontSize: "13px" }}>
            {name || "Walk-in Customer"}
          </Text>
        </div>
      ),
      width: windowWidth < 768 ? 120 : 150,
      ellipsis: true,
    },
    {
      title: "Staff",
      dataIndex: "staffId",
      key: "staffId",
      render: (staff) => (
        <div style={{ minWidth: 0 }}>
          <Text style={{ fontSize: "13px" }}>
            {staff?.name || "Unknown Staff"}
          </Text>
        </div>
      ),
      width: windowWidth < 768 ? 120 : 150,
      ellipsis: true,
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: renderOrderItems,
      width: windowWidth < 768 ? 250 : 320,
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (amount) => (
        <Text strong style={{ color: "#52c41a", fontSize: "13px" }}>
          KES {(amount || 0).toFixed(2)}
        </Text>
      ),
      width: windowWidth < 768 ? 80 : 100,
      align: "right",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          completed: { color: "success", text: "COMPLETED" },
          pending: { color: "warning", text: "PENDING" },
          preparing: { color: "processing", text: "PREPARING" },
          ready: { color: "cyan", text: "READY" },
          cancelled: { color: "error", text: "CANCELLED" },
        };

        const config = statusConfig[status] || {
          color: "default",
          text: "UNKNOWN",
        };

        return (
          <Tag color={config.color} style={{ fontSize: "10px", margin: 0 }}>
            {config.text}
          </Tag>
        );
      },
      width: windowWidth < 768 ? 80 : 100,
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Preparing", value: "preparing" },
        { text: "Ready", value: "ready" },
        { text: "Completed", value: "completed" },
        { text: "Cancelled", value: "cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        date ? (
          <Text style={{ fontSize: "11px" }}>
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "2-digit",
            })}
          </Text>
        ) : (
          "N/A"
        ),
      width: windowWidth < 768 ? 70 : 100,
      responsive: ["md"],
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: windowWidth >= 768 ? "right" : false,
      width: windowWidth < 768 ? 120 : 140,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit order">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditOrder(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete order?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteOrder(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete order">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const OrderForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        status: "pending",
        items: [{ mealId: undefined, quantity: 1 }],
      }}
    >
      <Form.Item
        name="customerName"
        label="Customer Name"
        rules={[{ required: true, message: "Please enter customer name!" }]}
      >
        <Input size="large" placeholder="Enter customer name" />
      </Form.Item>

      <Form.Item
        name="staffId"
        label="Staff Member"
        rules={[{ required: true, message: "Please select staff member!" }]}
      >
        <Select size="large" placeholder="Select staff member">
          {staff.map((staffMember) => (
            <Option key={staffMember._id} value={staffMember._id}>
              {staffMember.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space
                key={key}
                style={{ display: "flex", marginBottom: 8 }}
                align="baseline"
              >
                <Form.Item
                  {...restField}
                  name={[name, "mealId"]}
                  rules={[{ required: true, message: "Missing meal" }]}
                >
                  <Select
                    style={{ width: 200 }}
                    placeholder="Select meal"
                    size="large"
                  >
                    {meals.map((meal) => (
                      <Option key={meal._id} value={meal._id}>
                        {meal.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "quantity"]}
                  rules={[{ required: true, message: "Missing quantity" }]}
                  initialValue={1}
                >
                  <InputNumber
                    min={1}
                    placeholder="Qty"
                    size="large"
                    style={{ width: 100 }}
                  />
                </Form.Item>
                {fields.length > 1 && (
                  <MinusCircleOutlined onClick={() => remove(name)} />
                )}
              </Space>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add({ mealId: undefined, quantity: 1 })}
                block
                icon={<PlusOutlined />}
                size="large"
              >
                Add Item
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Form.Item
        name="status"
        label="Order Status"
        rules={[{ required: true, message: "Please select status!" }]}
      >
        <Select size="large">
          <Option value="pending">Pending</Option>
          <Option value="preparing">Preparing</Option>
          <Option value="ready">Ready</Option>
          <Option value="completed">Completed</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button
            onClick={() => {
              windowWidth < 768
                ? setIsDrawerVisible(false)
                : setIsModalVisible(false);
              setEditingOrder(null);
              form.resetFields();
            }}
            size="large"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
          >
            {editingOrder ? "Update" : "Create"} Order
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" tip="Loading orders..." />
      </div>
    );
  }

  return (
    <div
      style={{
        padding:
          windowWidth < 768 ? "12px" : windowWidth < 1200 ? "16px" : "24px",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: windowWidth < 768 ? "column" : "row",
          justifyContent: "space-between",
          alignItems: windowWidth < 768 ? "stretch" : "center",
          gap: windowWidth < 768 ? "16px" : "0",
          marginBottom: "24px",
        }}
      >
        <Title
          level={2}
          style={{ margin: 0, fontSize: windowWidth < 768 ? "20px" : "24px" }}
        >
          Orders ({orders.length})
        </Title>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => {
            setEditingOrder(null);
            form.resetFields();
            form.setFieldsValue({ status: "pending" });
            windowWidth < 768
              ? setIsDrawerVisible(true)
              : setIsModalVisible(true);
          }}
          style={{ width: windowWidth < 768 ? "100%" : "auto" }}
          size="large"
        >
          New Order
        </Button>
      </div>

      <Card bodyStyle={{ padding: windowWidth < 768 ? "12px" : "24px" }}>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          loading={loading}
          scroll={{ x: windowWidth < 768 ? 800 : 1000 }}
          pagination={{
            responsive: true,
            showSizeChanger: true,
            showQuickJumper: windowWidth >= 768,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} orders`,
            pageSize: windowWidth < 768 ? 5 : 10,
            pageSizeOptions: ["5", "10", "20", "50"],
            size: windowWidth < 768 ? "small" : "default",
          }}
          size={windowWidth < 768 ? "small" : "middle"}
        />
      </Card>

      <Modal
        title={
          <Space>
            <UserAddOutlined />
            {editingOrder ? "Edit Order" : "New Order"}
          </Space>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingOrder(null);
          form.resetFields();
        }}
        footer={null}
        width={windowWidth < 768 ? "95%" : windowWidth < 1200 ? "80%" : "900px"}
        style={{ top: windowWidth < 768 ? 10 : 20 }}
        bodyStyle={{
          maxHeight: "calc(100vh - 200px)",
          overflow: "auto",
          padding: windowWidth < 768 ? "16px" : "24px",
        }}
        destroyOnClose
      >
        <OrderForm />
      </Modal>

      <Drawer
        title={
          <Space>
            <UserAddOutlined />
            {editingOrder ? "Edit Order" : "New Order"}
          </Space>
        }
        placement="right"
        onClose={() => {
          setIsDrawerVisible(false);
          setEditingOrder(null);
          form.resetFields();
        }}
        open={isDrawerVisible}
        width="100%"
        bodyStyle={{ paddingBottom: 80 }}
        destroyOnClose
      >
        <OrderForm />
      </Drawer>
    </div>
  );
};

export default Orders;
