import React from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Banner = () => {

    const navigate=useNavigate()

  return (
    <div className='flex flex-col md:flex-row bg-primary rounded-lg px-6 sm:px-10 md:px-14 lg:px-12 my-20 md:mx-10 relative'>

    {/* Left side */}
    <div className='flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5 z-10'>
        <div>
        <p className='text-white text-xl sm:text-2xl md:text-3xl font-semibold'>Book Appointment</p>
        <p className='text-white text-sm sm:text-base mt-2'>with 100+ Trusted Doctors</p>
        </div>
        <button onClick={()=>{navigate('/login'); scrollTo(0,0)}} className='mt-6 bg-white text-primary font-medium px-5 py-2 rounded-full hover:bg-gray-100 transition-all'>
        Create Account
        </button>
    </div>

    {/* Right side */}
    <div className='hidden md:block md:w-1/2 lg:w-[370px] relative z-0'>
        <img className='w-full max-w-md' src={assets.appointment_img} alt="Appointment" />
    </div>

    </div>

  )
}

export default Banner

