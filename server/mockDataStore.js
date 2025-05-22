// In-memory data store
const dataStore = {
  users: [],
  meals: [],
  orders: [],
  nextId: 1
};

// Helper function to generate unique IDs
const generateId = () => `id_${dataStore.nextId++}`;

// Mock User Model
const User = {
  find: async (query = {}) => {
    return dataStore.users.filter(user => {
      return Object.entries(query).every(([key, value]) => user[key] === value);
    });
  },
  findOne: async (query) => {
    return dataStore.users.find(user => {
      return Object.entries(query).every(([key, value]) => user[key] === value);
    });
  },
  create: async (userData) => {
    const newUser = {
      _id: generateId(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    dataStore.users.push(newUser);
    return newUser;
  }
};

// Mock Meal Model
const Meal = {
  find: async (query = {}) => {
    return dataStore.meals.filter(meal => {
      return Object.entries(query).every(([key, value]) => meal[key] === value);
    });
  },
  findById: async (id) => {
    return dataStore.meals.find(meal => meal._id === id);
  },
  create: async (mealData) => {
    const newMeal = {
      _id: generateId(),
      ...mealData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    dataStore.meals.push(newMeal);
    return newMeal;
  },
  findByIdAndUpdate: async (id, updateData) => {
    const index = dataStore.meals.findIndex(meal => meal._id === id);
    if (index === -1) return null;
    
    dataStore.meals[index] = {
      ...dataStore.meals[index],
      ...updateData,
      updatedAt: new Date()
    };
    return dataStore.meals[index];
  }
};

// Mock Order Model
const Order = {
  find: async (query = {}) => {
    return dataStore.orders.filter(order => {
      return Object.entries(query).every(([key, value]) => order[key] === value);
    });
  },
  create: async (orderData) => {
    const newOrder = {
      _id: generateId(),
      ...orderData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    dataStore.orders.push(newOrder);
    return newOrder;
  }
};

module.exports = {
  User,
  Meal,
  Order,
  dataStore // Export for testing purposes
}; 