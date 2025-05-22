import { mockData } from "./mockData";

export const mockApi = {
  // Auth
  login: async (credentials) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const user = mockData.users.find((u) => u.email === credentials.email);
    if (user && user.password === credentials.password) {
      return {
        data: {
          user: { ...user, password: undefined },
          token: "mock-jwt-token",
        },
      };
    }
    throw new Error("Invalid credentials");
  },

  register: async (userData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      data: {
        user: { ...userData, _id: `user_${Date.now()}` },
        token: "mock-jwt-token",
      },
    };
  },

  // Meals
  getMeals: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { data: mockData.meals };
  },

  createMeal: async (mealData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newMeal = {
      _id: `meal_${Date.now()}`,
      ...mealData,
      createdAt: new Date().toISOString(),
    };
    mockData.meals.push(newMeal);
    return { data: newMeal };
  },

  updateMeal: async (id, mealData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockData.meals.findIndex((meal) => meal._id === id);
    if (index !== -1) {
      mockData.meals[index] = {
        ...mockData.meals[index],
        ...mealData,
        updatedAt: new Date().toISOString(),
      };
      return { data: mockData.meals[index] };
    }
    throw new Error("Meal not found");
  },

  deleteMeal: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockData.meals.findIndex((meal) => meal._id === id);
    if (index !== -1) {
      mockData.meals.splice(index, 1);
      return { data: { message: "Meal deleted successfully" } };
    }
    throw new Error("Meal not found");
  },

  // Orders
  getOrders: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { data: mockData.orders };
  },

  createOrder: async (orderData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newOrder = {
      _id: `order_${Date.now()}`,
      ...orderData,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    mockData.orders.push(newOrder);
    return { data: newOrder };
  },

  updateOrder: async (id, orderData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockData.orders.findIndex((order) => order._id === id);
    if (index !== -1) {
      mockData.orders[index] = {
        ...mockData.orders[index],
        ...orderData,
        updatedAt: new Date().toISOString(),
      };
      return { data: mockData.orders[index] };
    }
    throw new Error("Order not found");
  },

  deleteOrder: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockData.orders.findIndex((order) => order._id === id);
    if (index !== -1) {
      mockData.orders.splice(index, 1);
      return { data: { message: "Order deleted successfully" } };
    }
    throw new Error("Order not found");
  },

  // Reports
  getSalesReport: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const {
      startDate = new Date().toISOString().split("T")[0],
      endDate = new Date().toISOString().split("T")[0],
    } = params;

    // Generate daily sales data
    const dailySales = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    let currentDate = new Date(start);

    while (currentDate <= end) {
      dailySales.push({
        date: currentDate.toISOString().split("T")[0],
        amount: Math.floor(Math.random() * 5000) + 1000,
        orders: Math.floor(Math.random() * 50) + 10,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      data: {
        summary: {
          totalSales: dailySales.reduce((sum, day) => sum + day.amount, 0),
          totalOrders: dailySales.reduce((sum, day) => sum + day.orders, 0),
          averageOrderValue: Math.floor(
            dailySales.reduce((sum, day) => sum + day.amount, 0) /
              dailySales.reduce((sum, day) => sum + day.orders, 0)
          ),
        },
        dailySales,
        tableData: dailySales.map((day) => ({
          key: day.date,
          date: day.date,
          sales: `$${day.amount.toFixed(2)}`,
          orders: day.orders,
        })),
        columns: [
          { title: "Date", dataIndex: "date", key: "date" },
          { title: "Sales", dataIndex: "sales", key: "sales" },
          { title: "Orders", dataIndex: "orders", key: "orders" },
        ],
      },
    };
  },

  getCustomerAnalytics: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const {
      startDate = new Date().toISOString().split("T")[0],
      endDate = new Date().toISOString().split("T")[0],
    } = params;

    // Filter customer data based on date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    const customerSegments = [
      { name: "New Customers", value: 35 },
      { name: "Returning Customers", value: 45 },
      { name: "Loyal Customers", value: 20 },
    ];

    const customerData = Array.from({ length: 50 }, (_, i) => {
      const lastVisit = new Date(
        Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
      );
      return {
        key: i,
        customerId: `CUST${i + 1000}`,
        name: `Customer ${i + 1}`,
        orders: Math.floor(Math.random() * 10) + 1,
        totalSpent: Math.floor(Math.random() * 1000) + 100,
        lastVisit: lastVisit.toISOString().split("T")[0],
      };
    }).filter((customer) => {
      const visitDate = new Date(customer.lastVisit);
      return visitDate >= start && visitDate <= end;
    });

    return {
      data: {
        summary: {
          totalCustomers: customerData.length,
          averageOrderValue: Math.floor(
            customerData.reduce((sum, c) => sum + c.totalSpent, 0) /
              customerData.reduce((sum, c) => sum + c.orders, 0)
          ),
          newCustomers: Math.floor(customerData.length * 0.3),
        },
        customerSegments,
        tableData: customerData,
        columns: [
          { title: "Customer ID", dataIndex: "customerId", key: "customerId" },
          { title: "Name", dataIndex: "name", key: "name" },
          { title: "Orders", dataIndex: "orders", key: "orders" },
          {
            title: "Total Spent",
            dataIndex: "totalSpent",
            key: "totalSpent",
            render: (value) => `$${value.toFixed(2)}`,
          },
          { title: "Last Visit", dataIndex: "lastVisit", key: "lastVisit" },
        ],
      },
    };
  },

  getPeakHours: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const {
      startDate = new Date().toISOString().split("T")[0],
      endDate = new Date().toISOString().split("T")[0],
    } = params;

    // Generate hourly data for the date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, "0");
      // Multiply by days to get total orders across the date range
      return {
        hour: `${hour}:00`,
        orders:
          (Math.floor(Math.random() * 30) +
            (i >= 11 && i <= 14 ? 20 : 0) +
            (i >= 17 && i <= 20 ? 25 : 0)) *
          daysDiff,
      };
    });

    return {
      data: {
        summary: {
          busiestHour: hours.reduce(
            (max, h) => (h.orders > max.orders ? h : max),
            hours[0]
          ).hour,
          totalOrders: hours.reduce((sum, h) => sum + h.orders, 0),
          averageOrdersPerHour: Math.floor(
            hours.reduce((sum, h) => sum + h.orders, 0) / 24
          ),
        },
        hourlyData: hours,
        tableData: hours.map((h) => ({
          key: h.hour,
          hour: h.hour,
          orders: h.orders,
          percentage: `${Math.floor(
            (h.orders / hours.reduce((sum, h) => sum + h.orders, 0)) * 100
          )}%`,
        })),
        columns: [
          { title: "Hour", dataIndex: "hour", key: "hour" },
          { title: "Orders", dataIndex: "orders", key: "orders" },
          { title: "Percentage", dataIndex: "percentage", key: "percentage" },
        ],
      },
    };
  },

  getRecentOrders: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      data: mockData.orders.slice(0, 5).map((order) => ({
        ...order,
        customerName: order.customerName || "Walk-in Customer",
      })),
    };
  },

  getPopularMeals: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      data: [
        { name: "Chicken Burger", count: 45 },
        { name: "Pizza", count: 38 },
        { name: "French Fries", count: 32 },
        { name: "Salad", count: 25 },
        { name: "Ice Cream", count: 20 },
      ],
    };
  },

  getSalesAnalytics: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { period = "daily" } = params;
    const data = [];
    const now = new Date();
    let daysToGenerate;

    switch (period) {
      case "weekly":
        daysToGenerate = 7;
        break;
      case "monthly":
        daysToGenerate = 30;
        break;
      default:
        daysToGenerate = 7;
    }

    for (let i = daysToGenerate - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split("T")[0],
        amount: Math.floor(Math.random() * 1000) + 500,
        type: "Sales",
      });
    }

    return { data };
  },
};
