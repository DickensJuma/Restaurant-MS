const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  available: { type: Boolean, default: true },
  images: [{
    url: String,
    alt: String,
    isMain: { type: Boolean, default: false }
  }],
  description: String,
  ingredients: [String],
  preparationTime: Number, // in minutes
  calories: Number,
  dietaryInfo: {
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('Meal', mealSchema);
