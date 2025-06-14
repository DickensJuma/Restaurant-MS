const Order = require("../models/Order");
const Meal = require("../models/Meal");
const User = require("../models/User");

// Get sales report
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    // Get today's date in UTC
    const now = new Date();
    const startOfToday = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setUTCDate(startOfYesterday.getUTCDate() - 1);

    console.log("Debug dates:", {
      now: now.toISOString(),
      startOfToday: startOfToday.toISOString(),
      startOfYesterday: startOfYesterday.toISOString(),
      requestDates: { startDate, endDate },
    });

    // If date range is provided, use it
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      query.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    // Get orders based on query
    const orders = await Order.find(query);

    console.log(
      "Found orders:",
      orders.map((order) => ({
        id: order._id,
        createdAt: order.createdAt.toISOString(),
        total: order.total,
      }))
    );

    // Calculate daily sales
    const dailySales = orders.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { amount: 0, orders: 0 };
      }
      acc[date].amount += order.total;
      acc[date].orders += 1;
      return acc;
    }, {});

    // Format data for response
    const tableData = Object.entries(dailySales).map(([date, data]) => ({
      key: date,
      date,
      sales: data.amount,
      orders: data.orders,
    }));

    // Calculate summary
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // If no date range is provided, get today's stats
    let todayOrders = 0;
    let todayRevenue = 0;

    if (!startDate && !endDate) {
      const todayOrdersList = await Order.find({
        createdAt: { $gte: startOfToday },
      });
      todayOrders = todayOrdersList.length;
      todayRevenue = todayOrdersList.reduce(
        (sum, order) => sum + order.total,
        0
      );
    } else {
      // If date range is provided, use the orders from that range
      todayOrders = totalOrders;
      todayRevenue = totalSales;
    }

    res.json({
      summary: {
        totalSales,
        totalOrders,
        averageOrderValue,
        todayOrders,
        todayRevenue,
      },
      dailySales: Object.entries(dailySales).map(([date, data]) => ({
        date,
        amount: data.amount,
        orders: data.orders,
      })),
      tableData,
      columns: [
        { title: "Date", dataIndex: "date", key: "date" },
        { title: "Sales", dataIndex: "sales", key: "sales" },
        { title: "Orders", dataIndex: "orders", key: "orders" },
      ],
    });
  } catch (error) {
    console.error("Sales report error:", error);
    res.status(500).json({ error: "Failed to generate sales report" });
  }
};

// Get customer analytics
exports.getCustomerAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const orders = await Order.find(query);

    // Calculate customer segments
    const customerSegments = [
      { name: "New Customers", value: 0 },
      { name: "Returning Customers", value: 0 },
      { name: "Loyal Customers", value: 0 },
    ];

    // Process customer data
    const customerData = orders.reduce((acc, order) => {
      const customerId = order.customerId;
      if (!acc[customerId]) {
        acc[customerId] = {
          orders: 0,
          totalSpent: 0,
          lastVisit: order.createdAt,
        };
      }
      acc[customerId].orders += 1;
      acc[customerId].totalSpent += order.total;
      acc[customerId].lastVisit = order.createdAt;
      return acc;
    }, {});

    // Categorize customers
    Object.values(customerData).forEach((customer) => {
      if (customer.orders === 1) {
        customerSegments[0].value++;
      } else if (customer.orders <= 3) {
        customerSegments[1].value++;
      } else {
        customerSegments[2].value++;
      }
    });

    res.json({
      customerSegments,
      tableData: Object.entries(customerData).map(([customerId, data]) => ({
        key: customerId,
        customerId,
        orders: data.orders,
        totalSpent: data.totalSpent,
        lastVisit: data.lastVisit,
      })),
      summary: {
        totalCustomers: Object.keys(customerData).length,
        averageOrderValue:
          orders.reduce((sum, order) => sum + order.total, 0) / orders.length,
      },
    });
  } catch (error) {
    console.error("Customer analytics error:", error);
    res.status(500).json({ error: "Failed to generate customer analytics" });
  }
};

// Get peak hours report
exports.getPeakHours = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const orders = await Order.find(query);

    // Calculate hourly distribution
    const hourlyData = Array(24)
      .fill(0)
      .map((_, hour) => ({
        hour: `${hour.toString().padStart(2, "0")}:00`,
        orders: 0,
      }));

    orders.forEach((order) => {
      const hour = order.createdAt.getHours();
      hourlyData[hour].orders++;
    });

    // Calculate summary
    const totalOrders = orders.length;
    const busiestHour = hourlyData.reduce((max, current) =>
      current.orders > max.orders ? current : max
    );

    res.json({
      hourlyData,
      summary: {
        busiestHour: busiestHour.hour,
        totalOrders,
        averageOrdersPerHour: totalOrders / 24,
      },
      tableData: hourlyData.map((hour) => ({
        key: hour.hour,
        hour: hour.hour,
        orders: hour.orders,
        percentage: `${((hour.orders / totalOrders) * 100).toFixed(1)}%`,
      })),
    });
  } catch (error) {
    console.error("Peak hours error:", error);
    res.status(500).json({ error: "Failed to generate peak hours report" });
  }
};

// Get popular meals report
exports.getPopularMeals = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const orders = await Order.find(query).populate("items.mealId");

    // Calculate meal popularity
    const mealStats = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!item.mealId) return; // Skip if meal reference is missing

        const mealId = item.mealId._id.toString();
        if (!mealStats[mealId]) {
          mealStats[mealId] = {
            name: item.mealId.name,
            quantity: 0,
            revenue: 0,
            image:
              item.mealId.images && item.mealId.images.length > 0
                ? item.mealId.images[0].url
                : null,
            category: item.mealId.category,
            price: item.mealId.price,
          };
        }
        mealStats[mealId].quantity += item.quantity;
        mealStats[mealId].revenue += item.mealId.price * item.quantity;
      });
    });

    // Convert to array and sort by quantity
    const popularMeals = Object.entries(mealStats)
      .map(([id, stats]) => ({
        key: id,
        name: stats.name,
        quantity: stats.quantity,
        revenue: stats.revenue,
        image: stats.image,
        category: stats.category,
        price: stats.price,
      }))
      .sort((a, b) => b.quantity - a.quantity);

    res.json({
      popularMeals,
      summary: {
        totalMealsSold: popularMeals.reduce(
          (sum, meal) => sum + meal.quantity,
          0
        ),
        totalRevenue: popularMeals.reduce((sum, meal) => sum + meal.revenue, 0),
      },
    });
  } catch (error) {
    console.error("Popular meals error:", error);
    res.status(500).json({ error: "Failed to generate popular meals report" });
  }
};

// Get sales analytics
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { period = "daily" } = req.query;
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const orders = await Order.find(query);

    let analytics = {};
    const now = new Date();

    // Group by period
    orders.forEach((order) => {
      let key;
      if (period === "daily") {
        key = order.createdAt.toISOString().split("T")[0];
      } else if (period === "weekly") {
        const weekStart = new Date(order.createdAt);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        key = weekStart.toISOString().split("T")[0];
      } else if (period === "monthly") {
        key = order.createdAt.toISOString().slice(0, 7);
      }

      if (!analytics[key]) {
        analytics[key] = {
          sales: 0,
          orders: 0,
          averageOrderValue: 0,
        };
      }

      analytics[key].sales += order.total;
      analytics[key].orders += 1;
      analytics[key].averageOrderValue =
        analytics[key].sales / analytics[key].orders;
    });

    // Convert to array and sort by date
    const analyticsData = Object.entries(analytics)
      .map(([date, data]) => ({
        key: date,
        date,
        sales: data.sales,
        orders: data.orders,
        averageOrderValue: data.averageOrderValue,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      analytics: analyticsData,
      summary: {
        totalSales: analyticsData.reduce((sum, data) => sum + data.sales, 0),
        totalOrders: analyticsData.reduce((sum, data) => sum + data.orders, 0),
        averageOrderValue:
          analyticsData.reduce((sum, data) => sum + data.averageOrderValue, 0) /
          analyticsData.length,
      },
    });
  } catch (error) {
    console.error("Sales analytics error:", error);
    res.status(500).json({ error: "Failed to generate sales analytics" });
  }
};

// Get recent orders
exports.getRecentOrders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("staffId", "name email")
      .populate("items.mealId", "name price dietaryInfo images");

    const recentOrders = orders.map((order) => ({
      key: order._id,
      orderId: order._id,
      customer: order.customerName || "Guest",
      items: order.items.map((item) => ({
        name: item.mealId ? item.mealId.name : "Unknown Meal",
        quantity: item.quantity,
        price: item.mealId ? item.mealId.price : 0,
        dietaryInfo: item.mealId ? item.mealId.dietaryInfo : null,
        image:
          item.mealId && item.mealId.images && item.mealId.images.length > 0
            ? item.mealId.images[0].url
            : null,
      })),
      total: order.total,
      status: order.status,
      paymentMethod: order.paymentMethod,
      staff: order.staffId
        ? {
            name: order.staffId.name,
            email: order.staffId.email,
          }
        : null,
      createdAt: order.createdAt,
    }));

    res.json(recentOrders);
  } catch (error) {
    console.error("Recent orders error:", error);
    res.status(500).json({ error: "Failed to fetch recent orders" });
  }
};

// Get performance stats
exports.getPerformanceStats = async (req, res) => {
  try {
    const { period = "monthly" } = req.query;
    const now = new Date();
    let startDate;

    // Set the start date based on the period
    switch (period) {
      case "daily":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "weekly":
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case "monthly":
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 6));
    }

    // Get orders within the date range
    const orders = await Order.find({
      createdAt: { $gte: startDate },
    }).populate("staffId", "name");

    // Calculate performance metrics
    const performanceData = orders.reduce((acc, order) => {
      const date = order.createdAt.toISOString().slice(0, 7); // YYYY-MM format
      const staffId = order.staffId._id.toString();

      if (!acc[date]) {
        acc[date] = {
          date,
          totalSales: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          staffPerformance: {},
        };
      }

      // Update overall metrics
      acc[date].totalSales += order.total;
      acc[date].totalOrders += 1;
      acc[date].averageOrderValue =
        acc[date].totalSales / acc[date].totalOrders;

      // Update staff-specific metrics
      if (!acc[date].staffPerformance[staffId]) {
        acc[date].staffPerformance[staffId] = {
          staffName: order.staffId.name,
          totalSales: 0,
          totalOrders: 0,
          averageOrderValue: 0,
        };
      }

      acc[date].staffPerformance[staffId].totalSales += order.total;
      acc[date].staffPerformance[staffId].totalOrders += 1;
      acc[date].staffPerformance[staffId].averageOrderValue =
        acc[date].staffPerformance[staffId].totalSales /
        acc[date].staffPerformance[staffId].totalOrders;

      return acc;
    }, {});

    // Convert to array and sort by date
    const analytics = Object.values(performanceData).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Calculate summary statistics
    const summary = {
      totalSales: analytics.reduce((sum, data) => sum + data.totalSales, 0),
      totalOrders: analytics.reduce((sum, data) => sum + data.totalOrders, 0),
      averageOrderValue:
        analytics.reduce((sum, data) => sum + data.averageOrderValue, 0) /
        analytics.length,
      period: period,
      dateRange: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
      },
    };

    res.json({
      success: true,
      data: {
        analytics,
        summary,
      },
    });
  } catch (error) {
    console.error("Performance stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate performance stats",
    });
  }
};
