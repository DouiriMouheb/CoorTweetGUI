// controllers/passwordController.js
const User = require("../models/user");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { createPasswordResetHTML } = require("../helpers/emailTemplates");
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
/*const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No user found with that email" });
    }

    // Generate a new random password
    const newPassword = generateSecurePassword();

    // Update the user's password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Send email with the new password
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Your New Password",
      text: `Your password has been reset. Your new password is: ${newPassword}\n\nFor security reasons, please change this password after logging in.`, // Plain text version
      html: createPasswordResetHTML(newPassword), // HTML version
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      status: "success",
      message: "New password sent to email",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      error: "Error resetting password. Please try again later.",
    });
  }
};*/
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No user found with that email" });
    }

    // Check if the user has recently requested a password reset
    const resetCooldown = 60 * 60 * 1000; // 1 hour in milliseconds
    if (
      user.lastPasswordResetRequest &&
      Date.now() - new Date(user.lastPasswordResetRequest).getTime() <
        resetCooldown
    ) {
      // Calculate time remaining before next request is allowed
      const timeElapsed =
        Date.now() - new Date(user.lastPasswordResetRequest).getTime();
      const timeRemaining = Math.ceil((resetCooldown - timeElapsed) / 60000); // Convert to minutes

      return res.status(429).json({
        error: `New password was already sent to your Email Please wait ${timeRemaining} minutes before requesting another password reset.`,
      });
    }

    // Update last request timestamp
    user.lastPasswordResetRequest = new Date();

    // Generate a new random password
    const newPassword = generateSecurePassword();

    // Update the user's password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Send email with the new password
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Your New Password",
      text: `Your password has been reset. Your new password is: ${newPassword}\n\nFor security reasons, please change this password after logging in.`, // Plain text version
      html: createPasswordResetHTML(newPassword), // HTML version
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      status: "success",
      message: "New password sent to email",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      error: "Error resetting password. Please try again later.",
    });
  }
};
// Function to generate a secure random password
const generateSecurePassword = () => {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
};
// controllers/userController.js or wherever appropriate
const updatePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Validate new password
    if (!validator.isStrongPassword(newPassword)) {
      return res.status(400).json({
        error:
          "Password is not strong enough. It should include uppercase, lowercase, numbers, and special characters.",
      });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      error: "Error updating password. Please try again later.",
    });
  }
};

// Reset password
/*const resetPassword = async (req, res) => {
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
};*/

module.exports = {
  forgotPassword,
  updatePassword,
  //resetPassword,
};
