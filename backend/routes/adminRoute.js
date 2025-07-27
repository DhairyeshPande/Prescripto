import express from "express";
import { addDoctor, allDoctors, loginAdmin, appointmentsAdmin, appointmentCancel, adminDashboard } from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { changeAvailablity } from "../controllers/doctorController.js";

const adminRouter=express.Router()

adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor) 
//() syntax == (path,middleware,controller)
adminRouter.post('/login',loginAdmin)
adminRouter.post('/all-doctors', authAdmin, allDoctors)
adminRouter.post('/change-availability', authAdmin, changeAvailablity)
adminRouter.get('/appointments',authAdmin,appointmentsAdmin)

// api to cancel appointment using admin panel
adminRouter.post('/cancel-appointment',authAdmin,appointmentCancel)

adminRouter.get('/dashboard',authAdmin,adminDashboard)

export default adminRouter