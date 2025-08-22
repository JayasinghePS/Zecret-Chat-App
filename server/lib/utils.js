import jwt from "jsonwebtoken";

// Function to generate a token for a user
export const generateToken = (userID)=>{
    const token = jwt.sign({userId}, process.env.JWT_SECRET);
    return token;
}