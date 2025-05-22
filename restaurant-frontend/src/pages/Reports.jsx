import React, { useState } from 'react';
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
  Col
} from 'antd';
import { reportsAPI } from '../services/api';

const { Option } = Select;
const { Title } = Typography;

function Reports() {
  const [form] = Form.useForm();
  const [reportType, setReportType] = useState('sales');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateReport = async (values) => {
    setLoading(true);
    try {
      let response;
      const { startDate, endDate } = values;

      switch (reportType) {
        case 'sales':
          response = await reportsAPI.getSalesReport({
            startDate: startDate.format('YYYY-MM-DD'),
            endDate: endDate.format('YYYY-MM-DD'),
          });
          break;
        case 'customer-analytics':
          response = await reportsAPI.getCustomerAnalytics({
            startDate: startDate.format('YYYY-MM-DD'),
            endDate: endDate.format('YYYY-MM-DD'),
          });
          break;
        case 'peak-hours':
          response = await reportsAPI.getPeakHours({
            startDate: startDate.format('YYYY-MM-DD'),
            endDate: endDate.format('YYYY-MM-DD'),
          });
          break;
      }
      setReportData(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Reports</Title>

      <Card style={{ marginBottom: '24px' }}>
        <Form
          form={form}
          onFinish={handleGenerateReport}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item
                name="reportType"
                label="Report Type"
                initialValue="sales"
              >
                <Select onChange={(value) => setReportType(value)}>
                  <Option value="sales">Sales Report</Option>
                  <Option value="customer-analytics">Customer Analytics</Option>
                  <Option value="peak-hours">Peak Hours</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="startDate"
                label="Start Date"
                rules={[{ required: true, message: 'Please select start date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="endDate"
                label="End Date"
                rules={[{ required: true, message: 'Please select end date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label=" " colon={false}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ width: '100%' }}
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
          style={{ marginBottom: '16px' }}
        />
      )}

      {reportData && (
        <Card>
          <Title level={4}>Report Results</Title>
          <pre style={{ overflow: 'auto' }}>
            {JSON.stringify(reportData, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}

export default Reports;