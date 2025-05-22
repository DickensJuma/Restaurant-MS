const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

// Mock data
const mockData = {
  users: [
    {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      role: "owner"
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      password: "password123",
      role: "staff"
    }
  ],
  meals: [
    {
      name: "Margherita Pizza",
      category: "Italian",
      price: 12.99,
      available: true
    },
    {
      name: "Chicken Burger",
      category: "Fast Food",
      price: 8.99,
      available: true
    },
    {
      name: "Caesar Salad",
      category: "Salads",
      price: 7.99,
      available: true
    }
  ],
  orders: [
    {
      meals: [
        { mealId: null, quantity: 2, price: 12.99 },
        { mealId: null, quantity: 1, price: 8.99 }
      ],
      total: 34.97,
      status: "completed"
    },
    {
      meals: [
        { mealId: null, quantity: 1, price: 7.99 }
      ],
      total: 7.99,
      status: "pending"
    }
  ]
};

// Test configuration
const API_URL = 'http://localhost:3000/api';
let authToken;
let createdMealIds = [];
let createdOrderIds = [];

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to handle errors
const handleError = (error, step) => {
  console.error(`❌ Error during ${step}:`);
  if (error.response) {
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
  } else if (error.request) {
    console.error('No response received:', error.request);
  } else {
    console.error('Error message:', error.message);
  }
  throw error;
};

// Test user journey
async function testUserJourney() {
  try {
    console.log('🚀 Starting test journey...\n');

    // 1. Register and Login
    console.log('1. Testing user registration and login...');
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, mockData.users[0]);
      console.log('✅ User registered successfully');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
        console.log('ℹ️ User already exists, proceeding with login...');
      } else {
        handleError(error, 'user registration');
      }
    }

    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: mockData.users[0].email,
        password: mockData.users[0].password
      });
      authToken = loginResponse.data.token;
      console.log('✅ User logged in successfully\n');
    } catch (error) {
      handleError(error, 'user login');
    }

    // 2. Create Meals
    console.log('2. Testing meal creation...');
    for (const meal of mockData.meals) {
      try {
        const response = await axios.post(`${API_URL}/meals`, meal, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        createdMealIds.push(response.data._id);
        console.log(`✅ Created meal: ${meal.name}`);
      } catch (error) {
        handleError(error, `meal creation for ${meal.name}`);
      }
    }
    console.log('');

    // 3. Create Orders
    console.log('3. Testing order creation...');
    for (const order of mockData.orders) {
      try {
        // Update meal IDs in the order
        const orderWithMealIds = {
          ...order,
          meals: order.meals.map((meal, index) => ({
            ...meal,
            mealId: createdMealIds[index % createdMealIds.length]
          }))
        };

        const response = await axios.post(`${API_URL}/orders`, orderWithMealIds, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        createdOrderIds.push(response.data._id);
        console.log(`✅ Created order with total: $${order.total}`);
      } catch (error) {
        handleError(error, `order creation for total $${order.total}`);
      }
    }
    console.log('');

    // 4. Test Reports
    console.log('4. Testing reports...');
    
    try {
      // Customer Analytics
      const customerAnalytics = await axios.get(
        `${API_URL}/reports/customer-analytics?startDate=2024-03-01&endDate=2024-03-20`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('✅ Customer analytics report generated');
    } catch (error) {
      handleError(error, 'customer analytics report generation');
    }

    try {
      // Peak Hours
      const peakHours = await axios.get(
        `${API_URL}/reports/peak-hours?startDate=2024-03-01&endDate=2024-03-20`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('✅ Peak hours report generated');
    } catch (error) {
      handleError(error, 'peak hours report generation');
    }

    try {
      // Export Excel
      const excelReport = await axios.get(
        `${API_URL}/reports/export/excel?reportType=sales&startDate=2024-03-01&endDate=2024-03-20`,
        { 
          headers: { Authorization: `Bearer ${authToken}` },
          responseType: 'arraybuffer'
        }
      );
      console.log('✅ Excel report exported');
    } catch (error) {
      handleError(error, 'excel report export');
    }

    try {
      // Schedule Report
      const scheduledReport = await axios.post(
        `${API_URL}/reports/schedule`,
        {
          reportType: 'sales',
          schedule: '0 0 * * *', // Daily at midnight
          email: 'admin@example.com',
          format: 'excel'
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('✅ Report scheduled successfully\n');
    } catch (error) {
      handleError(error, 'report scheduling');
    }

    console.log('🎉 Test journey completed successfully!');
  } catch (error) {
    console.error('❌ Test journey failed:', error.message);
  }
}

// Run the test
testUserJourney(); 