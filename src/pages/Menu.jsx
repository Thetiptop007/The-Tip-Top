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
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const categories = [
    'All', 'Tandoori Snacks', 'Non-Vegetarian', 'Vegetarian', 'Biryani', 'Rice Dishes', 'Chinese Snacks', 'Thali', 'Main Course Veg', 'Main Course Non-Veg', 'Raita', 'Egg Dishes', 'Breads', 'Chaap Gravy Items', 'Veg Combo', 'Non-Veg Combo','Soup', 
  ];

  // Levenshtein distance algorithm for fuzzy matching
  const levenshteinDistance = (str1, str2) => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[len1][len2];
  };

  // Calculate relevance score for search results
  const calculateRelevanceScore = (dishName, query) => {
    if (!query) return 0;
    
    const dishLower = dishName.toLowerCase();
    const queryLower = query.toLowerCase();
    let score = 0;
    
    // Exact full match - highest score
    if (dishLower === queryLower) return 1000;
    
    // Contains exact query - very high score
    if (dishLower.includes(queryLower)) return 900;
    
    const dishWords = dishLower.split(/\s+/);
    const queryWords = queryLower.split(/\s+/);
    
    // Score for each query word matching dish words
    queryWords.forEach(qWord => {
      if (qWord.length < 2) return;
      
      dishWords.forEach((dWord, index) => {
        // Exact word match - high score, bonus for earlier position
        if (dWord === qWord) {
          score += 500 - (index * 10);
          return;
        }
        
        // Word starts with query word
        if (dWord.startsWith(qWord)) {
          score += 300 - (index * 10);
          return;
        }
        
        // Word contains query word
        if (dWord.includes(qWord)) {
          score += 200 - (index * 10);
          return;
        }
        
        // Fuzzy match based on Levenshtein distance
        const maxDistance = qWord.length <= 4 ? 1 : 2;
        const distance = levenshteinDistance(dWord, qWord);
        
        if (distance <= maxDistance) {
          score += 100 - (distance * 20) - (index * 5);
        }
      });
    });
    
    // Bonus for matching multiple query words
    const matchingWords = queryWords.filter(qWord => 
      dishWords.some(dWord => 
        dWord === qWord || 
        dWord.includes(qWord) || 
        levenshteinDistance(dWord, qWord) <= (qWord.length <= 4 ? 1 : 2)
      )
    ).length;
    
    if (matchingWords > 1) {
      score += matchingWords * 150;
    }
    
    return score;
  };

  // Filter and sort dishes by relevance
  const filteredDishes = data.dishes
    .map(dish => ({
      ...dish,
      relevanceScore: debouncedSearchQuery 
        ? calculateRelevanceScore(dish.name, debouncedSearchQuery)
        : 0
    }))
    .filter(dish => {
      const matchesCategory = selectedCategory === 'All' || dish.categories.includes(selectedCategory);
      
      // If no search query, just filter by category
      if (!debouncedSearchQuery) return matchesCategory;
      
      // If search query exists, must have a relevance score > 0
      const matchesSearch = dish.relevanceScore > 0;
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      // Sort by relevance score (highest first)
      if (debouncedSearchQuery) {
        return b.relevanceScore - a.relevanceScore;
      }
      // Default order when no search
      return 0;
    });

  return (
    <div className='px-4 md:px-20 lg:px-40 py-10 md:py-15 lg:py-20 flex flex-col items-center'>
      <div className='sigmar-regular text-3xl md:text-4xl lg:text-5xl'>Menu</div>
      
      {/* Tandoori Items Available Notice */}
      <div className='mt-6 md:mt-8 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-4 md:p-5 rounded-lg shadow-md max-w-2xl w-full'>
        <div className='flex items-center gap-3'>
          <div className='text-2xl md:text-3xl'>🔥</div>
          <div>
            <h3 className='poppins-semibold text-red-600 text-lg md:text-xl'>Tandoori Items Now Available!</h3>
            <p className='poppins-regular text-gray-700 text-sm md:text-base mt-1'>
              Fresh tandoori chicken, paneer tikka, naans, and more are now being served hot from our kitchen!
            </p>
          </div>
        </div>
      </div>

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
        <div className='flex flex-col items-center mt-5 md:mt-10 lg:mt-15'>
          <div className='relative w-full md:w-1/2'>
            <input
              type="text"
              placeholder="Search dishes... (try 'nan', 'chiken', 'biryani')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full p-3 pl-10 rounded-2xl shadow-lg border border-stone-200 outline-none focus:border-red-400 transition-colors'
            />
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {debouncedSearchQuery && filteredDishes.length === 0 && (
            <div className='mt-4 text-gray-500 poppins-regular text-center'>
              No dishes found for "{debouncedSearchQuery}". Try a different search term.
            </div>
          )}
          {debouncedSearchQuery && filteredDishes.length > 0 && (
            <div className='mt-3 text-sm text-gray-600 poppins-regular'>
              Found {filteredDishes.length} dish{filteredDishes.length !== 1 ? 'es' : ''} matching "{debouncedSearchQuery}"
            </div>
          )}
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
