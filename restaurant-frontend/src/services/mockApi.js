import { mockData } from './mockData';

export const mockApi = {
  // Auth
  login: async (credentials) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = mockData.users.find(u => u.email === credentials.email);
    if (user && user.password === credentials.password) {
      return {
        data: {
          user: { ...user, password: undefined },
          token: 'mock-jwt-token'
        }
      };
    }
    throw new Error('Invalid credentials');
  },

  register: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: {
        user: { ...userData, _id: `user_${Date.now()}` },
        token: 'mock-jwt-token'
      }
    };
  },

  // Meals
  getMeals: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: mockData.meals };
  },

  createMeal: async (mealData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newMeal = {
      _id: `meal_${Date.now()}`,
      ...mealData,
      createdAt: new Date().toISOString()
    };
    mockData.meals.push(newMeal);
    return { data: newMeal };
  },

  updateMeal: async (id, mealData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockData.meals.findIndex(meal => meal._id === id);
    if (index !== -1) {
      mockData.meals[index] = {
        ...mockData.meals[index],
        ...mealData,
        updatedAt: new Date().toISOString()
      };
      return { data: mockData.meals[index] };
    }
    throw new Error('Meal not found');
  },

  deleteMeal: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockData.meals.findIndex(meal => meal._id === id);
    if (index !== -1) {
      mockData.meals.splice(index, 1);
      return { data: { message: 'Meal deleted successfully' } };
    }
    throw new Error('Meal not found');
  },

  // Orders
  getOrders: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: mockData.orders };
  },

  createOrder: async (orderData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newOrder = {
      _id: `order_${Date.now()}`,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    mockData.orders.push(newOrder);
    return { data: newOrder };
  },

  updateOrder: async (id, orderData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockData.orders.findIndex(order => order._id === id);
    if (index !== -1) {
      mockData.orders[index] = {
        ...mockData.orders[index],
        ...orderData,
        updatedAt: new Date().toISOString()
      };
      return { data: mockData.orders[index] };
    }
    throw new Error('Order not found');
  },

  deleteOrder: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockData.orders.findIndex(order => order._id === id);
    if (index !== -1) {
      mockData.orders.splice(index, 1);
      return { data: { message: 'Order deleted successfully' } };
    }
    throw new Error('Order not found');
  },
  

  // Reports
  getSalesReport: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: {
        totalOrders: 150,
        totalRevenue: 25000,
        totalCustomers: 45,
        averageOrderValue: 166.67,
        todayOrders: 12,
        todayRevenue: 2400,
        revenueChange: 15,
        ordersChange: 8
      }
    };
  },

  getCustomerAnalytics: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: {
        totalCustomers: 120,
        newCustomers: 15,
        returningCustomers: 85,
        customerSegments: [
          { segment: 'Regular', count: 45 },
          { segment: 'Occasional', count: 60 },
          { segment: 'New', count: 15 }
        ]
      }
    };
  },

  getPeakHours: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: {
        hourlyOrders: [
          { hour: '12:00', orders: 25 },
          { hour: '13:00', orders: 35 },
          { hour: '14:00', orders: 20 },
          { hour: '18:00', orders: 30 },
          { hour: '19:00', orders: 40 },
          { hour: '20:00', orders: 25 }
        ]
      }
    };
  },

  getRecentOrders: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: mockData.orders.slice(0, 5).map(order => ({
        ...order,
        customerName: order.customerName || 'Walk-in Customer',
      }))
    };
  },

  getPopularMeals: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: [
        { name: 'Chicken Burger', count: 45 },
        { name: 'Pizza', count: 38 },
        { name: 'French Fries', count: 32 },
        { name: 'Salad', count: 25 },
        { name: 'Ice Cream', count: 20 },
      ]
    };
  },

  getSalesAnalytics: async ({ period }) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 1000) + 500,
        type: 'Sales'
      });
    }
    
    return { data };
  },
};
