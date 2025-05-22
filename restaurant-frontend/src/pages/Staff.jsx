import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { fetchStaff, addStaff, updateStaff, deleteStaff } from '../store/slices/staffSlice';

const { Option } = Select;

const Staff = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const dispatch = useDispatch();
  const { staff, loading } = useSelector((state) => state.staff);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchStaff());
  }, [dispatch]);

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

  const handleDeleteStaff = async (id) => {
    try {
      await dispatch(deleteStaff(id)).unwrap();
      message.success('Staff member deleted successfully');
    } catch (error) {
      message.error(error.message || 'Failed to delete staff member');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingStaff) {
        await dispatch(updateStaff({ id: editingStaff._id, ...values })).unwrap();
        message.success('Staff member updated successfully');
      } else {
        await dispatch(addStaff(values)).unwrap();
        message.success('Staff member added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(error.message || 'Failed to save staff member');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
        title: 'Phone',  // Add this column
        dataIndex: 'phone',
        key: 'phone',
      },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditStaff(record)}
            disabled={user.role !== 'admin'}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this staff member?"
            onConfirm={() => handleDeleteStaff(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={user.role !== 'admin'}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Staff Management"
        extra={
          user.role === 'admin' && (
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={handleAddStaff}
            >
              Add Staff
            </Button>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={staff}
          loading={loading}
          rowKey="_id"
        />
      </Card>

      <Modal
        title={editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please input staff name!' }]}
          >
            <Input prefix={<UserAddOutlined />} />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please input phone number!' },
              { pattern: /^[0-9+\-\s()]*$/, message: 'Please enter a valid phone number!' }
            ]}
          >
            <Input prefix={<PhoneOutlined />} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input staff email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select staff role!' }]}
          >
            <Select>
              <Option value="staff">Staff</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>

          {!editingStaff && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please input password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingStaff ? 'Update' : 'Add'} Staff
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
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