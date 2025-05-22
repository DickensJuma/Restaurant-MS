import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  meals: [],
  loading: false,
  error: null,
  selectedMeal: null,
};

const mealSlice = createSlice({
  name: 'meals',
  initialState,
  reducers: {
    fetchMealsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMealsSuccess: (state, action) => {
      state.loading = false;
      state.meals = action.payload;
    },
    fetchMealsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addMeal: (state, action) => {
      state.meals.push(action.payload);
    },
    updateMeal: (state, action) => {
      const index = state.meals.findIndex(meal => meal._id === action.payload._id);
      if (index !== -1) {
        state.meals[index] = action.payload;
      }
    },
    deleteMeal: (state, action) => {
      state.meals = state.meals.filter(meal => meal._id !== action.payload);
    },
    setSelectedMeal: (state, action) => {
      state.selectedMeal = action.payload;
    },
    clearSelectedMeal: (state) => {
      state.selectedMeal = null;
    },
  },
});

export const {
  fetchMealsStart,
  fetchMealsSuccess,
  fetchMealsFailure,
  addMeal,
  updateMeal,
  deleteMeal,
  setSelectedMeal,
  clearSelectedMeal,
} = mealSlice.actions;

export default mealSlice.reducer;