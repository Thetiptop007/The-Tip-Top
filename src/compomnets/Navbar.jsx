import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BsHandbag } from "react-icons/bs";
import { GiChickenOven } from "react-icons/gi";
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Cart from './Cart/Cart';
import logo from '../assets/logo.png'

function Navbar() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [address, setAddress] = useState('');
    const [name, setName] = useState('');
    const addedDishes = useSelector((state) => state.dishes.dishes);

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isModalOpen]);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const totalAmount = addedDishes.reduce((total, dish) => total + dish.price * dish.quantity, 0);
    const totalItems = addedDishes.reduce((total, dish) => total + dish.quantity, 0);

    const handleConfirmOrder = () => {
        if (!address || !name) {
            toast.error('Both name and delivery address are required');
            return;
        }

        const orderDetails = addedDishes.map((dish, index) => {
            return `${index + 1}️⃣ ${dish.name} - ${dish.quantity} ${dish.quantity > 1 ? 'Pieces' : 'Piece'}`;
        }).join('\n');

        const message = `Hello, I’d like to place an order:\n\n🛒 Order Details:\n${orderDetails}\n\n💰 Total Amount: ₹${totalAmount.toFixed(2)}\n\n📍 Delivery Address: ${address}\n👤 Name: ${name}\n\nHelpline No: +91 9650780199`;

        const whatsappUrl = `https://wa.me/7696482938?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className='flex justify-between px-4 md:px-10 lg:px-20 py-4 md:py-6 lg:py-10 md:grid grid-cols-2 md:grid-cols-3 bg-stone-50'>
            <Link to={'/'} className='flex gap-2 md:gap-3 items-center sigmar-regular'>
                <img src={logo} alt="logo" className='w-40' />
            </Link>
            <div className='hidden md:block'></div>
            <div className='flex justify-end items-center'>
                <div
                    className='p-2 md:p-3 shadow-lg shadow-red-200 border border-red-100 rounded-full cursor-pointer hover:bg-red-400 hover:text-white transition-all duration-300 ease-in-out relative group'
                    onClick={handleOpenModal}
                >
                    <BsHandbag size={20} />
                    <div className='absolute w-7 poppins-regular right-6 md:right-8 aspect-square flex justify-center items-center bg-red-400 rounded-full text-white bottom-6 text-sm group-hover:bg-stone-50 group-hover:text-red-500 group-hover:border group-hover:border-stone-300 transition-all duration-300'>
                        {totalItems}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className='fixed inset-0 bg-stone-400/55 backdrop-blur-md bg-opacity-50 flex justify-center items-center z-50'>
                    <div className='bg-white min-h-96 max-h-[500px] overflow-y-auto mx-2 w-full max-w-[700px] flex flex-col justify-between p-4 md:p-7 rounded-2xl shadow-2xl shadow-stone-600'>
                        <Cart />
                        <div className='flex justify-between mt-4'>
                            <div className='text-lg font-semibold'>Total</div>
                            <div className='text-lg font-semibold'>₹{totalAmount.toFixed(2)}</div>
                        </div>
                        <div className='mt-8'>
                            <label htmlFor="name" className='block font-medium text-gray-700 poppins-regular'>Name</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm outline-stone-600 outline-1'
                                placeholder="Enter your name"
                            />
                        </div>
                        <div className='mt-8'>
                            <label htmlFor="address" className='block font-medium text-gray-700 poppins-regular'>Delivery Address</label>
                            <input 
                                type="text" 
                                id="address" 
                                name="address" 
                                value={address} 
                                onChange={(e) => setAddress(e.target.value)} 
                                className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm outline-stone-600 outline-1'
                                placeholder="Enter your delivery address"
                            />
                        </div>
                        <div className='mt-8 text-white poppins-medium flex justify-between items-center sticky md:static bottom-0 bg-stone-50 md:bg-transparent shadow-lg md:shadow-none shadow-stone-600 border md:border-none border-stone-300 rounded-2xl p-3 md:px-0 text-sm md:text-base'>
                            <div
                                className='bg-red-400 text-white px-4 md:px-6 rounded-tl-lg rounded-bl-3xl rounded-tr-3xl rounded-br-lg hover:bg-red-500 transition-all duration-300 cursor-pointer py-3'
                                onClick={handleCloseModal}
                            >
                                Close
                            </div>
                            <div
                                className='bg-green-600 text-white px-4 md:px-6 rounded-tl-lg rounded-bl-3xl rounded-tr-3xl rounded-br-lg hover:bg-green-500 transition-all duration-300 cursor-pointer py-3'
                                onClick={handleConfirmOrder}
                            >
                                Confirm Order
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Navbar;
