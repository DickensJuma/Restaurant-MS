import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import { Provider } from "react-redux";
import { store } from "./store";
import { NotificationProvider } from "./context/NotificationContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Menu from "./pages/Menu";
import Orders from "./pages/Orders";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Staff from "./pages/Staff";
import Login from "./pages/Login";
import Customers from "./pages/Customers";
import ProtectedRoute from "./components/ProtectedRoute";

// Create a separate component for the app content
function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="menu" element={<Menu />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="staff" element={<Staff />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Main App component
function App() {
  return (
    <Provider store={store}>
      <ConfigProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
