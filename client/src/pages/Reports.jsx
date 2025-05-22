import React, { useState } from "react";
import {
  Card,
  Form,
  Select,
  DatePicker,
  Button,
  Space,
  Spin,
  Alert,
  Typography,
  Row,
  Col,
  Tabs,
  Statistic,
  Table,
  Menu,
  Dropdown,
  message,
} from "antd";
import {
  DownloadOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { reportsAPI } from "../services/api";
import {
  exportToExcel,
  exportToPDF,
  formatReportData,
} from "../utils/exportUtils";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// Currency formatter
const formatCurrency = (value) => {
  return `KES ${Number(value).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

function Reports() {
  const [form] = Form.useForm();
  const [reportType, setReportType] = useState("sales");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("chart");

  const handleGenerateReport = async (values) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      const { dateRange } = values;
      const [startDate, endDate] = dateRange;

      switch (reportType) {
        case "sales":
          response = await reportsAPI.getSalesReport({
            startDate: startDate.format("YYYY-MM-DD"),
            endDate: endDate.format("YYYY-MM-DD"),
          });
          break;
        case "customer-analytics":
          response = await reportsAPI.getCustomerAnalytics({
            startDate: startDate.format("YYYY-MM-DD"),
            endDate: endDate.format("YYYY-MM-DD"),
          });
          break;
        case "peak-hours":
          response = await reportsAPI.getPeakHours({
            startDate: startDate.format("YYYY-MM-DD"),
            endDate: endDate.format("YYYY-MM-DD"),
          });
          break;
      }
      setReportData(response.data);
    } catch (error) {
      setError(error.message);
      message.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    if (!reportData) {
      message.error("Please generate a report first");
      return;
    }

    try {
      const formattedData = formatReportData(reportData, reportType);
      const filename = `${reportType}-report-${
        new Date().toISOString().split("T")[0]
      }`;

      if (format === "Excel") {
        exportToExcel(formattedData.data, filename);
        message.success("Report exported to Excel successfully");
      } else if (format === "PDF") {
        exportToPDF(
          formattedData.data,
          formattedData.columns,
          filename,
          reportType
        );
        message.success("Report exported to PDF successfully");
      }
    } catch (error) {
      message.error("Failed to export report: " + error.message);
      console.error("Export error:", error);
    }
  };

  const exportMenu = (
    <Menu>
      <Menu.Item
        key="excel"
        icon={<FileExcelOutlined />}
        onClick={() => handleExport("Excel")}
      >
        Export as Excel
      </Menu.Item>
      <Menu.Item
        key="pdf"
        icon={<FilePdfOutlined />}
        onClick={() => handleExport("PDF")}
      >
        Export as PDF
      </Menu.Item>
    </Menu>
  );

  const renderChart = () => {
    if (!reportData) return null;

    switch (reportType) {
      case "sales":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={reportData.dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                tickFormatter={(value) =>
                  `KES ${value.toLocaleString("en-KE")}`
                }
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8884d8"
                name="Sales"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "customer-analytics":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={reportData.customerSegments}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case "peak-hours":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reportData.hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#82ca9d" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const renderSummary = () => {
    if (!reportData) return null;

    return (
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Sales"
              value={reportData.summary?.totalSales || 0}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Orders"
              value={reportData.summary?.totalOrders || 0}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Average Order Value"
              value={reportData.summary?.averageOrderValue || 0}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: "24px" }}
      >
        <Col>
          <Title level={2}>Reports & Analytics</Title>
        </Col>
        <Col>
          <Space>
            <Dropdown overlay={exportMenu} trigger={["click"]}>
              <Button icon={<DownloadOutlined />}>Export</Button>
            </Dropdown>
          </Space>
        </Col>
      </Row>

      <Card style={{ marginBottom: "24px" }}>
        <Form form={form} onFinish={handleGenerateReport} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="reportType"
                label="Report Type"
                initialValue="sales"
              >
                <Select onChange={(value) => setReportType(value)}>
                  <Option value="sales">
                    <Space>
                      <LineChartOutlined />
                      Sales Report
                    </Space>
                  </Option>
                  <Option value="customer-analytics">
                    <Space>
                      <PieChartOutlined />
                      Customer Analytics
                    </Space>
                  </Option>
                  <Option value="peak-hours">
                    <Space>
                      <BarChartOutlined />
                      Peak Hours
                    </Space>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="dateRange"
                label="Date Range"
                rules={[
                  { required: true, message: "Please select date range" },
                ]}
              >
                <RangePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label=" " colon={false}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ width: "100%" }}
                >
                  Generate Report
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: "16px" }}
        />
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <Text style={{ display: "block", marginTop: "16px" }}>
            Generating report...
          </Text>
        </div>
      ) : (
        reportData && (
          <>
            {renderSummary()}
            <Card style={{ marginTop: "24px" }}>
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="Chart View" key="chart">
                  {renderChart()}
                </TabPane>
                <TabPane tab="Data Table" key="table">
                  <Table
                    dataSource={reportData.tableData}
                    columns={reportData.columns}
                    scroll={{ x: true }}
                    pagination={{ pageSize: 10 }}
                  />
                </TabPane>
              </Tabs>
            </Card>
          </>
        )
      )}
    </div>
  );
}

export default Reports;
