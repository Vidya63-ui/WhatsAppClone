import validator from 'validator';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
    name :{
        type: String,
        required: [true, "Please enter your name"],
        minLength: [3, "Name must be at least 3 characters"],
        maxLength: [30, "Name can't exceed 30 characters"],
        unique: true
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        validate : [validator.isEmail, "Please enter a valid email address"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength: [6, "Password must be at least 6 characters"],
        maxLength: [20, "Password can't exceed 20 characters"],
        select : false
    },
    freinds:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ]
});

// Checks if the password field was changed.Prevents rehashing an already-hashed password on profile updates
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
});

//bcrypt extracts the salt from stored hash.Re-hashes entered password.Compares hashes securely
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getJWTToken = function () {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpire = process.env.JWT_EXPIRE || '7d';
    return jwt.sign({ id: this._id }, jwtSecret, {
        expiresIn: jwtExpire,
    });
};

export const User = mongoose.model('User', userSchema);