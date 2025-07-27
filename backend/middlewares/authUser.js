import jwt from "jsonwebtoken";

// user authentication middleware
const authUser=async(req,res,next)=>{
    try {
        
        //logic to verify token
        const {token}=req.headers // getting token from header
        if(!token){
            return res.json({success:false,message:"Not authorised, login again"})
        }
        //decoding token
        const token_decode=jwt.verify(token,process.env.JWT_SECRET)
        // Ensure req.body exists before setting userId
        if (!req.body) {
        req.body = {};
        }

        req.body.userId=token_decode.id

        next()

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

export default authUser;