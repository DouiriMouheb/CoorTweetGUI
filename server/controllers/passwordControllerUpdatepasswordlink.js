// controllers/passwordController.js
const User = require("../models/user");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Request password reset
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No user found with that email" });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/reset-password/${resetToken}`;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Your Password Reset Token (valid for 1 hour)",
      text: `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}\nIf you didn't forget your password, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (error) {
    console.error(error);

    // If something goes wrong, reset the token fields
    if (req.body.email) {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save({ validateBeforeSave: false });
      }
    }

    res.status(500).json({
      status: "error",
      error: "Error sending email. Please try again later.",
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Use the static method to reset password
    await User.resetPassword(token, password);

    res.status(200).json({
      status: "success",
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      error: error.message,
    });
  }
};

module.exports = {
  forgotPassword,
  resetPassword,
};
