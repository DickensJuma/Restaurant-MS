const { User, Meal, Order, dataStore } = require('./mockDataStore');
const jwt = require('jsonwebtoken');

// Mock data
const mockData = {
  users: [
    {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      role: "owner"
    }
  ],
  meals: [
    {
      name: "Margherita Pizza",
      category: "Italian",
      price: 12.99,
      available: true
    },
    {
      name: "Chicken Burger",
      category: "Fast Food",
      price: 8.99,
      available: true
    }
  ],
  orders: [
    {
      meals: [
        { mealId: null, quantity: 2, price: 12.99 },
        { mealId: null, quantity: 1, price: 8.99 }
      ],
      total: 34.97
    }
  ]
};

// Test user journey
async function testUserJourney() {
  try {
    console.log('🚀 Starting test journey...\n');

    // 1. Register and Login
    console.log('1. Testing user registration and login...');
    const user = await User.create(mockData.users[0]);
    console.log('✅ User registered successfully');

    // Simulate login
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      'test_secret',
      { expiresIn: '1d' }
    );
    console.log('✅ User logged in successfully\n');

    // 2. Create Meals
    console.log('2. Testing meal creation...');
    const createdMeals = [];
    for (const meal of mockData.meals) {
      const newMeal = await Meal.create(meal);
      createdMeals.push(newMeal);
      console.log(`✅ Created meal: ${meal.name}`);
    }
    console.log('');

    // 3. Create Orders
    console.log('3. Testing order creation...');
    for (const order of mockData.orders) {
      const orderWithMealIds = {
        ...order,
        meals: order.meals.map((meal, index) => ({
          ...meal,
          mealId: createdMeals[index % createdMeals.length]._id
        }))
      };

      const newOrder = await Order.create(orderWithMealIds);
      console.log(`✅ Created order with total: $${order.total}`);
    }
    console.log('');

    // 4. Test Reports
    console.log('4. Testing reports...');
    
    // Get all orders
    const allOrders = await Order.find();
    console.log('✅ Retrieved all orders:', allOrders.length);

    // Get all meals
    const allMeals = await Meal.find();
    console.log('✅ Retrieved all meals:', allMeals.length);

    // Get user details
    const userDetails = await User.findOne({ email: user.email });
    console.log('✅ Retrieved user details:', userDetails.name);

    console.log('\n🎉 Test journey completed successfully!');
    
    // Print final state
    console.log('\nFinal State:');
    console.log('Users:', dataStore.users.length);
    console.log('Meals:', dataStore.meals.length);
    console.log('Orders:', dataStore.orders.length);

  } catch (error) {
    console.error('❌ Error during test journey:', error);
  }
}

// Run the test
testUserJourney(); 