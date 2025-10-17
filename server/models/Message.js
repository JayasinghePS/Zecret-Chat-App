import mongoose from "mongoose";

//This is Express middleware, because it uses req, res, and next.
const  messageSchema = new mongoose.Schema({
    senderId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    receiverId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    text: {type: String,},
    image: {type: String,},
    seen: {type: Boolean, default: false}

}, {timestamps: true}); //adds createdAt and updatedAt fields automatically.

const Message = mongoose.model("Message", messageSchema);

export default Message;