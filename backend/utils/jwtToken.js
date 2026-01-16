export const sendToken = (user, statusCode, res, message) => {
  const token = user.getJWTToken();

  const cookieOptions = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  };

  res.status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      message,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
};

