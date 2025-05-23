const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const auth = require("../middleware/auth");

// All report routes are protected
router.use(auth);

// Report routes
router.get("/sales", reportController.getSalesReport);
router.get("/customers", reportController.getCustomerAnalytics);
router.get("/peak-hours", reportController.getPeakHours);
router.get("/popular-meals", reportController.getPopularMeals);
router.get("/sales-analytics", reportController.getSalesAnalytics);
router.get("/recent-orders", reportController.getRecentOrders);
router.get("/performance-stats", reportController.getPerformanceStats);

module.exports = router;
