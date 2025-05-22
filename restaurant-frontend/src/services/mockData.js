
const foodImages = [
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnVyZ2VyfGVufDB8fDB8fHww',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGl6emF8ZW58MHx8MHx8fDA%3D',
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGFzdGF8ZW58MHx8MHx8fDA%3D',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FsYWR8ZW58MHx8MHx8fDA%3D',
  'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aWNlJTIwY3JlYW18ZW58MHx8MHx8fDA%3D',
  'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZHJpbmt8ZW58MHx8MHx8fDA%3D'
];

const getRandomImage = () => foodImages[Math.floor(Math.random() * foodImages.length)];

export const mockData = {
  users: [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+254 712 345 678',
      role: 'admin',
      status: 'active',
      password: 'password123'
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+254 723 456 789',
      role: 'staff',
      status: 'active',
      password: 'password123'
    }
  ],
  meals: [
    {
      _id: '1',
      name: 'Chicken Burger',
      description: 'Juicy chicken burger with fresh vegetables',
      price: 190,
      category: 'Burgers',
      image: foodImages[0],
      available: true
    },
    {
      _id: '2',
      name: 'Margherita Pizza',
      description: 'Classic margherita pizza with fresh basil',
      price: 250,
      category: 'Pizza',
      image: foodImages[1],
      available: true
    },
    {
      _id: '3',
      name: 'Spaghetti Bolognese',
      description: 'Traditional Italian pasta with meat sauce',
      price: 150,
      category: 'Pasta',
      image: foodImages[2],
      available: true
    },
    {
      _id: '4',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with Caesar dressing',
      price: 100,
      category: 'Salads',
      image: foodImages[3],
      available: true
    },
    {
      _id: '5',
      name: 'Vanilla Ice Cream',
      description: 'Creamy vanilla ice cream with chocolate sauce',
      price: 200,
      category: 'Desserts',
      image: foodImages[4],
      available: true
    },
    {
      _id: '6',
      name: 'Fresh Juice',
      description: 'Freshly squeezed orange juice',
      price: 499,
      category: 'Drinks',
      image: foodImages[5],
      available: true
    }
  ],
  orders: [
    {
      _id: '1',
      customerName: 'Walk-in Customer',
      items: [
        {
          meal: {
            _id: '1',
            name: 'Chicken Burger',
            price: 12.99
          },
          quantity: 2
        }
      ],
      total: 25.98,
      status: 'completed',
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      customerName: 'John Smith',
      items: [
        {
          meal: {
            _id: '2',
            name: 'Pizza',
            price: 15.99
          },
          quantity: 1
        }
      ],
      total: 15.99,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  ]
};