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
} from "antd";
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  fetchStaff,
  addStaff,
  updateStaff,
  deleteStaff,
} from "../store/slices/staffSlice";

const { Option } = Select;
const { Title } = Typography;

const Staff = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [screenSize, setScreenSize] = useState(window.innerWidth);

  const dispatch = useDispatch();
  const { staff, loading } = useSelector((state) => state.staff);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchStaff());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = screenSize < 768;

  const handleAddStaff = () => {
    setEditingStaff(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditStaff = (record) => {
    setEditingStaff(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleViewStaff = (record) => {
    setViewingStaff(record);
    setIsDrawerVisible(true);
  };

  const handleDeleteStaff = async (id) => {
    try {
      await dispatch(deleteStaff(id)).unwrap();
      message.success("Staff member deleted successfully");
    } catch (error) {
      message.error(error.message || "Failed to delete staff member");
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingStaff) {
        await dispatch(
          updateStaff({ id: editingStaff._id, ...values })
        ).unwrap();
        message.success("Staff member updated successfully");
      } else {
        await dispatch(addStaff(values)).unwrap();
        message.success("Staff member added successfully");
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(error.message || "Failed to save staff member");
    }
  };

  // Desktop/Tablet columns
  const desktopColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "20%",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: "18%",
      responsive: ["lg"],
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "25%",
      responsive: ["md"],
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: "12%",
      render: (role) => (
        <Tag color={role === "admin" ? "red" : "blue"}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "12%",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "13%",
      render: (_, record) => (
        <Space size="small" wrap>
          {isMobile && (
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewStaff(record)}
            />
          )}
          <Button
            size={isMobile ? "small" : "middle"}
            icon={<EditOutlined />}
            onClick={() => handleEditStaff(record)}
            disabled={user.role !== "admin"}
          />
          <Popconfirm
            title="Are you sure you want to delete this staff member?"
            onConfirm={() => handleDeleteStaff(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              size={isMobile ? "small" : "middle"}
              danger
              icon={<DeleteOutlined />}
              disabled={user.role !== "admin"}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Mobile columns - simplified view
  const mobileColumns = [
    {
      title: "Staff Details",
      key: "details",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>
            {record.name}
          </div>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: 4 }}>
            {record.email}
          </div>
          <Space size="small">
            <Tag color={record.role === "admin" ? "red" : "blue"}>
              {record.role.toUpperCase()}
            </Tag>
            <Tag color={record.status === "active" ? "green" : "red"}>
              {record.status.toUpperCase()}
            </Tag>
          </Space>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewStaff(record)}
            block
          >
            View
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditStaff(record)}
            disabled={user.role !== "admin"}
            block
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this staff member?"
            onConfirm={() => handleDeleteStaff(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={user.role !== "admin"}
              block
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const columns = isMobile ? mobileColumns : desktopColumns;

  return (
    <div
      style={{
        padding: isMobile ? "16px" : "24px",
        minHeight: "100vh",
      }}
    >
      <Card
        title={
          <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
            Staff Management
          </Title>
        }
        extra={
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleAddStaff}
            size={isMobile ? "small" : "middle"}
          >
            {isMobile ? "Add" : "Add Staff"}
          </Button>
        }
        bodyStyle={{ padding: isMobile ? "12px" : "24px" }}
      >
        <Table
          columns={columns}
          dataSource={staff}
          loading={loading}
          rowKey="_id"
          scroll={{ x: isMobile ? 300 : "max-content" }}
          pagination={{
            responsive: true,
            showSizeChanger: !isMobile,
            showQuickJumper: !isMobile,
            showTotal: (total, range) =>
              isMobile
                ? `${range[0]}-${range[1]} of ${total}`
                : `${range[0]}-${range[1]} of ${total} items`,
            pageSize: isMobile ? 5 : 10,
          }}
          size={isMobile ? "small" : "middle"}
        />
      </Card>

      {/* Staff Details Drawer for Mobile */}
      <Drawer
        title={`Staff Details - ${viewingStaff?.name}`}
        placement="bottom"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        height="60%"
      >
        {viewingStaff && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Name">
              {viewingStaff.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {viewingStaff.email}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {viewingStaff.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Role">
              <Tag color={viewingStaff.role === "admin" ? "red" : "blue"}>
                {viewingStaff.role.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={viewingStaff.status === "active" ? "green" : "red"}>
                {viewingStaff.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      {/* Add/Edit Modal */}
      <Modal
        title={editingStaff ? "Edit Staff Member" : "Add Staff Member"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={isMobile ? "95%" : 520}
        style={isMobile ? { top: 20 } : {}}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={isMobile ? [0, 0] : [16, 0]}>
            <Col xs={24} sm={24} md={24}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[
                  { required: true, message: "Please input staff name!" },
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

            {!editingStaff && (
              <Col xs={24} sm={24} md={24}>
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
              <Button onClick={() => setIsModalVisible(false)} block={isMobile}>
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
