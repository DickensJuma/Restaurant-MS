import React, { useState, useEffect } from "react";
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
  Radio,
  notification,
} from "antd";
import {
  DownloadOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  UserOutlined,
  UserAddOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
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
import dayjs from "dayjs";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("chart");
  const [dateFilter, setDateFilter] = useState("custom");

  // Fetch initial data when component mounts
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch data when report type changes
  useEffect(() => {
    if (reportType) {
      fetchData();
    }
  }, [reportType]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const startDate = dayjs().startOf("month").format("YYYY-MM-DD");
      const endDate = dayjs().endOf("month").format("YYYY-MM-DD");
      const response = await reportsAPI.getSalesReport({
        startDate,
        endDate,
      });
      console.log("Initial sales data:", response.data);

      if (response?.data) {
        setReportData(response.data);
      } else {
        // Initialize with empty data structure if no data is available
        setReportData({
          dailySales: [],
          summary: {
            totalSales: 0,
            totalOrders: 0,
            averageOrderValue: 0,
          },
          tableData: [],
          columns: [
            { title: "Date", dataIndex: "date", key: "date" },
            { title: "Sales", dataIndex: "sales", key: "sales" },
            { title: "Orders", dataIndex: "orders", key: "orders" },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setError(error.message);
      message.error("Failed to fetch initial data");
      // Initialize with empty data structure on error
      setReportData({
        dailySales: [],
        summary: {
          totalSales: 0,
          totalOrders: 0,
          averageOrderValue: 0,
        },
        tableData: [],
        columns: [
          { title: "Date", dataIndex: "date", key: "date" },
          { title: "Sales", dataIndex: "sales", key: "sales" },
          { title: "Orders", dataIndex: "orders", key: "orders" },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      let response;
      const today = dayjs().format("YYYY-MM-DD");

      switch (reportType) {
        case "sales":
          response = await reportsAPI.getSalesReport({
            startDate: today,
            endDate: today,
          });
          break;
        case "customer-analytics":
          response = await reportsAPI.getCustomerAnalytics({
            startDate: today,
            endDate: today,
          });
          break;
        case "peak-hours":
          response = await reportsAPI.getPeakHours({
            startDate: today,
            endDate: today,
          });
          break;
        default:
          throw new Error("Invalid report type");
      }

      if (response?.data) {
        setReportData(response.data);
      } else {
        // Initialize with empty data structure if no data is available
        setReportData({
          dailySales: [],
          summary: {
            totalSales: 0,
            totalOrders: 0,
            averageOrderValue: 0,
          },
          tableData: [],
          columns: [
            { title: "Date", dataIndex: "date", key: "date" },
            { title: "Sales", dataIndex: "sales", key: "sales" },
            { title: "Orders", dataIndex: "orders", key: "orders" },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      setError(error.message);
      message.error("Failed to fetch report data");
      // Initialize with empty data structure on error
      setReportData({
        dailySales: [],
        summary: {
          totalSales: 0,
          totalOrders: 0,
          averageOrderValue: 0,
        },
        tableData: [],
        columns: [
          { title: "Date", dataIndex: "date", key: "date" },
          { title: "Sales", dataIndex: "sales", key: "sales" },
          { title: "Orders", dataIndex: "orders", key: "orders" },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (filter) => {
    const now = dayjs();
    let startDate, endDate;

    switch (filter) {
      case "today":
        startDate = now.startOf("day");
        endDate = now.endOf("day");
        break;
      case "week":
        startDate = now.startOf("week");
        endDate = now.endOf("week");
        break;
      case "month":
        startDate = now.startOf("month");
        endDate = now.endOf("month");
        break;
      case "custom": {
        const currentRange = form.getFieldValue("dateRange");
        if (currentRange && currentRange[0] && currentRange[1]) {
          startDate = dayjs(currentRange[0]);
          endDate = dayjs(currentRange[1]);
        } else {
          startDate = now.subtract(7, "day");
          endDate = now;
        }
        break;
      }
      default:
        startDate = now.subtract(7, "day");
        endDate = now;
    }

    return [startDate, endDate];
  };

  const showNotification = (type, title, message) => {
    notification[type]({
      message: title,
      description: message,
      placement: "topRight",
      duration: 4.5,
      icon:
        type === "success" ? (
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
        ) : (
          <InfoCircleOutlined style={{ color: "#1890ff" }} />
        ),
    });
  };

  const handleDateFilterChange = (e) => {
    const filter = e.target.value;
    setDateFilter(filter);
    const [startDate, endDate] = getDateRange(filter);
    form.setFieldsValue({ dateRange: [startDate, endDate] });
    showNotification("info", "Date Range Updated", `Changed to ${filter} view`);
    handleGenerateReport({
      ...form.getFieldsValue(),
      dateRange: [startDate, endDate],
    });
  };

  const handleGenerateReport = async (values) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      const { dateRange } = values;

      if (!dateRange || !Array.isArray(dateRange) || dateRange.length !== 2) {
        throw new Error("Please select a valid date range");
      }

      const [startDate, endDate] = dateRange;

      // Validate that both dates are dayjs objects
      if (!dayjs.isDayjs(startDate) || !dayjs.isDayjs(endDate)) {
        throw new Error("Invalid date format");
      }

      // Check if dates are valid
      if (!startDate.isValid() || !endDate.isValid()) {
        throw new Error("Invalid date range selected");
      }

      // Check if end date is after start date
      if (endDate.isBefore(startDate)) {
        throw new Error("End date must be after start date");
      }

      const formattedStartDate = startDate.format("YYYY-MM-DD");
      const formattedEndDate = endDate.format("YYYY-MM-DD");

      showNotification(
        "info",
        "Generating Report",
        "Please wait while we fetch your report data..."
      );

      switch (reportType) {
        case "sales":
          response = await reportsAPI.getSalesReport({
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          });
          break;
        case "customer-analytics":
          response = await reportsAPI.getCustomerAnalytics({
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          });
          break;
        case "peak-hours":
          response = await reportsAPI.getPeakHours({
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          });
          break;
        default:
          throw new Error("Invalid report type");
      }
      setReportData(response.data);
      showNotification(
        "success",
        "Report Generated",
        `Successfully generated ${reportType} report for the selected period.`
      );
    } catch (error) {
      console.error("Error generating report:", error);
      setError(error.message);
      showNotification(
        "error",
        "Error",
        `Failed to generate report: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    if (!reportData) {
      showNotification(
        "error",
        "Export Failed",
        "Please generate a report first"
      );
      return;
    }

    try {
      const formattedData = formatReportData(reportData, reportType);
      const filename = `${reportType}-report-${dayjs().format("YYYY-MM-DD")}`;

      if (format === "Excel") {
        exportToExcel(formattedData.data, filename);
        showNotification(
          "success",
          "Export Successful",
          "Report exported to Excel successfully"
        );
      } else if (format === "PDF") {
        exportToPDF(
          formattedData.data,
          formattedData.columns,
          filename,
          reportType
        );
        showNotification(
          "success",
          "Export Successful",
          "Report exported to PDF successfully"
        );
      }
    } catch (error) {
      showNotification(
        "error",
        "Export Failed",
        `Failed to export report: ${error.message}`
      );
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
            <BarChart data={reportData.dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip
                formatter={(value, name) => [
                  name === "amount" ? formatCurrency(value) : value,
                  name === "amount" ? "Sales" : "Orders",
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="amount"
                fill="#8884d8"
                name="Sales"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="orders"
                fill="#82ca9d"
                name="Orders"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
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

    console.log("Rendering summary with data:", reportData); // Debug log

    switch (reportType) {
      case "sales": {
        const totalSales = reportData.summary?.totalSales || 0;
        const totalOrders = reportData.summary?.totalOrders || 0;
        const averageOrderValue = reportData.summary?.averageOrderValue || 0;

        console.log("Sales summary:", {
          totalSales,
          totalOrders,
          averageOrderValue,
        }); // Debug log

        return (
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Sales"
                  value={totalSales}
                  formatter={(value) => formatCurrency(value)}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: totalSales > 0 ? "#3f8600" : "#cf1322" }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Orders"
                  value={totalOrders}
                  prefix={<LineChartOutlined />}
                  valueStyle={{
                    color: totalOrders > 0 ? "#3f8600" : "#cf1322",
                  }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Average Order Value"
                  value={averageOrderValue}
                  formatter={(value) => formatCurrency(value)}
                  prefix={<PieChartOutlined />}
                  valueStyle={{
                    color: averageOrderValue > 0 ? "#3f8600" : "#cf1322",
                  }}
                />
              </Card>
            </Col>
          </Row>
        );
      }
      case "customer-analytics":
        return (
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Customers"
                  value={reportData.summary?.totalCustomers || 0}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="New Customers"
                  value={reportData.summary?.newCustomers || 0}
                  prefix={<UserAddOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Returning Customers"
                  value={reportData.summary?.returningCustomers || 0}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
          </Row>
        );
      case "peak-hours":
        return (
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Busiest Hour"
                  value={reportData.summary?.busiestHour || "N/A"}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Orders"
                  value={reportData.summary?.totalOrders || 0}
                  prefix={<ShoppingCartOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Average Orders/Hour"
                  value={reportData.summary?.averageOrdersPerHour || 0}
                  precision={2}
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
          </Row>
        );
      default:
        return null;
    }
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
              <Button icon={<DownloadOutlined />} disabled={!reportData}>
                Export
              </Button>
            </Dropdown>
          </Space>
        </Col>
      </Row>

      <Card style={{ marginBottom: "24px" }}>
        <Form
          form={form}
          onFinish={handleGenerateReport}
          layout="vertical"
          initialValues={{
            reportType: "sales",
            dateRange: [dayjs().startOf("month"), dayjs().endOf("month")],
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="reportType" label="Report Type">
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
                  {
                    validator: (_, value) => {
                      if (
                        !value ||
                        !Array.isArray(value) ||
                        value.length !== 2
                      ) {
                        return Promise.reject(
                          "Please select a valid date range"
                        );
                      }

                      const [startDate, endDate] = value;

                      if (
                        !dayjs.isDayjs(startDate) ||
                        !dayjs.isDayjs(endDate)
                      ) {
                        return Promise.reject("Invalid date format");
                      }

                      if (!startDate.isValid() || !endDate.isValid()) {
                        return Promise.reject("Invalid date range selected");
                      }

                      if (endDate.isBefore(startDate)) {
                        return Promise.reject(
                          "End date must be after start date"
                        );
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Radio.Group
                    value={dateFilter}
                    onChange={handleDateFilterChange}
                    buttonStyle="solid"
                  >
                    <Radio.Button value="today">Today</Radio.Button>
                    <Radio.Button value="week">This Week</Radio.Button>
                    <Radio.Button value="month">This Month</Radio.Button>
                    <Radio.Button value="custom">Custom Range</Radio.Button>
                  </Radio.Group>
                  <RangePicker
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                    disabled={dateFilter !== "custom"}
                    onChange={(dates) => {
                      if (dates) {
                        setDateFilter("custom");
                        form.setFieldsValue({ dateRange: dates });
                        handleGenerateReport({
                          ...form.getFieldsValue(),
                          dateRange: dates,
                        });
                      }
                    }}
                    getValueProps={(value) => ({
                      value: value ? dayjs(value) : null,
                    })}
                  />
                </Space>
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
            {reportData ? "Updating report..." : "Loading initial data..."}
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
