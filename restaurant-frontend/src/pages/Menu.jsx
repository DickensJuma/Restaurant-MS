import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
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
  Image,
  Typography,
  Row,
  Col,
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { mealsAPI } from '../services/api';

const { Option } = Select;
const { Text, Title } = Typography;

// Default image for meals without images
const DEFAULT_MEAL_IMAGE = 'https://via.assets.so/assets/images/default-meal.png';

const Menu = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await mealsAPI.getAll();
      setMeals(response.data);
    } catch (error) {
      setError(error.message);
      message.error('Failed to fetch meals');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = () => {
    setEditingMeal(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditMeal = (record) => {
    setEditingMeal(record);
    form.setFieldsValue(record);
    setPreviewImage(record.image || DEFAULT_MEAL_IMAGE);
    setIsModalVisible(true);
  };

  const handleDeleteMeal = async (id) => {
    try {
      await mealsAPI.delete(id);
      message.success('Meal deleted successfully');
      fetchMeals();
    } catch (error) {
      message.error('Failed to delete meal');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingMeal) {
        await mealsAPI.update(editingMeal._id, values);
        message.success('Meal updated successfully');
      } else {
        await mealsAPI.create(values);
        message.success('Meal created successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchMeals();
    } catch (error) {
      message.error('Failed to save meal');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Title level={2}>Menu</Title>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={handleAddMeal}
        >
          Add Meal
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {meals.map((meal) => (
          <Col xs={24} sm={12} md={8} lg={6} key={meal._id}>
            <Card
              hoverable
              cover={
                <Image
                  alt={meal.name}
                  src={meal.image || DEFAULT_MEAL_IMAGE}
                  height={200}
                  style={{ objectFit: 'cover' }}
                  fallback={DEFAULT_MEAL_IMAGE}
                />
              }
              actions={[
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEditMeal(meal)}
                >
                  Edit
                </Button>,
                <Popconfirm
                  title="Are you sure you want to delete this meal?"
                  onConfirm={() => handleDeleteMeal(meal._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                  >
                    Delete
                  </Button>
                </Popconfirm>
              ]}
            >
              <Card.Meta
                title={meal.name}
                description={
                  <>
                    <p>{meal.description}</p>
                    <p>Price: KES {meal.price.toFixed(2)}</p>
                    <Space>
                      <Tag color="blue">{meal.category}</Tag>
                      <Tag color={meal.available ? 'green' : 'red'}>
                        {meal.available ? 'Available' : 'Not Available'}
                      </Tag>
                    </Space>
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={editingMeal ? 'Edit Meal' : 'Add Meal'}
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
            label="Name"
            rules={[{ required: true, message: 'Please input meal name!' }]}
          >
            <Input prefix={<UserAddOutlined />} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input meal description!' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please input meal price!' }]}
          >
            <InputNumber
              prefix="KES"
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              formatter={value => `KES ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/KES\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select meal category!' }]}
          >
            <Select>
              <Option value="Burgers">Burgers</Option>
              <Option value="Pizza">Pizza</Option>
              <Option value="Pasta">Pasta</Option>
              <Option value="Salads">Salads</Option>
              <Option value="Desserts">Desserts</Option>
              <Option value="Drinks">Drinks</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="image"
            label="Image URL"
            rules={[{ required: true, message: 'Please input image URL!' }]}
          >
            <Input 
              prefix={<PictureOutlined />}
              onChange={(e) => setPreviewImage(e.target.value || DEFAULT_MEAL_IMAGE)}
            />
          </Form.Item>

          {previewImage && (
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
              <Image
                src={previewImage}
                alt="Preview"
                width={200}
                height={150}
                style={{ objectFit: 'cover' }}
                fallback={DEFAULT_MEAL_IMAGE}
              />
            </div>
          )}

          <Form.Item
            name="available"
            label="Status"
            valuePropName="checked"
            initialValue={true}
          >
            <Select>
              <Option value={true}>Available</Option>
              <Option value={false}>Not Available</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingMeal ? 'Update' : 'Add'} Meal
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

export default Menu;