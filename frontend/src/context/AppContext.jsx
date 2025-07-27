import { createContext, useState } from "react";
// import { doctors } from "../assets/assets";
import axios from 'axios'
import { useEffect } from "react";
import {toast} from 'react-toastify'


export const AppContext=createContext()

const AppContextProvider=(props)=>{

    const currencySymbol='₹'

    const backendUrl=import.meta.env.VITE_BACKEND_URL
    const [doctors, setDoctors] = useState([])
    // state to store user authentication token
    //const [token,setToken]=useState('')
    // agar upar wale se login kr rhe the toh refresh hone pe vo firse logout ho ja rha tha isliye niche wala
    const [token,setToken]=useState(localStorage.getItem('token') ? localStorage.getItem('token') : false )

    const [userData,setUserData]=useState(false)

    //calling api
    const getDoctorsData=async()=>{

        try {

            const {data}=await axios.get(backendUrl + '/api/doctor/list')
            if(data.success){

                //saving doctors data in state variable
                setDoctors(data.doctors)

            } else {
                toast.error(data.message)
            }
            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    // arrow func from which we get user data and can save data in state variable
    const loadUserProfileData=async(req,res)=>{

        try {

            const {data}=await axios.get(backendUrl + '/api/user/get-profile', {headers:{token}})
            if(data.success){
                setUserData(data.userData)
            } else {
                toast.error(data.message)
            }
            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            
        }
    }

    const value={
        doctors, getDoctorsData,
        currencySymbol,
        token, setToken,
        backendUrl, 
        userData, setUserData,
        loadUserProfileData,
    }

    useEffect(()=>{
        getDoctorsData()
    },[])

    useEffect(()=>{
        if(token){
            loadUserProfileData()
        } else {
            setUserData(false)
        }
    },[token])

    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider