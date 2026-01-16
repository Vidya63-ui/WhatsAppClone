import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Contact } from "../models/contactSchema.js";
import ErrorHandler from "../middleware/error.js";
import { User } from "../models/userSchema.js";
import { getIO } from "../utils/socket.js";

export const createContact = catchAsyncError(async (req, res, next) => {
    const { email, name, displayName } = req.body;

    const owner = req.user._id;
    let contact = await User.findOne({ $or: [{ name }, { email }] });

    if (!contact) {
        return next(new ErrorHandler("Contact user not found", 404));
    }

    let contactExists = await Contact.findOne({ owner, contactUser: contact._id });
    
    if (contactExists) {
        return next(new ErrorHandler("Contact already exists", 400));
    }

    const newContact = await Contact.create({
        owner,
        contactUser: contact._id,
        displayName,
    });

    const populatedContact = await Contact.findById(newContact._id).populate('contactUser', 'name email');

    // Emit update to the owner's room so their UI updates in real-time
    const io = getIO();
    if (io) {
      io.to(owner.toString()).emit('contactCreated', populatedContact);
    }
    
    res.status(201).json({
        success: true,
        message: "Contact created successfully",
        contact: populatedContact,
    });
});

export const getContacts = catchAsyncError(async (req, res, next) => {
    const owner = req.user._id;
    const contacts = await Contact.find({ owner }).populate('contactUser', 'name email');
    res.status(200).json({
        success: true,
        count: contacts.length,
        contacts,
    });
});

export const getContact = catchAsyncError(async (req, res, next) => {
    const owner = req.user._id;
    const contactId = req.params.id;
    const contact = await Contact.findOne({ _id: contactId, owner });

    if (!contact) {
        return next(new ErrorHandler("Contact not found", 404));
    }

    res.status(200).json({
        success: true,
        contact,
    });
});

export const updateContact = catchAsyncError(async (req, res, next) => {
    const owner = req.user._id;
    const contactId = req.params.id;
    const { displayName } = req.body;
    const contact = await Contact.findOne({ _id: contactId, owner });
    if (!contact) {
        return next(new ErrorHandler("Contact not found", 404));
    }
    contact.displayName = displayName || contact.displayName;
    await contact.save();

    const io = getIO();
    if (io) {
      io.to(owner.toString()).emit('contactUpdated', contact);
    }

    res.status(200).json({
        success: true,
        message: "Contact updated successfully",
        contact,
    });
});

export const deleteContact = catchAsyncError(async (req, res, next) => {
    const owner = req.user._id;
    const contactId = req.params.id;
    const contact = await Contact.findOne({ _id: contactId, owner });
    if (!contact) {
        return next(new ErrorHandler("Contact not found", 404));
    }
    await contact.deleteOne();

    const io = getIO();
    if (io) {
      io.to(owner.toString()).emit('contactDeleted', { contactId });
    }

    res.status(200).json({
        success: true,
        message: "Contact deleted successfully",
    });
});