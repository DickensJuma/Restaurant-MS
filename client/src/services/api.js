// import axios from 'axios';

// const API_URL = 'http://localhost:3000/api';

// const api = axios.create({
//   baseURL: API_URL,
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export const authAPI = {
//   login: (credentials) => api.post('/auth/login', credentials),
//   register: (userData) => api.post('/auth/register', userData),
// };

// export const mealsAPI = {
//   getAll: () => api.get('/meals'),
//   create: (mealData) => api.post('/meals', mealData),
//   update: (id, mealData) => api.put(`/meals/${id}`, mealData),
//   delete: (id) => api.delete(`/meals/${id}`),
// };

// export const ordersAPI = {
//   getAll: () => api.get('/orders'),
//   create: (orderData) => api.post('/orders', orderData),
//   update: (id, orderData) => api.put(`/orders/${id}`, orderData),
//   delete: (id) => api.delete(`/orders/${id}`),
// };

// export const reportsAPI = {
//   getSalesReport: (params) => api.get('/reports/sales', { params }),
//   getCustomerAnalytics: (params) => api.get('/reports/customer-analytics', { params }),
//   getPeakHours: (params) => api.get('/reports/peak-hours', { params }),
// };

// export default api;
import axios from "axios";
import { mockApi } from "./mockApi";

// Vite uses import.meta.env instead of process.env
const isDevelopment = import.meta.env.MODE === "development";
const useMockData =
  isDevelopment && import.meta.env.VITE_USE_MOCK_DATA === "true";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if using real API
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;
    console.error("API Error:", errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// Auth API
export const authAPI = useMockData
  ? {
      login: (credentials) => mockApi.login(credentials),
      register: (userData) => mockApi.register(userData),
      getProfile: () => mockApi.getProfile(),
    }
  : {
      login: (credentials) => axiosInstance.post("/auth/login", credentials),
      register: (userData) => axiosInstance.post("/auth/register", userData),
      getProfile: () => axiosInstance.get("/auth/profile"),
    };

// Meals API
export const mealsAPI = useMockData
  ? {
      getAll: () => mockApi.getMeals(),
      create: (mealData) => mockApi.createMeal(mealData),
      update: (id, mealData) => mockApi.updateMeal(id, mealData),
      delete: (id) => mockApi.deleteMeal(id),
    }
  : {
      getAll: () => axiosInstance.get("/meals"),
      create: (mealData) => axiosInstance.post("/meals", mealData),
      update: (id, mealData) => axiosInstance.put(`/meals/${id}`, mealData),
      delete: (id) => axiosInstance.delete(`/meals/${id}`),
    };

// Orders API
export const ordersAPI = useMockData
  ? {
      getAll: () => mockApi.getOrders(),
      create: (orderData) => mockApi.createOrder(orderData),
      update: (id, orderData) => mockApi.updateOrder(id, orderData),
      delete: (id) => mockApi.deleteOrder(id),
    }
  : {
      getAll: () => axiosInstance.get("/orders"),
      create: (orderData) => axiosInstance.post("/orders", orderData),
      update: (id, orderData) => axiosInstance.put(`/orders/${id}`, orderData),
      delete: (id) => axiosInstance.delete(`/orders/${id}`),
    };

// Reports API
export const reportsAPI = useMockData
  ? {
      getSalesReport: (params) => mockApi.getSalesReport(params),
      getCustomerAnalytics: (params) => mockApi.getCustomerAnalytics(params),
      getPeakHours: (params) => mockApi.getPeakHours(params),
      getRecentOrders: () => mockApi.getRecentOrders(),
      getPopularMeals: () => mockApi.getPopularMeals(),
      getSalesAnalytics: (params) => mockApi.getSalesAnalytics(params),
    }
  : {
      getSalesReport: () => axiosInstance.get("/orders/sales-report"),
      getCustomerAnalytics: (params) =>
        axiosInstance.get("/reports/customers", { params }),
      getPeakHours: (params) =>
        axiosInstance.get("/reports/peak-hours", { params }),
      getRecentOrders: () => axiosInstance.get("/orders/recent"),
      getPopularMeals: () => axiosInstance.get("/orders/popular-meals"),
      getSalesAnalytics: (params) =>
        axiosInstance.get("/orders/sales-analytics", { params }),
    };

// Staff API
export const staffAPI = useMockData
  ? {
      getAll: () => mockApi.getStaff(),
      create: (staffData) => mockApi.createStaff(staffData),
      update: (id, staffData) => mockApi.updateStaff(id, staffData),
      delete: (id) => mockApi.deleteStaff(id),
    }
  : {
      getAll: () => axiosInstance.get("/staff"),
      create: (staffData) => axiosInstance.post("/staff", staffData),
      update: (id, staffData) => axiosInstance.put(`/staff/${id}`, staffData),
      delete: (id) => axiosInstance.delete(`/staff/${id}`),
    };

export default axiosInstance;
