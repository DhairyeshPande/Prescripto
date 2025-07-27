import express from 'express'
// import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay } from '../controllers/userController.js'
import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment } from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js'
import upload from '../middlewares/multer.js'

const userRouter=express.Router()

// creating api with userRouter route
// creating endpoint to register the user
userRouter.post('/register',registerUser)

//creating endpt for login
userRouter.post('/login',loginUser)

// creating 
userRouter.get('/get-profile',authUser,getProfile)

userRouter.post('/update-profile',upload.single('image'),authUser,updateProfile) // userRouter.post(path,middleware,middleware,updatedProfile)

userRouter.post('/book-appointment',authUser,bookAppointment)

userRouter.get('/appointments',authUser,listAppointment) // adding authUser middleware so that we dont pass userId directly, vo authUser middleware se lenga

userRouter.post('/cancel-appointment',authUser,cancelAppointment)

// userRouter.post('/payment-razorpay',authUser,paymentRazorpay)

// userRouter.post('/verify-razorpay',authUser,verifyRazorpay)

export default userRouter