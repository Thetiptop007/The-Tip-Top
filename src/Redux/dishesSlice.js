import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dishes: []
};

const dishesSlice = createSlice({
  name: 'dishes',
  initialState,
  reducers: {
    addDish: (state, action) => {
      const existingDish = state.dishes.find(dish => dish.id === action.payload.id);
      if (existingDish) {
        existingDish.quantity += action.payload.quantity;
      } else {
        state.dishes.push({ ...action.payload, quantity: action.payload.quantity });
      }
    },
    removeDish: (state, action) => {
      const existingDish = state.dishes.find(dish => dish.id === action.payload.id);
      if (existingDish) {
        if (existingDish.quantity > 1) {
          existingDish.quantity -= 1;
        } else {
          state.dishes = state.dishes.filter(dish => dish.id !== action.payload.id);
        }
      }
    },
    deleteDish: (state, action) => {
      state.dishes = state.dishes.filter(dish => dish.id !== action.payload.id);
    },
    updateDish: (state, action) => {
      const index = state.dishes.findIndex(dish => dish.id === action.payload.id);
      if (index !== -1) {
        state.dishes[index] = { ...state.dishes[index], ...action.payload };
      }
    },
  },
});

export const { addDish, removeDish, deleteDish, updateDish } = dishesSlice.actions;

export default dishesSlice.reducer;
