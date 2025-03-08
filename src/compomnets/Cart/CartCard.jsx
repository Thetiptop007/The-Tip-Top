import React from 'react';
import { useDispatch } from 'react-redux';
import { addDish, removeDish, deleteDish } from '../../Redux/dishesSlice';
import toast from 'react-hot-toast';
import { AiOutlineDelete } from "react-icons/ai";

function CartCard({ dish }) {
  const dispatch = useDispatch();

  const handleIncrease = () => {
    dispatch(addDish({ ...dish, quantity: 1 }));
  };

  const handleDecrease = () => {
    dispatch(removeDish(dish));
  };

  return (
    <div className='flex justify-between border-b border-gray-200 py-2'>
      <div className='flex items-center'>
        <img src={dish.image} alt={dish.name} className='w-16 h-16 object-cover rounded' />
        <div className='ml-4'>
          <h3 className='text-lg poppins-medium'>{dish.name}</h3>
          <div className='flex gap-4 md:gap-8 items-center'>
            <p className='text-sm text-gray-600 poppins-regular'>₹{dish.price} x {dish.quantity}</p>
            <div className='flex items-center mt-2 poppins-regular'>
              <button
                className='text-sm bg-red-400 text-white py-0 p-2 md:px-3 rounded cursor-pointer hover:bg-red-500 transition-all duration-300'
                onClick={handleDecrease}
              >
                -
              </button>
              <div className='mx-2 poppins-regular'>{dish.quantity}</div>
              <button
                className='text-sm bg-red-400 text-white py-0 p-2 md:px-3 rounded cursor-pointer hover:bg-red-500 transition-all duration-300'
                onClick={handleIncrease}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className='flex md:items-center'>
        <div className='text-lg font-semibold mr-4'>
          ₹{dish.price * dish.quantity}
        </div>
      </div>
    </div>
  );
}

export default CartCard;
