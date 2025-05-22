const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api';
let authToken;

async function testMealImages() {
  try {
    console.log('🚀 Starting meal image test...\n');

    // 1. Login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'john@example.com',
      password: 'password123'
    });
    authToken = loginResponse.data.token;
    console.log('✅ Logged in successfully\n');

    // 2. Create a meal with images
    const formData = new FormData();
    formData.append('name', 'Margherita Pizza');
    formData.append('category', 'Italian');
    formData.append('price', '12.99');
    formData.append('description', 'Classic Italian pizza with tomato and mozzarella');
    formData.append('ingredients', JSON.stringify(['tomato', 'mozzarella', 'basil']));
    formData.append('preparationTime', '15');
    formData.append('calories', '800');
    formData.append('dietaryInfo', JSON.stringify({
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false
    }));

    // Add images
    formData.append('images', fs.createReadStream(path.join(__dirname, 'test-images', 'pizza1.jpg')));
    formData.append('images', fs.createReadStream(path.join(__dirname, 'test-images', 'pizza2.jpg')));

    const createResponse = await axios.post(`${API_URL}/meals`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`
      }
    });

    console.log('✅ Created meal with images:', createResponse.data.name);
    console.log('Images:', createResponse.data.images);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testMealImages(); 