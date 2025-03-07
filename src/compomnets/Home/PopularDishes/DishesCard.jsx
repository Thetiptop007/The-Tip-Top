import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addDish, removeDish } from '../../../Redux/dishesSlice';
import toast from 'react-hot-toast';

function DishesCard({ dish }) {
  const dispatch = useDispatch();
  const storedDish = useSelector((state) => state.dishes.dishes.find((d) => d.id === dish.id));
  const [quantity, setQuantity] = useState(storedDish ? storedDish.quantity : 0);

  useEffect(() => {
    if (storedDish) {
      setQuantity(storedDish.quantity);
    } else {
      setQuantity(0);
    }
  }, [storedDish]);

  const handleAddToCart = (dish) => {
    setQuantity(1);
    dispatch(addDish({ ...dish, quantity: 1 }));
    toast.success(`${dish.name} added to cart!`);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
    dispatch(addDish({ ...dish, quantity: 1 }));
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
      dispatch(addDish({ ...dish, quantity: -1 }));
    } else {
      setQuantity(0);
      dispatch(removeDish(dish));
    }
  };

  return (
    <div className='w-full md:w-80 lg:w-96 md:min-h-[350px] lg:min-h-[400px] shadow shadow-stone-200 md:shadow-xl md:shadow-stone-400 border border-stone-200 rounded-t-[50px] md:rounded-t-[70px] lg:rounded-t-[90px] rounded-b-2xl md:rounded-b-3xl lg:rounded-b-4xl p-5 md:p-8 lg:p-10 animate-slide-up'>
      <div className='flex justify-between items-center min-h-24 md:min-h-28 lg:min-h-32 poppins-medium'>
        <div>{dish?.rating}</div>
        <div className='relative'>
          <div className='w-24 md:w-32 lg:w-40 aspect-square rounded-full overflow-hidden shadow-xl shadow-stone-400 border-2 md:border-3 lg:border-4 border-stone-400'>
            <img src={dish?.image} alt={dish?.name} className='w-full h-full object-cover' />
          </div>
        </div>
        <div>{dish?.reviews}K</div>
      </div>
      <div className='text-center mt-5 md:mt-8 lg:mt-10'>
        <div className='text-lg md:text-xl lg:text-2xl poppins-medium'>{dish?.name}</div>
        <div className='flex justify-center items-center'>
          {dish.quantity && 
          <div className='bg-red-200 px-3 py-1 rounded-md border border-red-400 poppins-regular'>{dish?.quantity}</div>
          }
        </div>
        <div className='mt-2 md:mt-3 lg:mt-4 poppins-regular text-stone-500 text-xs md:text-sm lg:text-base'>{dish?.description}</div>
        <div className='flex justify-between items-center mt-3 md:mt-4 lg:mt-5 poppins-medium'>
          <div className='text-xl md:text-2xl lg:text-3xl'>₹{dish?.price}</div>
          {quantity === 0 ? (
            <div
              className='text-sm md:text-lg bg-red-400 text-white p-2 px-3 md:px-5 rounded-tl-lg rounded-bl-2xl md:rounded-bl-3xl rounded-br-lg rounded-tr-2xl md:rounded-tr-3xl cursor-pointer hover:bg-red-500 transition-all duration-300'
              onClick={() => handleAddToCart(dish)}
            >
              Add to Cart
            </div>
          ) : (
            <div className='flex items-center'>
              <button
                className='text-sm md:text-lg bg-red-400 text-white p-2 md:p-2 px-3 md:px-5 rounded-tl-lg rounded-bl-2xl md:rounded-bl-3xl rounded-br-lg rounded-tr-2xl md:rounded-tr-3xl cursor-pointer hover:bg-red-500 transition-all duration-300'
                onClick={handleDecrease}
              >
                -
              </button>
              <div className='mx-2 w-5 md:w-10 text-xl md:text-2xl lg:text-3xl'>{quantity}</div>
              <button
                className='text-sm md:text-lg bg-red-400 text-white p-2 md:p-2 px-3 md:px-5 rounded-tl-lg rounded-bl-2xl rounded-br-lg rounded-tr-2xl cursor-pointer hover:bg-red-500 transition-all duration-300'
                onClick={handleIncrease}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DishesCard;