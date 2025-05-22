import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Avatar,
  Row,
  Col,
  Typography,
  Divider,
  Space,
} from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { updateProfile } from '../store/slices/authSlice';

const { Title } = Typography;

const Profile = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    }
  }, [user, form]);

  const handleSubmit = async (values) => {
    try {
      await dispatch(updateProfile(values)).unwrap();
      message.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      message.error(error.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      await dispatch(updateProfile({ password: values.newPassword })).unwrap();
      message.success('Password updated successfully');
      form.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
    } catch (error) {
      message.error(error.message || 'Failed to update password');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Profile</Title>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Avatar size={100} icon={<UserOutlined />} />
              <Title level={4} style={{ marginTop: '16px' }}>{user?.name}</Title>
              <Typography.Text type="secondary">{user?.role}</Typography.Text>
            </div>
            
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <MailOutlined /> {user?.email}
              </div>
              <div>
                <PhoneOutlined /> {user?.phone || 'Not set'}
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card title="Personal Information">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              disabled={!isEditing}
            >
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please input your name!' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please input your phone number!' }]}
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>

              <Form.Item>
                <Space>
                  {isEditing ? (
                    <>
                      <Button type="primary" htmlType="submit" loading={loading}>
                        Save Changes
                      </Button>
                      <Button onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button type="primary" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </Card>

          <Card title="Change Password" style={{ marginTop: '24px' }}>
            <Form
              layout="vertical"
              onFinish={handlePasswordChange}
            >
              <Form.Item
                name="currentPassword"
                label="Current Password"
                rules={[{ required: true, message: 'Please input your current password!' }]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { required: true, message: 'Please input your new password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your new password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Update Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;