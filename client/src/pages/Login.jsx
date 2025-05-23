import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Space,
  theme,
  Row,
  Col,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { authAPI } from "../services/api";
import { loginSuccess, loginFailure } from "../store/slices/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { token } = theme.useToken();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError("");
      const response = await authAPI.login(values);
      dispatch(loginSuccess(response.data));
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to login");
      dispatch(loginFailure(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#1a1a1a",
      }}
    >
      {/* Image Section */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
          background:
            "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), #ff7400",
          color: "white",
          position: "relative",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Typography.Title
            level={1}
            style={{
              color: "white",
              marginBottom: "24px",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Welcome to Black Parrot
          </Typography.Title>
          <Typography.Paragraph
            style={{
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: "18px",
              marginBottom: "32px",
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            Experience the finest dining with our exceptional service and
            delicious cuisine
          </Typography.Paragraph>
          <div
            style={{
              width: "100%",
              height: "400px",
              backgroundImage:
                "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              border: "4px solid rgba(255, 255, 255, 0.1)",
            }}
          />
        </div>
      </div>

      {/* Login Form Section */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
          background: "#ffffff",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 400,
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            borderRadius: "12px",
            border: "none",
          }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <Typography.Title
                level={2}
                style={{ color: "#1a1a1a", marginBottom: "8px" }}
              >
                Sign In
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: "16px" }}>
                Welcome back! Please login to your account
              </Typography.Text>
            </div>

            {error && (
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
              />
            )}

            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Email"
                  style={{
                    height: "45px",
                    borderRadius: "8px",
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                  style={{
                    height: "45px",
                    borderRadius: "8px",
                  }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{
                    height: "45px",
                    fontSize: "16px",
                    background: "#ff7400",
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(255, 116, 0, 0.2)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#ff8533";
                    e.target.style.boxShadow =
                      "0 6px 16px rgba(255, 116, 0, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#ff7400";
                    e.target.style.boxShadow =
                      "0 4px 12px rgba(255, 116, 0, 0.2)";
                  }}
                >
                  Sign in
                </Button>
              </Form.Item>
            </Form>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default Login;
