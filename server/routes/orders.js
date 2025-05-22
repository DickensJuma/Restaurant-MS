const express = require("express");
const Order = require("../models/Order");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { customerName, items, total, status, staffId } = req.body;
    console.log("Received order data:", req.body);

    const order = new Order({
      customerName,
      items: items.map((item) => ({
        mealId: item.mealId,
        quantity: item.quantity,
      })),
      total,
      status,
      staffId: staffId || req?.user?._id,
    });

    console.log("Created order object:", order);
    await order.save();
    res.json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(400).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.mealId")
      .populate("staffId", "name email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent orders for dashboard
router.get("/recent", async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .populate("items.mealId")
      .sort({ createdAt: -1 })
      .limit(5);

    const formattedOrders = recentOrders.map((order) => ({
      orderId: order._id,
      customer: order.customerName,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        name: item.mealId?.name || "Unknown",
        quantity: item.quantity,
      })),
    }));

    res.json({ recentOrders: formattedOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sales report for dashboard
router.get("/sales-report", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, todayOrders, totalRevenue, todayRevenue] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ createdAt: { $gte: today } }),
        Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
        Order.aggregate([
          { $match: { createdAt: { $gte: today } } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
      ]);

    const summary = {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalCustomers: await Order.distinct("customerName").length,
      averageOrderValue: totalOrders
        ? (totalRevenue[0]?.total || 0) / totalOrders
        : 0,
      todayOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
      revenueChange: 0, // You can calculate this based on previous period
      ordersChange: 0, // You can calculate this based on previous period
    };

    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get popular meals for dashboard
router.get("/popular-meals", async (req, res) => {
  try {
    const popularMeals = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.mealId",
          quantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "meals",
          localField: "_id",
          foreignField: "_id",
          as: "meal",
        },
      },
      { $unwind: "$meal" },
      {
        $project: {
          name: "$meal.name",
          quantity: 1,
          _id: 0,
        },
      },
    ]);

    res.json({ popularMeals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sales analytics for dashboard
router.get("/sales-analytics", async (req, res) => {
  try {
    const { period = "weekly" } = req.query;
    const now = new Date();
    let startDate;

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
        startDate = new Date(now.setDate(now.getDate() - 30));
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === "daily" ? "%Y-%m-%d" : "%Y-%m",
              date: "$createdAt",
            },
          },
          sales: { $sum: "$total" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          date: "$_id",
          sales: 1,
          _id: 0,
        },
      },
    ]);

    res.json({ analytics: salesData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { customerName, items, total, status, staffId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        customerName,
        items: items.map((item) => ({
          mealId: item.mealId,
          quantity: item.quantity,
        })),
        total,
        status,
        staffId: staffId || req?.user?._id,
      },
      { new: true }
    )
      .populate("items.mealId")
      .populate("staffId", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
