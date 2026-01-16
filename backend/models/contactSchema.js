import mongoose from "mongoose";
import validator from "validator";
const contactSchema = new mongoose.Schema({
  owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    contactUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    displayName: {
        type: String,
        required: true,
    },
});

export const Contact = mongoose.model('Contact', contactSchema);