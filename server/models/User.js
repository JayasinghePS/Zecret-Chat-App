import mongoose from "mongoose";

const  userSchema = new mongoose.Schema({
    email: {type: Stringh, required: true, unique: true},
    fullName: {type: Stringh, required: true},
    password: {type: Stringh, required: true, minlength: 6},
    profilePic: {type: Stringh, default: ""},
    bio: {type: Stringh},

}, {timestamps: true});

const User = mongoose.model("User", userSchema);

export default User;