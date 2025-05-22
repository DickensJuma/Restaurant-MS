require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Meal = require("./models/Meal");
const Order = require("./models/Order");

// Sample data
const users = [
  {
    name: "Admin User",
    email: "admin@restaurant.com",
    password: "admin123",
    phone: "07134567890",
    role: "owner",
  },
  {
    name: "Staff User",
    email: "staff@restaurant.com",
    password: "staff123",
    phone: "07324567890",
    role: "staff",
  },
];

const meals = [
  {
    name: "Margherita Pizza",
    category: "Italian",
    price: 12.99,
    description: "Classic Italian pizza with tomato sauce and mozzarella",
    ingredients: ["tomato sauce", "mozzarella", "basil"],
    preparationTime: 15,
    calories: 800,
    dietaryInfo: {
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
    },
    available: true,
  },
  {
    name: "Chicken Burger",
    category: "Fast Food",
    price: 8.99,
    description: "Grilled chicken burger with lettuce and special sauce",
    ingredients: ["chicken breast", "lettuce", "tomato", "special sauce"],
    preparationTime: 10,
    calories: 600,
    dietaryInfo: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
    },
    available: true,
  },
  {
    name: "Caesar Salad",
    category: "Salads",
    price: 7.99,
    description: "Fresh romaine lettuce with Caesar dressing and croutons",
    ingredients: ["romaine lettuce", "croutons", "parmesan", "Caesar dressing"],
    preparationTime: 8,
    calories: 350,
    dietaryInfo: {
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
    },
    available: true,
  },
];

// Function to create sample orders
const createSampleOrders = async (users, meals) => {
  const orders = [];
  const statuses = ["pending", "completed", "cancelled"];

  // Create 10 sample orders
  for (let i = 0; i < 10; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomMeal = meals[Math.floor(Math.random() * meals.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;

    const order = {
      customerId: randomUser._id,
      meals: [
        {
          mealId: randomMeal._id,
          quantity: quantity,
          price: randomMeal.price,
        },
      ],
      total: randomMeal.price * quantity,
      status: randomStatus,
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000
      ), // Random date within last 7 days
    };

    orders.push(order);
  }

  return orders;
};

// Main seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Meal.deleteMany({});
    await Order.deleteMany({});
    console.log("Cleared existing data");

    // Create users
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return User.create({
          ...user,
          password: hashedPassword,
        });
      })
    );
    console.log("Created users");

    // Create meals
    const createdMeals = await Meal.insertMany(meals);
    console.log("Created meals");

    // Create orders
    const createdOrders = await createSampleOrders(createdUsers, createdMeals);
    await Order.insertMany(createdOrders);
    console.log("Created orders");

    console.log("Database seeded successfully!");
    console.log("\nSample login credentials:");
    console.log("Admin - Email: admin@restaurant.com, Password: admin123");
    console.log("Staff - Email: staff@restaurant.com, Password: staff123");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the seed function
seedDatabase();
