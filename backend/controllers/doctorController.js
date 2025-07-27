import doctorModel from "../models/doctorModel.js"
import bcyrpt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"

const changeAvailablity=async(req,res)=>{
    try {

        const {docId}=req.body

        const docData=await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId,{available: !docData.available})
        res.json({success:true,message:'Availabilty changed'})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const doctorList=async(req,res)=>{
    try {
        
        const doctors=await doctorModel.find({}).select(['-password','-email'])

        res.json({success:true,doctors})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// controller function so that doctor can login 
// api for doctor login
const loginDoctor=async(req,res)=>{
    try {

        const {email,password}=req.body
        const doctor=await doctorModel.findOne({email})

        if(!doctor){
            return res.json({success:false,message:'Invalid credentials'})
        }
        
        // matching password
        const isMatch=await bcyrpt.compare(password, doctor.password)

        if(isMatch){
            // creating token using jwt
            const token=jwt.sign({id:doctor._id},process.env.JWT_SECRET)

            // generating response and sending token
            res.json({success:true, token})

        } else {
            res.json({success:false,message:'Invalid credentials'})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// api to get list of doctor appointments for doctor panel
const appointmentsDoctor=async(req,res)=>{
    try {

        const {docId}=req.body
        const appointments=await appointmentModel.find({docId})

        res.json({success:true, appointments})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// api to mark appointment completed for doctor panel
const appointmentComplete=async(req,res)=>{
    try {

        const {docId,appointmentId}=req.body   // we willl get this docId from authDoctor middleware where we convert dToken into docId

        const appointmentData=await appointmentModel.findById(appointmentId)

        if(appointmentData && appointmentData.docId===docId){

            await appointmentModel.findByIdAndUpdate(appointmentId,{isCompleted: true}) // we got isCompleted property from db mein dekhke, strucutre dekhke
            return res.json({success:true,message:"Appointment Completed"})

        } else {
            return res.json({success:false,message:"Mark failed"})
        }

        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// api to cancel appointment for doctor panel
const appointmentCancel=async(req,res)=>{
    try {

        const {docId,appointmentId}=req.body   // we willl get this docId from authDoctor middleware where we convert dToken into docId

        const appointmentData=await appointmentModel.findById(appointmentId)

        if(appointmentData && appointmentData.docId===docId){

            await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled: true}) // we got cancelled property from db mein dekhke, strucutre dekhke
            return res.json({success:true,message:"Appointment Cancelled"})

        } else {
            return res.json({success:false,message:"Cancellation failed"})
        }

        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// api to get dashboard data for doctor panel
const doctorDashboard=async(req,res)=>{

    try {

        const {docId}=req.body

        const appointments=await appointmentModel.find({docId})

        let earning=0
        appointments.map((item)=>{
            if(item.isCompleted || item.payment){
                earning+=item.amount
            }
        })

        let patients=[]
        appointments.map((item)=>{
            if(!patients.includes(item.userId)){
                patients.push(item.userId)
            }
        })

        const dashData={
            earning,
            appointments:appointments.length,
            patients:patients.length,
            latestAppointments:appointments.reverse().slice(0,5)
        }

        res.json({success:true, dashData})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

//api to get doctor profile for doctor panel
const doctorProfile=async(req,res)=>{

    try {

        const {docId}=req.body
        const profileData=await doctorModel.findById(docId).select('-password')
        
        res.json({success:true,profileData})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// api to update doctor profile data from doctor panel
const updateDoctorProfile=async(req,res)=>{

    try {

        const {docId,fees,address,available}=req.body

        await doctorModel.findByIdAndUpdate(docId,{fees,address,available})

        res.json({success:true,message:"Profile Updated"})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

export {changeAvailablity, 
        doctorList, 
        loginDoctor, 
        appointmentsDoctor, 
        appointmentComplete, appointmentCancel, 
        doctorDashboard,
        doctorProfile, updateDoctorProfile }