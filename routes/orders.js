const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

router.post('/', async (req, res) => {
  const { meals, total, placedBy } = req.body;
  const order = new Order({ meals, total, placedBy });
  await order.save();
  res.json(order);
});

router.get('/', async (req, res) => {
  const orders = await Order.find().populate('meals.mealId').populate('placedBy');
  res.json(orders);
});

module.exports = router;
