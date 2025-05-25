import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  Row,
  Col,
  Drawer,
  Descriptions,
  Typography,
  Statistic,
  Avatar,
  List,
  Divider,
  DatePicker,
  Spin,
} from "antd";
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  EyeOutlined,
  TeamOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { fetchStaff, deleteStaff } from "../store/slices/staffSlice";
import { staffAPI, reportsAPI, ordersAPI } from "../services/api";
import { useNotification } from "../context/NotificationContext";
import { Line, Column, Pie } from "@ant-design/plots";

const { Option } = Select;
const { Title, Text } = Typography;

const Staff = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffStats, setStaffStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const [performanceStats, setPerformanceStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  const dispatch = useDispatch();
  const { staff } = useSelector((state) => state.staff);
  const { user } = useSelector((state) => state.auth);
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        const response = await staffAPI.getAll();
        let staffData;

        if (Array.isArray(response)) {
          staffData = response;
          dispatch(fetchStaff.fulfilled(response));
        } else if (response && response.data && Array.isArray(response.data)) {
          staffData = response.data;
          dispatch(fetchStaff.fulfilled(response.data));
        } else {
          console.error("Invalid staff response:", response);
          addNotification(
            "error",
            "Failed to Load Staff",
            "Could not load staff data. Please try again.",
            "staff"
          );
          return;
        }

        // Fetch orders and calculate stats using the staff data directly
        try {
          const ordersResponse = await ordersAPI.getAll();
          if (!Array.isArray(ordersResponse.data)) {
            console.error("Invalid orders response:", ordersResponse);
            return;
          }

          const orders = ordersResponse.data;
          console.log(
            "All orders:",
            orders.map((order) => ({
              id: order._id,
              staffId: order.staffId?._id,
              staffName: order.staffId?.name,
              createdAt: order.createdAt,
              total: order.total,
            }))
          );

          // Calculate stats for each staff member
          const stats = {};
          staffData.forEach((staffMember) => {
            if (!staffMember?._id) {
              console.log("Skipping staff member with no ID:", staffMember);
              return;
            }

            const staffOrders = orders.filter(
              (order) => order?.staffId?._id === staffMember._id
            );

            console.log(
              `Staff ${staffMember._id} (${staffMember.name}) orders:`,
              staffOrders.map((order) => ({
                id: order._id,
                createdAt: order.createdAt,
                total: order.total,
              }))
            );

            // Calculate today's orders using UTC
            const now = new Date();
            const startOfToday = new Date(
              Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate()
              )
            );

            console.log("Date debug:", {
              now: now.toISOString(),
              startOfToday: startOfToday.toISOString(),
            });

            const todayOrders = staffOrders.filter((order) => {
              const orderDate = new Date(order.createdAt);
              const isToday = orderDate >= startOfToday;
              console.log(`Order ${order._id} date check:`, {
                orderDate: orderDate.toISOString(),
                startOfToday: startOfToday.toISOString(),
                isToday,
              });
              return isToday;
            });

            console.log(
              `Staff ${staffMember._id} (${staffMember.name}) today's orders:`,
              todayOrders.map((order) => ({
                id: order._id,
                createdAt: order.createdAt,
                total: order.total,
              }))
            );

            stats[staffMember._id] = {
              totalOrders: staffOrders.length,
              todayOrders: todayOrders.length,
              totalRevenue: staffOrders.reduce(
                (sum, order) => sum + (order?.total || 0),
                0
              ),
              todayRevenue: todayOrders.reduce(
                (sum, order) => sum + (order?.total || 0),
                0
              ),
              uniqueCustomers: new Set(
                staffOrders.map((order) => order?.customerName).filter(Boolean)
              ).size,
              averageOrderValue: staffOrders.length
                ? staffOrders.reduce(
                    (sum, order) => sum + (order?.total || 0),
                    0
                  ) / staffOrders.length
                : 0,
            };
          });

          console.log("Final stats:", stats);
          setStaffStats(stats);
        } catch (error) {
          console.error("Failed to fetch orders:", error);
          addNotification(
            "error",
            "Failed to Load Stats",
            error.message ||
              "Could not load order statistics. Please try again.",
            "staff"
          );
        }
      } catch (error) {
        console.error("Failed to fetch staff:", error);
        addNotification(
          "error",
          "Failed to Load Staff",
          error.message || "Could not load staff data. Please try again.",
          "staff"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [dispatch]);

  useEffect(() => {
    if (staff?.length > 0 && !selectedStaff) {
      setSelectedStaff(staff[0]);
    }
  }, [staff, selectedStaff]);

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchPerformanceStats = async (period = "monthly") => {
    try {
      setLoadingStats(true);
      const response = await reportsAPI.getPerformanceStats({ period });

      if (response.data && response.data.success && response.data.data) {
        setPerformanceStats(response.data.data);
      } else {
        addNotification(
          "error",
          "Failed to Load Stats",
          "Invalid response format from server",
          "staff"
        );
      }
    } catch (error) {
      console.error("Failed to fetch performance stats:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      addNotification(
        "error",
        "Failed to Load Stats",
        error.message ||
          "Could not load performance statistics. Please try again.",
        "staff"
      );
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchPerformanceStats(selectedPeriod);
  }, [selectedPeriod]);

  const isMobile = screenSize < 768;

  const handleAddStaff = async (staffData) => {
    try {
      const response = await staffAPI.create(staffData);
      dispatch(fetchStaff.fulfilled([...staff, response.data]));
      message.success("Staff member added successfully");
    } catch (error) {
      message.error(error.message || "Failed to add staff member");
      throw error;
    }
  };

  const handleEditStaff = (record) => {
    setEditingStaff(record);
    form.setFieldsValue({
      ...record,
      password: undefined, // Clear password field when editing
    });
    setIsModalVisible(true);
  };

  const handleDeleteStaff = async (id) => {
    try {
      await staffAPI.delete(id);
      dispatch(deleteStaff(id));
      message.success("Staff member deleted successfully");
    } catch (error) {
      message.error(error.message || "Failed to delete staff member");
    }
  };

  const handleUpdateStaff = async (staffData) => {
    try {
      const response = await staffAPI.update(editingStaff._id, staffData);
      dispatch(
        fetchStaff.fulfilled(
          staff.map((s) => (s._id === editingStaff._id ? response.data : s))
        )
      );
      message.success("Staff member updated successfully");
    } catch (error) {
      message.error(error.message || "Failed to update staff member");
      throw error;
    }
  };

  const handleToggleStatus = async (staffId, currentStatus) => {
    try {
      const response = await staffAPI.update(staffId, {
        status: !currentStatus ? "active" : "inactive",
      });
      if (response.data) {
        addNotification(
          "success",
          "Status Updated",
          `Staff member is now ${!currentStatus ? "active" : "inactive"}`,
          "staff"
        );
        dispatch(
          fetchStaff.fulfilled(
            staff.map((s) =>
              s._id === staffId
                ? { ...s, status: !currentStatus ? "active" : "inactive" }
                : s
            )
          )
        );
      }
    } catch (error) {
      addNotification(
        "error",
        "Update Failed",
        error.response?.data?.message ||
          "Failed to update staff status. Please try again.",
        "staff"
      );
    }
  };

  const handleSubmit = async (values) => {
    try {
      const isEditing = !!editingStaff;
      const staffData = {
        ...values,
        status: values.status || "active", // Ensure status is set
      };

      if (isEditing) {
        // Don't send password if it's not changed
        if (!staffData.password) {
          delete staffData.password;
        }
        await handleUpdateStaff(staffData);
      } else {
        await handleAddStaff(staffData);
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingStaff(null);

      // If we're editing the currently selected staff, update their details
      if (isEditing && selectedStaff?._id === editingStaff._id) {
        const updatedStaff = {
          ...selectedStaff,
          ...staffData,
        };
        dispatch(
          fetchStaff.fulfilled([
            ...staff.filter((s) => s._id !== editingStaff._id),
            updatedStaff,
          ])
        );
        setSelectedStaff(updatedStaff);
      }
    } catch (error) {
      message.error(error.message || "Failed to save staff member");
    }
  };

  const renderStaffStats = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="Total Staff"
            value={staff?.length || 0}
            prefix={<TeamOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="Active Staff"
            value={staff?.filter((s) => s.status === "active")?.length || 0}
            prefix={<UserOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="Today's Orders"
            value={Object.values(staffStats || {}).reduce(
              (sum, stat) => sum + (stat.todayOrders || 0),
              0
            )}
            prefix={<ShoppingOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="Today's Revenue"
            value={Object.values(staffStats || {}).reduce(
              (sum, stat) => sum + (stat.todayRevenue || 0),
              0
            )}
            prefix={<DollarOutlined />}
            precision={2}
            formatter={(value) => `KES ${value.toLocaleString()}`}
          />
        </Card>
      </Col>
    </Row>
  );

  const renderStaffList = () => (
    <Card
      title="Staff Members"
      extra={
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => {
            setEditingStaff(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
          size={isMobile ? "small" : "middle"}
          disabled={user?.role !== "admin"}
        >
          Add Staff
        </Button>
      }
    >
      <List
        dataSource={
          staff?.filter((staffMember) => staffMember?.status === "active") || []
        }
        loading={loading}
        renderItem={(staffMember) => (
          <List.Item
            actions={[
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditStaff(staffMember)}
                disabled={
                  (user?.role !== "admin" && user?._id !== staffMember?._id) ||
                  (staffMember?.role === "admin" && user?.role !== "admin")
                }
              />,
              <Button
                size="small"
                onClick={() =>
                  handleToggleStatus(
                    staffMember?._id,
                    staffMember?.status === "active"
                  )
                }
                disabled={
                  user?.role !== "admin" || staffMember?.role === "admin"
                }
              >
                {staffMember?.status === "active" ? "Deactivate" : "Activate"}
              </Button>,
              <Popconfirm
                title="Delete this staff member?"
                onConfirm={() => handleDeleteStaff(staffMember?._id)}
                okText="Yes"
                cancelText="No"
                disabled={staffMember?.role === "admin"}
              >
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={
                    user?.role !== "admin" || staffMember?.role === "admin"
                  }
                />
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={
                <a onClick={() => setSelectedStaff(staffMember)}>
                  {staffMember?.name}
                </a>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">{staffMember?.email}</Text>
                  <Space size={4}>
                    <Tag color={staffMember?.role === "admin" ? "red" : "blue"}>
                      {staffMember?.role?.toUpperCase()}
                    </Tag>
                    <Tag
                      color={staffMember?.status === "active" ? "green" : "red"}
                    >
                      {staffMember?.status?.toUpperCase()}
                    </Tag>
                  </Space>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );

  const renderPerformanceChart = () => {
    if (!performanceStats || !performanceStats.analytics) return null;

    // Prepare data for different charts
    const salesData = performanceStats.analytics.map((period) => ({
      date: period.date,
      value: period.totalSales,
      type: "Total Sales",
    }));

    const ordersData = performanceStats.analytics.map((period) => ({
      date: period.date,
      value: period.totalOrders,
      type: "Total Orders",
    }));

    const averageOrderData = performanceStats.analytics.map((period) => ({
      date: period.date,
      value: period.averageOrderValue,
      type: "Average Order Value",
    }));

    // Sales trend configuration
    const salesConfig = {
      data: salesData,
      xField: "date",
      yField: "value",
      seriesField: "type",
      yAxis: {
        label: {
          formatter: (v) => `KES ${v.toLocaleString()}`,
        },
      },
      legend: {
        position: "top",
      },
      smooth: true,
      animation: {
        appear: {
          animation: "path-in",
          duration: 1000,
        },
      },
      color: ["#1890ff"],
    };

    // Orders trend configuration
    const ordersConfig = {
      data: ordersData,
      xField: "date",
      yField: "value",
      seriesField: "type",
      yAxis: {
        label: {
          formatter: (v) => `${v} orders`,
        },
      },
      legend: {
        position: "top",
      },
      smooth: true,
      animation: {
        appear: {
          animation: "path-in",
          duration: 1000,
        },
      },
      color: ["#52c41a"],
    };

    // Average order value configuration
    const avgOrderConfig = {
      data: averageOrderData,
      xField: "date",
      yField: "value",
      seriesField: "type",
      yAxis: {
        label: {
          formatter: (v) => `KES ${v.toLocaleString()}`,
        },
      },
      legend: {
        position: "top",
      },
      smooth: true,
      animation: {
        appear: {
          animation: "path-in",
          duration: 1000,
        },
      },
      color: ["#722ed1"],
    };

    return (
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title="Performance Overview"
            extra={
              <Select
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                style={{ width: 120 }}
              >
                <Select.Option value="daily">Daily</Select.Option>
                <Select.Option value="weekly">Weekly</Select.Option>
                <Select.Option value="monthly">Monthly</Select.Option>
              </Select>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card size="small" title="Total Sales Trend">
                  <Line {...salesConfig} />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small" title="Orders Trend">
                  <Line {...ordersConfig} />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small" title="Average Order Value Trend">
                  <Line {...avgOrderConfig} />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} md={12}>
                <Card size="small" title="Performance Summary">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic
                        title="Total Sales"
                        value={performanceStats.summary.totalSales}
                        precision={2}
                        formatter={(value) => `KES ${value.toLocaleString()}`}
                        prefix={<DollarOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Total Orders"
                        value={performanceStats.summary.totalOrders}
                        prefix={<ShoppingOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Average Order Value"
                        value={performanceStats.summary.averageOrderValue}
                        precision={2}
                        formatter={(value) => `KES ${value.toLocaleString()}`}
                        prefix={<DollarOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Period"
                        value={
                          selectedPeriod.charAt(0).toUpperCase() +
                          selectedPeriod.slice(1)
                        }
                        prefix={<CalendarOutlined />}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title="Performance Metrics">
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Column
                        data={[
                          {
                            type: "Sales",
                            value: performanceStats.summary.totalSales,
                          },
                          {
                            type: "Orders",
                            value: performanceStats.summary.totalOrders,
                          },
                          {
                            type: "Avg. Order",
                            value: performanceStats.summary.averageOrderValue,
                          },
                        ]}
                        xField="type"
                        yField="value"
                        label={{
                          position: "middle",
                          style: {
                            fill: "#FFFFFF",
                            opacity: 0.6,
                          },
                        }}
                        color={["#1890ff", "#52c41a", "#722ed1"]}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderStaffDetails = () => {
    if (!selectedStaff) return null;

    const stats = staffStats[selectedStaff._id] || {
      totalOrders: 0,
      totalRevenue: 0,
      uniqueCustomers: 0,
      averageOrderValue: 0,
    };

    // Get staff-specific performance data
    const staffPerformance =
      performanceStats?.analytics?.reduce(
        (acc, period) => {
          const staffData = period.staffPerformance[selectedStaff._id];
          if (staffData) {
            acc.totalSales += staffData.totalSales;
            acc.totalOrders += staffData.totalOrders;
            acc.averageOrderValue = staffData.averageOrderValue;
          }
          return acc;
        },
        { totalSales: 0, totalOrders: 0, averageOrderValue: 0 }
      ) || stats;

    return (
      <Card
        title={
          <Space>
            <Avatar size={40} icon={<UserOutlined />} />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {selectedStaff.name}
              </Title>
              <Text type="secondary">{selectedStaff.email}</Text>
            </div>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Phone">
                {selectedStaff.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                <Tag color={selectedStaff.role === "admin" ? "red" : "blue"}>
                  {selectedStaff.role.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={selectedStaff.status === "active" ? "green" : "red"}
                >
                  {selectedStaff.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Col>

          <Col span={24}>
            <Divider orientation="left">Performance Stats</Divider>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={12} md={12}>
                <Card size="small">
                  <Statistic
                    title="Total Orders"
                    value={staffPerformance.totalOrders}
                    prefix={<ShoppingOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12} md={12}>
                <Card size="small">
                  <Statistic
                    title="Total Revenue"
                    value={staffPerformance.totalSales}
                    prefix={<DollarOutlined />}
                    precision={2}
                    formatter={(value) => `KES ${value.toLocaleString()}`}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12} md={12}>
                <Card size="small">
                  <Statistic
                    title="Unique Customers"
                    value={stats.uniqueCustomers}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12} md={12}>
                <Card size="small">
                  <Statistic
                    title="Avg. Order Value"
                    value={staffPerformance.averageOrderValue}
                    prefix={<DollarOutlined />}
                    precision={2}
                    formatter={(value) => `KES ${value.toLocaleString()}`}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <div style={{ padding: isMobile ? "16px" : "24px" }}>
      {renderStaffStats()}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={selectedStaff ? 12 : 24}>
          {renderStaffList()}
        </Col>
        {selectedStaff && (
          <Col xs={24} md={12}>
            {renderStaffDetails()}
          </Col>
        )}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {renderPerformanceChart()}
      </Row>

      {/* Add/Edit Modal */}
      <Modal
        title={
          <Space>
            {editingStaff ? (
              <>
                <EditOutlined />
                Edit Staff Member
              </>
            ) : (
              <>
                <UserAddOutlined />
                Add Staff Member
              </>
            )}
          </Space>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingStaff(null);
          form.resetFields();
        }}
        footer={null}
        width={isMobile ? "95%" : 520}
        style={isMobile ? { top: 20 } : {}}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: "active",
            role: "staff",
          }}
        >
          <Row gutter={isMobile ? [0, 0] : [16, 0]}>
            <Col xs={24} sm={24} md={24}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[
                  { required: true, message: "Please input staff name!" },
                  { min: 2, message: "Name must be at least 2 characters!" },
                ]}
              >
                <Input prefix={<UserAddOutlined />} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[
                  { required: true, message: "Please input phone number!" },
                  {
                    pattern: /^[0-9+\-\s()]*$/,
                    message: "Please enter a valid phone number!",
                  },
                ]}
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[
                  { required: true, message: "Please select staff role!" },
                ]}
              >
                <Select>
                  <Option value="staff">Staff</Option>
                  <Option value="admin">Admin</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please input staff email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[
                  { required: true, message: "Please select staff status!" },
                ]}
              >
                <Select>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>

            {!editingStaff && (
              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: "Please input password!" },
                    {
                      min: 6,
                      message: "Password must be at least 6 characters!",
                    },
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
              </Col>
            )}

            {editingStaff && (
              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  name="password"
                  label="New Password (Optional)"
                  rules={[
                    {
                      min: 6,
                      message: "Password must be at least 6 characters!",
                    },
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
              </Col>
            )}
          </Row>

          <Form.Item style={{ marginTop: 16 }}>
            <Space
              direction={isMobile ? "vertical" : "horizontal"}
              style={{ width: "100%" }}
            >
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block={isMobile}
              >
                {editingStaff ? "Update" : "Add"} Staff
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingStaff(null);
                  form.resetFields();
                }}
                block={isMobile}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Staff;
