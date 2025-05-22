import React, { useState, useEffect } from "react";
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
  Checkbox,
} from "antd";
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { mealsAPI } from "../services/api";

const { Option } = Select;
const { Text, Title } = Typography;

// Default image for meals without images
const DEFAULT_MEAL_IMAGE = "https://placehold.co/400x300?text=No+Image";

const Menu = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);

  console.log("meals", meals);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await mealsAPI.getAll();
      // Ensure images are properly formatted
      const formattedMeals = response.data.map((meal) => ({
        ...meal,
        images: Array.isArray(meal.images)
          ? meal.images.map((img) => ({
              ...img,
              url: img.url.startsWith("http")
                ? img.url
                : `${import.meta.env.VITE_API_URL || ""}${img.url}`,
            }))
          : [],
      }));
      setMeals(formattedMeals);
    } catch (error) {
      setError(error.message);
      message.error("Failed to fetch meals");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = () => {
    setEditingMeal(null);
    form.resetFields();
    setPreviewImages([DEFAULT_MEAL_IMAGE]);
    setIsModalVisible(true);
  };

  const handleEditMeal = (record) => {
    setEditingMeal(record);
    // Ensure images are properly formatted when editing
    const formattedImages = Array.isArray(record.images) ? record.images : [];
    form.setFieldsValue({
      ...record,
      images: formattedImages,
    });
    setPreviewImages(
      formattedImages.length ? formattedImages : [DEFAULT_MEAL_IMAGE]
    );
    setIsModalVisible(true);
  };

  const handleDeleteMeal = async (id) => {
    try {
      await mealsAPI.delete(id);
      message.success("Meal deleted successfully");
      fetchMeals();
    } catch {
      message.error("Failed to delete meal");
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Ensure images are properly formatted before submission
      const formattedValues = {
        ...values,
        images: Array.isArray(values.images) ? values.images : [],
      };

      if (editingMeal) {
        await mealsAPI.update(editingMeal._id, formattedValues);
        message.success("Meal updated successfully");
      } else {
        await mealsAPI.create(formattedValues);
        message.success("Meal created successfully");
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchMeals();
    } catch {
      message.error("Failed to save meal");
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
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div style={{ padding: { xs: "12px", sm: "16px", md: "24px" } }}>
      <div
        style={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: { xs: "16px", sm: "0" },
          marginBottom: "24px",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Menu
        </Title>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={handleAddMeal}
          style={{ width: { xs: "100%", sm: "auto" } }}
        >
          Add Meal
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {meals.map((meal) => (
          <Col
            xs={24}
            sm={12}
            md={8}
            lg={6}
            key={meal._id}
            style={{ display: "flex" }}
          >
            <Card
              hoverable
              style={{ width: "100%" }}
              cover={
                <Image.PreviewGroup>
                  <Image
                    alt={meal.name}
                    src={
                      Array.isArray(meal.images) && meal.images.length > 0
                        ? meal.images[0].url
                        : DEFAULT_MEAL_IMAGE
                    }
                    height={200}
                    style={{ objectFit: "cover" }}
                    fallback={DEFAULT_MEAL_IMAGE}
                    preview={true}
                    onError={(e) => {
                      e.target.src = DEFAULT_MEAL_IMAGE;
                    }}
                  />
                </Image.PreviewGroup>
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
                  <Button type="text" danger icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>,
              ]}
            >
              <Card.Meta
                title={meal.name}
                description={
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <Text ellipsis={{ rows: 2 }}>{meal.description}</Text>
                    <Text strong>Price: KES {meal.price.toFixed(2)}</Text>

                    <Space wrap>
                      <Tag color="blue">{meal.category}</Tag>
                      <Tag color={meal.available ? "green" : "red"}>
                        {meal.available ? "Available" : "Not Available"}
                      </Tag>
                    </Space>

                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <Text type="secondary">
                        Preparation Time: {meal.preparationTime} mins
                      </Text>
                      <Text type="secondary">
                        Calories: {meal.calories} kcal
                      </Text>
                    </Space>

                    <Space wrap>
                      {meal.dietaryInfo?.isVegetarian && (
                        <Tag color="green">Vegetarian</Tag>
                      )}
                      {meal.dietaryInfo?.isVegan && (
                        <Tag color="green">Vegan</Tag>
                      )}
                      {meal.dietaryInfo?.isGlutenFree && (
                        <Tag color="blue">Gluten Free</Tag>
                      )}
                    </Space>

                    <div>
                      <Text type="secondary">Ingredients:</Text>
                      <Space wrap>
                        {meal.ingredients?.map((ingredient, index) => (
                          <Tag key={index}>{ingredient}</Tag>
                        ))}
                      </Space>
                    </div>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={editingMeal ? "Edit Meal" : "Add Meal"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={{ xs: "100%", sm: "600px", md: "800px" }}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: "calc(100vh - 200px)", overflow: "auto" }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: "Please input meal name!" }]}
              >
                <Input prefix={<UserAddOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="price"
                label="Price"
                rules={[
                  { required: true, message: "Please input meal price!" },
                ]}
              >
                <InputNumber
                  prefix="KES"
                  style={{ width: "100%" }}
                  min={0}
                  step={0.01}
                  formatter={(value) =>
                    `KES ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/KES\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please input meal description!" },
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[
                  { required: true, message: "Please select meal category!" },
                ]}
              >
                <Select>
                  <Option value="Italian">Italian</Option>
                  <Option value="Burgers">Burgers</Option>
                  <Option value="Pizza">Pizza</Option>
                  <Option value="Pasta">Pasta</Option>
                  <Option value="Salads">Salads</Option>
                  <Option value="Desserts">Desserts</Option>
                  <Option value="Drinks">Drinks</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
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
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="preparationTime"
                label="Preparation Time (minutes)"
                rules={[
                  { required: true, message: "Please input preparation time!" },
                ]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="calories"
                label="Calories"
                rules={[{ required: true, message: "Please input calories!" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="ingredients"
            label="Ingredients"
            rules={[{ required: true, message: "Please input ingredients!" }]}
          >
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Enter ingredients (press enter after each ingredient)"
              tokenSeparators={[","]}
            />
          </Form.Item>

          <Form.Item
            name="dietaryInfo"
            label="Dietary Information"
            rules={[
              { required: true, message: "Please select dietary information!" },
            ]}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Checkbox name="isVegetarian">Vegetarian</Checkbox>
              <Checkbox name="isVegan">Vegan</Checkbox>
              <Checkbox name="isGlutenFree">Gluten Free</Checkbox>
            </Space>
          </Form.Item>

          <Form.Item
            name="images"
            label="Image URLs"
            rules={[
              {
                required: true,
                message: "Please input at least one image URL!",
              },
            ]}
            getValueFromEvent={(e) => {
              const values = e.target.value
                .split(",")
                .map((url) => url.trim())
                .filter((url) => url);
              setPreviewImages(values.length ? values : [DEFAULT_MEAL_IMAGE]);
              return values;
            }}
          >
            <Input.TextArea
              placeholder="Enter image URLs (one per line or comma-separated)"
              rows={4}
              onChange={(e) => {
                const values = e.target.value
                  .split(",")
                  .map((url) => url.trim())
                  .filter((url) => url);
                setPreviewImages(values.length ? values : [DEFAULT_MEAL_IMAGE]);
              }}
            />
          </Form.Item>

          {previewImages.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Image.PreviewGroup>
                <Row gutter={[8, 8]}>
                  {previewImages.map((image, index) => (
                    <Col xs={12} sm={8} md={6} key={index}>
                      <Image
                        src={image}
                        alt={`Preview ${index + 1}`}
                        width="100%"
                        height={100}
                        style={{ objectFit: "cover" }}
                        fallback={DEFAULT_MEAL_IMAGE}
                        preview={true}
                        onError={(e) => {
                          e.target.src = DEFAULT_MEAL_IMAGE;
                        }}
                      />
                    </Col>
                  ))}
                </Row>
              </Image.PreviewGroup>
            </div>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingMeal ? "Update" : "Add"} Meal
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Menu;
