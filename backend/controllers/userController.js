// creating api logic for the user like login, register, updateProfile, book appointment, displaying booked appointment, cancelling appointment and payment gateway

import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import razorpay from 'razorpay'


// api to register user
const registerUser=async(req,res)=>{

    try {

        const {name,email,password}=req.body

        if(!name || !password || !email){
            return res.json({success:false, message:"Missing details"})
        }

        //verifying email is correct or not
        if(!validator.isEmail(email)){
            return res.json({success:false, message:"Enter a valid email"})
        }

        // checking password min length is 8 or not
        if(password.length<8){
            return res.json({success:false, message:"Enter a strong password"})
        }

        //adding user in database

        //first bcrypt password - hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt)

        //saving hashed password in db
        const userData={
            name,
            email,
            password:hashedPassword
        }
        const newUser=new userModel(userData)
        //saving in db
        const user=await newUser.save()

        // creating token
        const token=jwt.sign({id:user._id}, process.env.JWT_SECRET)

        res.json({success:true,token})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// api for user login
const loginUser=async(req,res)=>{
    try {

        const {email,password}=req.body
        const user=await userModel.findOne({email})

        if(!user){
            return res.json({success:false,message:'User does not exist'})
        }

        // matching password
        const isMatch=await bcrypt.compare(password,user.password)

        if(isMatch){
            const token=jwt.sign({id:user._id}, process.env.JWT_SECRET)
            res.json({success:true,token})
        } else {
            res.json({success:false,message:"Invalid Credentials"})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// api to get user profile data
const getProfile=async (req,res)=>{

    try {

        const {userId}=req.body
        //const userId = req.userId; 
        const userData=await userModel.findById(userId).select('-password')

        res.json({success:true, userData})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// api to update user profile
const updateProfile=async(req,res)=>{
    try {

        const {userId,name,phone,address,dob,gender}=req.body
        const imageFile=req.file

        if(!name || !phone || !dob || !gender){
            return res.json({success:false,message:"Data missing"})
        }
        
        await userModel.findByIdAndUpdate(userId,{name,phone,address:JSON.parse(address),dob,gender})

        if(imageFile){

            // uploading image to cloudinary
            const imageUpload= await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
            const imageURL=imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId,{image:imageURL})

        }

        res.json({success:true,message:"Profile Updated"})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// api to book appointment
const bookAppointment=async(req,res)=>{

    try {

        const {userId,docId,slotDate,slotTime}=req.body

        const docData=await doctorModel.findById(docId).select('-password')

        if(!docData.available){
            return res.json({success:false,message:"Doctor not available"})
        } 

        let slots_booked=docData.slots_booked

        // checking for slots availability
        if(slots_booked[slotDate]){
            if(slots_booked[slotDate].includes(slotTime)){
                return res.json({success:false,message:"Slot not available"})
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate]=[]
            slots_booked[slotDate].push(slotTime)
        }

        const userData=await userModel.findById(userId).select('-password')

        // deleting slots_boked data from docData because we hae to save docData in appointmentData also
        // so in appointMentData we dont want unneccesay data
        delete docData.slots_booked

        const appointmentData={
            userId,
            docId,
            userData,
            docData,
            amount:docData.fees,
            slotTime,
            slotDate,
            date:Date.now()
        }

        const newAppointment=new appointmentModel(appointmentData)
        //saving newAppointment data in db
        await newAppointment.save()

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId,{slots_booked})

        res.json({success:true,message:'Appointment booked'})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// api to get users all appointment for frontend, my-appointments page
const listAppointment=async(req,res)=>{
     
    try {

        const {userId} =req.body
        // creating variable where we will store all appointments of this user
        const appointments=await appointmentModel.find({userId})

        res.json({success:true,appointments})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// api to cancel appointments
const cancelAppointment=async(req,res)=>{

    try {

        const {userId, appointmentId}=req.body

        const appointmentData=await appointmentModel.findById(appointmentId)

        // verifying appointment user
        if(appointmentData.userId !== userId){
            return res.json({success:false,message:'Unauthorised action'})
        } 

        await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled: true}) // canclled mila db se, waha dekha kya bolte isse
        
        // removing from doctor slot also
        const {docId, slotDate, slotTime}=appointmentData

        const doctorData=await doctorModel.findById(docId)

        let slots_booked=doctorData.slots_booked // made copy of doctors slots_booked
        slots_booked[slotDate]=slots_booked[slotDate].filter(e=> e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId,{slots_booked})

        res.json({success:true, message:"Appointment cancelled"})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}


// // api to make payment of appointment using razorpay
// const razorpayInstance=new razorpay({
//     key_id:process.env.RAZORPAY_KEY_ID,
//     key_secret:process.env.RAZORPAY_KEY_SECRET
// })
// const paymentRazorpay=async(req,res)=>{

//     try {

//         const {appointmentId} =req.body
//         const appointmentData=await appointmentModel.findById(appointmentId)

//         // checking appointdata is available or not, 
//         // if available then we will that appointment is cancel or not
//         // if cancel then dont create payment for that
//         if(!appointmentData || appointmentData.cancelled){
//             return res.json({success:false,message:"Appointment cancelled or not found"})
//         } 

//         // creating options for razorpay payment
//         const options={
//             amount: appointmentData.amount,
//             currency: process.env.CURRENCY,
//             receipt: appointmentId,
//         }
        
//         // creation of an order
//         const order=await razorpayInstance.orders.create(options)

//         res.json({success:true, order})
        
//     } catch (error) {
//         console.log(error)
//         res.json({success:false,message:error.message})
//     }  
// }

// // api to verify payment of razorpay
// const verifyRazorpay=async(req,res)=>{
//     try {

//         const {razorpay_order_id}=req.body
//         const orderInfo=await razorpayInstance.orders.fetch(razorpay_order_id)

//         //console.log(orderInfo)
//         if(orderInfo.status === 'paid'){
//             await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment:true})
//             res.json({success:true,message:'Payment Successful'})
//         } else {
//             res.json({success:false,message:'Payment Failed'})
//         }
        
//     } catch (error) {
//         console.log(error)
//         res.json({success:false,message:error.message})
//     }
// }

// export {registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay}
export {registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment}