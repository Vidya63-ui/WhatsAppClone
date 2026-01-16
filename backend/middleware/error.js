class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (err, req, res, next) => {
    // Always log the full error for debugging (stack + message)
    console.error('Error caught by middleware:', err && err.stack ? err.stack : err);

    if (typeof err === "string") {
        //The web server encountered an unexpected condition that prevented it from fulfilling a request,
        //  indicating a problem on the server's side rather than the user's
        return res.status(500).json({
            success: false,
            message: err
        });
    }

    let error = { ...err };
    error.message = err.message || "Internal Server Error";
    error.statusCode = err.statusCode || 500;

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        const message = messages.join(', ');
        error = new ErrorHandler(message, 400);
    }

    // Mongoose duplicate key error
    //11000 is a MongoDB error code that means:
    // You tried to insert or update a value that must be unique, but it already exists in the database.
    if (err.code === 11000) {
        const message = `Duplicate field value entered: ${Object.keys(err.keyValue).join(', ')}`;
        error = new ErrorHandler(message, 400);
    }

    if (err.name === "JsonWebTokenError") {
        const message = `Json Web Token is invalid, Try again please!`;
        error = new ErrorHandler(message, 401);
    }

    if (err.name === "TokenExpiredError") {
        const message = `Json Web Token is expired, Try again please!`;
        error = new ErrorHandler(message, 401);
    }

    const responsePayload = {
        success: false,
        message: error.message,
    };

    // Provide stack trace in development for easier debugging
    if (process.env.NODE_ENV !== 'production') {
        responsePayload.stack = err.stack;
    }

    return res.status(error.statusCode).json(responsePayload);
};

export default ErrorHandler;