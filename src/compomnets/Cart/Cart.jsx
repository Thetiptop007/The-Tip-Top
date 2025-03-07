import React from 'react';
import { useSelector } from 'react-redux';
import CartCard from './CartCard';

function Cart() {
  const addedDishes = useSelector((state) => state.dishes.dishes);

  return (
    <div>
      <h2 className='text-2xl poppins-semibold mb-4'>Your Cart</h2>
      {addedDishes.length === 0 ? (
        <div><p>Your cart is empty.</p></div>
      ) : (
        addedDishes.map((dish) => (
          <CartCard key={dish.id} dish={dish} />
        ))
      )}
    </div>
  );
}

export default Cart;