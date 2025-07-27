import { useState } from "react";
import { createContext } from "react";
import axios from 'axios'
import {toast} from 'react-toastify'

export const DoctorContext = createContext()

const DoctorContextProvider=(props)=>{

    // creating state variable in which we will save the doctor authentication token
    // const backendUrl=import.meta.env.VITE_BACKEND_URL // backendurl to make api call
    const backendUrl="https://prescripto-deploy-backend.onrender.com"
    const [dToken,setDToken]=useState(localStorage.getItem('dToken')?localStorage.getItem('dToken'):'')

    // will be calling API and when we get all appointments data, so we will be saving that data in state variable
    const [appointments, setAppointments]=useState([])

    //state variables to store dashboard data
    const [dashData,setDashData]=useState(false)

    //state variables to store profile data
    const [profileData,setProfileData]=useState(false)

    const getAppointments=async()=>{
        try {

            const {data}=await axios.get(backendUrl + '/api/doctor/appointments', {headers:{dToken}}) 

            if(data.success){
                setAppointments(data.appointments)
                console.log(data.appointments)
            } else {
                toast.error(data.message)
            }
            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // function to mark appointment completed
    const completeAppointment=async(appointmentId)=>{

        try {

            const {data}=await axios.post(backendUrl + '/api/doctor/complete-appointment',{appointmentId}, {headers:{dToken}})

            if(data.success){
                toast.success(data.message)
                getAppointments()
            } else {
                toast.error(data.message)
            }
            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    // function to cancel appointment
    const cancelAppointment=async(appointmentId)=>{

        try {

            const {data}=await axios.post(backendUrl + '/api/doctor/cancel-appointment',{appointmentId}, {headers:{dToken}})

            if(data.success){
                toast.success(data.message)
                getAppointments()
            } else {
                toast.error(data.message)
            }
            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    // arrow function
    const getDashData=async()=>{
        try {

            const {data}=await axios.get(backendUrl + '/api/doctor/dashboard', {headers:{dToken}})
            if(data.success){
                setDashData(data.dashData)
                console.log(data.dashData)
            } else {
                toast.error(data.message)
            }
            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // function to fetch data from api
    const getProfileData=async()=>{
        try {

            const {data}=await axios.get(backendUrl + '/api/doctor/profile', {headers:{dToken}})

            if(data.success){
                setProfileData(data.profileData)
                console.log(data.profileData)
            }
            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const value={
        dToken,setDToken,
        backendUrl,
        appointments, setAppointments,
        getAppointments,
        completeAppointment,cancelAppointment,
        dashData, setDashData, getDashData,
        profileData, setProfileData, getProfileData,
    }

    return(
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider
