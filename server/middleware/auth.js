import User from "../models/User.js";
import jwt from "jsonwebtoken";


// Middleware to protect routes (This is Express middleware, because it uses req, res, and next.)
export const protectRoute = async (req, res, next)=>{
    try {
        //takes the token from request headers.
        const token = req.headers.token;

        //checks if the token is valid using the secret key.
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        //extracts the user ID from token payload. fetches that user from DB (excluding password).
        const user = await User.findById(decoded.userId).select("-password");

        if(!user) return res.json({success: false, message: "User not found"});

        //If user found → attaches it to req.user so next middleware/controller can use it.
        req.user = user;
        
        next();
    } catch (error) {
        console.log(error.message);
        res.json({ success:false, message:error.message})
    }
}