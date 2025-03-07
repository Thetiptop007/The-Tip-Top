import React from 'react'
import heroImage from '../assets/heroImage.png'
import Hero from '../compomnets/Home/Hero'
import PopularDishes from '../compomnets/Home/PopularDishes/PopularDishes'
import HowItWorks from '../compomnets/Home/HowItWorks'

function Home() {
    return (
        <>
            <Hero />
            <PopularDishes/>
            <HowItWorks/>
        </>
    )
}

export default Home