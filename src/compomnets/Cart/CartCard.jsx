import React from 'react';

function CartCard({ dish }) {
  return (
    <div className='flex justify-between items-center border-b border-gray-200 py-2'>
      <div className='flex items-center'>
        <img src={dish.image} alt={dish.name} className='w-16 h-16 object-cover rounded' />
        <div className='ml-4'>
          <h3 className='text-lg poppins-medium'>{dish.name}</h3>
          <p className='text-sm text-gray-600 poppins-regular'>₹{dish.price} x {dish.quantity}</p>
        </div>
      </div>
      <div className='text-lg font-semibold'>
        ₹{dish.price * dish.quantity}
      </div>
    </div>
  );
}

export default CartCard;