import React from 'react'

function HowItWorks() {
    return (
        <div className='min-h-[900px] mt-32 bg-gradient-to-b from-red-100 to-transparent rounded-t-[80px] md:rounded-t-[300px] lg:rounded-t-[500px] flex flex-col items-center px-4 md:px-20 lg:px-40 py-16 md:py-24 lg:py-32'>
            <div className='sigmar-regular text-3xl md:text-4xl lg:text-5xl text-center'>How Does It <br className='block md:hidden' /> Work</div>


            <div className='mt-10 md:mt-16 lg:mt-20 flex flex-col md:flex-row justify-center gap-4 md:gap-10'>

                <div className='w-full md:w-80 lg:w-96 md:min-h-[350px] lg:min-h-[400px] p-5 md:p-8 lg:p-10'>
                    <div className='flex justify-center items-center min-h-24 md:min-h-28 lg:min-h-32 poppins-medium'>
                        <div className='relative'>
                            <div className='w-24 md:w-32 lg:w-40 aspect-square rounded-full overflow-hidden shadow-xl shadow-stone-400 border-2 md:border-3 lg:border-4 border-stone-400'>
                                <img src="https://img.freepik.com/free-vector/hand-drawn-people-taking-pictures-food-illustration_23-2150504673.jpg?t=st=1741358203~exp=1741361803~hmac=506d64f5ff1ff6367dd835a634f1efe243e70c8f872cbd04595abbc6dd571c2d&w=900" alt="dish" className='w-full h-full object-cover' />
                            </div>
                        </div>
                    </div>
                    <div className='text-center mt-5 md:mt-8 lg:mt-10'>
                        <div className='text-lg md:text-xl lg:text-2xl poppins-semibold text-red-500'>Choose Your Meal</div>
                        <div className='mt-2 md:mt-3 lg:mt-4 poppins-regular text-stone-500 text-xs md:text-sm lg:text-base'>See the menu area for all of our dishes. Decide on your preferred dish and serving size.</div>
                    </div>
                </div>

                <div className='w-full md:w-80 lg:w-96 md:min-h-[350px] lg:min-h-[400px] md:shadow-xl md:shadow-stone-400 md:border border-stone-200 rounded-t-[50px] md:rounded-t-[70px] lg:rounded-t-[90px] rounded-b-2xl md:rounded-b-3xl lg:rounded-b-4xl p-5 md:p-8 lg:p-10'>
                    <div className='flex justify-center items-center min-h-24 md:min-h-28 lg:min-h-32 poppins-medium'>
                        <div className='relative'>
                            <div className='w-24 md:w-32 lg:w-40 aspect-square rounded-full overflow-hidden shadow-xl shadow-stone-400 border-2 md:border-3 lg:border-4 border-stone-400'>
                                <img src="https://img.freepik.com/free-vector/set-different-bubbles-chat-messenger-app_23-2147785718.jpg?t=st=1741358266~exp=1741361866~hmac=9ae9ccaad3e0471956276f99680c0e2e6412dc7b27750dd3e996251aa110d155&w=900" alt="dish" className='w-full h-full object-cover' />
                            </div>
                        </div>
                    </div>
                    <div className='text-center mt-5 md:mt-8 lg:mt-10'>
                        <div className='text-lg md:text-xl lg:text-2xl poppins-semibold text-red-500'>Conform Your Order</div>
                        <div className='mt-2 md:mt-3 lg:mt-4 poppins-regular text-stone-500 text-xs md:text-sm lg:text-base'>Conform your order on whatsapp and wait to delivery.</div>
                    </div>
                </div>


                <div className='w-full md:w-80 lg:w-96 md:min-h-[350px] lg:min-h-[400px] rounded-t-[50px] md:rounded-t-[70px] lg:rounded-t-[90px] rounded-b-2xl md:rounded-b-3xl lg:rounded-b-4xl p-5 md:p-8 lg:p-10'>
                    <div className='flex justify-center items-center min-h-24 md:min-h-28 lg:min-h-32 poppins-medium'>
                        <div className='relative'>
                            <div className='w-24 md:w-32 lg:w-40 aspect-square rounded-full overflow-hidden shadow-xl shadow-stone-400 border-2 md:border-3 lg:border-4 border-stone-400'>
                                <img src="https://img.freepik.com/free-vector/delivery-service-illustrated_23-2148505081.jpg?t=st=1741358115~exp=1741361715~hmac=65fcf507c275b8dae2647045a19c58af93c9ea067cf765e2b74f4b625837b9fa&w=900" alt="dish" className='w-full h-full object-cover' />
                            </div>
                        </div>
                    </div>
                    <div className='text-center mt-5 md:mt-8 lg:mt-10'>
                        <div className='text-lg md:text-xl lg:text-2xl poppins-semibold text-red-500'>Collect Your Meal</div>
                        <div className='mt-2 md:mt-3 lg:mt-4 poppins-regular text-stone-500 text-xs md:text-sm lg:text-base'>Collect your meal and enjoy it. Visit again to get best food.</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HowItWorks