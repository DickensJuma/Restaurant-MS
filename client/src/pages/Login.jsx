import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Space,
  Checkbox,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  FacebookFilled,
  GoogleOutlined,
} from "@ant-design/icons";
import { authAPI } from "../services/api";
import { loginSuccess, loginFailure } from "../store/slices/authSlice";
import image from "../assets/images/bg-login.jpg";
import logo from "../assets/images/black-parrot.avif";
const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Responsive styles
  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    background: "#f7fafd",
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
    flexDirection: "row",
  };
  const leftStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#fff",
    padding: "0 40px",
    minWidth: 320,
    position: "relative",
  };
  const rightStyle = {
    flex: 1,
    minWidth: 320,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#f7fafd",
    position: "relative",
    overflow: "hidden",
  };
  const imageStyle = {
    width: "100%",
    height: "100vh",
    backgroundImage: `url(${image})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  };

  // Media queries for responsiveness
  const desktopQuery = `@media (min-width: 1200px)`;
  const tabletQuery = `@media (min-width: 768px) and (max-width: 1199px)`;
  const mobileQuery = `@media (max-width: 767px)`;

  // Inline style tag for media queries
  const responsiveStyles = `
    ${desktopQuery} {
      .login-container {
        flex-direction: row;
      }
      .login-left {
        flex: 1;
        padding: 0 40px;
      }
      .login-right {
        flex: 1;
        display: flex;
      }
      .login-image {
        height: 100vh;
      }
    }
    ${tabletQuery} {
      .login-container {
        flex-direction: row;
      }
      .login-left {
        flex: 1.2;
        padding: 0 32px;
      }
      .login-right {
        flex: 0.8;
        display: flex;
      }
      .login-image {
        height: 100vh;
      }
      .login-logo {
        top: 24px !important;
        left: 24px !important;
      }
      .login-footer {
        left: 24px !important;
        bottom: 16px !important;
        width: calc(100% - 48px) !important;
      }
      .login-form-container {
        max-width: 360px !important;
      }
      .login-title {
        font-size: 20px !important;
      }
      .login-subtitle {
        font-size: 14px !important;
      }
      .login-button {
        height: 40px !important;
      }
    }
    ${mobileQuery} {
      .login-container {
        flex-direction: column;
      }
      .login-left {
        min-width: 100vw;
        width: 100vw;
        padding: 0 16px;
      }
      .login-right {
        display: none !important;
      }
      .login-image {
        display: none !important;
      }
      .login-logo {
        left: 16px;
        top: 16px;
      }
      .login-footer {
        left: 16px;
        bottom: 12px;
        width: calc(100% - 32px);
        font-size: 12px;
      }
    }
  `;

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
    <div className="login-container" style={containerStyle}>
      <style>{responsiveStyles}</style>
      {/* Left: Login Form Section */}
      <div className="login-left" style={leftStyle}>
        {/* Logo */}
        <div
          className="login-logo"
          style={{ position: "absolute", top: 40, left: 40 }}
        >
          <img
            src={logo}
            alt="Black Parrot Logo"
            style={{ width: 40, height: 40, borderRadius: "50%" }}
          />
          <Title
            level={2}
            style={{
              color: "#eb9532",
              margin: 0,
              fontWeight: 700,
              letterSpacing: 1,
              fontSize: 28,
            }}
          >
            Black Parrot
          </Title>
        </div>
        <div
          className="login-form-container"
          style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}
        >
          <div style={{ marginBottom: 24 }}>
            <Text
              className="login-subtitle"
              style={{ fontSize: 12, color: "#888", letterSpacing: 1 }}
            >
              Welcome back to Black Parrot
            </Text>
            <Title
              level={3}
              className="login-title"
              style={{ margin: "8px 0 0 0", fontWeight: 700, fontSize: 24 }}
            >
              Login to your account
            </Title>
          </div>

          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            style={{ width: "100%" }}
            initialValues={{ remember: true }}
          >
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Your E-mail"
                className="login-input"
                style={{ height: 44, borderRadius: 8 }}
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
                placeholder="Your password"
                className="login-input"
                style={{ height: 44, borderRadius: 8 }}
              />
            </Form.Item>

            <Row
              justify="space-between"
              align="middle"
              style={{ marginBottom: 8 }}
            >
              <Col>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox style={{ fontSize: 14 }}>Remember me</Checkbox>
                </Form.Item>
              </Col>
              <Col>
                <a href="#" style={{ fontSize: 14, color: "#1877f2" }}>
                  Forgot password?
                </a>
              </Col>
            </Row>

            <Row gutter={8} style={{ marginBottom: 8 }}>
              <Col span={12}>
                <Button
                  block
                  className="login-button"
                  style={{
                    height: 44,
                    borderRadius: 8,
                    border: "1.5px solid #1877f2",
                    color: "#1877f2",
                    background: "#fff",
                    fontWeight: 500,
                  }}
                  onClick={() => navigate("/")}
                  disabled
                >
                  Sign up
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="login-button"
                  style={{
                    height: 44,
                    borderRadius: 8,
                    background: "#1877f2",
                    fontWeight: 500,
                  }}
                >
                  Login
                </Button>
              </Col>
            </Row>
          </Form>

          <div style={{ textAlign: "center", margin: "24px 0 0 0" }}>
            <Text style={{ color: "#b0b0b0", fontSize: 14 }}>
              OR LOGIN WITH
            </Text>
            <Row gutter={16} justify="center" style={{ marginTop: 16 }}>
              <Col>
                <Button
                  icon={<FacebookFilled style={{ fontSize: 20 }} />}
                  className="login-button"
                  style={{
                    background: "#1877f2",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    width: 120,
                    height: 44,
                    fontWeight: 500,
                  }}
                  block
                >
                  Facebook
                </Button>
              </Col>
              <Col>
                <Button
                  icon={<GoogleOutlined style={{ fontSize: 20 }} />}
                  className="login-button"
                  style={{
                    background: "#fff",
                    color: "#222",
                    border: "1.5px solid #eee",
                    borderRadius: 8,
                    width: 120,
                    height: 44,
                    fontWeight: 500,
                  }}
                  block
                >
                  Google
                </Button>
              </Col>
            </Row>
          </div>
        </div>
        {/* Footer & Language Switcher */}
        <div
          className="login-footer"
          style={{
            position: "absolute",
            bottom: 24,
            left: 40,
            width: "calc(100% - 80px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#b0b0b0", fontSize: 13 }}>
            All rights reserved © 2025
          </Text>
        </div>
      </div>

      {/* Right: Image/Testimonial Section */}
      <div className="login-right" style={rightStyle}>
        {/* Main Image */}
        <div className="login-image" style={imageStyle} />
      </div>
    </div>
  );
};

export default Login;
