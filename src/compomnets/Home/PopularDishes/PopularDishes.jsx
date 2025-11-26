import React from 'react'
import PopularDishesCard from './DishesCard'
import data from '../../../data.json'
import { Link } from 'react-router-dom'

function PopularDishes() {
    // Get specific popular dishes: Shahi Paneer (ID 22), Tandoori Chicken (ID 174), Chicken Dum Biryani (ID 202)
    const popularDishIds = [22, 174, 202];
    const topDishes = data?.dishes?.filter(dish => popularDishIds.includes(dish.id))

    return (
        <div className='flex flex-col text-center items-center px-4 md:px-20 lg:px-40'>
            <div className='sigmar-regular  text-3xl md:text-4xl lg:text-5xl'>Our Popular <br className='block md:hidden' /> Dishes</div>
            <div className='mt-10 md:mt-20 lg:mt-32 flex flex-col md:flex-row gap-10'>
                {topDishes.map(dish => (
                    <PopularDishesCard key={dish?.id} dish={dish} />
                ))}
            </div>
            <div className='mt-10 md:mt-20 flex justify-center items-center'>
                <Link to={'/menu'} className='text-sm md:text-lg bg-red-400 text-white p-2 md:p-3 px-4 md:px-5 rounded-tl-lg rounded-bl-3xl rounded-br-lg rounded-tr-3xl cursor-pointer hover:bg-red-500 transition-all duration-300 poppins-medium'>See All Dishes</Link>
            </div>
        </div>
    )
}

export default PopularDishes
