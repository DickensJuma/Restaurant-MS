import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import mealReducer from './slices/mealSlice';
import orderReducer from './slices/orderSlice';
import reportReducer from './slices/reportSlice';
import staffReducer from './slices/staffSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    meals: mealReducer,
    orders: orderReducer,
    reports: reportReducer,
    staff: staffReducer,
  },
});