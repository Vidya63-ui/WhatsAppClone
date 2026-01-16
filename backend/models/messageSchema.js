import mongoose from "mongoose";
import { User } from "./userSchema.js";
import validator from "validator";

const messageSchema = new mongoose.Schema({
    sender : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "User",
        required: [true, "Sender is required"]
    },
    receiver : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "User",
        required: [true, "Receiver is required"]
    },
    messageText : {
        type: String,
        required: [true, "Message text is required"],
        minLegth: [1, "Message must be at least 1 character"],
        maxLength: [1000, "Message can't exceed 1000 characters"],
    },
    createdAt : {
        type: Date,
        default: Date.now,
        required: [true, "Creation date is required"]
    },
    read:{
        type: Boolean,
        default: false
    }
});

export const Message = mongoose.model('Message', messageSchema);