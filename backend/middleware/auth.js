import jwt from 'jsonwebtoken';
import { User } from '../models/userSchema.js';
import { catchAsyncError } from './catchAsyncError.js';
import ErrorHandler from '../middleware/error.js';


export const isAuthenticated = catchAsyncError( async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    let decodedData;
    try{
         decodedData = jwt.verify(token, "takeYour$1$Time");
    }catch(err){
        return next(new ErrorHandler("Session expired or invalid token", 401));
    }

     const user = await User.findById(decodedData.id).select("-password");

    if (!user) {
       return next(new ErrorHandler("User no longer exists", 401));
    }
   
    req.user = user;
    next();
});

export default isAuthenticated;
