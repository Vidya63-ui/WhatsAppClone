import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../middleware/error.js";
import { Message } from "../models/messageSchema.js";
import { User } from "../models/userSchema.js";
import { getIO } from "../utils/socket.js";

export const postMessage = catchAsyncError(async (req, res, next) => {
    const { message } = req.body;
    const sender = req.user._id;

    const receiverId = req.params.id;
    if (!receiverId || !message) {
        return next(new ErrorHandler("Please enter all fields", 400));
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
        return next(new ErrorHandler("Receiver not found", 404));
    }

    const newMessage = await Message.create({
        sender,
        receiver: receiverId,
        messageText: message,
        createdAt: Date.now(),
    });

    // Populate for client-friendly payload
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    // Emit real-time update to sender and receiver rooms
    const io = getIO();
    if (io) {
      io.to(receiverId.toString()).emit('newMessage', populatedMessage);
      io.to(sender.toString()).emit('newMessage', populatedMessage);
    }

    res.status(201).json({
        success: true,
        message: "Message sent successfully",
        newMessage: populatedMessage,
    });
});

export const getMessages = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id;
    const otherUserId = req.params.id;

    const page = Number(req.query.page) || 1;
    const limit = 25;
    const skip = (page - 1) * limit;

    if (!otherUserId) {
        return next(new ErrorHandler("Please provide the other user ID", 400));
    }

    const messages = await Message.find({
        $or: [
            { sender: userId, receiver: otherUserId },
            { sender: otherUserId, receiver: userId }
        ]
    })
    .populate('sender', 'name email')
    .populate('receiver', 'name email')
    .sort({ createdAt: -1 }) // newest → oldest
    .skip(skip)
    .limit(limit);

    res.status(200).json({
        success: true,
        page,
        limit,
        count: messages.length,
        messages,
    });
});


export const updateMessages = catchAsyncError(async (req, res, next) => {
    const { message } = req.body;
    const messageId = req.params.id;
    const userId = req.user._id;

    if (!messageId || !message) {
        return next(new ErrorHandler("Please provide message ID and new message text", 400));
    }

    const existingMessage = await Message.findById(messageId);

    if (!existingMessage) {
        return next(new ErrorHandler("Message not found", 404));
    }

    // 🔐 Authorization check
    if (existingMessage.sender.toString() !== userId.toString()) {
        return next(new ErrorHandler("You are not allowed to update this message", 403));
    }

    // ⏱ Time limit (example: 5 minutes)
    if (Date.now() - existingMessage.createdAt > 5 * 60 * 1000) {
        return next(new ErrorHandler("Message can only be updated within 5 minutes", 400));
    }

    existingMessage.messageText = message;
    await existingMessage.save();

    const io = getIO();
    if (io) {
      io.to(existingMessage.receiver.toString()).emit('messageUpdated', existingMessage);
      io.to(existingMessage.sender.toString()).emit('messageUpdated', existingMessage);
    }

    res.status(200).json({
        success: true,
        message: "Message updated successfully",
        updatedMessage: existingMessage,
    });
});



export const deleteMessages = catchAsyncError(async (req, res, next) => {
    const messageId = req.params.id;
    const userId = req.user._id;

    if (!messageId) {
        return next(new ErrorHandler("Please provide message ID", 400));
    }

    const message = await Message.findById(messageId);

    if (!message) {
        return next(new ErrorHandler("Message not found", 404));
    }

    // 🔐 Authorization check
    if (message.sender.toString() !== userId.toString()) {
        return next(new ErrorHandler("You are not allowed to delete this message", 403));
    }

    // ⏱ Time limit
    if (Date.now() - message.createdAt > 5 * 60 * 1000) {
        return next(new ErrorHandler("Message can only be deleted within 5 minutes", 400));
    }

    const messageObj = message.toObject();
    await message.deleteOne();

    const io = getIO();
    if (io) {
      io.to(messageObj.receiver.toString()).emit('messageDeleted', { messageId: messageObj._id, sender: messageObj.sender, receiver: messageObj.receiver });
      io.to(messageObj.sender.toString()).emit('messageDeleted', { messageId: messageObj._id, sender: messageObj.sender, receiver: messageObj.receiver });
    }

    res.status(200).json({
        success: true,
        message: "Message deleted successfully",
    });
});

export const markMessagesAsRead = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id;
    const otherUserId = req.params.id;
    if (!otherUserId) {
        return next(new ErrorHandler("Please provide the other user ID", 400));
    }

    const result = await Message.updateMany(
        { sender: otherUserId, receiver: userId, read: false },
        { $set: { read: true } }
    );

    // Emit read receipts to both users
    const io = getIO();
    if (io) {
      io.to(otherUserId.toString()).emit('messagesRead', { by: userId, count: result.modifiedCount });
      io.to(userId.toString()).emit('messagesRead', { by: userId, count: result.modifiedCount });
    }

    // console.log(`Marked ${result.modifiedCount} messages as read from user ${otherUserId} to user ${userId}`);
    res.status(200).json({
        success: true,
        message: `${result.modifiedCount} messages marked as read`,
    });
});
