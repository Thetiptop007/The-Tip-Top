import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DishesCard from '../compomnets/Home/PopularDishes/DishesCard';
import data from '../data.json';

function Menu() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const addedDishes = useSelector((state) => state.dishes.dishes);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    console.log('Added Dishes:', addedDishes);
  }, [addedDishes]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 800);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const categories = [
    'All', 'Tandoori Snacks', 'Non-Vegetarian', 'Vegetarian', 'Biryani', 'Rice Dishes', 'Chinese Snacks', 'Thali', 'Main Course Veg', 'Main Course Non-Veg', 'Raita', 'Egg Dishes', 'Breads', 'Chaap Gravy Items', 'Veg Combo', 'Non-Veg Combo','Soup', 
  ];

  const filteredDishes = data.dishes.filter(dish => {
    const matchesCategory = selectedCategory === 'All' || dish.categories.includes(selectedCategory);
    const matchesSearch = dish.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className='px-4 md:px-20 lg:px-40 py-10 md:py-15 lg:py-20 flex flex-col items-center'>
      <div className='sigmar-regular text-3xl md:text-4xl lg:text-5xl'>Menu</div>
      <div className='mt-10 md:mt-15 lg:mt-20'>
        <div className='flex flex-col md:flex-row justify-center gap-3 md:gap-5 lg:gap-8 poppins-medium'>
          <div className='hidden md:flex flex-wrap justify-center gap-3 md:gap-5 lg:gap-8'>
            {categories.map(category => (
              <div
                key={category}
                className={`px-3 md:px-5 py-2 md:py-3 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 ${selectedCategory === category ? 'bg-red-400 text-white' : 'border border-stone-200 text-stone-600 hover:bg-red-400 hover:text-white'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </div>
            ))}
          </div>
          <div className='block md:hidden'>
            <select
              className='w-full p-3 rounded-2xl shadow-lg border border-stone-200 mt-5 md:mt-8 lg:mt-10 poppins-medium outline-none'
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        <div className='flex justify-center mt-5 md:mt-10 lg:mt-15'>
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full md:w-1/2 p-3 rounded-2xl shadow-lg border border-stone-200 outline-none'
          />
        </div>
        <div className='flex flex-wrap justify-center gap-5 lg:gap-8 mt-5 md:mt-10 lg:mt-16'>
          {filteredDishes.map((dish, index) => (
            <DishesCard key={`${dish.id}-${debouncedSearchQuery}-${selectedCategory}-${index}`} dish={dish} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Menu;
