const express = require('express');
const Order = require('../models/Order');
const Meal = require('../models/Meal');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const schedule = require('node-schedule');
const router = express.Router();

// Authentication middleware
const auth = require('../middleware/auth');

// Add error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Apply authentication to all report routes
router.use(auth);

// Get daily sales report
router.get('/daily-sales', async (req, res) => {
  try {
    const { date } = req.query;
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'completed'
    });

    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const orderCount = orders.length;

    res.json({
      date,
      totalSales,
      orderCount,
      orders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get popular meals report
router.get('/popular-meals', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    }).populate('meals.mealId');

    // Calculate meal popularity
    const mealCounts = {};
    orders.forEach(order => {
      order.meals.forEach(item => {
        const mealName = item.mealId.name;
        mealCounts[mealName] = (mealCounts[mealName] || 0) + item.quantity;
      });
    });

    // Sort meals by popularity
    const popularMeals = Object.entries(mealCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json(popularMeals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get revenue report by period
router.get('/revenue', async (req, res) => {
  try {
    const { period } = req.query; // 'daily', 'weekly', 'monthly'
    const now = new Date();
    let startDate;

    switch (period) {
      case 'daily':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 1));
    }

    const orders = await Order.find({
      createdAt: { $gte: startDate },
      status: 'completed'
    });

    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    const orderCount = orders.length;
    const averageOrderValue = revenue / orderCount;

    res.json({
      period,
      revenue,
      orderCount,
      averageOrderValue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Staff Performance Report
router.get('/staff-performance', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const staffPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$placedBy',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'staffDetails'
        }
      }
    ]);

    res.json(staffPerformance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inventory Report
router.get('/inventory', async (req, res) => {
  try {
    const meals = await Meal.find();
    const inventoryReport = meals.map(meal => ({
      name: meal.name,
      category: meal.category,
      price: meal.price,
      available: meal.available,
      lastUpdated: meal.updatedAt
    }));

    res.json(inventoryReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sales Analytics with Visualization Data
router.get('/sales-analytics', async (req, res) => {
  try {
    const { period } = req.query; // 'daily', 'weekly', 'monthly'
    const now = new Date();
    let startDate;

    switch (period) {
      case 'daily':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 1));
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          totalSales: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json(salesData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export to PDF
router.get('/export/pdf', async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report.pdf`);
    doc.pipe(res);

    // Add content based on report type
    doc.fontSize(25).text(`${reportType} Report`, 100, 100);
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 100, 150);

    // Add report-specific content
    switch (reportType) {
      case 'sales':
        const salesData = await Order.find({
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        });
        salesData.forEach((order, index) => {
          doc.text(`Order ${index + 1}: KES ${order.total}`, 100, 200 + (index * 20));
        });
        break;
      // Add more cases for different report types
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export to CSV
router.get('/export/csv', async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;
    let data;

    switch (reportType) {
      case 'sales':
        data = await Order.find({
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        });
        break;
      case 'inventory':
        data = await Meal.find();
        break;
      // Add more cases for different report types
    }

    const fields = Object.keys(data[0].toObject());
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Customer Analytics Report
router.get('/customer-analytics', asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate are required' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const customerData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$placedBy',
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        lastOrderDate: { $max: '$createdAt' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'customerDetails'
      }
    }
  ]);

  res.json(customerData);
}));

// Peak Hours Analysis
router.get('/peak-hours', asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate are required' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const peakHours = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        orderCount: { $sum: 1 },
        totalRevenue: { $sum: '$total' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  res.json(peakHours);
}));

// Export to Excel
router.get('/export/excel', asyncHandler(async (req, res) => {
  const { reportType, startDate, endDate } = req.query;
  if (!reportType) {
    return res.status(400).json({ error: 'reportType is required' });
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  let data;
  switch (reportType) {
    case 'sales':
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required for sales report' });
      }
      data = await Order.find({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      });
      worksheet.columns = [
        { header: 'Order ID', key: 'id' },
        { header: 'Total', key: 'total' },
        { header: 'Date', key: 'date' }
      ];
      break;
    case 'inventory':
      data = await Meal.find();
      worksheet.columns = [
        { header: 'Meal Name', key: 'name' },
        { header: 'Category', key: 'category' },
        { header: 'Price', key: 'price' }
      ];
      break;
    default:
      return res.status(400).json({ error: 'Invalid report type' });
  }

  worksheet.addRows(data);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report.xlsx`);
  await workbook.xlsx.write(res);
}));

// Report Scheduling
const scheduledReports = new Map();

router.post('/schedule', asyncHandler(async (req, res) => {
  const { reportType, schedule: scheduleTime, email, format } = req.body;
  
  if (!reportType || !scheduleTime || !email || !format) {
    return res.status(400).json({ 
      error: 'reportType, schedule, email, and format are required' 
    });
  }

  const jobId = Date.now().toString();
  const job = schedule.scheduleJob(scheduleTime, async () => {
    try {
      const report = await generateReport(reportType);
      await sendReportByEmail(email, report, format);
    } catch (error) {
      console.error('Error in scheduled report:', error);
    }
  });

  scheduledReports.set(jobId, job);
  res.json({ jobId, message: 'Report scheduled successfully' });
}));

router.delete('/schedule/:jobId', asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const job = scheduledReports.get(jobId);
  
  if (!job) {
    return res.status(404).json({ error: 'Scheduled report not found' });
  }

  job.cancel();
  scheduledReports.delete(jobId);
  res.json({ message: 'Scheduled report cancelled' });
}));

// Helper functions
async function generateReport(reportType) {
  switch (reportType) {
    case 'sales':
      return await Order.find().sort({ createdAt: -1 }).limit(100);
    case 'inventory':
      return await Meal.find();
    default:
      throw new Error('Invalid report type');
  }
}

async function sendReportByEmail(email, report, format) {
  // Implement email sending logic here
  console.log(`Sending ${format} report to ${email}`);
  // You can use nodemailer to implement this
}

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

module.exports = router; 