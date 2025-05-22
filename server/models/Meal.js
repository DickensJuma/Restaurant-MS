const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    available: {
      type: Boolean,
      default: true,
    },
    images: [
      {
        url: String,
        alt: String,
        isMain: {
          type: Boolean,
          default: false,
        },
      },
    ],
    description: {
      type: String,
      required: true,
      trim: true,
    },
    ingredients: [
      {
        type: String,
        trim: true,
      },
    ],
    preparationTime: {
      type: Number,
      required: true,
      min: 0,
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
    },
    dietaryInfo: {
      isVegetarian: {
        type: Boolean,
        default: false,
      },
      isVegan: {
        type: Boolean,
        default: false,
      },
      isGlutenFree: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Meal", mealSchema);
