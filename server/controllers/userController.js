import { generateToken } from "../../server/lib/utils.js";
import User from "../../server/models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// Signup a new user
export const signup = async (req, res) =>{
    const {fullName, email, password, bio} = req.body;
    try {
        // Validates all required fields.
        if(!fullName || !email || !password || !bio){
            return res.json({success: false, message: "Misiing Details"})
        }

        //Checks if an account with that email already exists.
        const user = await User.findOne({email});
        if(user){
            return res.json({success: false, message: "Account already exists"})
        }

        //Hashes password securely using bcrypt.
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //Saves new user in the database.
        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        });

        //Generates JWT token for the new user
        const token = generateToken(newUser._id)

        // /Returns new user’s data + token
        res.json({success: true, userData: newUser, token, message: "Account created successfully"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Controller to login a user
export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        //Finds a user by email
        const userData = await User.findOne({email})

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        //Compares given password with stored hash using bcrypt
        if(!isPasswordCorrect){
            return res.json({success: false, message: "Invalid credentials"});
        }

        const token = generateToken(userData._id)

        //If password matches, generates JWT token and returns user info + token
        res.json({success: true, userData, token, message: "Login successful"})
        
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}


// Controller to check if user is authenticated
export const checkAuth = (req, res)=>{
    res.json({success: true, user: req.user});
}

// Controller to update user profile details
export const updateProfile = async (req, res)=>{
    try {
        //Gets logged-in user ID and new profile info.
        const {profilePic, bio, fullName} = req.body;

        const userId = req.user._id;
        let updatedUser;

        //If no new image, updates name and bio only
        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true})
        } else{

            //If there’s a new picture, uploads to Cloudinary and updates image URL, name, and bio
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true});
        }
        //Sends updated user data as response
        res.json({success: true, user: updatedUser})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}