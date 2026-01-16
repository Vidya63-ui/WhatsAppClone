import {catchAsyncError} from "../middleware/catchAsyncError.js";
import { User} from "../models/userSchema.js";
import { Message } from "../models/messageSchema.js";
import ErrorHandler from "../middleware/error.js";
import {sendToken }from "../utils/jwtToken.js";

export const registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password} = req.body;
    if (!name || !email || !password) {
        return next(new ErrorHandler("Please enter all fields", 400));
    }

    const userExists = await User.find({ $or: [{ name }, { email }] });
    if (userExists.length > 0) {
        return next(new ErrorHandler("User already exists", 400));
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    sendToken(user, 201, res,"Registered Successfully");
});

export const loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("Please enter all fields", 400));
    }

    const user = await User.findOne({ email}).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }
    sendToken(user, 200, res,"Logged In Successfully");
});

export const logoutUser = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});



export const getUserDetails = catchAsyncError(async (req, res, next) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
});

export const searchUserByEmail = catchAsyncError(async (req, res, next) => {
    const { email } = req.query;
    
    if (!email) {
        return next(new ErrorHandler("Please provide an email", 400));
    }

    const user = await User.findOne({ email }).select('-password');
    
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email
        }
    });
});

export const getChatList = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id;

    const chats = await Message.aggregate([
        // 1️⃣ Only messages where user is involved
        {
            $match: {
                $or: [
                    { sender: userId },
                    { receiver: userId }
                ]
            }
        },

        // 2️⃣ Sort so latest message comes first
        {
            $sort: { createdAt: -1 }
        },

        // 3️⃣ Group by "other user"
        {
            $group: {
                _id: {
                    $cond: [
                        { $eq: ["$sender", userId] },
                        "$receiver",
                        "$sender"
                    ]
                },
                lastMessage: { $first: "$messageText" },
                lastMessageAt: { $first: "$createdAt" },
                read: { $first: "$read" },
                sender: { $first: "$sender" }
            }
        },

        // 4️⃣ Lookup user details
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user"
            }
        },
        //always an array after lookup
        { $unwind: "$user" },

        // 5️⃣ Lookup contact (custom name)
        {
            $lookup: {
                from: "contacts",
                let: { otherUserId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$owner", userId] },
                                    { $eq: ["$contactUser", "$$otherUserId"] }
                                ]
                            }
                        }
                    }
                ],
                as: "contact"
            }
        },

        // 6️⃣ Decide display name
        {
            $addFields: {
                displayName: {
                    $cond: [
                        { $gt: [{ $size: "$contact" }, 0] },
                        { $arrayElemAt: ["$contact.displayName", 0] },
                        "$user.name"
                    ]
                }
            }
        },

        // 7️⃣ Final shape
        {
            $project: {
                _id: 0,
                userId: "$_id",
                displayName: 1,
                lastMessage: 1,
                lastMessageAt: 1,
                read: 1,
                email: "$user.email"
            }
        },

        // 8️⃣ Sort chats by last message time
        {
            $sort: { lastMessageAt: -1 }
        }
    ]);

    res.status(200).json({
        success: true,
        chats
    });
});

