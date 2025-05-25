import axios from "axios";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: "/api", // This will be proxied by Nginx
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies
});

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // If no token is found, redirect to login
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }
  return config;
});

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return { data: response.data };
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login on authentication error
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;
    console.error("API Error:", errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => {
    // If the input looks like a phone number, send it as phone, otherwise as email
    const isPhone = /^[0-9+\-\s()]*$/.test(credentials.email);
    const data = isPhone
      ? { phone: credentials.email, password: credentials.password }
      : { email: credentials.email, password: credentials.password };
    return axiosInstance.post("/auth/login", data);
  },
  register: (userData) => axiosInstance.post("/auth/register", userData),
  getProfile: () => axiosInstance.get("/auth/profile"),
  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },
};

// Meals API
export const mealsAPI = {
  getAll: () => axiosInstance.get("/meals"),
  create: (mealData) => axiosInstance.post("/meals", mealData),
  update: (id, mealData) => axiosInstance.put(`/meals/${id}`, mealData),
  delete: (id) => axiosInstance.delete(`/meals/${id}`),
};

// Orders API
export const ordersAPI = {
  getAll: () => axiosInstance.get("/orders"),
  create: (orderData) => axiosInstance.post("/orders", orderData),
  update: (id, orderData) => axiosInstance.put(`/orders/${id}`, orderData),
  delete: (id) => axiosInstance.delete(`/orders/${id}`),
};

// Reports API
export const reportsAPI = {
  getSalesReport: (params) => axiosInstance.get("/reports/sales", { params }),
  getCustomerAnalytics: (params) =>
    axiosInstance.get("/reports/customers", { params }),
  getPeakHours: (params) =>
    axiosInstance.get("/reports/peak-hours", { params }),
  getRecentOrders: () => axiosInstance.get("/reports/recent-orders"),
  getPopularMeals: () => axiosInstance.get("/reports/popular-meals"),
  getSalesAnalytics: (params) =>
    axiosInstance.get("/reports/sales-analytics", { params }),
  getPerformanceStats: (params) =>
    axiosInstance.get("/reports/performance-stats", { params }),
};

// Staff API
export const staffAPI = {
  getAll: () => axiosInstance.get("/staff"),
  create: (staffData) => axiosInstance.post("/staff", staffData),
  update: (id, staffData) => axiosInstance.put(`/staff/${id}`, staffData),
  delete: (id) => axiosInstance.delete(`/staff/${id}`),
};

export default axiosInstance;
