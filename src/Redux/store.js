import { configureStore } from '@reduxjs/toolkit';
import dishesReducer from './dishesSlice';

const store = configureStore({
  reducer: {
    dishes: dishesReducer,
  },
});

export default store;