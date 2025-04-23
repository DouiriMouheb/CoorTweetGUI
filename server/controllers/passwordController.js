// controllers/passwordController.js
const User = require("../models/user");
const { Resend } = require("resend");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { createPasswordResetHTML } = require("../helpers/emailTemplates");

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

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
        error: `New password was already sent to your Email. Please wait ${timeRemaining} minutes before requesting another password reset.`,
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

    // Send email with the new password using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: user.email,
      subject: "Your New Password",
      text: `Your password has been reset. Your new password is: ${newPassword}\n\nFor security reasons, please change this password after logging in.`,
      html: createPasswordResetHTML(newPassword),
    });

    if (error) {
      console.error("Email sending failed:", error);
      return res.status(500).json({
        status: "error",
        error: "Failed to send password reset email",
      });
    }

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

// Update password function
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

module.exports = {
  forgotPassword,
  updatePassword,
};
