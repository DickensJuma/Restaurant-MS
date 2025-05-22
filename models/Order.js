const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  meals: [{
    mealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal' },
    quantity: Number,
    price: Number
  }],
  total: Number,
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  placedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
