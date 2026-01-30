import React, { useEffect, useState } from 'react'
import { GiChickenOven } from "react-icons/gi";
import { Link } from 'react-router-dom';
import { getApiUrl } from '../config/api';

function Footer() {
    const [contactInfo, setContactInfo] = useState({
        email: 'support@tiptop.com',
        phone: '+91 1234567890',
        address: 'Shop No 17, Near Tower, Law Gate Rd, Lpu, Phagwara, Punjab 144411'
    });

    useEffect(() => {
        fetchContactInfo();
    }, []);

    const fetchContactInfo = async () => {
        try {
            const response = await fetch(getApiUrl('api/v1/settings'));
            if (response.ok) {
                const data = await response.json();
                if (data.data) {
                    setContactInfo({
                        email: data.data.contactEmail || contactInfo.email,
                        phone: data.data.contactPhone || contactInfo.phone,
                        address: data.data.address || contactInfo.address
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching contact info:', error);
        }
    };

    return (
        <div>
            <div className='mt-20 border-t-2 border-b-2 border-stone-300 mx-4 md:mx-10 lg:mx-20 py-10 md:py-15 lg:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
                <div>
                    <div className='flex gap-5 items-center sigmar-regular'>
                        <div className='p-3 rounded-full bg-red-400 w-fit text-white'>
                            <GiChickenOven size={40} />
                        </div>
                        <div className='text-2xl md:text-3xl text-red-400'>The Tip Top</div>
                    </div>
                    <div className='mt-5 poppins-regular'>
                        <span className='poppins-medium'>Address:</span> {contactInfo.address}
                    </div>
                    <div className='mt-2 poppins-regular'>
                        <span className='poppins-medium'>Email:</span> {contactInfo.email}
                    </div>
                    <div className='mt-2 poppins-regular'>
                        <span className='poppins-medium'>Phone:</span> {contactInfo.phone}
                    </div>
                </div>
                <div>
                    <div className='sigmar-regular text-lg md:text-xl'>Quick Links</div>
                    <div className='mt-5 poppins-medium text-stone-600 flex flex-col gap-2'>
                        <Link to={'/'} className='hover:underline hover:text-red-400 transition-all duration-300'>Home</Link>
                        <Link to={'/menu'} className='hover:underline hover:text-red-400 transition-all duration-300'>Menu</Link>
                        <Link to={'/privacy-policy'} className='hover:underline hover:text-red-400 transition-all duration-300'>Privacy Policy</Link>
                    </div>
                </div>
                <div>
                    <div className='sigmar-regular text-lg md:text-xl'>Business Hours</div>
                    <div className='mt-5 poppins-regular text-stone-600'>
                        <div className='flex justify-between mb-1'>
                            <span className='poppins-medium'>Monday - Friday:</span>
                            <span>10:00 AM - 11:00 PM</span>
                        </div>
                        <div className='flex justify-between mb-1'>
                            <span className='poppins-medium'>Saturday:</span>
                            <span>10:00 AM - 12:00 AM</span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='poppins-medium'>Sunday:</span>
                            <span>11:00 AM - 10:00 PM</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className='py-5 flex justify-center items-center poppins-regular text-xs md:text-sm lg:text-base'> 
                Powered By - &nbsp;
                <a href="https://www.helmer.world" target="_blank" rel="noopener noreferrer" className='poppins-regular bg-stone-800 text-stone-50 px-2 rounded-md hover:bg-stone-700'> 
                    NAITIK
                </a>
            </div>
        </div>
    )
}

export default Footer
