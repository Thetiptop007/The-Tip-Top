import React from 'react'
import heroImage from '../../assets/heroImage.png'
import { Link } from 'react-router-dom'

function Hero() {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 px-4 md:px-20 lg:px-40 py-10'>
            <div>
                <div className='w-fit flex gap-4 items-center rounded-3xl overflow-hidden bg-stone-100 poppins-semibold shadow-lg shadow-stone-300 border border-stone-200'>
                    <div className='w-16 h-8 md:w-20 md:h-10 bg-red-400 flex justify-center items-center'>
                        <div><img src={heroImage} alt="heroImage small" className='w-10' /></div>
                    </div>
                    <div className='pr-5 text-sm md:text-base'> Food, Taste , Quality</div>
                </div>
                <div className='sigmar-regular mt-10 text-4xl md:text-6xl lg:text-8xl'>
                    Eat <span className='text-red-400'>Finest</span> Flavours at Finest Vibezz
                </div>
                <div className='mt-10 text-base md:text-lg poppins-regular'>
                Get your food at the comfort of your place, delivered fresh and fast to your doorstep.
                </div>
                <div className='mt-10'>
                    <Link to={'/menu'} className='bg-red-400 py-2 px-5 md:py-4 md:px-10 w-fit poppins-regular text-white rounded-tl-lg rounded-bl-3xl rounded-tr-3xl rounded-br-lg shadow-lg shadow-stone-300 hover:bg-red-500 transition-all duration-300 cursor-pointer'>Order Now</Link>
                </div>
            </div>
            <div className='mt-10 md:mt-0'>
                <div>
                    <img src={heroImage} alt="heroImage" className='w-full h-auto' />
                </div>
            </div>
        </div>
    )
}

export default Hero