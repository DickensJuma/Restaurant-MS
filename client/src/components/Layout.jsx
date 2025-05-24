import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Layout,
  Menu,
  Button,
  theme,
  Avatar,
  Dropdown,
  Space,
  Typography,
  Badge,
  Popover,
  List,
  Tabs,
  Switch,
} from "antd";
import {
  DashboardOutlined,
  MenuOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  LogoutOutlined,
  UserOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  BellOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import { logout } from "../store/slices/authSlice";
import { useNotification } from "../context/NotificationContext";
import "../styles/notifications.css";

const { Header, Sider, Content } = Layout;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    notifications,
    unreadCount,
    soundEnabled,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    toggleSound,
    getNotificationsByCategory,
    clearNotificationsByCategory,
  } = useNotification();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const notificationContent = (
    <div style={{ width: 350 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 16px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Typography.Text strong>Notifications</Typography.Text>
        <Space>
          <Switch
            checkedChildren={<SoundOutlined />}
            unCheckedChildren={<SoundOutlined />}
            checked={soundEnabled}
            onChange={toggleSound}
            size="small"
            className="notification-sound-toggle"
          />
          <Button type="link" size="small" onClick={markAllAsRead}>
            Mark all as read
          </Button>
          <Button type="link" size="small" onClick={clearAllNotifications}>
            Clear all
          </Button>
        </Space>
      </div>
      <Tabs
        defaultActiveKey="all"
        items={[
          {
            key: "all",
            label: "All",
            children: (
              <List
                dataSource={notifications}
                style={{ maxHeight: 400, overflow: "auto" }}
                renderItem={(item) => (
                  <List.Item
                    className="notification-list-item"
                    style={{
                      backgroundColor: item.read ? "transparent" : "#f5f5f5",
                      padding: "8px 16px",
                      cursor: "pointer",
                    }}
                    onClick={() => markAsRead(item.id)}
                  >
                    <List.Item.Meta
                      avatar={
                        item.type === "success" ? (
                          <CheckCircleOutlined style={{ color: "#52c41a" }} />
                        ) : item.type === "warning" ? (
                          <WarningOutlined style={{ color: "#faad14" }} />
                        ) : (
                          <InfoCircleOutlined style={{ color: "#1890ff" }} />
                        )
                      }
                      title={item.title}
                      description={
                        <Space direction="vertical" size={0}>
                          <Typography.Text
                            type="secondary"
                            style={{ fontSize: "12px" }}
                          >
                            {item.message}
                          </Typography.Text>
                          <Typography.Text
                            type="secondary"
                            style={{ fontSize: "12px" }}
                          >
                            {new Date(item.timestamp).toLocaleString()}
                          </Typography.Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                locale={{
                  emptyText: (
                    <div style={{ textAlign: "center", padding: "24px" }}>
                      <Typography.Text type="secondary">
                        No notifications
                      </Typography.Text>
                    </div>
                  ),
                }}
              />
            ),
          },
          {
            key: "orders",
            label: "Orders",
            children: (
              <List
                dataSource={getNotificationsByCategory("orders")}
                style={{ maxHeight: 400, overflow: "auto" }}
                renderItem={(item) => (
                  <List.Item
                    className="notification-list-item"
                    style={{
                      backgroundColor: item.read ? "transparent" : "#f5f5f5",
                      padding: "8px 16px",
                      cursor: "pointer",
                    }}
                    onClick={() => markAsRead(item.id)}
                  >
                    <List.Item.Meta
                      avatar={
                        item.type === "success" ? (
                          <CheckCircleOutlined style={{ color: "#52c41a" }} />
                        ) : item.type === "warning" ? (
                          <WarningOutlined style={{ color: "#faad14" }} />
                        ) : (
                          <InfoCircleOutlined style={{ color: "#1890ff" }} />
                        )
                      }
                      title={item.title}
                      description={
                        <Space direction="vertical" size={0}>
                          <Typography.Text
                            type="secondary"
                            style={{ fontSize: "12px" }}
                          >
                            {item.message}
                          </Typography.Text>
                          <Typography.Text
                            type="secondary"
                            style={{ fontSize: "12px" }}
                          >
                            {new Date(item.timestamp).toLocaleString()}
                          </Typography.Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                locale={{
                  emptyText: (
                    <div style={{ textAlign: "center", padding: "24px" }}>
                      <Typography.Text type="secondary">
                        No order notifications
                      </Typography.Text>
                    </div>
                  ),
                }}
              />
            ),
          },
        ]}
      />
    </div>
  );

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/menu",
      icon: <MenuOutlined />,
      label: "Menu",
    },
    {
      key: "/orders",
      icon: <ShoppingCartOutlined />,
      label: "Orders",
    },
    {
      key: "/customers",
      icon: <UsergroupAddOutlined />,
      label: "Customers",
    },
    {
      key: "/reports",
      icon: <BarChartOutlined />,
      label: "Reports",
    },
    {
      key: "/staff",
      icon: <TeamOutlined />,
      label: "Staff",
    },
    {
      key: "/profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: () => {
        dispatch(logout());
        navigate("/login");
      },
    },
  ];

  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="light"
          style={{
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "block",
          }}
          className="main-sider"
        >
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Typography.Title level={4} style={{ margin: 0, color: "#e65100" }}>
              {collapsed ? "RMS" : "Black Parrot"}
            </Typography.Title>
          </div>
          <Menu
            theme="light"
            selectedKeys={[location.pathname]}
            mode="inline"
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              padding: "0 24px",
              background: colorBgContainer,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Space size={24}>
              <Popover
                content={notificationContent}
                trigger="click"
                placement="bottomRight"
                arrow={{ pointAtCenter: true }}
              >
                <Badge
                  count={unreadCount}
                  size="small"
                  className="notification-badge"
                >
                  <Button
                    type="text"
                    icon={<BellOutlined style={{ fontSize: "20px" }} />}
                    style={{ padding: "4px 8px" }}
                  />
                </Badge>
              </Popover>
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
              >
                <Space style={{ cursor: "pointer" }}>
                  <Avatar icon={<UserOutlined />} />
                  <Typography.Text strong>{user?.name}</Typography.Text>
                </Space>
              </Dropdown>
            </Space>
          </Header>
          <Content
            style={{
              margin: "24px 16px",
              padding: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              minHeight: 280,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-bottom-nav">
        {menuItems.map((item) => (
          <div
            key={item.key}
            className={`mobile-nav-item${
              location.pathname === item.key ? " active" : ""
            }`}
            onClick={() => navigate(item.key)}
          >
            {item.icon}
            <span className="mobile-nav-label">{item.label}</span>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 600px) {
          .main-sider {
            display: none !important;
          }
          .mobile-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100vw;
            height: 60px;
            background: #fff;
            box-shadow: 0 -2px 8px rgba(0,0,0,0.08);
            z-index: 1000;
            justify-content: space-around;
            align-items: center;
            border-top: 1px solid #eee;
          }
          .mobile-nav-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #888;
            font-size: 22px;
            cursor: pointer;
            transition: color 0.2s;
            height: 100%;
          }
          .mobile-nav-item.active {
            color: #e65100;
            font-weight: 600;
            background: #fff8e1;
          }
          .mobile-nav-label {
            font-size: 10px;
            margin-top: 2px;
            display: block;
          }
        }
        @media (min-width: 601px) {
          .mobile-bottom-nav {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default AppLayout;
