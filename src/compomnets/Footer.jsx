import React from 'react'
import { GiChickenOven } from "react-icons/gi";
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <div>
            <div className='mt-20 border-t-2 border-b-2 border-stone-300 mx-4 md:mx-10 lg:mx-20 py-10 md:py-15 lg:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-40'>
                <div>
                    <div className='flex gap-5 items-center sigmar-regular'>
                        <div className='p-3 rounded-full bg-red-400 w-fit text-white'>
                            <GiChickenOven size={40} />
                        </div>
                        <div className='text-2xl md:text-3xl text-red-400'>The Tip Top</div>
                    </div>
                    <div className='mt-5 poppins-regular'> <span className='poppins-medium'>Address</span> - Shop No 17, Near Tower, Law Gate Rd, Lpu, Phagwara, Punjab 144411</div>
                </div>
                {/* <div>
                    <div className='sigmar-regular text-lg md:text-xl'>Products</div>
                    <div className='mt-5 poppins-medium text-stone-600 flex flex-col gap-1'>
                        <Link to={'/'} className='hover:underline hover:text-red-400 transition-all duration-300'>Explore Our Menu</Link>
                        <Link to={'/'} className='hover:underline hover:text-red-400 transition-all duration-300'>See All Dishes</Link>
                        <Link to={'/'} className='hover:underline hover:text-red-400 transition-all duration-300'>How Does It Works</Link>
                        <Link to={'/'} className='hover:underline hover:text-red-400 transition-all duration-300'>Order Now</Link>
                    </div>
                </div> */}
            </div>
            <div className='py-5 flex justify-center items-center poppins-regular text-xs md:text-sm lg:text-base'> Powered By -  &nbsp;<a href="https://www.helmer.world" target="_blank" className='poppins-regular bg-stone-800 text-stone-50 px-2 rounded-md hover:bg-stone-700'> HELMER</a>
            </div>
            <div></div>
        </div>
    )
}

export default Footer